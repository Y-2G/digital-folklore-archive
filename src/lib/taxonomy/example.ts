/**
 * Taxonomy Usage Examples
 *
 * This file demonstrates how to use the taxonomy dictionary in application code.
 */

import {
  ITEM_TYPES,
  LANGUAGES,
  SOURCE_CONFIDENCES,
  FIRST_SEEN_PERIODS,
  MOTIFS,
  REGIONS,
  MEDIUMS,
  getLabel,
  findItem,
  isValidValue,
  isItemType,
  isMotif,
} from './index';

import type { ItemType, Motif, Language } from '@/types/firestore';

// ============================================
// Example 1: Get localized label for UI display
// ============================================

/**
 * Display an item type label in Japanese
 */
function displayItemType(type: ItemType, locale: 'ja' | 'en' = 'ja'): string {
  return getLabel(ITEM_TYPES, type, locale);
}

// Usage:
console.log(displayItemType('KAIDAN', 'ja')); // "怪談"
console.log(displayItemType('KAIDAN', 'en')); // "Kaidan"
console.log(displayItemType('URBAN_LEGEND', 'ja')); // "都市伝説"

// ============================================
// Example 2: Generate select options for forms
// ============================================

/**
 * Generate options for a language selector
 */
function getLanguageOptions(locale: 'ja' | 'en' = 'ja') {
  return LANGUAGES.map(item => ({
    value: item.value,
    label: item.label[locale],
  }));
}

// Usage:
console.log(getLanguageOptions('ja'));
// [
//   { value: 'JA', label: '日本語' },
//   { value: 'EN', label: '英語' },
//   { value: 'OTHER', label: 'その他' }
// ]

console.log(getLanguageOptions('en'));
// [
//   { value: 'JA', label: 'Japanese' },
//   { value: 'EN', label: 'English' },
//   { value: 'OTHER', label: 'Other' }
// ]

// ============================================
// Example 3: Validate user input
// ============================================

/**
 * Validate a motif tag from user input
 */
function validateMotif(input: string): { valid: boolean; motif?: Motif; error?: string } {
  if (!input) {
    return { valid: false, error: 'Motif is required' };
  }

  if (isMotif(input)) {
    return { valid: true, motif: input };
  }

  return { valid: false, error: `Invalid motif: ${input}` };
}

// Usage:
console.log(validateMotif('ENTITY')); // { valid: true, motif: 'ENTITY' }
console.log(validateMotif('INVALID')); // { valid: false, error: 'Invalid motif: INVALID' }

// ============================================
// Example 4: Build facet filters UI
// ============================================

interface FacetGroup {
  name: string;
  label: { ja: string; en: string };
  options: Array<{ value: string; label: { ja: string; en: string } }>;
}

/**
 * Generate facet configuration for catalog filter UI
 */
function getFacetGroups(): FacetGroup[] {
  return [
    {
      name: 'type',
      label: { ja: '種別', en: 'Type' },
      options: ITEM_TYPES,
    },
    {
      name: 'language',
      label: { ja: '言語', en: 'Language' },
      options: LANGUAGES,
    },
    {
      name: 'confidence',
      label: { ja: '出典確度', en: 'Source Confidence' },
      options: SOURCE_CONFIDENCES,
    },
    {
      name: 'firstSeen',
      label: { ja: '初出年代', en: 'First Seen' },
      options: FIRST_SEEN_PERIODS,
    },
    {
      name: 'motifs',
      label: { ja: 'モチーフ', en: 'Motif' },
      options: MOTIFS,
    },
    {
      name: 'region',
      label: { ja: '地域', en: 'Region' },
      options: REGIONS,
    },
    {
      name: 'medium',
      label: { ja: '媒体', en: 'Medium' },
      options: MEDIUMS,
    },
  ];
}

// Usage:
const facets = getFacetGroups();
console.log(facets[0].name); // "type"
console.log(facets[0].label.ja); // "種別"
console.log(facets[0].options[0].value); // "KAIDAN"
console.log(facets[0].options[0].label.ja); // "怪談"

// ============================================
// Example 5: Display motif tags with badges
// ============================================

/**
 * Render motif tags for an item
 */
function renderMotifTags(motifs: Motif[], locale: 'ja' | 'en' = 'ja'): string[] {
  return motifs.map(motif => {
    const item = findItem(MOTIFS, motif);
    return item ? item.label[locale] : motif;
  });
}

// Usage:
const sampleMotifs: Motif[] = ['ENTITY', 'MISSING_PERSON', 'FOREST_MOUNTAIN'];
console.log(renderMotifTags(sampleMotifs, 'ja')); // ["存在・実体", "行方不明者", "森・山"]
console.log(renderMotifTags(sampleMotifs, 'en')); // ["Entity", "Missing Person", "Forest / Mountain"]

// ============================================
// Example 6: Type-safe form handling
// ============================================

interface ItemFormData {
  type: ItemType;
  language: Language;
  motifs: Motif[];
}

/**
 * Validate item form data with type guards
 */
function validateItemForm(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const formData = data as Partial<ItemFormData>;

  // Validate type
  if (!formData.type) {
    errors.push('Type is required');
  } else if (!isItemType(formData.type)) {
    errors.push('Invalid type');
  }

  // Validate language
  if (!formData.language) {
    errors.push('Language is required');
  } else if (!isValidValue(LANGUAGES, formData.language)) {
    errors.push('Invalid language');
  }

  // Validate motifs (max 3 recommended)
  if (formData.motifs) {
    if (formData.motifs.length > 3) {
      errors.push('Maximum 3 motifs recommended');
    }

    const invalidMotifs = formData.motifs.filter(m => !isMotif(m));
    if (invalidMotifs.length > 0) {
      errors.push(`Invalid motifs: ${invalidMotifs.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Usage:
const validData: ItemFormData = {
  type: 'KAIDAN',
  language: 'JA',
  motifs: ['ENTITY', 'MISSING_PERSON'],
};
console.log(validateItemForm(validData)); // { valid: true, errors: [] }

const invalidData = {
  type: 'INVALID',
  language: 'JA',
  motifs: ['ENTITY', 'INVALID_MOTIF', 'TOO', 'MANY', 'TAGS'],
};
console.log(validateItemForm(invalidData));
// {
//   valid: false,
//   errors: [
//     'Invalid type',
//     'Maximum 3 motifs recommended',
//     'Invalid motifs: INVALID_MOTIF, TOO, MANY, TAGS'
//   ]
// }

// ============================================
// Example 7: Search/filter helpers
// ============================================

/**
 * Check if an item matches filter criteria
 */
function matchesFilters(
  item: { type: ItemType; language: Language; motifs: Motif[] },
  filters: {
    types?: ItemType[];
    languages?: Language[];
    motifs?: Motif[];
  }
): boolean {
  // Check type filter
  if (filters.types && filters.types.length > 0) {
    if (!filters.types.includes(item.type)) {
      return false;
    }
  }

  // Check language filter
  if (filters.languages && filters.languages.length > 0) {
    if (!filters.languages.includes(item.language)) {
      return false;
    }
  }

  // Check motif filter (item must have at least one matching motif)
  if (filters.motifs && filters.motifs.length > 0) {
    const hasMatchingMotif = filters.motifs.some(filterMotif =>
      item.motifs.includes(filterMotif)
    );
    if (!hasMatchingMotif) {
      return false;
    }
  }

  return true;
}

// Usage:
const items = [
  {
    id: 'DTA-000001',
    type: 'KAIDAN' as ItemType,
    language: 'JA' as Language,
    motifs: ['ENTITY', 'FOREST_MOUNTAIN'] as Motif[],
  },
  {
    id: 'DTA-000002',
    type: 'CREEPYPASTA' as ItemType,
    language: 'EN' as Language,
    motifs: ['MISSING_PERSON', 'STALKER_OBSERVER'] as Motif[],
  },
];

const filtered = items.filter(item =>
  matchesFilters(item, {
    types: ['KAIDAN', 'CREEPYPASTA'],
    motifs: ['ENTITY'],
  })
);
console.log(filtered.length); // 1 (only first item matches)

// ============================================
// Example 8: Export for documentation
// ============================================

/**
 * Generate markdown documentation for taxonomy
 */
function generateTaxonomyDocs(): string {
  const sections: string[] = [];

  sections.push('# Taxonomy Reference\n');

  // Item Types
  sections.push('## Item Types\n');
  ITEM_TYPES.forEach(item => {
    sections.push(`- \`${item.value}\`: ${item.label.ja} / ${item.label.en}`);
  });
  sections.push('');

  // Motifs
  sections.push('## Motifs (max 3 recommended)\n');
  MOTIFS.forEach(item => {
    sections.push(`- \`${item.value}\`: ${item.label.ja} / ${item.label.en}`);
  });
  sections.push('');

  return sections.join('\n');
}

// Usage:
const docs = generateTaxonomyDocs();
console.log(docs);
// # Taxonomy Reference
//
// ## Item Types
//
// - `KAIDAN`: 怪談 / Kaidan
// - `URBAN_LEGEND`: 都市伝説 / Urban Legend
// ...
