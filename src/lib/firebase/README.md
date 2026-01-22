# Firebase SDK Initialization

This directory contains Firebase SDK initialization modules for both client-side and server-side operations.

## File Structure

```
firebase/
├── client.ts    # Client-side Firebase SDK (browser/SSR)
├── admin.ts     # Server-side Firebase Admin SDK (elevated privileges)
└── README.md    # This file
```

## Usage

### Client SDK (`client.ts`)

Use for client-side operations and Next.js pages/components:

```typescript
import { db, auth, storage } from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';

// Query Firestore (respects security rules)
const itemsRef = collection(db, 'items');
const snapshot = await getDocs(itemsRef);
```

**Security:**
- Operates under Firebase security rules
- Limited by user authentication and permissions
- Safe to use in client components and API routes

### Admin SDK (`admin.ts`)

Use for server-side operations requiring elevated privileges:

```typescript
'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';

// Server action with admin privileges
export async function generateItemId() {
  const db = getAdminFirestore();

  // Admin operations bypass security rules
  const itemsRef = db.collection('items');
  const snapshot = await itemsRef.orderBy('id', 'desc').limit(1).get();

  // ... generate next ID
}
```

**Security:**
- ⚠️ **Server-side only** - never import in client code
- Bypasses Firestore security rules
- Full database access
- Use only in server actions, API routes, and server components

## Authentication Methods

### Development (Emulator)

Set environment variables in `.env.local`:

```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
NEXT_PUBLIC_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_STORAGE_EMULATOR_HOST=localhost:9199
```

No authentication required when using emulators.

### Production

#### Method 1: Google Application Default Credentials (Recommended)

```bash
# Point to service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

#### Method 2: Explicit Environment Variables

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Getting Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely (never commit to git!)

For Method 1:
- Save JSON file outside the repository
- Set `GOOGLE_APPLICATION_CREDENTIALS` to the file path

For Method 2:
- Extract `project_id`, `client_email`, and `private_key` from the JSON
- Add them to `.env.local` (note: `private_key` contains literal `\n` which will be handled by the code)

## Best Practices

### Client SDK
- ✅ Use in React components, client components
- ✅ Use in Next.js pages (SSR/SSG)
- ✅ Operations respect security rules
- ✅ Safe to expose Firebase config

### Admin SDK
- ✅ Use in Server Actions (`'use server'`)
- ✅ Use in API Route Handlers (`app/api/**/route.ts`)
- ✅ Use in Server Components (with caution)
- ❌ **Never** import in client components
- ❌ **Never** expose service account credentials
- ⚠️ Always validate input before admin operations

### Security Checklist

When using Admin SDK:

1. ✅ File has `'use server'` directive or is in `app/api/`
2. ✅ Input validation before database operations
3. ✅ User authentication check (if applicable)
4. ✅ Authorization logic (check user permissions)
5. ✅ Rate limiting for public APIs
6. ✅ Audit logging for sensitive operations

## Examples

### Server Action with Admin SDK

```typescript
'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { CatalogItem } from '@/types/firestore';

export async function getItemById(id: string): Promise<CatalogItem | null> {
  // Input validation
  if (!id || !id.startsWith('DTA-')) {
    throw new Error('Invalid item ID');
  }

  const db = getAdminFirestore();
  const docRef = db.collection('items').doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as CatalogItem;
}
```

### API Route with Admin SDK

```typescript
// app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminFirestore();
    const docRef = db.collection('items').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(doc.data());
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

### "Missing Firebase Admin credentials"

Ensure you have set either:
- `GOOGLE_APPLICATION_CREDENTIALS` pointing to service account JSON, or
- All three variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, or
- `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` for local development

### "Cannot import firebase-admin in client code"

Admin SDK can only be used server-side. Move the code to:
- Server Actions (with `'use server'`)
- API Routes (`app/api/**/route.ts`)
- Server Components (ensure no client-side usage)

### "Private key is invalid"

If using Method 2, ensure `FIREBASE_PRIVATE_KEY` includes the header and footer:
```
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
```

The code automatically handles `\n` escaping, so copy the exact value from the JSON.

## Related Documentation

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
