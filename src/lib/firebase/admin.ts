/**
 * Firebase Admin SDK Initialization (Server-Side Only)
 *
 * This file initializes the Firebase Admin SDK for server-side operations including:
 * - Server actions with elevated privileges
 * - Admin tasks (batch operations, security rule testing)
 * - Background jobs and scheduled functions
 *
 * Authentication Methods:
 * 1. Google Application Default Credentials (ADC)
 *    - Set GOOGLE_APPLICATION_CREDENTIALS to point to service account JSON
 *    - Recommended for production environments
 * 2. Environment Variables
 *    - FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY (recommended)
 *    - Or legacy: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *    - Alternative method when ADC is not available
 *
 * Emulator Support:
 * - Set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true to connect to local emulators
 * - Admin SDK will use emulator hosts configured in environment variables
 * - No authentication required when using emulators
 *
 * Security Notes:
 * - THIS MODULE IS SERVER-SIDE ONLY - never import in client code
 * - Service account credentials grant full database access
 * - Never expose FIREBASE_PRIVATE_KEY or service account JSON to the client
 * - Use Firebase security rules as the primary defense for client operations
 */

import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Check if using emulators
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

// Singleton instances
let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminAuthInstance: Auth | undefined;

/**
 * Initialize Firebase Admin SDK
 * Uses singleton pattern to prevent multiple initializations
 */
function initializeAdminApp(): App {
  // Return existing app if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // When using emulators, minimal config is sufficient
  if (useEmulator) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-dta';

    console.error(`[Firebase Admin] Initializing for emulator (project: ${projectId})`);

    return initializeApp({
      projectId,
    });
  }

  // Production: Try Google Application Default Credentials first
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('[Firebase Admin] Using Google Application Default Credentials');

    // The cert() function will automatically read from GOOGLE_APPLICATION_CREDENTIALS
    return initializeApp({
      credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    });
  }

  // Production: Fall back to explicit environment variables
  // Support both FIREBASE_ADMIN_* (recommended) and FIREBASE_* (legacy) prefixes
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials.\n' +
      'Either set GOOGLE_APPLICATION_CREDENTIALS to point to service account JSON,\n' +
      'or provide FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.\n' +
      'For local development, set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true to use emulators.'
    );
  }

  console.error(`[Firebase Admin] Initializing with explicit credentials (project: ${projectId})`);

  // Private key from environment variables may have escaped newlines
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey: formattedPrivateKey,
  };

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

/**
 * Get Admin Firestore instance
 * Automatically connects to emulator if NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
 *
 * @returns Firestore instance with admin privileges
 */
export function getAdminFirestore(): Firestore {
  if (adminDb) {
    return adminDb;
  }

  // Initialize app if needed
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }

  adminDb = getFirestore(adminApp);

  // Connect to Firestore emulator if enabled
  if (useEmulator) {
    const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
    const [hostname, port] = firestoreHost.split(':');

    // Admin SDK uses different method for emulator connection
    adminDb.settings({
      host: `${hostname}:${port}`,
      ssl: false,
    });

    console.error(`[Firebase Admin] Connected to Firestore emulator at ${firestoreHost}`);
  }

  return adminDb;
}

/**
 * Get Admin Auth instance
 * For future use in authentication-related server actions
 *
 * @returns Auth instance with admin privileges
 */
export function getAdminAuth(): Auth {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }

  // Initialize app if needed
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }

  adminAuthInstance = getAuth(adminApp);

  // Auth emulator connection
  if (useEmulator) {
    const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST || 'localhost:9099';

    // Admin SDK connects to Auth emulator via environment variable
    // This is set automatically when using Firebase emulators
    console.error(`[Firebase Admin] Auth emulator expected at ${authHost}`);
  }

  return adminAuthInstance;
}

/**
 * Type re-exports for convenience
 */
export type { Firestore, Auth };
