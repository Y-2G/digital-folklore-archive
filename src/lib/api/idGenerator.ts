/**
 * ID Generator Module
 *
 * Generates sequential item IDs in the format DTA-XXXXXX.
 * Uses Firestore transactions to ensure atomicity and prevent duplicate IDs.
 *
 * Storage:
 * - Counter document: /counters/items
 * - Field: count (number)
 *
 * Thread Safety:
 * - Uses Firestore transactions for atomic read-increment-write
 * - Safe for concurrent requests
 */

import { getAdminFirestore } from '@/lib/firebase/admin';

/**
 * Counter document path
 */
const COUNTER_COLLECTION = 'counters';
const COUNTER_DOCUMENT = 'items';

/**
 * ID prefix for all items
 */
const ID_PREFIX = 'DTA';

/**
 * Number of digits in the numeric portion
 */
const ID_DIGITS = 6;

/**
 * Formats a number as a padded item ID
 *
 * @param num - The sequence number
 * @returns Formatted ID string (e.g., "DTA-000001")
 *
 * @example
 * formatItemId(1)    // "DTA-000001"
 * formatItemId(128)  // "DTA-000128"
 * formatItemId(999999) // "DTA-999999"
 */
export function formatItemId(num: number): string {
  const paddedNum = String(num).padStart(ID_DIGITS, '0');
  return `${ID_PREFIX}-${paddedNum}`;
}

/**
 * Parses an item ID and extracts the sequence number
 *
 * @param id - Item ID string (e.g., "DTA-000128")
 * @returns The numeric portion, or null if invalid
 *
 * @example
 * parseItemId("DTA-000128")  // 128
 * parseItemId("invalid")     // null
 */
export function parseItemId(id: string): number | null {
  const match = id.match(/^DTA-(\d{6})$/);
  if (!match) {
    return null;
  }
  return parseInt(match[1], 10);
}

/**
 * Validates if a string is a valid item ID format
 *
 * @param id - String to validate
 * @returns true if valid DTA-XXXXXX format
 */
export function isValidItemId(id: string): boolean {
  return /^DTA-\d{6}$/.test(id);
}

/**
 * Generates the next sequential item ID
 *
 * Uses a Firestore transaction to atomically:
 * 1. Read the current counter value
 * 2. Increment the counter
 * 3. Write the new counter value
 *
 * This ensures no two items can receive the same ID, even under
 * concurrent requests.
 *
 * @returns Promise resolving to the new item ID (e.g., "DTA-000129")
 * @throws Error if the transaction fails after retries
 *
 * @example
 * ```typescript
 * const newId = await generateItemId();
 * console.log(newId); // "DTA-000001" (first item)
 *
 * const nextId = await generateItemId();
 * console.log(nextId); // "DTA-000002" (second item)
 * ```
 */
export async function generateItemId(): Promise<string> {
  const db = getAdminFirestore();
  const counterRef = db.collection(COUNTER_COLLECTION).doc(COUNTER_DOCUMENT);

  // Run atomic transaction to get next ID
  const newId = await db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let currentCount: number;

    if (!counterDoc.exists) {
      // First item - initialize counter
      currentCount = 0;
    } else {
      const data = counterDoc.data();
      currentCount = data?.count ?? 0;

      // Validate counter value
      if (typeof currentCount !== 'number' || !Number.isInteger(currentCount)) {
        throw new Error('Invalid counter value in database');
      }
    }

    // Increment counter
    const newCount = currentCount + 1;

    // Check for overflow (unlikely but handle gracefully)
    if (newCount > 999999) {
      throw new Error('ID counter overflow: maximum capacity reached');
    }

    // Update counter document
    transaction.set(
      counterRef,
      {
        count: newCount,
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    return formatItemId(newCount);
  });

  return newId;
}

/**
 * Gets the current counter value without incrementing
 * Useful for monitoring and debugging
 *
 * @returns Promise resolving to the current count, or 0 if not initialized
 */
export async function getCurrentCount(): Promise<number> {
  const db = getAdminFirestore();
  const counterRef = db.collection(COUNTER_COLLECTION).doc(COUNTER_DOCUMENT);

  const counterDoc = await counterRef.get();

  if (!counterDoc.exists) {
    return 0;
  }

  const data = counterDoc.data();
  return data?.count ?? 0;
}

/**
 * Initializes or resets the counter to a specific value
 * WARNING: Only use for testing or migration purposes
 *
 * @param count - The value to set the counter to
 * @throws Error if count is invalid
 */
export async function setCounter(count: number): Promise<void> {
  if (!Number.isInteger(count) || count < 0 || count > 999999) {
    throw new Error('Counter must be an integer between 0 and 999999');
  }

  const db = getAdminFirestore();
  const counterRef = db.collection(COUNTER_COLLECTION).doc(COUNTER_DOCUMENT);

  await counterRef.set({
    count,
    lastUpdated: new Date(),
    manuallySet: true,
  });
}
