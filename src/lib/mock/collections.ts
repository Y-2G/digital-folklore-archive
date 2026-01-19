/**
 * Mock Collections Data
 *
 * Sample collections for testing the Collections UI
 */

export interface CollectionDoc {
  slug: string;
  title: {
    ja: string;
    en: string;
  };
  description: {
    ja: string;
    en: string;
  };
  itemIds: string[];
  coverImage?: string;
  curatorNote?: {
    ja?: string;
    en?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const mockCollections: CollectionDoc[] = [
  {
    slug: '2ch-classics',
    title: {
      ja: '2ch怪談傑作選',
      en: '2ch Kaidan Classics',
    },
    description: {
      ja: '2ちゃんねるのオカルト板から生まれた代表的な怪談作品を集めたコレクション。',
      en: 'A collection of classic kaidan stories that originated from 2ch\'s occult board.',
    },
    itemIds: ['DTA-000001', 'DTA-000128', 'DTA-000112'],
    curatorNote: {
      ja: '2000年代初頭のインターネット怪談文化を代表する作品群です。',
      en: 'These works represent the internet kaidan culture of the early 2000s.',
    },
    createdAt: '2024-06-01',
    updatedAt: '2025-01-10',
  },
  {
    slug: 'western-creepypasta',
    title: {
      ja: '西洋クリーピーパスタ傑作集',
      en: 'Western Creepypasta Masterpieces',
    },
    description: {
      ja: '英語圏で生まれた代表的なクリーピーパスタ作品のコレクション。',
      en: 'A collection of iconic creepypasta stories from English-speaking communities.',
    },
    itemIds: ['DTA-000002', 'DTA-000003', 'DTA-000089'],
    curatorNote: {
      en: 'These stories helped define the creepypasta genre internationally.',
    },
    createdAt: '2024-07-15',
    updatedAt: '2025-01-05',
  },
  {
    slug: 'japanese-urban-legends',
    title: {
      ja: '日本の都市伝説',
      en: 'Japanese Urban Legends',
    },
    description: {
      ja: '口承や印刷物から広まった日本の古典的な都市伝説を集めたコレクション。',
      en: 'A collection of classic Japanese urban legends spread through oral tradition and print media.',
    },
    itemIds: ['DTA-000056', 'DTA-000167', 'DTA-000004'],
    createdAt: '2024-08-20',
    updatedAt: '2024-12-28',
  },
  {
    slug: 'entity-encounters',
    title: {
      ja: '存在との遭遇',
      en: 'Entity Encounters',
    },
    description: {
      ja: '未知の存在や怪異との遭遇を描いた作品を集めたテーマ別コレクション。',
      en: 'A thematic collection of stories featuring encounters with unknown entities.',
    },
    itemIds: ['DTA-000003', 'DTA-000056', 'DTA-000112', 'DTA-000167'],
    createdAt: '2024-09-10',
    updatedAt: '2024-12-15',
  },
];

/**
 * Get all collections
 */
export function getAllCollections(): CollectionDoc[] {
  return mockCollections;
}

/**
 * Get collection by slug
 */
export function getCollectionBySlug(slug: string): CollectionDoc | undefined {
  return mockCollections.find(c => c.slug === slug);
}
