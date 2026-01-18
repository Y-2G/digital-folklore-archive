# Taxonomy Dictionary

Bilingual label dictionaries for all taxonomy enums used in the Digital Folklore Archive.

## Overview

This module provides type-safe, bilingual (Japanese/English) label dictionaries for all taxonomy enums defined in the data model. It's primarily used for:

- Faceted search UI components
- Form select options
- Display labels in item details
- Validation of user input
- Documentation generation

## Taxonomies

### Primary Facets

| Taxonomy | Type | Count | Description |
|----------|------|-------|-------------|
| `ITEM_TYPES` | `ItemType` | 6 | Content type classification |
| `LANGUAGES` | `Language` | 3 | Primary language |
| `SOURCE_CONFIDENCES` | `SourceConfidence` | 3 | Source reliability |
| `FIRST_SEEN_PERIODS` | `FirstSeen` | 5 | Time period of first appearance |
| `MOTIFS` | `Motif` | 15 | Thematic tags (max 3 per item) |

### Secondary Facets

| Taxonomy | Type | Count | Description |
|----------|------|-------|-------------|
| `REGIONS` | `Region` | 5 | Geographic origin |
| `MEDIUMS` | `Medium` | 6 | Publication medium |

## Usage

### Basic Label Lookup

```typescript
import { ITEM_TYPES, getLabel } from '@/lib/taxonomy';

// Get Japanese label (default)
const jaLabel = getLabel(ITEM_TYPES, 'KAIDAN');
// => "怪談"

// Get English label
const enLabel = getLabel(ITEM_TYPES, 'KAIDAN', 'en');
// => "Kaidan"
```

### Generate Form Options

```typescript
import { LANGUAGES } from '@/lib/taxonomy';

function LanguageSelect({ locale }: { locale: 'ja' | 'en' }) {
  return (
    <select>
      {LANGUAGES.map(item => (
        <option key={item.value} value={item.value}>
          {item.label[locale]}
        </option>
      ))}
    </select>
  );
}
```

### Validate Input with Type Guards

```typescript
import { isMotif, isItemType } from '@/lib/taxonomy';

// Type guard with type narrowing
function validateItemType(input: string): ItemType | null {
  if (isItemType(input)) {
    return input; // TypeScript knows this is ItemType
  }
  return null;
}

// Array validation
function validateMotifs(inputs: string[]): Motif[] {
  return inputs.filter(isMotif);
}
```

### Build Facet Filters

```typescript
import { MOTIFS, REGIONS } from '@/lib/taxonomy';

function FacetPanel({ locale }: { locale: 'ja' | 'en' }) {
  return (
    <div>
      <h3>Motifs</h3>
      {MOTIFS.map(motif => (
        <label key={motif.value}>
          <input type="checkbox" value={motif.value} />
          {motif.label[locale]}
        </label>
      ))}

      <h3>Region</h3>
      {REGIONS.map(region => (
        <label key={region.value}>
          <input type="radio" value={region.value} />
          {region.label[locale]}
        </label>
      ))}
    </div>
  );
}
```

## API Reference

### Types

```typescript
/**
 * Generic taxonomy item structure
 */
interface TaxonomyItem<T extends string> {
  value: T;
  label: {
    ja: string;
    en: string;
  };
}
```

### Constants

All taxonomy arrays follow the same structure:

```typescript
const ITEM_TYPES: TaxonomyItem<ItemType>[] = [...]
const LANGUAGES: TaxonomyItem<Language>[] = [...]
const SOURCE_CONFIDENCES: TaxonomyItem<SourceConfidence>[] = [...]
const FIRST_SEEN_PERIODS: TaxonomyItem<FirstSeen>[] = [...]
const MOTIFS: TaxonomyItem<Motif>[] = [...]
const REGIONS: TaxonomyItem<Region>[] = [...]
const MEDIUMS: TaxonomyItem<Medium>[] = [...]
```

### Helper Functions

#### `getLabel<T>(items, value, locale?)`

Get localized label for a taxonomy value.

```typescript
getLabel(ITEM_TYPES, 'KAIDAN', 'ja') // => "怪談"
getLabel(ITEM_TYPES, 'KAIDAN', 'en') // => "Kaidan"
```

**Parameters:**
- `items` - Taxonomy array
- `value` - Enum value
- `locale` - `'ja'` or `'en'` (default: `'ja'`)

**Returns:** Localized label string, or value as fallback

#### `getValues<T>(items)`

Extract all enum values from a taxonomy array.

```typescript
getValues(LANGUAGES) // => ['JA', 'EN', 'OTHER']
```

**Parameters:**
- `items` - Taxonomy array

**Returns:** Array of enum values

#### `getLabels<T>(items, locale?)`

Extract all labels from a taxonomy array.

```typescript
getLabels(LANGUAGES, 'ja') // => ['日本語', '英語', 'その他']
getLabels(LANGUAGES, 'en') // => ['Japanese', 'English', 'Other']
```

**Parameters:**
- `items` - Taxonomy array
- `locale` - `'ja'` or `'en'` (default: `'ja'`)

**Returns:** Array of localized labels

#### `findItem<T>(items, value)`

Find full taxonomy item by value.

```typescript
findItem(REGIONS, 'JAPAN')
// => { value: 'JAPAN', label: { ja: '日本', en: 'Japan' } }

findItem(REGIONS, 'INVALID')
// => undefined
```

**Parameters:**
- `items` - Taxonomy array
- `value` - Enum value to find

**Returns:** `TaxonomyItem<T>` or `undefined`

#### `isValidValue<T>(items, value)`

Check if a value exists in a taxonomy (with type narrowing).

```typescript
if (isValidValue(ITEM_TYPES, input)) {
  // TypeScript knows input is ItemType here
  console.log(input);
}
```

**Parameters:**
- `items` - Taxonomy array
- `value` - String to validate

**Returns:** `true` if value is valid

### Type Guards

Convenient type guards for each taxonomy:

```typescript
isItemType(value: string): value is ItemType
isLanguage(value: string): value is Language
isSourceConfidence(value: string): value is SourceConfidence
isFirstSeen(value: string): value is FirstSeen
isMotif(value: string): value is Motif
isRegion(value: string): value is Region
isMedium(value: string): value is Medium
```

**Example:**

```typescript
function processUserInput(typeInput: string, motifInput: string) {
  if (!isItemType(typeInput)) {
    throw new Error('Invalid item type');
  }

  if (!isMotif(motifInput)) {
    throw new Error('Invalid motif');
  }

  // TypeScript knows types here
  const type: ItemType = typeInput;
  const motif: Motif = motifInput;
}
```

## Design Decisions

### Array Order

The order of items in each taxonomy array is intentional and represents the display order in UI:

- **ITEM_TYPES**: By genre (traditional → digital)
- **LANGUAGES**: By frequency (JA most common)
- **SOURCE_CONFIDENCES**: By reliability (highest → lowest)
- **FIRST_SEEN_PERIODS**: Chronological (oldest → newest)
- **MOTIFS**: Grouped by category (location → entities → media → themes)
- **REGIONS**: By project relevance (Japan-centric)
- **MEDIUMS**: Digital-first ordering

### Bilingual Labels

All labels include both Japanese and English text:

- **Japanese (ja)**: Used for primary Japanese audience
- **English (en)**: Used for international access and API responses

The label structure enables runtime locale switching without rebuilding the application.

### Type Safety

The module provides multiple layers of type safety:

1. **Generic types**: `TaxonomyItem<T>` ensures value and type match
2. **Type guards**: Runtime validation with compile-time type narrowing
3. **Strict enums**: All taxonomy types are strict string unions

### Motif Limit

The data model recommends a maximum of 3 motifs per item to maintain focus and avoid over-tagging. This is a soft limit enforced in validation logic, not at the type level.

## Files

- `index.ts` - Main taxonomy definitions and helper functions
- `example.ts` - Usage examples and patterns
- `README.md` - This file

## References

- **Design Spec**: `docs/design/04-taxonomy.md`
- **Data Model**: `docs/design/05-data-model.md`
- **Type Definitions**: `src/types/firestore.ts`

## Testing

While this module doesn't include formal tests, all taxonomies are validated for:

- Non-empty arrays
- Unique values
- Both ja and en labels present
- Type compatibility with `@/types/firestore`

To verify, run:

```bash
yarn tsc --noEmit
yarn lint
```

## Future Extensions

When adding new taxonomy categories:

1. Add type definition to `@/types/firestore.ts`
2. Create `TaxonomyItem<T>[]` array in this file
3. Implement type guard function (e.g., `isNewTaxonomy`)
4. Update this README with the new taxonomy
5. Update `docs/design/04-taxonomy.md` if needed
