# Phase 3.4: Item Page Implementation Plan

## Overview
Implement the Item detail page with bilingual support, focusing on a library/archive aesthetic with clean, minimal design.

## Design Requirements
- Reading-first layout with max-width 800px for body text
- Sidebar 280px width (desktop only)
- Library aesthetic - clean, minimal, no theatrical effects
- Original/translation toggle for bilingual content
- Emphasis on metadata, provenance, and version history

## Components to Implement

### 1. Common Components
- [ ] `Badge` - Type/Language/Confidence badges
- [ ] `Breadcrumb` - Navigation breadcrumb

### 2. Item-specific Components
- [ ] `TitleBlock` - Title, original title, metadata
- [ ] `BodyViewer` - Body text with original/translation toggle
- [ ] `AnnotationList` - Footnotes and annotations
- [ ] `SourceInfo` - Source attribution information
- [ ] `ItemSidebar` - Metadata sidebar
- [ ] `RevisionHistory` - Version history list

### 3. Page Implementation
- [ ] `src/app/[locale]/items/[id]/page.tsx` - Main item page

### 4. Mock Data
- [ ] `src/lib/mock/items.ts` - Mock item data with annotations and revisions

### 5. Translations
- [ ] Update `src/messages/ja.json` with item page translations
- [ ] Update `src/messages/en.json` with item page translations

## Directory Structure
```
src/
├── app/[locale]/items/[id]/
│   ├── page.tsx
│   └── page.module.css
├── components/
│   ├── common/
│   │   ├── Badge.tsx
│   │   ├── Badge.module.css
│   │   ├── Breadcrumb.tsx
│   │   └── Breadcrumb.module.css
│   └── item/
│       ├── TitleBlock.tsx
│       ├── TitleBlock.module.css
│       ├── BodyViewer.tsx
│       ├── BodyViewer.module.css
│       ├── AnnotationList.tsx
│       ├── AnnotationList.module.css
│       ├── SourceInfo.tsx
│       ├── SourceInfo.module.css
│       ├── ItemSidebar.tsx
│       ├── ItemSidebar.module.css
│       ├── RevisionHistory.tsx
│       ├── RevisionHistory.module.css
│       └── index.ts
└── lib/mock/
    └── items.ts
```

## Implementation Order
1. Create mock data first
2. Implement Badge and Breadcrumb common components
3. Implement item-specific components (Title → Body → Annotations → Source → Sidebar → Revisions)
4. Create main page layout
5. Add translations
6. Test and refine styling

## Notes
- Use Server Components by default, Client Components only for interactivity (BodyViewer toggle)
- Follow existing CSS Module patterns with CSS variables
- Ensure semantic HTML and proper accessibility
- External links must have `rel="noopener noreferrer"`
- Annotation numbers use [1], [2] format
