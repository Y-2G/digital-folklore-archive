/**
 * Firestore Data Seeding Script
 *
 * Seeds Firestore with initial mock data.
 *
 * Usage:
 *   npx ts-node scripts/seed-firestore.ts
 *
 * Prerequisites:
 *   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 *   - Or run with Firebase emulator
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Mock data imports (adjust paths as needed when running)
// Note: This script assumes it's run from the project root

// ============================================================================
// Configuration
// ============================================================================

const USE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST !== undefined;

// Initialize Firebase Admin
function initializeFirebase() {
  if (USE_EMULATOR) {
    console.log('🔧 Using Firestore Emulator');
    initializeApp({ projectId: 'demo-dta' });
  } else {
    // For production, use service account
    const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!serviceAccount) {
      throw new Error(
        'GOOGLE_APPLICATION_CREDENTIALS environment variable is required for production seeding'
      );
    }
    initializeApp({
      credential: cert(serviceAccount as string),
    });
  }
}

// ============================================================================
// Mock Data (inline for simplicity)
// ============================================================================

const mockItems = [
  {
    id: 'DTA-000001',
    type: 'KAIDAN',
    language: 'JA',
    confidence: 'PRIMARY',
    title: { ja: 'コトリバコ', en: 'Kotori Box' },
    body: {
      ja: '人を呪い殺すための箱という設定の創作怪談。2ch発祥。',
      en: 'A cursed box story originating from 2ch.',
    },
    firstSeen: '2000s',
    sourceName: '2ch',
    sourceUrl: 'https://example.com/kotori',
    motifs: ['RITUAL_RULES', 'ENTITY'],
    region: 'JAPAN',
    medium: 'FORUM_BBS',
    annotationCount: 3,
    revisionCount: 2,
    status: 'PUBLISHED',
    searchTokens: ['コトリバコ', 'kotori', 'box', '呪い', 'dta-000001', '000001'],
  },
  {
    id: 'DTA-000002',
    type: 'URBAN_LEGEND',
    language: 'EN',
    confidence: 'SECONDARY',
    title: { en: 'The Backrooms', ja: 'バックルーム' },
    originalTitle: 'The Backrooms',
    body: {
      en: 'If you no-clip out of reality, you may end up in the Backrooms.',
      ja: '現実から抜け落ちた先に存在する無限の黄色い部屋。',
    },
    firstSeen: '2010s',
    sourceName: '4chan',
    motifs: ['PLACE', 'ROOM_APARTMENT'],
    region: 'NA',
    medium: 'FORUM_BBS',
    annotationCount: 5,
    revisionCount: 1,
    status: 'PUBLISHED',
    searchTokens: ['backrooms', 'バックルーム', 'yellow', 'dta-000002', '000002'],
  },
  {
    id: 'DTA-000003',
    type: 'CREEPYPASTA',
    language: 'EN',
    confidence: 'PRIMARY',
    title: { en: 'Ben Drowned', ja: 'ベン・ドラウンド' },
    body: {
      en: "A haunted Majora's Mask cartridge story.",
      ja: 'ムジュラの仮面の呪われたカートリッジの物語。',
    },
    firstSeen: '2010s',
    sourceName: 'Something Awful',
    sourceUrl: 'https://example.com/ben-drowned',
    motifs: ['MEDIA_DEVICE', 'ENTITY', 'DOPPELGANGER'],
    region: 'NA',
    medium: 'FORUM_BBS',
    annotationCount: 8,
    revisionCount: 3,
    status: 'PUBLISHED',
    searchTokens: ['ben', 'drowned', 'zelda', 'majora', 'dta-000003', '000003'],
  },
  {
    id: 'DTA-000128',
    type: 'KAIDAN',
    language: 'JA',
    confidence: 'SECONDARY',
    title: { ja: 'きさらぎ駅', en: 'Kisaragi Station' },
    body: {
      ja: '2004年に2chのオカルト板で報告された、存在しない駅に迷い込んだという実況形式の怪談。',
      en: 'A 2ch thread from 2004 about getting lost at a non-existent train station.',
    },
    firstSeen: '2000s',
    sourceName: '2ch',
    sourceUrl: 'https://example.com/kisaragi',
    sourceArchiveUrl: 'https://archive.example.com/kisaragi',
    motifs: ['PLACE', 'MISSING_PERSON'],
    region: 'JAPAN',
    medium: 'FORUM_BBS',
    annotationCount: 12,
    revisionCount: 5,
    status: 'PUBLISHED',
    searchTokens: ['きさらぎ駅', 'kisaragi', 'station', '2ch', 'dta-000128', '000128'],
  },
];

const mockCollections = [
  {
    slug: '2ch-classics',
    title: { ja: '2ch怪談傑作選', en: '2ch Kaidan Classics' },
    description: {
      ja: '2ちゃんねるのオカルト板から生まれた代表的な怪談作品を集めたコレクション。',
      en: "A collection of classic kaidan stories that originated from 2ch's occult board.",
    },
    itemIds: ['DTA-000001', 'DTA-000128'],
    curatorNote: {
      ja: '2000年代初頭のインターネット怪談文化を代表する作品群です。',
      en: 'These works represent the internet kaidan culture of the early 2000s.',
    },
    status: 'PUBLISHED',
  },
  {
    slug: 'western-creepypasta',
    title: { ja: '西洋クリーピーパスタ傑作集', en: 'Western Creepypasta Masterpieces' },
    description: {
      ja: '英語圏で生まれた代表的なクリーピーパスタ作品のコレクション。',
      en: 'A collection of iconic creepypasta stories from English-speaking communities.',
    },
    itemIds: ['DTA-000002', 'DTA-000003'],
    curatorNote: {
      en: 'These stories helped define the creepypasta genre internationally.',
    },
    status: 'PUBLISHED',
  },
];

// ============================================================================
// Seeding Functions
// ============================================================================

async function seedItems(db: FirebaseFirestore.Firestore) {
  console.log('📚 Seeding items...');
  const batch = db.batch();
  const now = Timestamp.now();

  for (const item of mockItems) {
    const ref = db.collection('items').doc(item.id);
    batch.set(ref, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(`   ✓ Seeded ${mockItems.length} items`);
}

async function seedCollections(db: FirebaseFirestore.Firestore) {
  console.log('📁 Seeding collections...');
  const batch = db.batch();
  const now = Timestamp.now();

  for (const collection of mockCollections) {
    const ref = db.collection('collections').doc(collection.slug);
    batch.set(ref, {
      ...collection,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(`   ✓ Seeded ${mockCollections.length} collections`);
}

async function main() {
  console.log('🌱 Starting Firestore seeding...\n');

  try {
    initializeFirebase();
    const db = getFirestore();

    await seedItems(db);
    await seedCollections(db);

    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
