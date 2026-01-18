# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Work Rules

**Before implementing any feature or making changes:**
1. Create a design document under `docs/` as a markdown file
2. Create a work plan with a checklist format
3. Implement based on the design document and work plan
4. Mark checklist items as complete upon finishing each task to track progress

Existing task checklist: `docs/tasks/tasks-001.md` (76 items across 6 phases)

## Project Overview

**Digital Folklore Archive (デジタル伝承資料庫)** - A Next.js + TypeScript + Firebase digital library for cataloging contemporary folklore (kaidan, urban legends, creepypasta, chain memes, original works, commentary).

**Design Philosophy:**
- Library/archive aesthetic (clean, minimal, no theatrical effects)
- Catalog-based UI using table rows, not cards
- Bilingual support (Japanese/English)
- Emphasis on metadata, provenance, and version history

## Commands

```bash
yarn dev      # Start dev server at http://localhost:3000
yarn build    # Create production build
yarn start    # Start production server
yarn lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16.1.3 (App Router)
- **React**: 19.2.3 with React Compiler enabled
- **TypeScript**: ^5 (strict mode)
- **Database**: Firebase Firestore (planned)
- **i18n**: next-intl (planned)
- **Styling**: CSS Modules + CSS Variables
- **Fonts**: Geist Sans/Mono

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── lib/                    # Utilities (to be created)
│   ├── firebase/client.ts  # Firebase initialization
│   └── catalog/            # Query builders, search tokenization
├── types/firestore.ts      # TypeScript type definitions
└── messages/               # i18n translation files (ja.json, en.json)

docs/
├── design/                 # Design specifications (10 docs)
└── tasks/TASKS.md          # Implementation checklist
```

## Routing Pattern (to be implemented)

```
/[locale]/                  # ja, en
├── /catalog                # Faceted catalog
├── /items/[id]             # Item detail (ID: DTA-XXXXXX)
├── /collections/[slug]     # Collections
├── /analysis               # Statistics
├── /about                  # About
└── /submit                 # User submission
```

## Data Model

Main collection: `/items/{id}`

Key fields:
- `id`: "DTA-000128" format
- `type`: KAIDAN, URBAN_LEGEND, CREEPYPASTA, CHAIN_MEME, ORIGINAL, COMMENTARY
- `language`: JA, EN, OTHER
- `confidence`: PRIMARY, SECONDARY, UNKNOWN
- `title`, `body`: Bilingual objects with `ja?`, `en?`, `original?`
- `motifs`: Array of motif tags (max 3 recommended)
- `searchTokens`: Full-text search index array

Subcollections: `/items/{id}/revisions/{revId}`, `/items/{id}/annotations/{noteId}`

## Path Alias

`@/*` → `./src/*` (configured in tsconfig.json)

## Key Design Documents

Reference these for specifications:
- `docs/design/01-project-overview.md` - Purpose, tone, features
- `docs/design/04-taxonomy.md` - All enums and facet definitions
- `docs/design/05-data-model.md` - Firestore schema
- `docs/design/07-nextjs-structure.md` - Directory layout

## Environment Variables

Create `.env.local` with Firebase config:
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```
