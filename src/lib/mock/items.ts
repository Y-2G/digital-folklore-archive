/**
 * Mock Data for Development
 *
 * Sample folklore items for testing the Catalog UI
 * before Firebase integration.
 */

import type { ItemDoc } from '@/types/firestore';
import { Timestamp } from 'firebase/firestore';

/**
 * Helper to create mock Timestamp from date string
 */
function mockTimestamp(dateString: string): Timestamp {
  const date = new Date(dateString);
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
    toMillis: () => date.getTime(),
  } as Timestamp;
}

/**
 * Mock Items (10 samples)
 */
/**
 * Get all mock items
 */
export function getAllItems(): ItemDoc[] {
  return mockItems;
}

/**
 * Get item by ID
 */
export function getItemById(id: string): ItemDoc | undefined {
  return mockItems.find(item => item.id === id);
}

/**
 * Get recent items (sorted by updatedAt)
 */
export function getRecentItems(limit: number = 5): ItemDoc[] {
  return [...mockItems]
    .sort((a, b) => b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime())
    .slice(0, limit);
}

/**
 * Get newest items (sorted by createdAt)
 */
export function getNewestItems(limit: number = 5): ItemDoc[] {
  return [...mockItems]
    .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
    .slice(0, limit);
}

/**
 * Get featured items (items with most annotations)
 */
export function getFeaturedItems(limit: number = 3): ItemDoc[] {
  return [...mockItems]
    .sort((a, b) => (b.annotationCount || 0) - (a.annotationCount || 0))
    .slice(0, limit);
}

/**
 * Featured item reasons (for display)
 */
export const featuredReasons: Record<string, { ja: string; en: string }> = {
  'DTA-000145': {
    ja: '学術的な分析と文化的影響の考察',
    en: 'Academic analysis and cultural impact study',
  },
  'DTA-000128': {
    ja: '2ch発祥の代表的な実況形式怪談',
    en: 'Iconic live-thread format kaidan from 2ch',
  },
  'DTA-000003': {
    ja: 'クリーピーパスタの金字塔的作品',
    en: 'A landmark work in creepypasta history',
  },
  'DTA-000001': {
    ja: 'インターネット怪談の初期作品',
    en: 'Early work of internet kaidan',
  },
  'DTA-000112': {
    ja: '2ch発の人気創作怪談',
    en: 'Popular original kaidan from 2ch',
  },
};

export const mockItems: ItemDoc[] = [
  {
    id: 'DTA-000001',
    type: 'KAIDAN',
    language: 'JA',
    confidence: 'PRIMARY',
    title: {
      ja: 'コトリバコ',
      en: 'Kotori Box',
    },
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
    createdAt: mockTimestamp('2024-01-15T10:00:00Z'),
    updatedAt: mockTimestamp('2024-12-20T14:30:00Z'),
    searchTokens: ['コトリバコ', 'kotori', 'box', '呪い'],
  },
  {
    id: 'DTA-000002',
    type: 'URBAN_LEGEND',
    language: 'EN',
    confidence: 'SECONDARY',
    title: {
      en: 'The Backrooms',
      ja: 'バックルーム',
    },
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
    createdAt: mockTimestamp('2024-02-10T09:00:00Z'),
    updatedAt: mockTimestamp('2025-01-05T16:45:00Z'),
    searchTokens: ['backrooms', 'バックルーム', 'yellow'],
  },
  {
    id: 'DTA-000003',
    type: 'CREEPYPASTA',
    language: 'EN',
    confidence: 'PRIMARY',
    title: {
      en: 'Ben Drowned',
      ja: 'ベン・ドラウンド',
    },
    body: {
      en: 'A haunted Majora\'s Mask cartridge story.',
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
    createdAt: mockTimestamp('2024-03-01T11:20:00Z'),
    updatedAt: mockTimestamp('2024-11-15T10:15:00Z'),
    searchTokens: ['ben', 'drowned', 'zelda', 'majora'],
  },
  {
    id: 'DTA-000004',
    type: 'CHAIN_MEME',
    language: 'JA',
    confidence: 'UNKNOWN',
    title: {
      ja: '赤い部屋',
      en: 'Red Room',
    },
    body: {
      ja: '「あなたは好きですか？」という音声が流れるポップアップ広告の都市伝説。',
      en: 'Urban legend about a popup ad asking "Do you like it?"',
    },
    firstSeen: '2000s',
    sourceName: 'Flash game',
    motifs: ['MEDIA_DEVICE', 'ROOM_APARTMENT', 'WARNING_CHAIN'],
    region: 'JAPAN',
    medium: 'UNKNOWN',
    annotationCount: 2,
    revisionCount: 1,
    status: 'PUBLISHED',
    createdAt: mockTimestamp('2024-04-12T08:30:00Z'),
    updatedAt: mockTimestamp('2024-10-22T13:00:00Z'),
    searchTokens: ['赤い部屋', 'red', 'room', 'popup'],
  },
  {
    id: 'DTA-000128',
    type: 'KAIDAN',
    language: 'JA',
    confidence: 'SECONDARY',
    title: {
      ja: 'きさらぎ駅',
      en: 'Kisaragi Station',
    },
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
    createdAt: mockTimestamp('2024-01-20T15:00:00Z'),
    updatedAt: mockTimestamp('2025-01-10T09:20:00Z'),
    searchTokens: ['きさらぎ駅', 'kisaragi', 'station', '2ch'],
  },
  {
    id: 'DTA-000056',
    type: 'URBAN_LEGEND',
    language: 'JA',
    confidence: 'PRIMARY',
    title: {
      ja: '口裂け女',
      en: 'Slit-Mouthed Woman',
    },
    body: {
      ja: '1970年代後半に日本全国で流行したマスクをした女性の都市伝説。',
      en: 'A masked woman urban legend that spread across Japan in the late 1970s.',
    },
    firstSeen: 'Pre-1999',
    sourceName: 'Oral tradition',
    motifs: ['ENTITY', 'CHILD_FAMILY'],
    region: 'JAPAN',
    medium: 'PRINT_ORAL',
    annotationCount: 6,
    revisionCount: 4,
    status: 'PUBLISHED',
    createdAt: mockTimestamp('2024-02-28T12:00:00Z'),
    updatedAt: mockTimestamp('2024-12-05T11:30:00Z'),
    searchTokens: ['口裂け女', 'kuchisake', 'onna', 'slit'],
  },
  {
    id: 'DTA-000089',
    type: 'CREEPYPASTA',
    language: 'EN',
    confidence: 'PRIMARY',
    title: {
      en: 'The Russian Sleep Experiment',
      ja: 'ロシア睡眠実験',
    },
    body: {
      en: 'A fictional story about a Soviet-era sleep deprivation experiment.',
      ja: 'ソ連時代の睡眠剥奪実験を題材にした創作。',
    },
    firstSeen: '2010s',
    sourceName: 'Creepypasta Wiki',
    sourceUrl: 'https://example.com/russian-sleep',
    motifs: ['EXPERIMENT_REPORT', 'ENTITY'],
    region: 'EU',
    medium: 'WIKI_ARCHIVE',
    annotationCount: 4,
    revisionCount: 2,
    status: 'PUBLISHED',
    createdAt: mockTimestamp('2024-05-15T10:45:00Z'),
    updatedAt: mockTimestamp('2024-11-30T14:20:00Z'),
    searchTokens: ['russian', 'sleep', 'experiment', 'soviet'],
  },
  {
    id: 'DTA-000112',
    type: 'ORIGINAL',
    language: 'JA',
    confidence: 'PRIMARY',
    title: {
      ja: '八尺様',
      en: 'Hachishaku-sama',
    },
    body: {
      ja: '2ch発の創作怪談。背の高い女性の怪異。',
      en: 'A tall woman yokai story from 2ch.',
    },
    firstSeen: '2000s',
    sourceName: '2ch',
    motifs: ['ENTITY', 'CHILD_FAMILY', 'RITUAL_RULES'],
    region: 'JAPAN',
    medium: 'FORUM_BBS',
    annotationCount: 7,
    revisionCount: 3,
    status: 'PUBLISHED',
    createdAt: mockTimestamp('2024-06-01T09:15:00Z'),
    updatedAt: mockTimestamp('2024-12-18T16:00:00Z'),
    searchTokens: ['八尺様', 'hachishaku', 'tall', 'woman'],
  },
  {
    id: 'DTA-000145',
    type: 'COMMENTARY',
    language: 'EN',
    confidence: 'PRIMARY',
    title: {
      en: 'Analysis: Slender Man Phenomenon',
      ja: '解説：スレンダーマン現象',
    },
    body: {
      en: 'Academic analysis of the Slender Man mythos and its cultural impact.',
      ja: 'スレンダーマンの神話とその文化的影響に関する学術的分析。',
    },
    firstSeen: '2020s',
    sourceName: 'Academic Journal',
    motifs: ['ENTITY', 'STALKER_OBSERVER'],
    region: 'NA',
    medium: 'WIKI_ARCHIVE',
    annotationCount: 15,
    revisionCount: 6,
    status: 'PUBLISHED',
    createdAt: mockTimestamp('2024-07-10T13:30:00Z'),
    updatedAt: mockTimestamp('2025-01-12T10:00:00Z'),
    searchTokens: ['slender', 'man', 'analysis', 'academic'],
  },
  {
    id: 'DTA-000167',
    type: 'CHAIN_MEME',
    language: 'JA',
    confidence: 'SECONDARY',
    title: {
      ja: 'テケテケ',
      en: 'Teke Teke',
    },
    body: {
      ja: '上半身だけで移動する女性の幽霊の都市伝説。チェーンメール形式で拡散。',
      en: 'Urban legend about a legless ghost woman. Spread via chain messages.',
    },
    firstSeen: '2000s',
    sourceName: 'Chain email',
    motifs: ['ENTITY', 'WARNING_CHAIN', 'ROAD_TUNNEL'],
    region: 'JAPAN',
    medium: 'SNS',
    annotationCount: 4,
    revisionCount: 2,
    status: 'PUBLISHED',
    createdAt: mockTimestamp('2024-08-20T11:00:00Z'),
    updatedAt: mockTimestamp('2024-12-28T15:45:00Z'),
    searchTokens: ['テケテケ', 'teke', 'chain', 'ghost'],
  },
];
