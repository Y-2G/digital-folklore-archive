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
const getFirebaseConfig = () => ({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (useEmulator ? 'demo-api-key' : ''),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (useEmulator ? 'demo-dta.firebaseapp.com' : ''),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (useEmulator ? 'demo-dta' : ''),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (useEmulator ? 'demo-dta.appspot.com' : ''),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (useEmulator ? '123456789' : ''),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (useEmulator ? '1:123456789:web:abc123' : ''),
});

/**
 * Validate required environment variables
 * Returns array of missing variable names, empty if all present
 */
const validateFirebaseConfig = (): string[] => {
  if (useEmulator) return [];

  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ] as const;

  return requiredEnvVars.filter((varName) => !process.env[varName]);
};

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  return useEmulator || validateFirebaseConfig().length === 0;
};

// Lazy initialization variables
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;
let _emulatorsConnected = false;

/**
 * Initialize Firebase app and services lazily
 * This prevents errors during build time when environment variables are not set
 */
const initializeFirebase = (): void => {
  if (_app) return; // Already initialized

  const missingVars = validateFirebaseConfig();
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
      'Please ensure all NEXT_PUBLIC_FIREBASE_* variables are set in .env.local\n' +
      'Or set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true to use local emulators'
    );
  }

  const firebaseConfig = getFirebaseConfig();

  // Initialize Firebase app (check for existing app to prevent re-initialization)
  if (getApps().length === 0) {
    _app = initializeApp(firebaseConfig);
  } else {
    _app = getApps()[0];
  }

  // Initialize services
  _db = getFirestore(_app);
  _auth = getAuth(_app);
  _storage = getStorage(_app);

  // Connect to emulators if enabled
  if (useEmulator && !_emulatorsConnected) {
    const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
    const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST || 'localhost:9099';
    const storageHost = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST || 'localhost:9199';

    const [firestoreHostname, firestorePort] = firestoreHost.split(':');
    const [storageHostname, storagePort] = storageHost.split(':');

    try {
      connectFirestoreEmulator(_db, firestoreHostname, parseInt(firestorePort, 10));
      // Auth and Storage emulators only connect on client side
      if (typeof window !== 'undefined') {
        connectAuthEmulator(_auth, `http://${authHost}`);
        connectStorageEmulator(_storage, storageHostname, parseInt(storagePort, 10));
      }
      _emulatorsConnected = true;
      console.log('[Firebase] Connected to Firestore emulator (server/client)');
    } catch (error) {
      // Emulators may already be connected (e.g., during hot reload)
      console.warn('[Firebase] Emulator connection warning:', error);
    }
  }
};

// Getter functions for lazy initialization
export const getFirebaseApp = (): FirebaseApp => {
  initializeFirebase();
  return _app!;
};

export const getDb = (): Firestore => {
  initializeFirebase();
  return _db!;
};

export const getFirebaseAuth = (): Auth => {
  initializeFirebase();
  return _auth!;
};

export const getFirebaseStorage = (): FirebaseStorage => {
  initializeFirebase();
  return _storage!;
};

// Legacy exports for backward compatibility
// These will throw if Firebase is not configured when accessed
export const app = new Proxy({} as FirebaseApp, {
  get(_, prop) {
    return getFirebaseApp()[prop as keyof FirebaseApp];
  },
});

export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    return getDb()[prop as keyof Firestore];
  },
});

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return getFirebaseAuth()[prop as keyof Auth];
  },
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(_, prop) {
    return getFirebaseStorage()[prop as keyof FirebaseStorage];
  },
});
