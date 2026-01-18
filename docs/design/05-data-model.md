# Firebase（Firestore）データ設計

## コレクション一覧

| コレクション | 説明 |
|-------------|------|
| `/items/{id}` | 資料本体（idは DTA-000128 形式推奨） |
| `/items/{id}/revisions/{revId}` | 版履歴 |
| `/items/{id}/annotations/{noteId}` | 注釈/脚注 |
| `/collections/{slug}` | 棚（編集者コレクション） |

---

## items ドキュメント

```ts
type SourceConfidence = "PRIMARY" | "SECONDARY" | "UNKNOWN";
type ItemType = "KAIDAN" | "URBAN_LEGEND" | "CREEPYPASTA" | "CHAIN_MEME" | "ORIGINAL" | "COMMENTARY";

interface ItemDoc {
  id: string; // "DTA-000128"
  type: ItemType;
  language: "JA" | "EN" | "OTHER";
  confidence: SourceConfidence;

  title: { ja?: string; en?: string };
  originalTitle?: string;

  body: {
    ja?: string;        // 翻訳本文
    en?: string;        // 英訳本文（または原文）
    original?: string;  // 原文（原語のまま）
  };

  firstSeen?: string;       // "2010s" or "2023-08"
  sourceName?: string;      // "2ch", "reddit", "wiki"
  sourceUrl?: string;       // 初出URL
  sourceArchiveUrl?: string;

  motifs: string[];         // 最大3推奨
  formats?: string[];
  region?: string;
  medium?: string;

  annotationCount?: number; // 並び替え用集計
  revisionCount?: number;

  status: "PUBLISHED" | "DRAFT";
  createdAt: Timestamp;
  updatedAt: Timestamp;

  searchTokens?: string[];  // タイトル/原題/タグ/出典/IDから生成（検索用）
}
```

---

## revisions（版履歴）

```ts
interface RevisionDoc {
  at: Timestamp;
  summary: { ja: string; en?: string };
  editorUid?: string;
}
```

---

## annotations（注釈）

```ts
interface AnnotationDoc {
  order: number; // 1, 2, 3...
  text: { ja?: string; en?: string };
}
```

---

## collections（棚）

```ts
interface CollectionDoc {
  slug: string; // "missing-person"
  title: { ja: string; en: string };
  description?: { ja?: string; en?: string };
  itemIds: string[];
  status: "PUBLISHED" | "DRAFT";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```
