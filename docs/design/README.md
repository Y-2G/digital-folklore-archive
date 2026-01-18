# デジタル伝承資料庫 — 設計ドキュメント

> Next.js + TypeScript + Firebase による目録型資料庫

## 概要

目録型（図書館UI）／演出ゼロ（0）／多言語（JP/EN）／怪談・都市伝説・クリーピーパスタ・創作・解説を収蔵する資料庫。

## タスク管理

実装タスクのチェックリストは **[TASKS.md](../tasks/TASKS.md)** を参照してください。

---

## ドキュメント構成

| ファイル | 内容 |
|---------|------|
| [01-project-overview.md](./01-project-overview.md) | プロジェクト概要・目的・トーン |
| [02-information-architecture.md](./02-information-architecture.md) | 情報設計（IA）・サイトマップ |
| [03-page-design.md](./03-page-design.md) | ページ設計（Home / Catalog / Item） |
| [04-taxonomy.md](./04-taxonomy.md) | Facet・タクソノミー・辞書定義 |
| [05-data-model.md](./05-data-model.md) | Firebase（Firestore）データ設計 |
| [06-search.md](./06-search.md) | 検索設計 |
| [07-nextjs-structure.md](./07-nextjs-structure.md) | Next.js（App Router）構成 |
| [08-i18n.md](./08-i18n.md) | 多言語対応（next-intl） |
| [09-security.md](./09-security.md) | Firestore セキュリティルール・インデックス |
| [10-operations.md](./10-operations.md) | 運用ルール・実装ロードマップ |

## 技術スタック

- **Frontend**: Next.js (App Router) + TypeScript
- **Database**: Firebase Firestore
- **i18n**: next-intl
- **検索**: Firestore ネイティブ（将来的に Algolia/Meilisearch へ置換可能）
