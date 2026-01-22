/**
 * Firebase Client SDK Initialization
 *
 * This file initializes the Firebase client SDK for use in client-side code.
 * It checks for an existing Firebase app instance before initializing to prevent
 * duplicate app initialization errors.
 *
 * Emulator Support:
 * - Set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true to connect to local emulators
 * - Emulator hosts can be configured via environment variables
 *
 * Security Notes:
 * - Environment variables with NEXT_PUBLIC_ prefix are exposed to the browser
 * - Firebase client config is safe to expose (protected by Firebase security rules)
 * - Never include server-side secrets in this file
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

// Check if using emulators
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

// Firebase configuration
// When using emulators, provide default values for demo project
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (useEmulator ? 'demo-api-key' : undefined),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (useEmulator ? 'demo-dta.firebaseapp.com' : undefined),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (useEmulator ? 'demo-dta' : undefined),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (useEmulator ? 'demo-dta.appspot.com' : undefined),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (useEmulator ? '123456789' : undefined),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (useEmulator ? '1:123456789:web:abc123' : undefined),
};

// Validate required environment variables (only when not using emulators)
if (!useEmulator) {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ] as const;

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
      'Please ensure all NEXT_PUBLIC_FIREBASE_* variables are set in .env.local\n' +
      'Or set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true to use local emulators'
    );
  }
}

// Initialize Firebase app (check for existing app to prevent re-initialization)
let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);

// Track if emulators have been connected (to prevent multiple connections)
let emulatorsConnected = false;

// Connect to emulators if enabled (works on both server and client)
if (useEmulator && !emulatorsConnected) {
  const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
  const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST || 'localhost:9099';
  const storageHost = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST || 'localhost:9199';

  const [firestoreHostname, firestorePort] = firestoreHost.split(':');
  const [storageHostname, storagePort] = storageHost.split(':');

  try {
    connectFirestoreEmulator(db, firestoreHostname, parseInt(firestorePort, 10));
    // Auth and Storage emulators only connect on client side
    if (typeof window !== 'undefined') {
      connectAuthEmulator(auth, `http://${authHost}`);
      connectStorageEmulator(storage, storageHostname, parseInt(storagePort, 10));
    }
    emulatorsConnected = true;
    console.log('[Firebase] Connected to Firestore emulator (server/client)');
  } catch (error) {
    // Emulators may already be connected (e.g., during hot reload)
    console.warn('[Firebase] Emulator connection warning:', error);
  }
}

// Export Firebase app and services
export { app, db, auth, storage };
