# Next.js（App Router）構成

## ディレクトリ構造

```
src/
  app/
    [locale]/
      layout.tsx
      page.tsx                    # Home
      catalog/
        page.tsx                  # Catalog
      items/
        [id]/
          page.tsx                # Item
      collections/
        page.tsx                  # Collections list
        [slug]/
          page.tsx                # Collection detail
      analysis/
        page.tsx                  # Analysis
      about/
        page.tsx                  # About
      submit/
        page.tsx                  # Submit
  lib/
    firebase/
      client.ts                   # Firebase client初期化
    catalog/
      queries.ts                  # Firestoreクエリ
      searchTokens.ts             # 検索トークン生成
  types/
    firestore.ts                  # Firestore型定義
  messages/
    ja.json                       # 日本語メッセージ
    en.json                       # 英語メッセージ
```

## ルーティング

| パス | ファイル | 説明 |
|------|----------|------|
| `/ja` | `app/[locale]/page.tsx` | 日本語トップ |
| `/en` | `app/[locale]/page.tsx` | 英語トップ |
| `/ja/catalog` | `app/[locale]/catalog/page.tsx` | 日本語目録 |
| `/en/catalog` | `app/[locale]/catalog/page.tsx` | 英語目録 |
| `/ja/items/DTA-000128` | `app/[locale]/items/[id]/page.tsx` | 資料詳細 |
| `/ja/collections` | `app/[locale]/collections/page.tsx` | 棚一覧 |
| `/ja/collections/missing-person` | `app/[locale]/collections/[slug]/page.tsx` | 棚詳細 |
