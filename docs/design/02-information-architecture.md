# 情報設計（IA）/ サイトマップ

## 本線（最小で強い）

```
/                       Home（トップページ）
├── /catalog            Catalog（目録）
├── /items/[id]         Item（資料詳細）
├── /collections        Collections（棚一覧）
├── /collections/[slug] Collection（棚詳細）
├── /analysis           Analysis（分析・統計）
├── /about              About（資料庫について）
└── /submit             Submit（投稿・提案）
```

## ページ概要

| ページ | パス | 概要 |
|--------|------|------|
| Home | `/` | 大検索バー + 分類入口（Type/Language/Confidence） |
| Catalog | `/catalog` | Facetで絞り込める目録 |
| Item | `/items/[id]` | 資料詳細（読書優先＋出典・版履歴） |
| Collections | `/collections` | 編集者キュレーションの棚一覧 |
| Collection | `/collections/[slug]` | 個別の棚（テーマ別資料群） |
| Analysis | `/analysis` | 統計・分布・傾向 |
| About | `/about` | 資料庫の方針・運営情報 |
| Submit | `/submit` | 資料の投稿・提案フォーム |
