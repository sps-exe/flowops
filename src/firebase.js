import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredEnvKeys = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
};

const missingFirebaseKeys = Object.entries(requiredEnvKeys)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const hasAllFirebaseKeys = missingFirebaseKeys.length === 0;
const app = hasAllFirebaseKeys ? initializeApp(firebaseConfig) : null;

if (!hasAllFirebaseKeys) {
  console.warn('[Firebase] Missing env keys:', missingFirebaseKeys.join(', '));
}

// Initialize Firebase Authentication and get a reference to the service
export const isFirebaseConfigured = hasAllFirebaseKeys;

export const auth = isFirebaseConfigured ? getAuth(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = isFirebaseConfigured ? getFirestore(app) : null;

// Enable offline persistence
// This guarantees MSME stores can continue working if their internet drops.
if (db) {
  enableMultiTabIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
      } else if (err.code == 'unimplemented') {
        console.warn("The current browser does not support all of the features required to enable persistence");
      }
    });
}

export default app;
