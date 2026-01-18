# 検索設計

## 概要

Firestore ネイティブで実装し、将来的に Algolia/Meilisearch 等へ置換可能な設計とする。

## searchTokens

### seed（トークン生成元）

- `id`
- `title.ja` / `title.en`
- `originalTitle`
- `sourceName`
- `motifs`

### 正規化ルール

1. lowercase（小文字化）
2. NFKC正規化
3. 記号除去

### 部分一致の実現

- prefixトークン化（先頭から n 文字）
- 例: "くねくね" → ["く", "くね", "くねく", "くねくね"]

## Firestoreクエリ

```ts
// searchTokensに対してarray-containsでクエリ
const q = query(
  collection(db, "items"),
  where("status", "==", "PUBLISHED"),
  where("searchTokens", "array-contains", normalizedQuery),
  orderBy("updatedAt", "desc"),
  limit(20)
);
```

## 将来的な拡張

- **Algolia**: フル機能の全文検索
- **Meilisearch**: セルフホスト可能な代替
- **Typesense**: オープンソースの選択肢
