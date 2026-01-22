# 記事投稿API設計

## 概要

Digital Folklore Archiveの管理者向け記事投稿APIの仕様を定義する。
このAPIは管理者のみがアクセス可能であり、APIキー認証により保護される。

**関連ドキュメント:**
- [05-data-model.md](./05-data-model.md) - Firestoreデータモデル
- [04-taxonomy.md](./04-taxonomy.md) - 分類体系
- [09-security.md](./09-security.md) - セキュリティルール

---

## エンドポイント仕様

### POST /api/v1/items

新規資料（Item）を作成する。

| 項目 | 値 |
|------|-----|
| メソッド | `POST` |
| パス | `/api/v1/items` |
| Content-Type | `application/json` |
| 認証 | APIキー（必須） |
| 権限 | 管理者のみ |

---

## 認証方法

### APIキー認証

リクエストヘッダーに `X-API-Key` を含める。

```
X-API-Key: <your-api-key>
```

**サーバー側検証:**
- 環境変数 `DTA_API_SECRET_KEY` と照合
- 一致しない場合は `401 Unauthorized` を返却

**環境変数設定例:**
```bash
# .env.local
DTA_API_SECRET_KEY=your-secure-api-key-here
```

**キー生成推奨方法:**
```bash
openssl rand -base64 32
```

---

## リクエストスキーマ

### 型定義

```typescript
interface CreateItemRequest {
  // === 必須フィールド ===

  /** 資料種別 */
  type: ItemType;

  /** 主要言語 */
  language: Language;

  /** 出典確度 */
  confidence: SourceConfidence;

  /** タイトル（少なくとも一方は必須） */
  title: {
    ja?: string;
    en?: string;
  };

  /** 本文（少なくとも一方は必須） */
  body: {
    ja?: string;
    en?: string;
    original?: string;
  };

  /** モチーフタグ（0-3個推奨） */
  motifs: Motif[];

  // === 任意フィールド ===

  /** 原題（原語のまま） */
  originalTitle?: string;

  /** 初出年代（"2010s" または "2023-08" 形式） */
  firstSeen?: FirstSeen | string;

  /** 出典名 */
  sourceName?: string;

  /** 初出URL */
  sourceUrl?: string;

  /** アーカイブURL（archive.org等） */
  sourceArchiveUrl?: string;

  /** 形式タグ（自由入力） */
  formats?: string[];

  /** 地域 */
  region?: Region;

  /** 媒体 */
  medium?: Medium;

  /** 公開状態（デフォルト: "DRAFT"） */
  status?: DocStatus;

  /** 初期注釈 */
  annotations?: Array<{
    order: number;
    text: {
      ja?: string;
      en?: string;
    };
  }>;
}

// 型定義（src/types/firestore.ts より）
type ItemType = 'KAIDAN' | 'URBAN_LEGEND' | 'CREEPYPASTA' | 'CHAIN_MEME' | 'ORIGINAL' | 'COMMENTARY';
type Language = 'JA' | 'EN' | 'OTHER';
type SourceConfidence = 'PRIMARY' | 'SECONDARY' | 'UNKNOWN';
type DocStatus = 'PUBLISHED' | 'DRAFT';
type FirstSeen = 'Pre-1999' | '2000s' | '2010s' | '2020s' | 'Unknown';
type Motif = 'PLACE' | 'ROAD_TUNNEL' | 'FOREST_MOUNTAIN' | 'WATER' | 'ROOM_APARTMENT' | 'MISSING_PERSON' | 'STALKER_OBSERVER' | 'ENTITY' | 'DOPPELGANGER' | 'CHILD_FAMILY' | 'MEDIA_DEVICE' | 'RITUAL_RULES' | 'WARNING_CHAIN' | 'EXPERIMENT_REPORT' | 'IDENTITY';
type Region = 'JAPAN' | 'NA' | 'EU' | 'ASIA_EX_JAPAN' | 'GLOBAL_UNKNOWN';
type Medium = 'FORUM_BBS' | 'SNS' | 'VIDEO' | 'WIKI_ARCHIVE' | 'PRINT_ORAL' | 'UNKNOWN';
```

### リクエスト例

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
    "ja": "田んぼの中に白い何かが...",
    "en": "A white something in the rice field...",
    "original": "田んぼの中に白い何かが..."
  },
  "motifs": ["ENTITY", "PLACE"],
  "originalTitle": "くねくね",
  "firstSeen": "2000s",
  "sourceName": "2ch",
  "sourceUrl": "https://example.com/original",
  "sourceArchiveUrl": "https://web.archive.org/web/...",
  "region": "JAPAN",
  "medium": "FORUM_BBS",
  "status": "DRAFT",
  "annotations": [
    {
      "order": 1,
      "text": {
        "ja": "※1: 2003年頃にオカルト板で広まった。",
        "en": "Note 1: Spread on the occult board around 2003."
      }
    }
  ]
}
```

### バリデーションルール

| フィールド | ルール |
|-----------|--------|
| `type` | ItemType列挙値のいずれか |
| `language` | Language列挙値のいずれか |
| `confidence` | SourceConfidence列挙値のいずれか |
| `title` | `ja` または `en` のいずれかは必須（空文字不可） |
| `body` | `ja`、`en`、`original` のいずれかは必須（空文字不可） |
| `motifs` | Motif列挙値の配列（0-10個、3個推奨） |
| `firstSeen` | FirstSeen列挙値または "YYYY-MM" 形式 |
| `sourceUrl` | 有効なURL形式 |
| `sourceArchiveUrl` | 有効なURL形式 |
| `status` | DocStatus列挙値（省略時は "DRAFT"） |
| `annotations[].order` | 正の整数（1以上） |

---

## レスポンススキーマ

### 成功レスポンス（201 Created）

```typescript
interface CreateItemResponse {
  success: true;
  data: {
    /** 生成されたドキュメントID */
    id: string;
    /** 作成日時（ISO 8601形式） */
    createdAt: string;
    /** 公開状態 */
    status: DocStatus;
  };
}
```

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": "DTA-000128",
    "createdAt": "2025-01-22T10:30:00.000Z",
    "status": "DRAFT"
  }
}
```

### エラーレスポンス

```typescript
interface ErrorResponse {
  success: false;
  error: {
    /** エラーコード */
    code: string;
    /** エラーメッセージ */
    message: string;
    /** フィールドエラー詳細（バリデーションエラー時） */
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

**バリデーションエラー例（400）:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "type",
        "message": "Invalid enum value. Expected 'KAIDAN' | 'URBAN_LEGEND' | 'CREEPYPASTA' | 'CHAIN_MEME' | 'ORIGINAL' | 'COMMENTARY'"
      },
      {
        "field": "title",
        "message": "At least one of 'ja' or 'en' is required"
      }
    ]
  }
}
```

**認証エラー例（401）:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

---

## エラーコード一覧

| HTTPステータス | エラーコード | 説明 |
|---------------|-------------|------|
| 400 | `VALIDATION_ERROR` | リクエストボディのバリデーション失敗 |
| 400 | `INVALID_JSON` | JSONパースエラー |
| 401 | `UNAUTHORIZED` | APIキーが無効または未指定 |
| 403 | `FORBIDDEN` | アクセス権限がない |
| 405 | `METHOD_NOT_ALLOWED` | 許可されていないHTTPメソッド |
| 409 | `CONFLICT` | リソースの競合（重複ID等） |
| 413 | `PAYLOAD_TOO_LARGE` | リクエストボディが大きすぎる |
| 429 | `RATE_LIMIT_EXCEEDED` | レートリミット超過 |
| 500 | `INTERNAL_ERROR` | サーバー内部エラー |
| 503 | `SERVICE_UNAVAILABLE` | サービス一時停止中 |

---

## レートリミット仕様

### 制限値

| 制限種別 | 値 | 単位 |
|---------|-----|------|
| リクエスト数上限 | 60 | リクエスト/分 |
| ペイロードサイズ上限 | 1 MB | リクエストあたり |
| 同時接続数上限 | 10 | 接続/APIキー |

### レスポンスヘッダー

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1705920000
```

| ヘッダー | 説明 |
|---------|------|
| `X-RateLimit-Limit` | 時間枠あたりの最大リクエスト数 |
| `X-RateLimit-Remaining` | 残りリクエスト数 |
| `X-RateLimit-Reset` | リセット時刻（Unix timestamp） |

### 超過時レスポンス（429）

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 60 seconds."
  }
}
```

```
Retry-After: 60
```

---

## セキュリティ考慮事項

### 1. APIキー管理

- **キー長**: 最低32バイト（256ビット）以上
- **保管**: 環境変数として保存、コードにハードコードしない
- **ローテーション**: 定期的なキー更新を推奨（90日ごと）
- **漏洩対応**: 漏洩検知時は即座に無効化・再発行

### 2. 入力検証

- すべての入力フィールドに対してサニタイズを実施
- 許可されたEnum値のみを受け入れる（ホワイトリスト方式）
- URL形式のフィールドはスキーム（http/https）を検証
- XSS対策として本文・タイトルのHTMLエスケープを実施

### 3. 通信セキュリティ

- HTTPS必須（HTTP接続は拒否）
- TLS 1.2以上を要求
- CORS設定により許可されたオリジンのみアクセス可能

### 4. ログ・監査

- 全APIリクエストをログに記録（タイムスタンプ、IPアドレス、エンドポイント）
- APIキーの最後4文字のみをログに含める（全体は記録しない）
- 認証失敗は詳細にログを記録（不正アクセス検知用）

### 5. ペイロード制限

- `body.original` の最大文字数: 100,000文字
- `body.ja` / `body.en` の最大文字数: 100,000文字
- `title` の最大文字数: 500文字
- `motifs` 配列の最大要素数: 10
- `annotations` 配列の最大要素数: 50

---

## 実装メモ

### ID生成ロジック

```typescript
/**
 * 新しいDTA形式のIDを生成
 * 形式: DTA-XXXXXX（6桁ゼロパディング）
 */
async function generateItemId(): Promise<string> {
  // 最新のIDを取得し、インクリメント
  // または、カウンターコレクションを使用
  const counter = await getNextCounter('items');
  return `DTA-${counter.toString().padStart(6, '0')}`;
}
```

### searchTokens生成

投稿時に以下のフィールドから `searchTokens` を自動生成:
- `id`
- `title.ja` / `title.en`
- `originalTitle`
- `sourceName`
- `motifs`

詳細は [06-search.md](./06-search.md) を参照。

### Firestoreトランザクション

```typescript
await runTransaction(db, async (transaction) => {
  // 1. ID生成
  const newId = await generateItemId();

  // 2. searchTokens生成
  const searchTokens = generateSearchTokens(requestBody);

  // 3. メインドキュメント作成
  const itemRef = doc(db, 'items', newId);
  transaction.set(itemRef, {
    ...requestBody,
    id: newId,
    searchTokens,
    annotationCount: annotations?.length ?? 0,
    revisionCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 4. 注釈サブコレクション作成
  for (const annotation of annotations ?? []) {
    const annotationRef = doc(collection(itemRef, 'annotations'));
    transaction.set(annotationRef, annotation);
  }

  // 5. 初期リビジョン作成
  const revisionRef = doc(collection(itemRef, 'revisions'));
  transaction.set(revisionRef, {
    at: serverTimestamp(),
    summary: { ja: '初版作成', en: 'Initial creation' },
  });
});
```

### 推奨ディレクトリ構成

```
src/
  app/
    api/
      v1/
        items/
          route.ts              # POST /api/v1/items
  lib/
    api/
      auth.ts                   # APIキー認証
      validation.ts             # リクエストバリデーション
      rateLimit.ts              # レートリミット
      errors.ts                 # エラーハンドリング
    catalog/
      idGenerator.ts            # ID生成ロジック
      searchTokens.ts           # 検索トークン生成
```

---

## 将来の拡張

### v1.1予定

- `PUT /api/v1/items/{id}` - 資料更新
- `DELETE /api/v1/items/{id}` - 資料削除
- `GET /api/v1/items/{id}` - 資料取得（管理者向け、下書き含む）

### v2予定

- バッチ投稿（複数資料の一括作成）
- WebHook通知（投稿完了時）
- Firebase Admin SDK認証オプション
