import { db } from '../firebase';
import {
  collection,
  doc,
  deleteDoc,
  writeBatch,
  updateDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  getDoc,
} from 'firebase/firestore';

// ─── Helper ───────────────────────────────────────────────────────────────────
const getTodayDateId = () => new Date().toISOString().split('T')[0];

/**
 * Guard: if db is not configured (no valid Firebase env), all syncs are no-ops.
 * This lets the app run fully in Sandbox/localStorage mode without crashing.
 */
const canSync = () => !!db;

// ─── LOAD (Cloud → App State) ─────────────────────────────────────────────────

/**
 * Hydrates the app from Firestore on login.
 * Returns null if Firebase is not configured or if the store is new.
 */
export const loadStoreDataFromCloud = async (storeId) => {
  if (!canSync() || !storeId) return null;

  try {
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);

    const [productsSnap, customersSnap, suppliersSnap, billsSnap, manualEntriesSnap, statsSnap] = await Promise.all([
      getDocs(collection(db, `stores/${storeId}/products`)),
      getDocs(collection(db, `stores/${storeId}/customers`)),
      getDocs(collection(db, `stores/${storeId}/suppliers`)),
      getDocs(
        query(
          collection(db, `stores/${storeId}/bills`),
          orderBy('createdAt', 'desc'),
          limit(100)
        )
      ),
      getDocs(
        query(
          collection(db, `stores/${storeId}/manualEntries`),
          orderBy('createdAt', 'desc'),
          limit(300)
        )
      ),
      getDoc(doc(db, `stores/${storeId}/stats`, getTodayDateId())),
    ]);

    const products = productsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    const customers = customersSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    const suppliers = suppliersSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    const recentBills = billsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    const manualEntries = manualEntriesSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    const stats = statsSnap.exists() ? statsSnap.data() : null;
    const business = storeSnap.exists() ? storeSnap.data()?.business || null : null;

    const billCounter =
      recentBills.length > 0
        ? Math.max(...recentBills.map(b => parseInt(b.id) || 0))
        : 0;

    return { products, customers, suppliers, recentBills, manualEntries, stats, business, billCounter };
  } catch (err) {
    console.error('[Sync] loadStoreDataFromCloud failed:', err);
    return null;
  }
};

// ─── WRITE (App State → Cloud) ────────────────────────────────────────────────

/**
 * Atomically writes a new bill and decrements stock for all sold items.
 */
export const syncBillToCloud = async (storeId, newBill, productsToReduce = []) => {
  if (!canSync() || !storeId) return;

  try {
    const batch = writeBatch(db);

    // 1. Write the bill document
    const billRef = doc(collection(db, `stores/${storeId}/bills`), newBill.id);
    batch.set(billRef, { ...newBill, storeId });

    // 2. Update stock levels for each reduced product
    productsToReduce.forEach(p => {
      if (!p.id) return;
      const pRef = doc(collection(db, `stores/${storeId}/products`), String(p.id));
      batch.update(pRef, {
        stock: p.stock,
        soldToday: p.soldToday ?? 0,
      });
    });

    await batch.commit();
    console.log('[Sync] Bill synced →', newBill.id);
  } catch (err) {
    console.error('[Sync] syncBillToCloud failed:', err);
  }
};

/**
 * Updates (or creates) the daily stats document for today.
 */
export const syncDailyStatsToCloud = async (storeId, stats) => {
  if (!canSync() || !storeId) return;

  try {
    const statsRef = doc(db, `stores/${storeId}/stats`, getTodayDateId());
    await setDoc(statsRef, { ...stats, storeId, date: getTodayDateId() }, { merge: true });
    console.log('[Sync] Daily stats synced');
  } catch (err) {
    console.error('[Sync] syncDailyStatsToCloud failed:', err);
  }
};

/**
 * Updates a customer's outstanding balance after a Khata credit or payment.
 */
export const syncKhataCreditToCloud = async (storeId, customerId, newDue, latestTransaction) => {
  if (!canSync() || !storeId || !customerId) return;

  try {
    const customerRef = doc(collection(db, `stores/${storeId}/customers`), customerId);
    const updatePayload = { due: newDue };
    // Append the transaction if provided (using array-union equivalent via read-modify-write)
    if (latestTransaction) {
      const snap = await getDoc(customerRef);
      const existing = snap.exists() ? (snap.data().transactions || []) : [];
      updatePayload.transactions = [latestTransaction, ...existing].slice(0, 200); // cap at 200
    }
    await updateDoc(customerRef, updatePayload);
    console.log('[Sync] Khata synced for customer:', customerId);
  } catch (err) {
    // If doc doesn't exist yet (new customer), ignore
    if (err.code !== 'not-found') {
      console.error('[Sync] syncKhataCreditToCloud failed:', err);
    }
  }
};

/**
 * Creates a new customer in Firestore.
 */
export const syncCustomerToCloud = async (storeId, newCustomer) => {
  if (!canSync() || !storeId || !newCustomer?.id) return;

  try {
    const customerRef = doc(collection(db, `stores/${storeId}/customers`), newCustomer.id);
    await setDoc(customerRef, { ...newCustomer, storeId });
    console.log('[Sync] Customer synced:', newCustomer.name);
  } catch (err) {
    console.error('[Sync] syncCustomerToCloud failed:', err);
  }
};

/**
 * Updates a single product's stock level (and optionally its cost price).
 */
export const syncStockToCloud = async (storeId, productId, newStock, costPrice, supplierId = null) => {
  if (!canSync() || !storeId || productId == null) return;

  try {
    const productRef = doc(collection(db, `stores/${storeId}/products`), String(productId));
    const payload = { stock: newStock };
    if (costPrice != null && Number.isFinite(costPrice)) {
      payload.costPrice = costPrice;
    }
    if (supplierId != null) {
      payload.supplierId = supplierId;
    }
    await updateDoc(productRef, payload);
    console.log('[Sync] Stock synced for product:', productId, '→', newStock);
  } catch (err) {
    // If the product doesn't exist in Firestore yet (new store), create it
    if (err.code === 'not-found') {
      try {
        const productRef = doc(collection(db, `stores/${storeId}/products`), String(productId));
        const fallbackPayload = { id: String(productId), stock: newStock, storeId };
        if (costPrice != null && Number.isFinite(costPrice)) {
          fallbackPayload.costPrice = costPrice;
        }
        if (supplierId != null) {
          fallbackPayload.supplierId = supplierId;
        }
        await setDoc(productRef, fallbackPayload);
      } catch (e2) {
        console.error('[Sync] syncStockToCloud setDoc fallback failed:', e2);
      }
    } else {
      console.error('[Sync] syncStockToCloud failed:', err);
    }
  }
};

/**
 * Creates or replaces a supplier document in Firestore.
 */
export const syncSupplierToCloud = async (storeId, supplier) => {
  if (!canSync() || !storeId || !supplier?.id) return;

  try {
    const supplierRef = doc(collection(db, `stores/${storeId}/suppliers`), String(supplier.id));
    await setDoc(supplierRef, { ...supplier, id: String(supplier.id), storeId }, { merge: true });
    console.log('[Sync] Supplier synced:', supplier.id);
  } catch (err) {
    console.error('[Sync] syncSupplierToCloud failed:', err);
  }
};

/**
 * Creates or replaces a product document in Firestore.
 */
export const syncProductToCloud = async (storeId, product) => {
  if (!canSync() || !storeId || product?.id == null) return;

  try {
    const productRef = doc(collection(db, `stores/${storeId}/products`), String(product.id));
    await setDoc(productRef, { ...product, id: String(product.id), storeId }, { merge: true });
    console.log('[Sync] Product synced:', product.id);
  } catch (err) {
    console.error('[Sync] syncProductToCloud failed:', err);
  }
};

/**
 * Creates or replaces a manual entry document in Firestore.
 */
export const syncManualEntryToCloud = async (storeId, entry) => {
  if (!canSync() || !storeId || !entry?.id) return;

  try {
    const entryRef = doc(collection(db, `stores/${storeId}/manualEntries`), String(entry.id));
    await setDoc(entryRef, { ...entry, id: String(entry.id), storeId }, { merge: true });
    console.log('[Sync] Manual entry synced:', entry.id);
  } catch (err) {
    console.error('[Sync] syncManualEntryToCloud failed:', err);
  }
};

/**
 * Deletes a manual entry document from Firestore.
 */
export const deleteManualEntryFromCloud = async (storeId, entryId) => {
  if (!canSync() || !storeId || !entryId) return;

  try {
    const entryRef = doc(collection(db, `stores/${storeId}/manualEntries`), String(entryId));
    await deleteDoc(entryRef);
    console.log('[Sync] Manual entry deleted:', entryId);
  } catch (err) {
    console.error('[Sync] deleteManualEntryFromCloud failed:', err);
  }
};

/**
 * Writes the business profile to the root store document.
 */
export const syncBusinessToCloud = async (storeId, businessData) => {
  if (!canSync() || !storeId) return;

  try {
    const storeRef = doc(db, 'stores', storeId);
    await setDoc(storeRef, { business: businessData, storeId }, { merge: true });
    console.log('[Sync] Business profile synced');
  } catch (err) {
    console.error('[Sync] syncBusinessToCloud failed:', err);
  }
};
