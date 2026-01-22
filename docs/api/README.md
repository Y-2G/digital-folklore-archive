# Digital Folklore Archive API

記事投稿APIの使用ガイドです。

## 概要

このAPIは管理者向けの記事投稿エンドポイントを提供します。外部システムやスクリプトからの記事登録に使用できます。

## 認証

### APIキー認証

すべてのリクエストには `X-API-Key` ヘッダーが必要です。

```bash
X-API-Key: your-secret-api-key
```

APIキーは環境変数 `DTA_API_SECRET_KEY` で設定します。

**セキュリティ注意事項:**
- APIキーは絶対にクライアントサイドコードに含めないでください
- サーバーサイドのスクリプトやCI/CDパイプラインでのみ使用してください
- 定期的にキーをローテーションすることを推奨します

## エンドポイント

### POST /api/v1/items

新しい記事を作成します。

#### リクエスト

```http
POST /api/v1/items
Content-Type: application/json
X-API-Key: your-secret-api-key
```

#### 必須フィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `type` | string | 資料種別: `KAIDAN`, `URBAN_LEGEND`, `CREEPYPASTA`, `CHAIN_MEME`, `ORIGINAL`, `COMMENTARY` |
| `language` | string | 主要言語: `JA`, `EN`, `OTHER` |
| `confidence` | string | 出典確度: `PRIMARY`, `SECONDARY`, `UNKNOWN` |
| `title` | object | タイトル（`ja` または `en` のいずれか必須） |
| `body` | object | 本文（`ja`, `en`, `original` のいずれか必須） |
| `motifs` | array | モチーフタグ（1〜3個） |
| `status` | string | 公開状態: `PUBLISHED`, `DRAFT`（デフォルト: `DRAFT`） |

#### 任意フィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `originalTitle` | string | 原題（最大200文字） |
| `firstSeen` | string | 初出年代（`Pre-1999`, `2000s`, `2010s`, `2020s`, `Unknown`, または `YYYY` / `YYYY-MM`形式） |
| `sourceName` | string | 出典名（最大100文字） |
| `sourceUrl` | string | 初出URL |
| `sourceArchiveUrl` | string | アーカイブURL |
| `formats` | array | 形式タグ（最大10個） |
| `region` | string | 地域: `JAPAN`, `NA`, `EU`, `ASIA_EX_JAPAN`, `GLOBAL_UNKNOWN` |
| `medium` | string | 媒体: `FORUM_BBS`, `SNS`, `VIDEO`, `WIKI_ARCHIVE`, `PRINT_ORAL`, `UNKNOWN` |

#### モチーフタグ一覧

```
PLACE, ROAD_TUNNEL, FOREST_MOUNTAIN, WATER, ROOM_APARTMENT,
MISSING_PERSON, STALKER_OBSERVER, ENTITY, DOPPELGANGER, CHILD_FAMILY,
MEDIA_DEVICE, RITUAL_RULES, WARNING_CHAIN, EXPERIMENT_REPORT, IDENTITY
```

#### リクエスト例

```json
{
  "type": "KAIDAN",
  "language": "JA",
  "confidence": "PRIMARY",
  "title": {
    "ja": "くねくね",
    "en": "Kunekune"
  },
  "body": {
    "ja": "田んぼの中に白い人型の何かがいて、くねくねと体を揺らしている...",
    "en": "In the rice paddies, there's something white and human-shaped, swaying..."
  },
  "motifs": ["ENTITY", "PLACE"],
  "status": "DRAFT",
  "firstSeen": "2000s",
  "sourceName": "2ch",
  "region": "JAPAN",
  "medium": "FORUM_BBS"
}
```

#### レスポンス

##### 成功 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "DTA-000001",
    "createdAt": "2026-01-22T10:30:00.000Z"
  }
}
```

##### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "fields": {
        "title": "At least one of ja or en is required"
      }
    }
  }
}
```

## エラーコード

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| `UNAUTHORIZED` | 401 | APIキーが無効または未指定 |
| `VALIDATION_ERROR` | 400 | リクエストデータが不正 |
| `RATE_LIMITED` | 429 | レート制限超過 |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

## レート制限

- **制限**: 10リクエスト / 60秒（IPアドレスごと）
- **ヘッダー**: すべてのレスポンスに以下のヘッダーが含まれます
  - `X-RateLimit-Limit`: 制限値
  - `X-RateLimit-Remaining`: 残りリクエスト数
  - `X-RateLimit-Reset`: リセット時刻（Unix timestamp）
  - `Retry-After`: 制限超過時の待機秒数

環境変数で調整可能:
```
DTA_API_RATE_LIMIT_WINDOW_MS=60000
DTA_API_RATE_LIMIT_MAX_REQUESTS=10
```

## 自動処理

APIは以下の処理を自動で行います:

1. **ID自動採番**: `DTA-XXXXXX` 形式のIDを自動生成
2. **検索トークン生成**: タイトル・出典・モチーフから検索用トークンを自動生成
3. **タイムスタンプ**: `createdAt`, `updatedAt` を自動設定

## 使用例

### curl

```bash
# 環境変数にAPIキーを設定
export DTA_API_SECRET_KEY="your-secret-api-key"

# 記事を投稿
curl -X POST http://localhost:3000/api/v1/items \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $DTA_API_SECRET_KEY" \
  -d '{
    "type": "KAIDAN",
    "language": "JA",
    "confidence": "PRIMARY",
    "title": { "ja": "テスト怪談" },
    "body": { "ja": "これはテストです" },
    "motifs": ["ENTITY"],
    "status": "DRAFT"
  }'
```

### JavaScript (Node.js)

```javascript
const response = await fetch('http://localhost:3000/api/v1/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.DTA_API_SECRET_KEY,
  },
  body: JSON.stringify({
    type: 'KAIDAN',
    language: 'JA',
    confidence: 'PRIMARY',
    title: { ja: 'テスト怪談' },
    body: { ja: 'これはテストです' },
    motifs: ['ENTITY'],
    status: 'DRAFT',
  }),
});

const result = await response.json();

if (result.success) {
  console.log('Created item:', result.data.id);
} else {
  console.error('Error:', result.error.message);
}
```

### Python

```python
import requests
import os

response = requests.post(
    'http://localhost:3000/api/v1/items',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': os.environ['DTA_API_SECRET_KEY'],
    },
    json={
        'type': 'KAIDAN',
        'language': 'JA',
        'confidence': 'PRIMARY',
        'title': {'ja': 'テスト怪談'},
        'body': {'ja': 'これはテストです'},
        'motifs': ['ENTITY'],
        'status': 'DRAFT',
    }
)

result = response.json()

if result['success']:
    print(f"Created item: {result['data']['id']}")
else:
    print(f"Error: {result['error']['message']}")
```

## セキュリティ

### 実装されているセキュリティ対策

- **APIキー認証**: タイミング攻撃対策付きの定時間比較
- **入力バリデーション**: Zodスキーマによる厳格な型検証
- **レート制限**: IPベースのDoS対策
- **エラー情報隠蔽**: 本番環境では内部エラー詳細を非公開

### ベストプラクティス

1. APIキーは環境変数で管理し、コードにハードコードしない
2. 本番環境ではHTTPS経由でのみアクセスする
3. 定期的にAPIキーをローテーションする
4. 監査ログを有効にして不正アクセスを監視する

## トラブルシューティング

### 401 Unauthorized

- `X-API-Key` ヘッダーが正しく設定されているか確認
- 環境変数 `DTA_API_SECRET_KEY` が設定されているか確認

### 400 Validation Error

- リクエストボディのJSON形式が正しいか確認
- 必須フィールドがすべて含まれているか確認
- 値が許可された範囲内か確認（例: motifs は1〜3個）

### 429 Rate Limited

- レート制限を超えています
- `Retry-After` ヘッダーの秒数だけ待ってから再試行

## 関連ドキュメント

- [API設計書](../design/12-item-api.md)
- [データモデル](../design/05-data-model.md)
- [タクソノミー定義](../design/04-taxonomy.md)
