/**
 * Firestore Data Access Functions
 *
 * Functions to fetch data from Firestore.
 * Supports both production Firebase and local emulator.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './client';
import type {
  ItemDoc,
  CollectionDoc,
  ItemType,
  SourceConfidence,
  Language,
} from '@/types/firestore';

// ============================================================================
// Items Collection
// ============================================================================

/**
 * Fetch all published items
 */
export async function getPublishedItems(): Promise<ItemDoc[]> {
  const itemsRef = collection(db, 'items');
  const q = query(
    itemsRef,
    where('status', '==', 'PUBLISHED'),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as ItemDoc[];
}

/**
 * Fetch a single item by ID
 */
export async function getItemById(id: string): Promise<ItemDoc | null> {
  const itemRef = doc(db, 'items', id);
  const snapshot = await getDoc(itemRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  } as ItemDoc;
}

/**
 * Fetch items with filters
 */
export async function getFilteredItems(options: {
  type?: ItemType[];
  confidence?: SourceConfidence[];
  language?: Language[];
  searchTokens?: string[];
  sortField?: 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limitCount?: number;
}): Promise<ItemDoc[]> {
  const {
    type,
    confidence,
    language,
    searchTokens,
    sortField = 'updatedAt',
    sortOrder = 'desc',
    limitCount,
  } = options;

  const itemsRef = collection(db, 'items');
  const constraints: QueryConstraint[] = [
    where('status', '==', 'PUBLISHED'),
  ];

  // Note: Firestore doesn't support multiple array-contains or IN clauses
  // For complex filtering, we need to filter client-side or use composite indexes

  // Single type filter
  if (type && type.length === 1) {
    constraints.push(where('type', '==', type[0]));
  }

  // Single confidence filter
  if (confidence && confidence.length === 1) {
    constraints.push(where('confidence', '==', confidence[0]));
  }

  // Single language filter
  if (language && language.length === 1) {
    constraints.push(where('language', '==', language[0]));
  }

  // Search by tokens (array-contains for single token)
  if (searchTokens && searchTokens.length === 1) {
    constraints.push(where('searchTokens', 'array-contains', searchTokens[0]));
  }

  // Sorting
  constraints.push(orderBy(sortField, sortOrder));

  // Limit
  if (limitCount) {
    constraints.push(firestoreLimit(limitCount));
  }

  const q = query(itemsRef, ...constraints);
  const snapshot = await getDocs(q);

  let items = snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as ItemDoc[];

  // Client-side filtering for multiple values (Firestore limitation)
  if (type && type.length > 1) {
    items = items.filter((item) => type.includes(item.type));
  }
  if (confidence && confidence.length > 1) {
    items = items.filter((item) => confidence.includes(item.confidence));
  }
  if (language && language.length > 1) {
    items = items.filter((item) => language.includes(item.language));
  }
  if (searchTokens && searchTokens.length > 1) {
    items = items.filter((item) =>
      searchTokens.every((token) => item.searchTokens?.includes(token))
    );
  }

  return items;
}

/**
 * Fetch recent items (for home page)
 */
export async function getRecentItems(count: number = 5): Promise<ItemDoc[]> {
  const itemsRef = collection(db, 'items');
  const q = query(
    itemsRef,
    where('status', '==', 'PUBLISHED'),
    orderBy('createdAt', 'desc'),
    firestoreLimit(count)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as ItemDoc[];
}

/**
 * Fetch recently updated items (for home page)
 */
export async function getRecentlyUpdatedItems(count: number = 5): Promise<ItemDoc[]> {
  const itemsRef = collection(db, 'items');
  const q = query(
    itemsRef,
    where('status', '==', 'PUBLISHED'),
    orderBy('updatedAt', 'desc'),
    firestoreLimit(count)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as ItemDoc[];
}

/**
 * Fetch featured items (most annotated)
 */
export async function getFeaturedItems(count: number = 3): Promise<ItemDoc[]> {
  const itemsRef = collection(db, 'items');
  const q = query(
    itemsRef,
    where('status', '==', 'PUBLISHED'),
    orderBy('annotationCount', 'desc'),
    firestoreLimit(count)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as ItemDoc[];
}

// ============================================================================
// Collections
// ============================================================================

/**
 * Fetch all published collections
 */
export async function getPublishedCollections(): Promise<CollectionDoc[]> {
  const collectionsRef = collection(db, 'collections');
  const q = query(
    collectionsRef,
    where('status', '==', 'PUBLISHED'),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    slug: doc.id,
  })) as CollectionDoc[];
}

/**
 * Fetch a single collection by slug
 */
export async function getCollectionBySlug(slug: string): Promise<CollectionDoc | null> {
  const collectionRef = doc(db, 'collections', slug);
  const snapshot = await getDoc(collectionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.data(),
    slug: snapshot.id,
  } as CollectionDoc;
}

/**
 * Fetch items in a collection
 */
export async function getItemsInCollection(itemIds: string[]): Promise<ItemDoc[]> {
  if (itemIds.length === 0) return [];

  // Fetch items individually (Firestore doesn't support whereIn with more than 10 items)
  const items: ItemDoc[] = [];

  for (const id of itemIds) {
    const item = await getItemById(id);
    if (item && item.status === 'PUBLISHED') {
      items.push(item);
    }
  }

  return items;
}
