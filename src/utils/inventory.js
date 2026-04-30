const DEFAULT_MIN_STOCK = 5;
const CRITICAL_STOCK_LEVEL = 2;

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function normalizeProduct(product) {
  const stock = Math.max(0, toSafeNumber(product?.stock, 0));
  const rawMinStock = toSafeNumber(product?.minStock, DEFAULT_MIN_STOCK);
  const minStock = Math.max(0, rawMinStock);

  return {
    ...product,
    stock,
    minStock,
    soldToday: Math.max(0, toSafeNumber(product?.soldToday, 0)),
  };
}

export function getStockStatus(product) {
  const normalized = normalizeProduct(product);

  if (normalized.stock <= CRITICAL_STOCK_LEVEL) return 'critical';
  if (normalized.stock <= normalized.minStock) return 'low';
  return 'ok';
}

export function isLowStock(product) {
  return getStockStatus(product) !== 'ok';
}

export function getStockBarPercent(stock, minStock) {
  const safeStock = Math.max(0, toSafeNumber(stock, 0));
  const safeMinStock = Math.max(0, toSafeNumber(minStock, DEFAULT_MIN_STOCK));
  const capacity = Math.max(safeMinStock * 2, 1);

  return Math.min(100, (safeStock / capacity) * 100);
}
