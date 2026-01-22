# MCP Server 設計書

## 概要

Digital Folklore Archive のMCPサーバー実装仕様。外部AIエージェントから記事を投稿する機能を提供する。

## アーキテクチャ

```
┌─────────────────┐
│  Claude Desktop │
│  (MCP Client)   │
└────────┬────────┘
         │ stdio (JSON-RPC)
         ▼
┌─────────────────┐
│   MCP Server    │
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│   Core Library      │
│  (ItemService)      │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Firebase Emulator  │
│    (Firestore)      │
└─────────────────────┘
```

## ファイル構成

```
src/
├── lib/
│   └── core/
│       ├── index.ts          # コアサービスのエクスポート
│       └── item-service.ts   # createItem ビジネスロジック
└── mcp/
    ├── index.ts              # エントリーポイント
    ├── server.ts             # MCPサーバー本体
    └── tools/
        └── create-item.ts    # create_folklore_item ツール
```

## MCPツール

### create_folklore_item

記事を新規作成するツール。

#### 入力スキーマ

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| type | enum | ✓ | KAIDAN, URBAN_LEGEND, CREEPYPASTA, CHAIN_MEME, ORIGINAL, COMMENTARY |
| language | enum | ✓ | JA, EN, OTHER |
| confidence | enum | ✓ | PRIMARY, SECONDARY, UNKNOWN |
| title | object | ✓ | `{ ja?: string, en?: string }` 少なくとも1つ必須 |
| body | object | ✓ | `{ ja?: string, en?: string, original?: string }` 少なくとも1つ必須 |
| motifs | array | ✓ | 1-3個のモチーフタグ |
| status | enum | | DRAFT (デフォルト), PUBLISHED |
| originalTitle | string | | 原題 |
| firstSeen | string | | 初出時期 (Pre-1999, 2000s, 2010s, 2020s, Unknown, YYYY, YYYY-MM) |
| sourceName | string | | 出典名 |
| sourceUrl | string | | 出典URL |
| sourceArchiveUrl | string | | アーカイブURL |
| formats | array | | フォーマットタグ |
| region | enum | | JAPAN, NA, EU, ASIA_EX_JAPAN, GLOBAL_UNKNOWN |
| medium | enum | | FORUM_BBS, SNS, VIDEO, WIKI_ARCHIVE, PRINT_ORAL, UNKNOWN |

#### モチーフタグ一覧

- PLACE (場所)
- ROAD_TUNNEL (道路・トンネル)
- FOREST_MOUNTAIN (森・山)
- WATER (水)
- ROOM_APARTMENT (部屋・マンション)
- MISSING_PERSON (行方不明)
- STALKER_OBSERVER (ストーカー・観察者)
- ENTITY (存在)
- DOPPELGANGER (ドッペルゲンガー)
- CHILD_FAMILY (子供・家族)
- MEDIA_DEVICE (メディア・機器)
- RITUAL_RULES (儀式・ルール)
- WARNING_CHAIN (警告・チェーン)
- EXPERIMENT_REPORT (実験・報告)
- IDENTITY (アイデンティティ)

#### 出力例

```json
{
  "content": [
    {
      "type": "text",
      "text": "Successfully created folklore item.\n\nID: DTA-000001\nCreated: 2026-01-23T10:30:00.000Z"
    }
  ]
}
```

## 起動方法

### 前提条件

1. Firebase Emulatorが起動していること
2. 環境変数が設定されていること

### 環境変数

```bash
# Firebase Emulator使用
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
```

### コマンド

```bash
# Firebase Emulator起動
yarn firebase:emulator

# 別ターミナルでMCPサーバー起動
yarn mcp:server
```

## Claude Desktop設定

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dta-archive": {
      "command": "npx",
      "args": [
        "ts-node",
        "--project",
        "tsconfig.mcp.json",
        "src/mcp/index.ts"
      ],
      "cwd": "/Users/tsujiyoshifumi/work/dev/digital-folklore-archive",
      "env": {
        "NEXT_PUBLIC_USE_FIREBASE_EMULATOR": "true",
        "NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST": "localhost:8080"
      }
    }
  }
}
```

> **注意**: `yarn mcp:server` は使用しないでください。yarnの出力がstdoutに混じり、MCPプロトコルが壊れます。

## 使用例

Claude Desktopで以下のように使用:

```
「きさらぎ駅」という怪談を登録してください。
- タイプ: 怪談
- 言語: 日本語
- 信頼度: 二次ソース
- タイトル: きさらぎ駅
- 本文: 2004年1月8日、2ちゃんねるのオカルト板に...
- モチーフ: 場所、行方不明者
- 出典: 2ch
```

## セキュリティ

- ローカル開発環境でのみ使用を想定
- Firebase Emulator使用時は認証不要
- 本番環境での使用時は追加の認証機構が必要

## 拡張予定

- `search_items` - 検索ツール
- `get_item` - 詳細取得ツール
- `list_taxonomy` - 分類一覧ツール
