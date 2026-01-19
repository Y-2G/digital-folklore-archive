/**
 * Search Token Generation
 *
 * Generates searchTokens array for Firestore array-contains queries.
 * Based on docs/design/06-search.md
 */

import type { ItemDoc } from '@/types/firestore';

/**
 * Normalize text for search indexing
 * - Lowercase
 * - NFKC normalization (converts full-width to half-width, etc.)
 * - Remove symbols and punctuation
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove non-letter, non-number chars (keep spaces)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate prefix tokens for partial matching
 * Example: "くねくね" → ["く", "くね", "くねく", "くねくね"]
 *
 * @param text - Normalized text to tokenize
 * @param minLength - Minimum prefix length (default: 1)
 * @param maxLength - Maximum prefix length (default: text length)
 */
export function generatePrefixTokens(
  text: string,
  minLength: number = 1,
  maxLength?: number
): string[] {
  const tokens: string[] = [];
  const normalizedText = normalizeText(text);

  if (!normalizedText) return tokens;

  // Split into words and generate prefixes for each word
  const words = normalizedText.split(' ').filter(w => w.length > 0);

  for (const word of words) {
    const max = maxLength ?? word.length;
    for (let i = minLength; i <= Math.min(max, word.length); i++) {
      tokens.push(word.slice(0, i));
    }
  }

  return [...new Set(tokens)]; // Remove duplicates
}

/**
 * Extract seeds (source texts) from an item for tokenization
 */
function extractSeeds(item: ItemDoc): string[] {
  const seeds: string[] = [];

  // ID (e.g., "DTA-000128")
  if (item.id) {
    seeds.push(item.id);
    // Also add without prefix for searching by number
    const numericPart = item.id.replace(/^DTA-/, '');
    if (numericPart) {
      seeds.push(numericPart);
    }
  }

  // Titles
  if (item.title.ja) seeds.push(item.title.ja);
  if (item.title.en) seeds.push(item.title.en);
  if (item.originalTitle) seeds.push(item.originalTitle);

  // Source
  if (item.sourceName) seeds.push(item.sourceName);

  // Motifs (as readable text)
  if (item.motifs && item.motifs.length > 0) {
    seeds.push(...item.motifs);
  }

  return seeds.filter(s => s && s.trim().length > 0);
}

/**
 * Generate searchTokens array for an item
 *
 * This is the main function to use when creating/updating items.
 * The generated tokens are stored in the `searchTokens` field.
 */
export function generateSearchTokens(item: ItemDoc): string[] {
  const seeds = extractSeeds(item);
  const allTokens: string[] = [];

  for (const seed of seeds) {
    // Add the full normalized seed
    const normalized = normalizeText(seed);
    if (normalized) {
      allTokens.push(normalized);
    }

    // Add prefix tokens for partial matching
    // Limit max prefix length to 10 to avoid excessive tokens
    const prefixes = generatePrefixTokens(seed, 1, 10);
    allTokens.push(...prefixes);
  }

  // Remove duplicates and empty strings, sort for consistency
  const uniqueTokens = [...new Set(allTokens)]
    .filter(t => t.length > 0)
    .sort();

  return uniqueTokens;
}

/**
 * Normalize a search query for matching against searchTokens
 */
export function normalizeSearchQuery(query: string): string {
  return normalizeText(query);
}

/**
 * Check if a search query would match an item's searchTokens
 * (Client-side filtering for mock data)
 */
export function matchesSearchQuery(
  searchTokens: string[],
  query: string
): boolean {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return true; // Empty query matches all

  // Check if any token starts with or equals the query
  return searchTokens.some(
    token => token === normalizedQuery || token.startsWith(normalizedQuery)
  );
}
