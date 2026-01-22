# Request Validation Layer

## Overview

The validation layer (`src/lib/api/validation.ts`) provides comprehensive request validation using Zod schemas. It ensures type safety, data integrity, and consistent error handling across all API endpoints and server actions.

## Features

- **Type-safe validation** using Zod with TypeScript inference
- **Bilingual text validation** with at least one language required
- **Character limits** enforced (200 for titles, 100,000 for body text)
- **URL validation** for source and archive URLs
- **Enum validation** for all taxonomy fields
- **Field-specific error messages** for better debugging
- **Integration with error handling** module

## Core Schemas

### Enum Schemas

All enum types from `src/types/firestore.ts` are validated:

```typescript
ItemTypeSchema       // KAIDAN, URBAN_LEGEND, etc.
LanguageSchema       // JA, EN, OTHER
SourceConfidenceSchema // PRIMARY, SECONDARY, UNKNOWN
DocStatusSchema      // PUBLISHED, DRAFT
FirstSeenSchema      // Pre-1999, 2000s, 2010s, 2020s, Unknown, or YYYY/YYYY-MM
MotifSchema          // PLACE, ROAD_TUNNEL, etc. (15 motifs)
RegionSchema         // JAPAN, NA, EU, etc.
MediumSchema         // FORUM_BBS, SNS, VIDEO, etc.
```

### Multilingual Text Schemas

```typescript
BilingualTextSchema  // { ja?: string, en?: string } with at least one required
BodyTextSchema       // Extends BilingualText with optional 'original' field
```

### Request Schemas

```typescript
CreateItemRequestSchema        // Full validation for new items
UpdateItemRequestSchema        // Partial validation for updates
CreateAnnotationRequestSchema  // Annotation creation
UpdateAnnotationRequestSchema  // Annotation updates
CreateRevisionRequestSchema    // Revision history
```

## Usage Examples

### Basic Validation

```typescript
import { validateCreateItemRequest } from '@/lib/api/validation';

const result = validateCreateItemRequest(requestBody);

if (!result.success) {
  console.error(result.error.fields);
  // { 'title.ja': 'Required', 'motifs': 'At least one motif is required' }
  return createValidationError(result.error.message, result.error.fields);
}

// result.data is now type-safe CreateItemRequest
const item = await createItem(result.data);
```

### API Route Integration

```typescript
import { NextRequest } from 'next/server';
import { validateCreateItemRequest } from '@/lib/api/validation';
import { createValidationError, createSuccessResponse } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate request
  const result = validateCreateItemRequest(body);
  if (!result.success) {
    return createValidationError(result.error.message, result.error.fields);
  }

  // Process validated data
  const item = await createItemInFirestore(result.data);

  return createSuccessResponse(item, 201);
}
```

### Server Action Integration

```typescript
'use server';

import { validateCreateItemRequest } from '@/lib/api/validation';

export async function createItemAction(formData: FormData) {
  const body = Object.fromEntries(formData);

  const result = validateCreateItemRequest(body);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  const item = await createItem(result.data);
  return { success: true, data: item };
}
```

### Generic Validation

```typescript
import { validateOrError, CreateItemRequestSchema } from '@/lib/api/validation';

const result = validateOrError(unknownData, CreateItemRequestSchema);
```

## Validation Rules

### Character Limits

| Field | Limit | Rule |
|-------|-------|------|
| `title.ja`, `title.en` | 200 | Per language |
| `body.ja`, `body.en`, `body.original` | 100,000 | Per language |
| `originalTitle` | 200 | Single field |
| `sourceName` | 100 | Single field |
| `formats[]` item | 50 | Per tag |

### Required Fields (CreateItem)

- `type` (ItemType enum)
- `language` (Language enum)
- `confidence` (SourceConfidence enum)
- `title` (BilingualText with at least one language)
- `body` (BodyText with at least one language/original)
- `motifs` (Array of 1-3 Motif enum values)
- `status` (defaults to 'DRAFT')

### Optional Fields

All other fields are optional: `originalTitle`, `firstSeen`, `sourceName`, `sourceUrl`, `sourceArchiveUrl`, `formats`, `region`, `medium`

### URL Validation

- `sourceUrl` must be valid URL format
- `sourceArchiveUrl` must be valid URL format

### Motif Rules

- Minimum: 1 motif required
- Maximum: 3 motifs allowed
- Must be valid Motif enum values

### FirstSeen Format

Accepts:
- Predefined decades: `Pre-1999`, `2000s`, `2010s`, `2020s`, `Unknown`
- Custom dates: `YYYY` format (e.g., `2023`)
- Month precision: `YYYY-MM` format (e.g., `2023-08`)

## Error Response Format

Validation errors return structured field-specific messages:

```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid request data',
    details: {
      fields: {
        'title.ja': 'Japanese text must not exceed 200 characters',
        'motifs': 'At least one motif is required',
        'sourceUrl': 'Must be a valid URL'
      }
    }
  }
}
```

## Type Safety

All validation functions return discriminated unions:

```typescript
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; fields: Record<string, string> } }
```

This enables type narrowing:

```typescript
const result = validateCreateItemRequest(body);
if (result.success) {
  // TypeScript knows result.data is CreateItemRequest
  result.data.type // Type: ItemType
}
```

## Security Considerations

1. **No HTML Escaping**: Validation does not escape HTML. Content is stored as-is in Firestore and escaped during rendering.

2. **Character Limits**: Enforced to prevent storage abuse (100k chars ≈ 50-100 pages of text).

3. **Type Coercion**: Strict validation without automatic type coercion (use `z.coerce.*` if needed).

4. **URL Validation**: Basic format check only; does not verify URL accessibility.

## Performance

- Zod validation is synchronous and typically completes in <1ms for typical requests
- No external API calls or database queries during validation
- Validation errors short-circuit on first failure per field

## Testing

Example test cases:

```typescript
// Valid minimal request
const validRequest = {
  type: 'KAIDAN',
  language: 'JA',
  confidence: 'PRIMARY',
  title: { ja: '口裂け女' },
  body: { ja: '本文テキスト' },
  motifs: ['ENTITY'],
  status: 'DRAFT'
};

// Invalid: missing required field
const invalid1 = { ...validRequest, motifs: undefined };

// Invalid: too many motifs
const invalid2 = { ...validRequest, motifs: ['ENTITY', 'PLACE', 'WATER', 'CHILD_FAMILY'] };

// Invalid: no language in title
const invalid3 = { ...validRequest, title: {} };

// Invalid: character limit exceeded
const invalid4 = { ...validRequest, title: { ja: 'a'.repeat(201) } };
```

## Future Enhancements

Potential additions:

1. **Custom refinements** for cross-field validation
2. **Locale-aware validation** for Japanese text patterns
3. **Schema versioning** for API evolution
4. **Rate limit metadata** extraction from requests
5. **Sanitization helpers** (if needed for specific use cases)
