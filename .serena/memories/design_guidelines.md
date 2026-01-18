# Design Guidelines

## Mandatory Work Rules
**Before implementing any feature or making changes:**
1. Create a design document under `docs/` as a markdown file
2. Create a work plan with a checklist format
3. Implement based on the design document and work plan
4. Mark checklist items as complete upon finishing each task to track progress

## Key Design Documents
Reference these for specifications:
- `docs/design/01-project-overview.md` - Purpose, tone, features
- `docs/design/04-taxonomy.md` - All enums and facet definitions
- `docs/design/05-data-model.md` - Firestore schema
- `docs/design/07-nextjs-structure.md` - Directory layout
- `docs/design/08-i18n.md` - Internationalization approach
- `docs/design/06-search.md` - Search implementation
- `docs/design/09-security.md` - Security rules
- `docs/design/10-operations.md` - Deployment and operations

## Task Management
- Main task checklist: `docs/tasks/tasks-001.md` (76 items across 6 phases)
- Update progress as tasks are completed
- Track which phase you are working on

## Data Model Key Concepts
- Item IDs use format: "DTA-000128"
- Types: KAIDAN, URBAN_LEGEND, CREEPYPASTA, CHAIN_MEME, ORIGINAL, COMMENTARY
- Languages: JA, EN, OTHER
- Source Confidence: PRIMARY, SECONDARY, UNKNOWN
- Bilingual fields: `title`, `body` with `ja?`, `en?`, `original?` properties
- Search tokens for full-text search

## Environment Variables
Firebase configuration in `.env.local`:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID