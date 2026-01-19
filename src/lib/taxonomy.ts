/**
 * Taxonomy Helper Functions
 *
 * Provides human-readable labels and utilities for taxonomy enums
 * Based on docs/design/04-taxonomy.md
 */

import type {
  ItemType,
  SourceConfidence,
  Language,
  Motif,
  Region,
  Medium,
  FirstSeen
} from '@/types/firestore';
import type { Locale } from '@/i18n/config';

// ============================================================================
// Type Definitions for Taxonomy Items
// ============================================================================

export interface TaxonomyItem<T extends string> {
  value: T;
  label: {
    ja: string;
    en: string;
  };
}

// ============================================================================
// ItemType Taxonomy
// ============================================================================

export const ITEM_TYPES: TaxonomyItem<ItemType>[] = [
  {
    value: 'KAIDAN',
    label: { ja: '怪談', en: 'Kaidan' }
  },
  {
    value: 'URBAN_LEGEND',
    label: { ja: '都市伝説', en: 'Urban Legend' }
  },
  {
    value: 'CREEPYPASTA',
    label: { ja: 'クリーピーパスタ', en: 'Creepypasta' }
  },
  {
    value: 'CHAIN_MEME',
    label: { ja: 'チェーン・ミーム', en: 'Chain Meme' }
  },
  {
    value: 'ORIGINAL',
    label: { ja: '創作', en: 'Original' }
  },
  {
    value: 'COMMENTARY',
    label: { ja: '解説', en: 'Commentary' }
  }
];

// ============================================================================
// SourceConfidence Taxonomy
// ============================================================================

export const SOURCE_CONFIDENCES: TaxonomyItem<SourceConfidence>[] = [
  {
    value: 'PRIMARY',
    label: { ja: '原投稿', en: 'Primary Source' }
  },
  {
    value: 'SECONDARY',
    label: { ja: '二次', en: 'Secondary Source' }
  },
  {
    value: 'UNKNOWN',
    label: { ja: '不明', en: 'Unknown' }
  }
];

// ============================================================================
// Language Taxonomy
// ============================================================================

export const LANGUAGES: TaxonomyItem<Language>[] = [
  {
    value: 'JA',
    label: { ja: '日本語', en: 'Japanese' }
  },
  {
    value: 'EN',
    label: { ja: '英語', en: 'English' }
  },
  {
    value: 'OTHER',
    label: { ja: 'その他', en: 'Other' }
  }
];

// ============================================================================
// Motif Taxonomy
// ============================================================================

export const MOTIFS: TaxonomyItem<Motif>[] = [
  {
    value: 'PLACE',
    label: { ja: '場所', en: 'Place' }
  },
  {
    value: 'ROAD_TUNNEL',
    label: { ja: '道路・トンネル', en: 'Road/Tunnel' }
  },
  {
    value: 'FOREST_MOUNTAIN',
    label: { ja: '森・山', en: 'Forest/Mountain' }
  },
  {
    value: 'WATER',
    label: { ja: '水', en: 'Water' }
  },
  {
    value: 'ROOM_APARTMENT',
    label: { ja: '部屋・アパート', en: 'Room/Apartment' }
  },
  {
    value: 'MISSING_PERSON',
    label: { ja: '行方不明者', en: 'Missing Person' }
  },
  {
    value: 'STALKER_OBSERVER',
    label: { ja: 'ストーカー・観察者', en: 'Stalker/Observer' }
  },
  {
    value: 'ENTITY',
    label: { ja: '存在・実体', en: 'Entity' }
  },
  {
    value: 'DOPPELGANGER',
    label: { ja: 'ドッペルゲンガー', en: 'Doppelganger' }
  },
  {
    value: 'CHILD_FAMILY',
    label: { ja: '子供・家族', en: 'Child/Family' }
  },
  {
    value: 'MEDIA_DEVICE',
    label: { ja: 'メディア・デバイス', en: 'Media/Device' }
  },
  {
    value: 'RITUAL_RULES',
    label: { ja: '儀式・ルール', en: 'Ritual/Rules' }
  },
  {
    value: 'WARNING_CHAIN',
    label: { ja: '警告・チェーン', en: 'Warning/Chain' }
  },
  {
    value: 'EXPERIMENT_REPORT',
    label: { ja: '実験・報告', en: 'Experiment/Report' }
  },
  {
    value: 'IDENTITY',
    label: { ja: 'アイデンティティ', en: 'Identity' }
  }
];

// ============================================================================
// Region Taxonomy
// ============================================================================

export const REGIONS: TaxonomyItem<Region>[] = [
  {
    value: 'JAPAN',
    label: { ja: '日本', en: 'Japan' }
  },
  {
    value: 'NA',
    label: { ja: '北米', en: 'North America' }
  },
  {
    value: 'EU',
    label: { ja: 'ヨーロッパ', en: 'Europe' }
  },
  {
    value: 'ASIA_EX_JAPAN',
    label: { ja: 'アジア（日本除く）', en: 'Asia (ex. Japan)' }
  },
  {
    value: 'GLOBAL_UNKNOWN',
    label: { ja: 'グローバル/不明', en: 'Global/Unknown' }
  }
];

// ============================================================================
// Medium Taxonomy
// ============================================================================

export const MEDIUMS: TaxonomyItem<Medium>[] = [
  {
    value: 'FORUM_BBS',
    label: { ja: 'フォーラム/BBS', en: 'Forum/BBS' }
  },
  {
    value: 'SNS',
    label: { ja: 'SNS', en: 'SNS' }
  },
  {
    value: 'VIDEO',
    label: { ja: '動画', en: 'Video' }
  },
  {
    value: 'WIKI_ARCHIVE',
    label: { ja: 'Wiki/アーカイブ', en: 'Wiki/Archive' }
  },
  {
    value: 'PRINT_ORAL',
    label: { ja: '印刷物/口承', en: 'Print/Oral' }
  },
  {
    value: 'UNKNOWN',
    label: { ja: '不明', en: 'Unknown' }
  }
];

// ============================================================================
// FirstSeen (Time Period) Taxonomy
// ============================================================================

export const FIRST_SEEN_PERIODS: TaxonomyItem<FirstSeen>[] = [
  {
    value: 'Pre-1999',
    label: { ja: '1999年以前', en: 'Pre-1999' }
  },
  {
    value: '2000s',
    label: { ja: '2000年代', en: '2000s' }
  },
  {
    value: '2010s',
    label: { ja: '2010年代', en: '2010s' }
  },
  {
    value: '2020s',
    label: { ja: '2020年代', en: '2020s' }
  },
  {
    value: 'Unknown',
    label: { ja: '不明', en: 'Unknown' }
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get human-readable label for a taxonomy value
 */
export function getLabel<T extends string>(
  taxonomy: TaxonomyItem<T>[],
  value: T,
  locale: Locale
): string {
  const item = taxonomy.find(t => t.value === value);
  return item ? item.label[locale] : value;
}

/**
 * Find taxonomy item by value
 */
export function findTaxonomyItem<T extends string>(
  taxonomy: TaxonomyItem<T>[],
  value: T
): TaxonomyItem<T> | undefined {
  return taxonomy.find(t => t.value === value);
}
