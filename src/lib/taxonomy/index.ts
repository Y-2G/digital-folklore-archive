/**
 * Taxonomy Dictionary Definitions
 *
 * Provides bilingual label dictionaries for all taxonomy enums.
 * Used for faceted search UI and display purposes.
 *
 * Reference: docs/design/04-taxonomy.md
 */

import type {
  ItemType,
  SourceConfidence,
  Language,
  FirstSeen,
  Motif,
  Region,
  Medium,
} from '@/types/firestore';

// ============================================
// Taxonomy Item Type
// ============================================

/**
 * Generic taxonomy item with bilingual labels
 */
export interface TaxonomyItem<T extends string> {
  value: T;
  label: {
    ja: string;
    en: string;
  };
}

// ============================================
// Type (種別)
// ============================================

/**
 * Item Types - Main content classification
 * Order: Display order in facet UI
 */
export const ITEM_TYPES: TaxonomyItem<ItemType>[] = [
  { value: 'KAIDAN', label: { ja: '怪談', en: 'Kaidan' } },
  { value: 'URBAN_LEGEND', label: { ja: '都市伝説', en: 'Urban Legend' } },
  { value: 'CREEPYPASTA', label: { ja: 'クリーピーパスタ', en: 'Creepypasta' } },
  { value: 'CHAIN_MEME', label: { ja: 'チェーン・ミーム', en: 'Chain Meme' } },
  { value: 'ORIGINAL', label: { ja: '創作', en: 'Original' } },
  { value: 'COMMENTARY', label: { ja: '解説', en: 'Commentary' } },
];

// ============================================
// Language (言語)
// ============================================

/**
 * Languages - Primary language of the content
 * Order: By frequency (JA most common)
 */
export const LANGUAGES: TaxonomyItem<Language>[] = [
  { value: 'JA', label: { ja: '日本語', en: 'Japanese' } },
  { value: 'EN', label: { ja: '英語', en: 'English' } },
  { value: 'OTHER', label: { ja: 'その他', en: 'Other' } },
];

// ============================================
// Source Confidence (出典確度)
// ============================================

/**
 * Source Confidence - Reliability of source attribution
 * Order: By reliability (highest to lowest)
 */
export const SOURCE_CONFIDENCES: TaxonomyItem<SourceConfidence>[] = [
  { value: 'PRIMARY', label: { ja: '原投稿・初出確認済', en: 'Primary Source' } },
  { value: 'SECONDARY', label: { ja: '二次資料・初出追跡可', en: 'Secondary Source' } },
  { value: 'UNKNOWN', label: { ja: '初出不明', en: 'Unknown' } },
];

// ============================================
// First Seen (初出年代)
// ============================================

/**
 * First Seen Periods - When the content first appeared
 * Order: Chronological (oldest to newest)
 */
export const FIRST_SEEN_PERIODS: TaxonomyItem<FirstSeen>[] = [
  { value: 'Pre-1999', label: { ja: '1999年以前', en: 'Pre-1999' } },
  { value: '2000s', label: { ja: '2000年代', en: '2000s' } },
  { value: '2010s', label: { ja: '2010年代', en: '2010s' } },
  { value: '2020s', label: { ja: '2020年代', en: '2020s' } },
  { value: 'Unknown', label: { ja: '不明', en: 'Unknown' } },
];

// ============================================
// Motif (モチーフ)
// ============================================

/**
 * Motifs - Thematic tags (15 initial tags)
 * Order: By category grouping (location → entities → media → themes)
 * Maximum 3 motifs recommended per item
 */
export const MOTIFS: TaxonomyItem<Motif>[] = [
  // Location-based
  { value: 'PLACE', label: { ja: '場所', en: 'Place' } },
  { value: 'ROAD_TUNNEL', label: { ja: '道路・トンネル', en: 'Road / Tunnel' } },
  { value: 'FOREST_MOUNTAIN', label: { ja: '森・山', en: 'Forest / Mountain' } },
  { value: 'WATER', label: { ja: '水', en: 'Water' } },
  { value: 'ROOM_APARTMENT', label: { ja: '部屋・アパート', en: 'Room / Apartment' } },

  // Characters/Entities
  { value: 'MISSING_PERSON', label: { ja: '行方不明者', en: 'Missing Person' } },
  { value: 'STALKER_OBSERVER', label: { ja: 'ストーカー・観察者', en: 'Stalker / Observer' } },
  { value: 'ENTITY', label: { ja: '存在・実体', en: 'Entity' } },
  { value: 'DOPPELGANGER', label: { ja: 'ドッペルゲンガー', en: 'Doppelganger' } },
  { value: 'CHILD_FAMILY', label: { ja: '子供・家族', en: 'Child / Family' } },

  // Media/Format
  { value: 'MEDIA_DEVICE', label: { ja: 'メディア・デバイス', en: 'Media / Device' } },

  // Themes/Concepts
  { value: 'RITUAL_RULES', label: { ja: '儀式・ルール', en: 'Ritual / Rules' } },
  { value: 'WARNING_CHAIN', label: { ja: '警告・チェーン', en: 'Warning / Chain' } },
  { value: 'EXPERIMENT_REPORT', label: { ja: '実験・報告', en: 'Experiment / Report' } },
  { value: 'IDENTITY', label: { ja: 'アイデンティティ', en: 'Identity' } },
];

// ============================================
// Region (地域)
// ============================================

/**
 * Regions - Geographic origin or setting
 * Order: By relevance to project (Japan-centric)
 */
export const REGIONS: TaxonomyItem<Region>[] = [
  { value: 'JAPAN', label: { ja: '日本', en: 'Japan' } },
  { value: 'NA', label: { ja: '北米', en: 'North America' } },
  { value: 'EU', label: { ja: 'ヨーロッパ', en: 'Europe' } },
  { value: 'ASIA_EX_JAPAN', label: { ja: 'アジア（日本除く）', en: 'Asia (excl. Japan)' } },
  { value: 'GLOBAL_UNKNOWN', label: { ja: 'グローバル/不明', en: 'Global / Unknown' } },
];

// ============================================
// Medium (媒体)
// ============================================

/**
 * Mediums - Publication/distribution channel
 * Order: By digital-first ordering
 */
export const MEDIUMS: TaxonomyItem<Medium>[] = [
  { value: 'FORUM_BBS', label: { ja: 'フォーラム/BBS', en: 'Forum / BBS' } },
  { value: 'SNS', label: { ja: 'SNS', en: 'SNS' } },
  { value: 'VIDEO', label: { ja: '動画', en: 'Video' } },
  { value: 'WIKI_ARCHIVE', label: { ja: 'Wiki/アーカイブ', en: 'Wiki / Archive' } },
  { value: 'PRINT_ORAL', label: { ja: '印刷物/口承', en: 'Print / Oral' } },
  { value: 'UNKNOWN', label: { ja: '不明', en: 'Unknown' } },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get label for a taxonomy value
 *
 * @param items - Taxonomy array
 * @param value - Enum value
 * @param locale - Language (ja or en)
 * @returns Localized label, or value as fallback
 *
 * @example
 * getLabel(ITEM_TYPES, 'KAIDAN', 'ja') // "怪談"
 * getLabel(ITEM_TYPES, 'KAIDAN', 'en') // "Kaidan"
 */
export function getLabel<T extends string>(
  items: TaxonomyItem<T>[],
  value: T,
  locale: 'ja' | 'en' = 'ja'
): string {
  const item = items.find(i => i.value === value);
  return item?.label[locale] ?? value;
}

/**
 * Get all values from a taxonomy array
 *
 * @param items - Taxonomy array
 * @returns Array of enum values
 *
 * @example
 * getValues(LANGUAGES) // ['JA', 'EN', 'OTHER']
 */
export function getValues<T extends string>(items: TaxonomyItem<T>[]): T[] {
  return items.map(i => i.value);
}

/**
 * Get all labels from a taxonomy array
 *
 * @param items - Taxonomy array
 * @param locale - Language (ja or en)
 * @returns Array of localized labels
 *
 * @example
 * getLabels(LANGUAGES, 'ja') // ['日本語', '英語', 'その他']
 */
export function getLabels<T extends string>(
  items: TaxonomyItem<T>[],
  locale: 'ja' | 'en' = 'ja'
): string[] {
  return items.map(i => i.label[locale]);
}

/**
 * Find taxonomy item by value
 *
 * @param items - Taxonomy array
 * @param value - Enum value
 * @returns TaxonomyItem or undefined
 *
 * @example
 * findItem(REGIONS, 'JAPAN') // { value: 'JAPAN', label: { ja: '日本', en: 'Japan' } }
 */
export function findItem<T extends string>(
  items: TaxonomyItem<T>[],
  value: T
): TaxonomyItem<T> | undefined {
  return items.find(i => i.value === value);
}

/**
 * Check if a value is valid in a taxonomy
 *
 * @param items - Taxonomy array
 * @param value - Value to check
 * @returns true if value exists in taxonomy
 *
 * @example
 * isValidValue(ITEM_TYPES, 'KAIDAN') // true
 * isValidValue(ITEM_TYPES, 'INVALID') // false
 */
export function isValidValue<T extends string>(
  items: TaxonomyItem<T>[],
  value: string
): value is T {
  return items.some(i => i.value === value);
}

// ============================================
// Utility Type Guards
// ============================================

/**
 * Type guard for ItemType
 */
export function isItemType(value: string): value is ItemType {
  return isValidValue(ITEM_TYPES, value);
}

/**
 * Type guard for Language
 */
export function isLanguage(value: string): value is Language {
  return isValidValue(LANGUAGES, value);
}

/**
 * Type guard for SourceConfidence
 */
export function isSourceConfidence(value: string): value is SourceConfidence {
  return isValidValue(SOURCE_CONFIDENCES, value);
}

/**
 * Type guard for FirstSeen
 */
export function isFirstSeen(value: string): value is FirstSeen {
  return isValidValue(FIRST_SEEN_PERIODS, value);
}

/**
 * Type guard for Motif
 */
export function isMotif(value: string): value is Motif {
  return isValidValue(MOTIFS, value);
}

/**
 * Type guard for Region
 */
export function isRegion(value: string): value is Region {
  return isValidValue(REGIONS, value);
}

/**
 * Type guard for Medium
 */
export function isMedium(value: string): value is Medium {
  return isValidValue(MEDIUMS, value);
}
