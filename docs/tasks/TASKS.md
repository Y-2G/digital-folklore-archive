# 実装タスク一覧

> 各設計ドキュメントから抽出したタスクのチェックリスト

## 進捗サマリー

| フェーズ | 進捗 | 状態 |
|---------|------|------|
| Phase 1: 基盤構築 | 0/15 | 未着手 |
| Phase 2: データ層 | 0/12 | 未着手 |
| Phase 3: ページ実装 | 0/24 | 未着手 |
| Phase 4: 検索・フィルタ | 0/8 | 未着手 |
| Phase 5: 多言語対応 | 0/7 | 未着手 |
| Phase 6: 管理・運用 | 0/10 | 未着手 |
| **合計** | **0/76** | **未着手** |

---

## Phase 1: 基盤構築

> 参照: [01-project-overview.md](../design/01-project-overview.md), [07-nextjs-structure.md](../design/07-nextjs-structure.md)

### 1.1 プロジェクトセットアップ

- [ ] Next.js App Router プロジェクト初期化
- [ ] TypeScript 設定確認・調整
- [ ] ESLint / Prettier 設定
- [ ] ディレクトリ構造作成（`src/app`, `src/lib`, `src/types`, `src/messages`）

### 1.2 Firebase セットアップ

- [ ] Firebase プロジェクト作成
- [ ] Firestore データベース作成
- [ ] Firebase SDK インストール（`firebase`, `firebase-admin`）
- [ ] `src/lib/firebase/client.ts` 作成（クライアント初期化）
- [ ] 環境変数設定（`.env.local`）

### 1.3 デザインシステム基盤

- [ ] グローバルCSS / CSS変数定義
- [ ] フォント設定（資料館トーン：セリフ系 or 明朝系）
- [ ] 基本レイアウトコンポーネント作成
- [ ] 共通Header コンポーネント作成
- [ ] 共通Footer コンポーネント作成
- [ ] レスポンシブブレークポイント定義

---

## Phase 2: データ層

> 参照: [05-data-model.md](../design/05-data-model.md), [04-taxonomy.md](../design/04-taxonomy.md)

### 2.1 型定義

- [ ] `src/types/firestore.ts` 作成
- [ ] `ItemDoc` 型定義
- [ ] `RevisionDoc` 型定義
- [ ] `AnnotationDoc` 型定義
- [ ] `CollectionDoc` 型定義
- [ ] Enum型定義（`ItemType`, `SourceConfidence`, `Language`）

### 2.2 タクソノミー定義

- [ ] Type（種別）辞書定義
- [ ] Language（言語）辞書定義
- [ ] SourceConfidence（出典確度）辞書定義
- [ ] FirstSeen（初出年代）辞書定義
- [ ] Motif（モチーフ）辞書定義
- [ ] Region（地域）辞書定義（任意）

---

## Phase 3: ページ実装

> 参照: [02-information-architecture.md](../design/02-information-architecture.md), [03-page-design.md](../design/03-page-design.md)

### 3.1 レイアウト

- [ ] `src/app/[locale]/layout.tsx` 作成
- [ ] ナビゲーション実装
- [ ] 言語切替UI実装

### 3.2 Home ページ (`/`)

- [ ] `src/app/[locale]/page.tsx` 作成
- [ ] Hero セクション（タグライン + 検索バー）
- [ ] クイックチップ（Type / Confidence / Language）
- [ ] 新規収蔵リスト（5件）
- [ ] 最近更新リスト（5件）
- [ ] 注目資料セクション（3件）

### 3.3 Catalog ページ (`/catalog`)

- [ ] `src/app/[locale]/catalog/page.tsx` 作成
- [ ] 上部ツールバー（検索バー + ソート + 条件チップ）
- [ ] Facet サイドバー実装
- [ ] 目録行リスト実装
- [ ] ページネーション / 無限スクロール
- [ ] URL クエリパラメータ連携

### 3.4 Item ページ (`/items/[id]`)

- [ ] `src/app/[locale]/items/[id]/page.tsx` 作成
- [ ] Breadcrumb 実装
- [ ] Title block（タイトル / 原題 / バッジ）
- [ ] 本文エリア（原文 / 翻訳切替）
- [ ] 注釈・脚注表示
- [ ] サイドバー（メタデータ / 関連資料）
- [ ] 出典セクション
- [ ] 版履歴セクション

### 3.5 Collections ページ

- [ ] `src/app/[locale]/collections/page.tsx` 作成（一覧）
- [ ] `src/app/[locale]/collections/[slug]/page.tsx` 作成（詳細）
- [ ] 棚カード / リスト表示

### 3.6 その他ページ

- [ ] `src/app/[locale]/about/page.tsx` 作成
- [ ] `src/app/[locale]/analysis/page.tsx` 作成（統計・分布）
- [ ] `src/app/[locale]/submit/page.tsx` 作成（投稿フォーム）

---

## Phase 4: 検索・フィルタ

> 参照: [06-search.md](../design/06-search.md)

### 4.1 検索機能

- [ ] `src/lib/catalog/searchTokens.ts` 作成
- [ ] searchTokens 生成ロジック実装
- [ ] 正規化処理（lowercase + NFKC + 記号除去）
- [ ] prefix トークン化実装

### 4.2 クエリ実装

- [ ] `src/lib/catalog/queries.ts` 作成
- [ ] 基本クエリ（PUBLISHED + orderBy updatedAt）
- [ ] Facet フィルタクエリ
- [ ] 検索クエリ（array-contains）

---

## Phase 5: 多言語対応

> 参照: [08-i18n.md](../design/08-i18n.md)

### 5.1 next-intl セットアップ

- [ ] `next-intl` インストール・設定
- [ ] ミドルウェア設定（locale検出・リダイレクト）
- [ ] `src/messages/ja.json` 作成
- [ ] `src/messages/en.json` 作成

### 5.2 翻訳実装

- [ ] 共通UI翻訳（ナビ / ボタン / ラベル）
- [ ] ページ固有翻訳（Home / Catalog / Item）
- [ ] Type / Confidence ラベル翻訳

---

## Phase 6: 管理・運用

> 参照: [09-security.md](../design/09-security.md), [10-operations.md](../design/10-operations.md)

### 6.1 セキュリティ

- [ ] Firestore セキュリティルール作成
- [ ] 管理者カスタムクレーム設定
- [ ] 必要なインデックス作成

### 6.2 管理機能

- [ ] 管理者認証フロー
- [ ] 資料追加機能（手動 or 管理画面）
- [ ] 資料編集機能
- [ ] searchTokens 自動生成（Cloud Functions）

### 6.3 デプロイ・運用

- [ ] Vercel / Firebase Hosting 設定
- [ ] 環境変数設定（本番）
- [ ] CI/CD パイプライン構築
- [ ] 初期データ投入

---

## 補足: コンポーネント一覧

実装が必要な主要コンポーネント:

### 共通

- [ ] `SearchBar` - 検索入力
- [ ] `Badge` - Type / Lang / Confidence バッジ
- [ ] `Chip` - フィルタ条件チップ
- [ ] `Breadcrumb` - パンくずリスト

### Catalog

- [ ] `FacetSidebar` - 絞り込みサイドバー
- [ ] `FacetGroup` - Facet グループ（チェックボックス群）
- [ ] `CatalogRow` - 目録1行
- [ ] `SortSelect` - ソート選択

### Item

- [ ] `TitleBlock` - タイトルブロック
- [ ] `BodyViewer` - 本文表示（原文/翻訳切替）
- [ ] `AnnotationList` - 注釈一覧
- [ ] `RevisionHistory` - 版履歴
- [ ] `SourceInfo` - 出典情報

### Home

- [ ] `HeroSection` - ヒーローセクション
- [ ] `QuickChips` - クイックフィルタ
- [ ] `ItemListCompact` - コンパクトな資料リスト
- [ ] `FeaturedItem` - 注目資料カード

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| YYYY-MM-DD | 初版作成 |
