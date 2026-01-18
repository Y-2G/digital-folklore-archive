# Phase 1.3: デザインシステム基盤 - 実装記録

## 実施日
2026-01-18

## 概要
Digital Folklore Archive のデザインシステム基盤を構築。資料館/図書館の美学に基づいたクリーンでミニマルなデザインシステムを実装しました。

## 実装内容

### 1. グローバルCSS変数システム (`src/app/globals.css`)

以下のカテゴリーでCSS変数を定義:

#### カラーシステム
- `--background`: #faf9f7 (ライトモード) / #1a1a1a (ダークモード)
- `--foreground`: #1a1a1a (ライトモード) / #e8e6e3 (ダークモード)
- `--muted`: #666666 (ライトモード) / #999999 (ダークモード)
- `--border`: #e0ddd8 (ライトモード) / #333333 (ダークモード)
- `--accent`: #4a4a4a (ライトモード) / #b0b0b0 (ダークモード)

#### タイポグラフィ
- `--font-serif`: Georgia系（タイトル用）
- `--font-sans`: Geist Sans系（本文用）
- `--font-mono`: Geist Mono系（コード用）

#### スペーシングスケール
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-2xl`: 48px

#### タイポグラフィスケール
- `--text-xs`: 0.75rem (12px)
- `--text-sm`: 0.875rem (14px)
- `--text-base`: 1rem (16px)
- `--text-lg`: 1.125rem (18px)
- `--text-xl`: 1.25rem (20px)
- `--text-2xl`: 1.5rem (24px)

#### レイアウト
- `--max-width`: 1200px
- `--sidebar-width`: 280px

### 2. レスポンシブブレークポイント

定義したブレークポイント:
- Mobile: ~640px
- Tablet: 641px~1024px
- Desktop: 1025px~

### 3. コンポーネント実装

#### Container (`src/components/common/Container.tsx`)
- 最大幅1200pxのコンテナコンポーネント
- レスポンシブパディング（モバイル: 16px, タブレット: 24px, デスクトップ: 32px）
- セマンティックHTML対応（`as` prop で `div`, `main`, `section`, `article` を選択可能）

#### Header (`src/components/common/Header.tsx`)
- サイト名の日英併記表示
- Sticky positioning でスクロール時も固定
- 下部ボーダーで明確なセクション分離
- ナビゲーションと言語切替のプレースホルダー（Phase 3 で実装予定）
- レスポンシブレイアウト（モバイルで縦積み）

#### Footer (`src/components/common/Footer.tsx`)
- シンプルなコピーライト表示
- プロジェクト説明文
- 上部ボーダーでページコンテンツと分離

### 4. レイアウト更新

#### Root Layout (`src/app/layout.tsx`)
- Header と Footer を全ページに適用
- メタデータを更新（サイトタイトルと説明）
- 言語属性を `ja` に設定

#### Home Page (`src/app/page.tsx`, `src/app/page.module.css`)
- Container コンポーネントを使用
- 資料館風のヒーローセクション
- 実装完了状態を示すプレースホルダー
- レスポンシブタイポグラフィ

## ファイル構成

```
src/
├── app/
│   ├── globals.css          # 更新: CSS変数システム
│   ├── layout.tsx            # 更新: Header/Footer追加
│   ├── page.tsx              # 更新: Container使用
│   └── page.module.css       # 更新: 資料館風スタイル
└── components/
    └── common/
        ├── index.ts          # 新規: Barrel export
        ├── Container.tsx     # 新規
        ├── Container.module.css
        ├── Header.tsx        # 新規
        ├── Header.module.css
        ├── Footer.tsx        # 新規
        └── Footer.module.css
```

## デザイン原則の適用

✓ 資料館/図書館の美学
- セリフフォント（Georgia）をタイトルに使用
- クリーンな罫線とボーダー
- 控えめな色使い（#faf9f7 背景、#e0ddd8 ボーダー）

✓ ミニマリズム
- 派手な効果なし
- hover効果は opacity 0.7 の控えめな変化のみ
- フラットなデザイン

✓ アクセシビリティ
- セマンティックHTML（header, main, footer）
- 適切な見出し階層
- カラーコントラスト確保

✓ レスポンシブデザイン
- モバイルファースト
- 3段階のブレークポイント
- 柔軟なタイポグラフィスケーリング

## ビルド確認

```bash
$ yarn build
✓ Compiled successfully in 1274.8ms
✓ Generating static pages using 7 workers (4/4) in 148.5ms

$ yarn lint
✓ No linting errors
```

## 次のステップ

Phase 1.3 完了により、以下が可能になりました:

1. 一貫したデザインシステムでのコンポーネント開発
2. レスポンシブレイアウトの基盤
3. ダークモード対応の基盤

次のフェーズ:
- Phase 2: データ層（型定義、Firebase初期化）
- Phase 3: ページ実装（Catalog、Item詳細など）

## 実装者ノート

- CSS変数により、将来的なテーマ変更が容易
- Container コンポーネントの `as` prop により、適切なセマンティックHTMLの使用が促進される
- Header/Footer はサーバーコンポーネントとして実装（インタラクションが不要なため）
- 全体的にゼロランタイムCSSアプローチ（CSS Modules使用）
