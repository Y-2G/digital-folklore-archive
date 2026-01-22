/**
 * Item Service - Core Business Logic
 *
 * This module contains the core business logic for item operations,
 * shared between REST API and MCP server.
 */

import { Timestamp } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { generateItemId } from '@/lib/api/idGenerator';
import { generateSearchTokens } from '@/lib/catalog/searchTokens';
import type { CreateItemRequest } from '@/lib/api/validation';
import type { ItemDoc } from '@/types/firestore';

/**
 * Result of creating a new item
 */
export interface CreateItemResult {
  id: string;
  createdAt: Date;
}

/**
 * Creates a new folklore item in Firestore
 *
 * This function handles:
 * - Sequential ID generation (DTA-XXXXXX format)
 * - Search token generation for full-text search
 * - Timestamp management (createdAt, updatedAt)
 * - Counter initialization (annotationCount, revisionCount)
 *
 * @param data - Validated item data (from CreateItemRequestSchema)
 * @returns Created item ID and timestamp
 *
 * @example
 * ```typescript
 * const result = await createItem({
 *   type: 'KAIDAN',
 *   language: 'JA',
 *   confidence: 'PRIMARY',
 *   title: { ja: 'きさらぎ駅' },
 *   body: { ja: '...' },
 *   motifs: ['PLACE', 'MISSING_PERSON'],
 *   status: 'DRAFT',
 * });
 * console.log(result.id); // 'DTA-000001'
 * ```
 */
export async function createItem(data: CreateItemRequest): Promise<CreateItemResult> {
  // 1. Generate unique item ID
  const id = await generateItemId();

  // 2. Generate search tokens for full-text search
  const itemForTokens = {
    id,
    title: data.title,
    originalTitle: data.originalTitle,
    sourceName: data.sourceName,
    motifs: data.motifs,
  } as ItemDoc;

  const searchTokens = generateSearchTokens(itemForTokens);

  // 3. Prepare document for Firestore
  const now = Timestamp.now();

  const itemDoc: Omit<ItemDoc, 'createdAt' | 'updatedAt'> & {
    createdAt: Timestamp;
    updatedAt: Timestamp;
  } = {
    id,
    type: data.type,
    language: data.language,
    confidence: data.confidence,
    title: data.title,
    body: data.body,
    motifs: data.motifs,
    status: data.status,
    searchTokens,
    annotationCount: 0,
    revisionCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Add optional fields if provided
  if (data.originalTitle) {
    itemDoc.originalTitle = data.originalTitle;
  }
  if (data.firstSeen) {
    itemDoc.firstSeen = data.firstSeen;
  }
  if (data.sourceName) {
    itemDoc.sourceName = data.sourceName;
  }
  if (data.sourceUrl) {
    itemDoc.sourceUrl = data.sourceUrl;
  }
  if (data.sourceArchiveUrl) {
    itemDoc.sourceArchiveUrl = data.sourceArchiveUrl;
  }
  if (data.formats && data.formats.length > 0) {
    itemDoc.formats = data.formats;
  }
  if (data.region) {
    itemDoc.region = data.region;
  }
  if (data.medium) {
    itemDoc.medium = data.medium;
  }

  // 4. Save to Firestore
  const db = getAdminFirestore();
  await db.collection('items').doc(id).set(itemDoc);

  return {
    id,
    createdAt: now.toDate(),
  };
}
