/**
 * Firebase Admin SDK Type Tests
 *
 * This file provides type-level tests to ensure the admin module
 * exports the correct types and functions.
 *
 * Note: Actual runtime tests should be done with emulators running.
 */

import { getAdminFirestore, getAdminAuth } from '../admin';
import type { Firestore, Auth } from '../admin';

// Type assertion tests (compile-time only)
type AssertType<T, Expected> = T extends Expected
  ? Expected extends T
    ? true
    : never
  : never;

// Test: getAdminFirestore returns Firestore instance
type FirestoreTest = AssertType<
  ReturnType<typeof getAdminFirestore>,
  Firestore
>;

// Test: getAdminAuth returns Auth instance
type AuthTest = AssertType<
  ReturnType<typeof getAdminAuth>,
  Auth
>;

/**
 * Example usage patterns for documentation
 */
export const exampleUsage = {
  /**
   * Example 1: Basic Firestore query with admin privileges
   */
  async queryItems() {
    'use server';
    const db = getAdminFirestore();
    const itemsRef = db.collection('items');
    const snapshot = await itemsRef.limit(10).get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  /**
   * Example 2: Generate next item ID (admin-only operation)
   */
  async generateNextId() {
    'use server';
    const db = getAdminFirestore();
    const itemsRef = db.collection('items');

    // Query latest item by ID (requires composite index)
    const snapshot = await itemsRef
      .orderBy('id', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return 'DTA-000001';
    }

    const lastId = snapshot.docs[0].id;
    const lastNumber = parseInt(lastId.replace('DTA-', ''), 10);
    const nextNumber = lastNumber + 1;

    return `DTA-${nextNumber.toString().padStart(6, '0')}`;
  },

  /**
   * Example 3: Batch operation with admin SDK
   */
  async batchUpdateMotifs() {
    'use server';
    const db = getAdminFirestore();
    const batch = db.batch();

    const itemsRef = db.collection('items');
    const snapshot = await itemsRef.where('type', '==', 'KAIDAN').get();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        motifs: ['ghost', 'supernatural'],
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();
  },

  /**
   * Example 4: Custom claims for admin users
   */
  async setAdminClaim(uid: string) {
    'use server';
    const auth = getAdminAuth();

    await auth.setCustomUserClaims(uid, { admin: true });
  },

  /**
   * Example 5: Verify user token and check claims
   */
  async verifyAdminToken(idToken: string) {
    'use server';
    const auth = getAdminAuth();

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const isAdmin = decodedToken.admin === true;

      return { uid: decodedToken.uid, isAdmin };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  },
};

/**
 * Security patterns for admin operations
 */
export const securityPatterns = {
  /**
   * Pattern 1: Input validation before admin operation
   */
  async safeGetItem(id: string) {
    'use server';

    // Validate input format
    if (!id || !id.match(/^DTA-\d{6}$/)) {
      throw new Error('Invalid item ID format. Expected: DTA-XXXXXX');
    }

    const db = getAdminFirestore();
    const docRef = db.collection('items').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() };
  },

  /**
   * Pattern 2: Check user authentication before admin operation
   */
  async authenticatedUpdate(idToken: string, itemId: string, data: object) {
    'use server';

    // Verify user is authenticated
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    if (!decodedToken) {
      throw new Error('Unauthorized: Invalid token');
    }

    // Check if user has admin privileges
    if (!decodedToken.admin) {
      throw new Error('Forbidden: Admin privileges required');
    }

    // Perform admin operation
    const db = getAdminFirestore();
    const docRef = db.collection('items').doc(itemId);

    await docRef.update({
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: decodedToken.uid,
    });
  },

  /**
   * Pattern 3: Transaction for atomic operations
   */
  async atomicIdGeneration() {
    'use server';
    const db = getAdminFirestore();

    // Use transaction to prevent race conditions
    return await db.runTransaction(async (transaction) => {
      const counterRef = db.collection('metadata').doc('counters');
      const counterDoc = await transaction.get(counterRef);

      let nextId = 1;
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.lastItemId || 0) + 1;
      }

      transaction.set(counterRef, { lastItemId: nextId }, { merge: true });

      return `DTA-${nextId.toString().padStart(6, '0')}`;
    });
  },
};
