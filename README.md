# Digital Folklore Archive / デジタル伝承資料庫

A digital library for cataloging contemporary folklore (kaidan, urban legends, creepypasta, chain memes, original works, commentary).

同時代の伝承（怪談・都市伝説・クリーピーパスタ等）を収蔵するデジタル資料庫。

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: Firebase Firestore
- **i18n**: next-intl (Japanese / English)
- **Styling**: CSS Modules + CSS Variables

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn
- Docker (for local Firebase emulators)

### Setup

1. Clone the repository

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

### Development with Docker Firebase Emulator (Recommended)

Start the Firebase emulator using Docker:

```bash
# Start emulators
yarn docker:up

# Check logs
yarn docker:logs

# Stop emulators
yarn docker:down

# Reset data and restart
yarn docker:reset
```

Configure `.env.local` for emulator:
```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
NEXT_PUBLIC_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_STORAGE_EMULATOR_HOST=localhost:9199
```

Start the development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Emulator UI

Access the Firebase Emulator UI at [http://localhost:4000](http://localhost:4000) to:
- View and edit Firestore data
- Manage authentication users
- Monitor storage

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Create production build |
| `yarn lint` | Run ESLint |
| `yarn typecheck` | Run TypeScript type check |
| `yarn docker:up` | Start Firebase emulators (Docker) |
| `yarn docker:down` | Stop Firebase emulators |
| `yarn docker:logs` | View emulator logs |
| `yarn docker:reset` | Reset emulator data |
| `yarn db:seed` | Seed initial data |

## Project Structure

```
src/
├── app/[locale]/        # Next.js App Router (i18n)
├── components/          # React components
├── lib/
│   ├── firebase/        # Firebase initialization
│   └── catalog/         # Query builders, search
├── types/               # TypeScript types
└── messages/            # i18n translations (ja.json, en.json)

docs/
├── design/              # Design documents
└── tasks/               # Task checklists
```

## Documentation

See `docs/design/` for detailed specifications:
- Project overview and design philosophy
- Data model (Firestore schema)
- Page designs
- Search implementation
- Docker Firebase setup
