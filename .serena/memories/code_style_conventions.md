# Code Style and Conventions

## TypeScript
- **Strict Mode**: Enabled (`strict: true` in tsconfig.json)
- **Module Resolution**: Bundler mode
- **Target**: ES2017
- Always use TypeScript for all source files (`.ts`, `.tsx`)
- Define types explicitly, avoid `any`

## Naming Conventions
- **Files**: PascalCase for components (`Container.tsx`), camelCase for utilities (`client.ts`)
- **Components**: PascalCase (`Container`, `SearchBar`)
- **Functions/Variables**: camelCase (`getFirestore`, `firebaseConfig`)
- **Types/Interfaces**: PascalCase (`ItemDoc`, `FirebaseApp`)
- **Constants**: UPPER_SNAKE_CASE for enums/constants (`ITEM_TYPE`, `API_KEY`)

## Path Aliases
- Use `@/*` for imports from `src/` directory
- Example: `import { db } from '@/lib/firebase/client'`

## Component Structure
- Use CSS Modules for styling (`Component.module.css`)
- Place component-specific styles alongside component files
- Use global CSS variables for theming (defined in `globals.css`)

## Firebase Patterns
- Client SDK initialization in `src/lib/firebase/client.ts`
- Use `getApps()` to check for existing app before initializing
- Environment variables must use `NEXT_PUBLIC_` prefix for client access

## Code Organization
- Utilities go in `src/lib/`
- Type definitions in `src/types/`
- Reusable components in `src/components/`
- Page-specific code in `src/app/`

## Comments
- Use JSDoc-style comments for exported functions
- Add inline comments for complex logic
- Document security considerations and assumptions