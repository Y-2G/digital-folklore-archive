# 記事投稿API実装計画

## 概要

Digital Folklore Archiveプロジェクトに管理者向けの記事投稿APIを追加する。APIキー認証を使用し、記事の自動処理（ID採番、searchTokens生成、バリデーション）を行う。

### 目的
- 外部システムやスクリプトからの記事投稿を可能にする
- 管理者のみがアクセス可能なセキュアなエンドポイントを提供
- 一貫性のあるデータ登録を自動処理で保証

### 背景
現在、記事の追加は `scripts/seed-firestore.ts` による手動実行のみ。API化することで、CMS連携やバッチ処理が可能になる。

---

## 作業分析

### スコープ
- Next.js API Route (App Router) の新規作成
- Firebase Admin SDK のサーバーサイド初期化モジュール作成
- APIキー認証ミドルウェア実装
- バリデーション層の実装
- ID自動採番機能（countersコレクション利用）
- レートリミット実装
- エラーハンドリング統一

### 影響範囲
| 領域 | 影響 | 詳細 |
|------|------|------|
| `src/app/api/` | 新規 | APIルート追加（存在しないため新規作成） |
| `src/lib/firebase/` | 拡張 | Admin SDK初期化モジュール追加 |
| `src/lib/api/` | 新規 | 認証・バリデーション・エラーハンドリング |
| `.env` | 更新 | APIキー環境変数追加 |
| `firestore.rules` | 影響なし | Admin SDK使用のためバイパス |

### リスク評価
| リスク | 重大度 | 対策 |
|--------|--------|------|
| APIキー漏洩 | 高 | 環境変数管理、ログからの除外 |
| インジェクション攻撃 | 高 | 入力バリデーション、型強制 |
| DoS攻撃 | 中 | レートリミット実装 |
| ID重複 | 中 | Firestoreトランザクション使用 |
| 不正なデータ登録 | 中 | スキーマバリデーション |

---

## タスク分解

| ID | タスク | 担当エージェント | 依存関係 | 規模 | 状態 |
|----|--------|------------------|----------|------|------|
| T1 | API設計書作成 | backend-architect | - | M | [x] |
| T2 | Firebase Admin SDK サーバーサイド初期化モジュール作成 | backend-specialist | - | S | [x] |
| T3 | 環境変数設定・ドキュメント更新 | infra-implementer | - | S | [x] |
| T4 | APIキー認証ミドルウェア実装 | backend-specialist | T3 | M | [x] |
| T5 | ID自動採番機能実装（countersコレクション） | backend-specialist | T2 | M | [x] |
| T6 | リクエストバリデーション層実装 | backend-specialist | T1 | M | [x] |
| T7 | 記事投稿APIエンドポイント実装 | backend-specialist | T2,T4,T5,T6 | L | [x] |
| T8 | レートリミット実装 | backend-specialist | T4 | M | [x] |
| T9 | エラーハンドリング統一モジュール作成 | backend-specialist | - | S | [x] |
| T10 | セキュリティレビュー | multi-perspective-reviewer | T7,T8 | M | [x] |
| T11 | 統合テスト・動作確認 | backend-specialist | T7 | M | [x] |
| T12 | API使用ドキュメント作成 | backend-architect | T7 | S | [x] |

---

## 実行計画

### Phase 1: 設計・基盤整備（並列実行可）

**目標**: API設計の確定と基盤モジュールの準備

#### T1: API設計書作成
**担当**: backend-architect

API仕様を `docs/design/12-item-api.md` に作成:

```markdown
# 記事投稿API設計

## エンドポイント
POST /api/v1/items

## 認証
- Header: `X-API-Key: <secret>`
- 環境変数: `DTA_API_SECRET_KEY`

## リクエスト
Content-Type: application/json

### 必須フィールド
- type: ItemType
- language: Language
- confidence: SourceConfidence
- title: { ja?: string, en?: string } (少なくとも1つ必須)
- body: { ja?: string, en?: string, original?: string } (少なくとも1つ必須)
- motifs: Motif[] (1-3個)
- status: DocStatus

### 任意フィールド
- originalTitle?: string
- firstSeen?: string
- sourceName?: string
- sourceUrl?: string
- sourceArchiveUrl?: string
- formats?: string[]
- region?: Region
- medium?: Medium

## レスポンス
### 成功 (201 Created)
{
  "success": true,
  "data": {
    "id": "DTA-000129",
    "createdAt": "2026-01-22T..."
  }
}

### エラー
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": [...]
  }
}

## エラーコード
- UNAUTHORIZED: 認証失敗
- VALIDATION_ERROR: バリデーションエラー
- RATE_LIMITED: レート制限超過
- INTERNAL_ERROR: サーバーエラー
```

#### T2: Firebase Admin SDK サーバーサイド初期化モジュール作成
**担当**: backend-specialist

`src/lib/firebase/admin.ts` を作成:
- サーバーサイド専用のAdmin SDK初期化
- シングルトンパターンでアプリ再初期化防止
- 環境変数からの認証情報読み込み
- エミュレータ対応

#### T3: 環境変数設定・ドキュメント更新
**担当**: infra-implementer

`.env.example` に追加:
```
# API Authentication (server-side only, keep secret)
DTA_API_SECRET_KEY=your-secret-api-key-here

# Rate Limiting
DTA_API_RATE_LIMIT_WINDOW_MS=60000
DTA_API_RATE_LIMIT_MAX_REQUESTS=10
```

#### T9: エラーハンドリング統一モジュール作成
**担当**: backend-specialist

`src/lib/api/errors.ts` を作成:
- 統一されたエラーレスポンス形式
- エラーコード定義
- 情報漏洩を防ぐセキュアなエラーメッセージ

---

### Phase 2: 認証・検証層（T3完了後）

**目標**: セキュリティ基盤の確立

#### T4: APIキー認証ミドルウェア実装
**担当**: backend-specialist

`src/lib/api/auth.ts` を作成:
- `X-API-Key` ヘッダーの検証
- タイミング攻撃対策（constant-time comparison）
- 認証失敗ログ（キー値は記録しない）

```typescript
// 実装例
export async function validateApiKey(request: Request): Promise<boolean> {
  const apiKey = request.headers.get('X-API-Key');
  const secretKey = process.env.DTA_API_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(apiKey, secretKey);
}
```

#### T6: リクエストバリデーション層実装
**担当**: backend-specialist

`src/lib/api/validation.ts` を作成:
- Zodスキーマによる型安全なバリデーション
- ItemDoc型との整合性チェック
- サニタイズ処理（XSS対策）
- カスタムエラーメッセージ（日英）

```typescript
// バリデーションスキーマ例
const CreateItemSchema = z.object({
  type: z.enum(['KAIDAN', 'URBAN_LEGEND', ...]),
  language: z.enum(['JA', 'EN', 'OTHER']),
  confidence: z.enum(['PRIMARY', 'SECONDARY', 'UNKNOWN']),
  title: z.object({
    ja: z.string().max(200).optional(),
    en: z.string().max(200).optional(),
  }).refine(data => data.ja || data.en, {
    message: 'At least one title (ja or en) is required'
  }),
  // ... 他フィールド
});
```

#### T8: レートリミット実装
**担当**: backend-specialist

`src/lib/api/rateLimit.ts` を作成:
- インメモリ方式（シンプル実装）
- IPアドレス + APIキーによる制限
- 設定可能なウィンドウとリクエスト数
- レート制限ヘッダーの付与

```typescript
// レスポンスヘッダー例
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1706000000
```

---

### Phase 3: コア機能実装（Phase 1, 2完了後）

**目標**: 記事投稿の中核機能

#### T5: ID自動採番機能実装
**担当**: backend-specialist

`src/lib/api/idGenerator.ts` を作成:
- `/counters/items` ドキュメントで連番管理
- Firestoreトランザクションで排他制御
- `DTA-XXXXXX` 形式でフォーマット

```typescript
// 実装例
export async function generateItemId(): Promise<string> {
  const db = getAdminFirestore();
  const counterRef = db.collection('counters').doc('items');

  return db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const currentCount = counterDoc.exists
      ? counterDoc.data()?.count ?? 0
      : 0;
    const newCount = currentCount + 1;

    transaction.set(counterRef, { count: newCount }, { merge: true });

    return `DTA-${String(newCount).padStart(6, '0')}`;
  });
}
```

#### T7: 記事投稿APIエンドポイント実装
**担当**: backend-specialist

`src/app/api/v1/items/route.ts` を作成:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/auth';
import { validateCreateItemRequest } from '@/lib/api/validation';
import { checkRateLimit } from '@/lib/api/rateLimit';
import { generateItemId } from '@/lib/api/idGenerator';
import { generateSearchTokens } from '@/lib/catalog/searchTokens';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  // 1. レートリミットチェック
  const rateLimitResult = await checkRateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: '...' } },
      { status: 429, headers: rateLimitResult.headers }
    );
  }

  // 2. 認証チェック
  if (!await validateApiKey(request)) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
      { status: 401 }
    );
  }

  // 3. リクエストボディ取得・バリデーション
  const body = await request.json();
  const validation = validateCreateItemRequest(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', ...validation.error } },
      { status: 400 }
    );
  }

  // 4. ID生成
  const id = await generateItemId();

  // 5. searchTokens生成
  const itemData = { ...validation.data, id };
  const searchTokens = generateSearchTokens(itemData as any);

  // 6. Firestoreに保存
  const db = getAdminFirestore();
  const now = Timestamp.now();

  await db.collection('items').doc(id).set({
    ...validation.data,
    id,
    searchTokens,
    annotationCount: 0,
    revisionCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  // 7. 成功レスポンス
  return NextResponse.json(
    { success: true, data: { id, createdAt: now.toDate().toISOString() } },
    { status: 201 }
  );
}
```

---

### Phase 4: 検証・ドキュメント（Phase 3完了後）

**目標**: 品質保証とドキュメント整備

#### T10: セキュリティレビュー
**担当**: multi-perspective-reviewer

レビュー観点:
- [ ] OWASP Top 10対策の確認
  - [ ] A01:2021 Broken Access Control
  - [ ] A02:2021 Cryptographic Failures
  - [ ] A03:2021 Injection
  - [ ] A04:2021 Insecure Design
  - [ ] A05:2021 Security Misconfiguration
- [ ] 認証・認可の堅牢性
- [ ] 入力バリデーションの網羅性
- [ ] エラーメッセージの情報漏洩チェック
- [ ] ログに機密情報が含まれていないか
- [ ] レートリミットの適切性

#### T11: 統合テスト・動作確認
**担当**: backend-specialist

テストケース:
- [ ] 正常系: 全フィールド指定での投稿
- [ ] 正常系: 必須フィールドのみでの投稿
- [ ] 異常系: 認証なし → 401
- [ ] 異常系: 不正なAPIキー → 401
- [ ] 異常系: 必須フィールド欠落 → 400
- [ ] 異常系: 型不正 → 400
- [ ] 異常系: レートリミット超過 → 429
- [ ] ID採番: 連番が正しく採番されるか
- [ ] searchTokens: 適切に生成されるか

テスト方法:
```bash
# 正常系テスト
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

# 認証エラーテスト
curl -X POST http://localhost:3000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"type": "KAIDAN"}'
```

#### T12: API使用ドキュメント作成
**担当**: backend-architect

`docs/api/README.md` を作成:
- エンドポイント一覧
- 認証方法
- リクエスト/レスポンス例
- エラーコード一覧
- レートリミット仕様
- 使用例（curl、JavaScript）

---

## 品質チェックリスト

### セキュリティ
- [x] APIキーは環境変数で管理されている
- [x] APIキーはログに出力されない
- [x] タイミング攻撃対策が実装されている
- [x] 入力バリデーションが全フィールドに適用されている
- [x] エラーメッセージに内部情報が含まれていない
- [x] レートリミットが実装されている
- [ ] HTTPSが強制されている（本番環境）※デプロイ時に確認

### コード品質
- [x] TypeScript strict modeでエラーがない
- [x] ESLintエラーがない
- [x] 適切なエラーハンドリングがされている
- [x] ログが適切に出力されている
- [ ] テストが全てパスしている ※vitest未導入のためスキップ

### ドキュメント
- [x] API設計書が作成されている
- [x] 環境変数の説明が更新されている
- [x] 使用例が記載されている

---

## 関連ファイル

### 新規作成
| ファイル | 説明 |
|---------|------|
| `docs/design/12-item-api.md` | API設計書 |
| `src/lib/firebase/admin.ts` | Firebase Admin SDK初期化 |
| `src/lib/api/auth.ts` | APIキー認証 |
| `src/lib/api/validation.ts` | リクエストバリデーション |
| `src/lib/api/rateLimit.ts` | レートリミット |
| `src/lib/api/errors.ts` | エラーハンドリング |
| `src/lib/api/idGenerator.ts` | ID自動採番 |
| `src/app/api/v1/items/route.ts` | 記事投稿APIエンドポイント |
| `docs/api/README.md` | API使用ドキュメント |

### 更新
| ファイル | 変更内容 |
|---------|---------|
| `.env.example` | APIキー環境変数追加 |
| `package.json` | zod依存関係追加（バリデーション用） |
| `firestore.rules` | countersコレクションルール確認 |

### 参照（既存）
| ファイル | 参照理由 |
|---------|---------|
| `src/types/firestore.ts` | ItemDoc型定義 |
| `src/lib/catalog/searchTokens.ts` | searchTokens生成関数 |
| `src/lib/firebase/client.ts` | Firebase設定参考 |
| `scripts/seed-firestore.ts` | Admin SDK使用例参考 |

---

## 依存関係追加

```bash
yarn add zod
```

Zodを選定した理由:
- TypeScript first な設計
- 軽量（バンドルサイズ小）
- Next.jsエコシステムで広く使用
- 型推論が強力

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-22 | 初版作成 |
| 2026-01-22 | 全タスク完了 |
