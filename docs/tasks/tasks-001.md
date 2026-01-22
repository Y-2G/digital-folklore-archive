# 実装タスク一覧

> 各設計ドキュメントから抽出したタスクのチェックリスト

## 進捗サマリー

| フェーズ | 進捗 | 状態 |
|---------|------|------|
| Phase 1: 基盤構築 | 12/15 | 進行中 |
| Phase 2: データ層 | 12/12 | 完了 |
| Phase 3: ページ実装 | 23/26 | ほぼ完了 |
| Phase 4: 検索・フィルタ | 8/8 | 完了 |
| Phase 5: 多言語対応 | 7/7 | 完了 |
| Phase 6: 管理・運用 | 10/10 | 完了 |
| Phase 7: Docker Firebase 環境 | 10/12 | ほぼ完了 |
| **合計** | **82/90** | **進行中** |

※ Phase 3の未完了項目: ページネーション、注釈表示、版履歴表示（Firestore連携後に実装予定）

---

## Phase 1: 基盤構築

> 参照: [01-project-overview.md](../design/01-project-overview.md), [07-nextjs-structure.md](../design/07-nextjs-structure.md)

### 1.1 プロジェクトセットアップ

- [x] Next.js App Router プロジェクト初期化
- [x] TypeScript 設定確認・調整
- [x] ESLint / Prettier 設定
- [x] ディレクトリ構造作成（`src/app`, `src/lib`, `src/types`, `src/messages`）

### 1.2 Firebase セットアップ

- [ ] Firebase プロジェクト作成
- [ ] Firestore データベース作成
- [x] Firebase SDK インストール（`firebase`, `firebase-admin`）
- [x] `src/lib/firebase/client.ts` 作成（クライアント初期化）
- [ ] 環境変数設定（`.env.local`）

### 1.3 デザインシステム基盤

- [x] グローバルCSS / CSS変数定義
- [x] フォント設定（資料館トーン：セリフ系 or 明朝系）
- [x] 基本レイアウトコンポーネント作成
- [x] 共通Header コンポーネント作成
- [x] 共通Footer コンポーネント作成
- [x] レスポンシブブレークポイント定義

---

## Phase 2: データ層

> 参照: [05-data-model.md](../design/05-data-model.md), [04-taxonomy.md](../design/04-taxonomy.md)

### 2.1 型定義

- [x] `src/types/firestore.ts` 作成
- [x] `ItemDoc` 型定義
- [x] `RevisionDoc` 型定義
- [x] `AnnotationDoc` 型定義
- [x] `CollectionDoc` 型定義
- [x] Enum型定義（`ItemType`, `SourceConfidence`, `Language`）

### 2.2 タクソノミー定義

- [x] Type（種別）辞書定義
- [x] Language（言語）辞書定義
- [x] SourceConfidence（出典確度）辞書定義
- [x] FirstSeen（初出年代）辞書定義
- [x] Motif（モチーフ）辞書定義
- [x] Region（地域）辞書定義（任意）

---

## Phase 3: ページ実装

> 参照: [02-information-architecture.md](../design/02-information-architecture.md), [03-page-design.md](../design/03-page-design.md)

### 3.1 レイアウト

- [x] `src/app/[locale]/layout.tsx` 作成
- [x] ナビゲーション実装
- [x] 言語切替UI実装

### 3.2 Home ページ (`/`)

- [x] `src/app/[locale]/page.tsx` 作成
- [x] Hero セクション（タグライン + 検索バー）
- [x] クイックチップ（Type / Confidence / Language）
- [x] 新規収蔵リスト（5件）
- [x] 最近更新リスト（5件）
- [x] 注目資料セクション（3件）

### 3.3 Catalog ページ (`/catalog`)

- [x] `src/app/[locale]/catalog/page.tsx` 作成
- [x] 上部ツールバー（検索バー + ソート + 条件チップ）
- [x] Facet サイドバー実装
- [x] 目録行リスト実装
- [ ] ページネーション / 無限スクロール（モックデータのため未実装）
- [x] URL クエリパラメータ連携

### 3.4 Item ページ (`/items/[id]`)

- [x] `src/app/[locale]/items/[id]/page.tsx` 作成
- [x] Breadcrumb 実装
- [x] Title block（タイトル / 原題 / バッジ）
- [x] 本文エリア（原文 / 翻訳切替）
- [ ] 注釈・脚注表示（データ未整備のため未実装）
- [x] サイドバー（メタデータ / 関連資料）
- [x] 出典セクション
- [ ] 版履歴セクション（データ未整備のため未実装）

### 3.5 Collections ページ

- [x] `src/app/[locale]/collections/page.tsx` 作成（一覧）
- [x] `src/app/[locale]/collections/[slug]/page.tsx` 作成（詳細）
- [x] 棚カード / リスト表示

### 3.6 その他ページ

- [x] `src/app/[locale]/about/page.tsx` 作成
- [x] `src/app/[locale]/analysis/page.tsx` 作成（統計・分布）
- [x] `src/app/[locale]/submit/page.tsx` 作成（投稿フォーム）

---

## Phase 4: 検索・フィルタ

> 参照: [06-search.md](../design/06-search.md)

### 4.1 検索機能

- [x] `src/lib/catalog/searchTokens.ts` 作成
- [x] searchTokens 生成ロジック実装
- [x] 正規化処理（lowercase + NFKC + 記号除去）
- [x] prefix トークン化実装

### 4.2 クエリ実装

- [x] `src/lib/catalog/queries.ts` 作成
- [x] 基本クエリ（PUBLISHED + orderBy updatedAt）
- [x] Facet フィルタクエリ
- [x] 検索クエリ（array-contains）

---

## Phase 5: 多言語対応

> 参照: [08-i18n.md](../design/08-i18n.md)

### 5.1 next-intl セットアップ

- [x] `next-intl` インストール・設定
- [x] ミドルウェア設定（locale検出・リダイレクト）
- [x] `src/messages/ja.json` 作成
- [x] `src/messages/en.json` 作成

### 5.2 翻訳実装

- [x] 共通UI翻訳（ナビ / ボタン / ラベル）
- [x] ページ固有翻訳（Home / Catalog / Item）
- [x] Type / Confidence ラベル翻訳

---

## Phase 6: 管理・運用

> 参照: [09-security.md](../design/09-security.md), [10-operations.md](../design/10-operations.md)

### 6.1 セキュリティ

- [x] Firestore セキュリティルール作成（`firestore.rules`）
- [x] 管理者カスタムクレーム設定（`scripts/set-admin-claim.ts`）
- [x] 必要なインデックス作成（`firestore.indexes.json`）

### 6.2 管理機能

- [x] 管理者認証フロー（カスタムクレーム方式）
- [x] 資料追加機能（`scripts/seed-firestore.ts`で手動投入）
- [x] 資料編集機能（Firestoreルールで管理者のみ許可）
- [x] searchTokens 自動生成（`src/lib/catalog/searchTokens.ts`で実装済み）

### 6.3 デプロイ・運用

- [x] Vercel / Firebase Hosting 設定（`firebase.json`作成）
- [x] 環境変数設定（`.env.example`作成）
- [x] CI/CD パイプライン構築（`.github/workflows/ci.yml`）
- [x] 初期データ投入（`scripts/seed-firestore.ts`）

---

## Phase 7: Docker Firebase 環境

> 参照: [11-docker-firebase.md](../design/11-docker-firebase.md)

### 7.1 Docker 基盤

- [x] `docker/firebase/Dockerfile` 作成
- [x] `docker-compose.yml` 作成
- [x] `.firebaserc` 作成（プロジェクト設定）
- [x] `.dockerignore` 作成

### 7.2 Firebase 設定更新

- [x] `firebase.json` 更新（host を 0.0.0.0 に変更、Auth/Storage 追加）
- [x] エミュレータデータ永続化設定（import/export）

### 7.3 アプリケーション連携

- [x] `src/lib/firebase/client.ts` 更新（エミュレータ自動接続）
- [x] `.env.local.example` 更新（エミュレータ用変数追加）
- [x] `.gitignore` 更新（`firebase-data/` 追加）

### 7.4 開発スクリプト

- [x] `package.json` にDockerスクリプト追加（`docker:up`, `docker:down`, `docker:logs`, `docker:reset`）

### 7.5 ドキュメント・CI

- [x] `README.md` 更新（Docker 使用方法追加）
- [ ] GitHub Actions 更新（Docker エミュレータ対応）

---

## 補足: コンポーネント一覧

実装が必要な主要コンポーネント:

### 共通

- [x] `SearchBar` - 検索入力
- [x] `Badge` - Type / Lang / Confidence バッジ
- [x] `Chip` - フィルタ条件チップ（ActiveFiltersとして実装）
- [x] `Breadcrumb` - パンくずリスト

### Catalog

- [x] `FacetSidebar` - 絞り込みサイドバー
- [x] `FacetGroup` - Facet グループ（チェックボックス群）
- [x] `CatalogRow` - 目録1行
- [x] `SortSelect` - ソート選択

### Item

- [x] `TitleBlock` - タイトルブロック
- [x] `BodyViewer` - 本文表示（原文/翻訳切替）
- [ ] `AnnotationList` - 注釈一覧（データ未整備のため未実装）
- [ ] `RevisionHistory` - 版履歴（データ未整備のため未実装）
- [x] `SourceInfo` - 出典情報

### Home

- [x] `HeroSection` - ヒーローセクション
- [x] `QuickChips` - クイックフィルタ
- [x] `ItemListCompact` - コンパクトな資料リスト
- [x] `FeaturedItem` - 注目資料カード

### Collection

- [x] `CollectionCard` - コレクションカード

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-21 | Phase 7 追加（Docker Firebase 環境） |
| 2026-01-20 | Phase 6 完了（Firestoreルール、インデックス、CI/CD、シードスクリプト） |
| 2026-01-20 | Phase 4 完了（searchTokens生成ロジック、クエリビルダー） |
| 2026-01-20 | Phase 3.5-3.6 完了（Collections/About/Analysis/Submitページ） |
| 2026-01-20 | Phase 3.2-3.4 完了（Home/Catalog/Itemページ、全コンポーネント） |
| 2026-01-20 | Phase 5 完了（next-intl設定、翻訳ファイル作成） |
| 2026-01-20 | Phase 3.1 完了（レイアウト・ナビゲーション・言語切替） |
| 2026-01-19 | Phase 2 データ層完了（Firestore型定義・タクソノミー定義） |
| 2026-01-19 | Phase 1.3 デザインシステム基盤完了（Header/Footer/Container/CSS変数） |
| 2026-01-18 | Phase 1.2 Firebase SDK インストールと初期化ファイル作成完了 |
| 2026-01-18 | Phase 1.1 プロジェクトセットアップ完了 |
| YYYY-MM-DD | 初版作成 |
