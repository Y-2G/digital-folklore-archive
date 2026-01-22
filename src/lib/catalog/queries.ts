/**
 * Catalog Query Builders
 *
 * Query builders for Firestore catalog operations.
 * Fetches data from Firebase Firestore (or emulator in development).
 *
 * Based on docs/design/06-search.md
 */

import type { ItemDoc, ItemType, SourceConfidence, Language, FirstSeen, Motif } from '@/types/firestore';
import { getPublishedItems } from '@/lib/firebase/firestore';
import { normalizeSearchQuery, matchesSearchQuery } from './searchTokens';

// ============================================================================
// Types
// ============================================================================

export type SortField = 'updatedAt' | 'createdAt' | 'firstSeen' | 'annotationCount';
export type SortOrder = 'asc' | 'desc';

export interface CatalogFilters {
  type?: ItemType[];
  confidence?: SourceConfidence[];
  language?: Language[];
  firstSeen?: FirstSeen[];
  motif?: Motif[];
  search?: string;
}

export interface CatalogQueryOptions {
  filters?: CatalogFilters;
  sort?: {
    field: SortField;
    order: SortOrder;
  };
  limit?: number;
  offset?: number;
}

export interface CatalogQueryResult {
  items: ItemDoc[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Firestore Query Implementation
// ============================================================================

/**
 * Query catalog items with filters and sorting
 * Fetches from Firestore and applies client-side filtering for complex queries
 */
export async function queryCatalogItems(options: CatalogQueryOptions = {}): Promise<CatalogQueryResult> {
  const {
    filters = {},
    sort = { field: 'updatedAt', order: 'desc' },
    limit = 20,
    offset = 0,
  } = options;

  // Fetch all published items from Firestore
  let items = await getPublishedItems();

  // Apply filters (client-side for flexibility)
  items = applyFilters(items, filters);

  // Get total before pagination
  const total = items.length;

  // Apply sorting
  items = applySorting(items, sort.field, sort.order);

  // Apply pagination
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Apply filters to items array
 */
function applyFilters(items: ItemDoc[], filters: CatalogFilters): ItemDoc[] {
  let filtered = items;

  // Filter by type
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(item => filters.type!.includes(item.type));
  }

  // Filter by confidence
  if (filters.confidence && filters.confidence.length > 0) {
    filtered = filtered.filter(item => filters.confidence!.includes(item.confidence));
  }

  // Filter by language
  if (filters.language && filters.language.length > 0) {
    filtered = filtered.filter(item => filters.language!.includes(item.language));
  }

  // Filter by firstSeen
  if (filters.firstSeen && filters.firstSeen.length > 0) {
    const firstSeenFilters = filters.firstSeen as string[];
    filtered = filtered.filter(item =>
      item.firstSeen && firstSeenFilters.includes(item.firstSeen)
    );
  }

  // Filter by motif (any match)
  if (filters.motif && filters.motif.length > 0) {
    filtered = filtered.filter(item =>
      item.motifs && item.motifs.some(m => filters.motif!.includes(m))
    );
  }

  // Filter by search query
  if (filters.search && filters.search.trim()) {
    const normalizedQuery = normalizeSearchQuery(filters.search);
    filtered = filtered.filter(item =>
      item.searchTokens && matchesSearchQuery(item.searchTokens, normalizedQuery)
    );
  }

  return filtered;
}

/**
 * Apply sorting to items array
 */
function applySorting(
  items: ItemDoc[],
  field: SortField,
  order: SortOrder
): ItemDoc[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'updatedAt':
        comparison = getTimestamp(a.updatedAt) - getTimestamp(b.updatedAt);
        break;
      case 'createdAt':
        comparison = getTimestamp(a.createdAt) - getTimestamp(b.createdAt);
        break;
      case 'firstSeen':
        // Sort by era: Pre-1999 < 2000s < 2010s < 2020s < Unknown
        const eraOrder: Record<string, number> = {
          'Pre-1999': 1,
          '2000s': 2,
          '2010s': 3,
          '2020s': 4,
          'Unknown': 5,
        };
        const aOrder = a.firstSeen ? eraOrder[a.firstSeen] || 99 : 99;
        const bOrder = b.firstSeen ? eraOrder[b.firstSeen] || 99 : 99;
        comparison = aOrder - bOrder;
        break;
      case 'annotationCount':
        comparison = (a.annotationCount || 0) - (b.annotationCount || 0);
        break;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Helper to get timestamp value from Firestore Timestamp or Date
 */
function getTimestamp(value: unknown): number {
  if (!value) return 0;
  // Firestore Timestamp
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  // Regular Date
  if (value instanceof Date) {
    return value.getTime();
  }
  // Firestore Timestamp from REST API (seconds + nanoseconds)
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return (value as { seconds: number }).seconds * 1000;
  }
  return 0;
}

// ============================================================================
// Facet Counting
// ============================================================================

export interface FacetCounts {
  type: Record<ItemType, number>;
  confidence: Record<SourceConfidence, number>;
  language: Record<Language, number>;
  firstSeen: Record<FirstSeen, number>;
  motif: Record<Motif, number>;
}

/**
 * Count items per facet value
 * Used to display counts next to filter options
 */
export async function getFacetCounts(items?: ItemDoc[]): Promise<FacetCounts> {
  const sourceItems = items ?? await getPublishedItems();

  const counts: FacetCounts = {
    type: {} as Record<ItemType, number>,
    confidence: {} as Record<SourceConfidence, number>,
    language: {} as Record<Language, number>,
    firstSeen: {} as Record<FirstSeen, number>,
    motif: {} as Record<Motif, number>,
  };

  for (const item of sourceItems) {
    // Count types
    counts.type[item.type] = (counts.type[item.type] || 0) + 1;

    // Count confidence
    counts.confidence[item.confidence] = (counts.confidence[item.confidence] || 0) + 1;

    // Count language
    counts.language[item.language] = (counts.language[item.language] || 0) + 1;

    // Count firstSeen
    if (item.firstSeen) {
      const fs = item.firstSeen as FirstSeen;
      counts.firstSeen[fs] = (counts.firstSeen[fs] || 0) + 1;
    }

    // Count motifs
    if (item.motifs) {
      for (const motif of item.motifs) {
        counts.motif[motif] = (counts.motif[motif] || 0) + 1;
      }
    }
  }

  return counts;
}

// ============================================================================
// URL Query Parameter Helpers
// ============================================================================

/**
 * Parse URL search params into CatalogFilters
 */
export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams
): CatalogFilters {
  const filters: CatalogFilters = {};

  const type = searchParams.getAll('type');
  if (type.length > 0) filters.type = type as ItemType[];

  const confidence = searchParams.getAll('confidence');
  if (confidence.length > 0) filters.confidence = confidence as SourceConfidence[];

  const language = searchParams.getAll('language');
  if (language.length > 0) filters.language = language as Language[];

  const firstSeen = searchParams.getAll('firstSeen');
  if (firstSeen.length > 0) filters.firstSeen = firstSeen as FirstSeen[];

  const motif = searchParams.getAll('motif');
  if (motif.length > 0) filters.motif = motif as Motif[];

  const search = searchParams.get('q');
  if (search) filters.search = search;

  return filters;
}

/**
 * Convert CatalogFilters to URL search params
 */
export function filtersToSearchParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.type) {
    for (const t of filters.type) params.append('type', t);
  }
  if (filters.confidence) {
    for (const c of filters.confidence) params.append('confidence', c);
  }
  if (filters.language) {
    for (const l of filters.language) params.append('language', l);
  }
  if (filters.firstSeen) {
    for (const f of filters.firstSeen) params.append('firstSeen', f);
  }
  if (filters.motif) {
    for (const m of filters.motif) params.append('motif', m);
  }
  if (filters.search) {
    params.set('q', filters.search);
  }

  return params;
}

/**
 * Parse sort parameter from URL
 */
export function parseSortFromSearchParams(
  searchParams: URLSearchParams
): { field: SortField; order: SortOrder } {
  const sort = searchParams.get('sort');

  switch (sort) {
    case 'new':
      return { field: 'createdAt', order: 'desc' };
    case 'updated':
      return { field: 'updatedAt', order: 'desc' };
    case 'firstSeen':
      return { field: 'firstSeen', order: 'asc' };
    case 'mostAnnotated':
      return { field: 'annotationCount', order: 'desc' };
    default:
      return { field: 'updatedAt', order: 'desc' };
  }
}
