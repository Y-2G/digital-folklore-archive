# Digital Folklore Archive - Project Overview

## Purpose
A Next.js + TypeScript + Firebase digital library for cataloging contemporary folklore (kaidan, urban legends, creepypasta, chain memes, original works, commentary).

## Design Philosophy
- Library/archive aesthetic (clean, minimal, no theatrical effects)
- Catalog-based UI using table rows, not cards
- Bilingual support (Japanese/English)
- Emphasis on metadata, provenance, and version history

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
├── lib/                    # Utilities
│   ├── firebase/           # Firebase initialization
│   └── catalog/            # Query builders, search tokenization
├── types/                  # TypeScript type definitions
├── components/             # React components
│   ├── common/             # Shared components
│   ├── home/               # Home page components
│   ├── catalog/            # Catalog components
│   └── item/               # Item detail components
└── messages/               # i18n translation files (ja.json, en.json)

docs/
├── design/                 # Design specifications (10 docs)
└── tasks/                  # Implementation checklist
```

## Path Alias
`@/*` → `./src/*` (configured in tsconfig.json)