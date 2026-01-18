# ページ設計

## Home（トップページ）

### 構成要素

- **Header**（共通）
- **Hero**
  - タグライン（1行）
  - 検索バー（大）
  - クイックチップ：Type / Confidence / Language
  - CTA：目録を見る
- **2カラム**（モバイル縦積み）
  - 新規収蔵（5件）
  - 最近更新（5件）
- **注目資料**（3件、編集理由を1行）

---

## Catalog（目録）

### 目的

資料庫の本体。Facetで探せる。

### 構成要素

- **上部ツールバー**
  - 検索バー（中）
  - ソート（New / Updated / First seen / Most annotated）
  - 現在条件（chips）+ 解除
- **左カラム**: Facet（絞り込み）
- **右カラム**: 目録行リスト

### 目録1行（推奨項目）

| 項目 | 例 |
|------|-----|
| ID | DTA-000128 |
| Title | タイトル（原題併記可） |
| Badges | Type / Lang / Confidence |
| First seen | YYYY or YYYY-MM |
| Source | 短縮表記（reddit/2ch/wiki等） |
| Updated | YYYY-MM-DD |

---

## Item（資料詳細）

### 目的

読書優先＋資料価値（出典・方針・版履歴）。

### 構成要素

- **Breadcrumb**
- **Title block**
  - タイトル / 原題
  - Type / Lang / Confidence
  - メタ情報（First seen / Source）
- **本文エリア**
  - 原文 / 翻訳切替
  - 脚注・注釈
- **サイドバー**（デスクトップ）
  - 資料メタデータ
  - 関連資料
  - 版履歴
- **Source section**
  - 出典URL
  - アーカイブURL
  - 出典確度の説明
- **Revision history**
  - 版履歴一覧
  - 編集サマリー
