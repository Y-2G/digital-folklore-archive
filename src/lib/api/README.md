# API Error Handling Module

統一されたエラーハンドリングとレスポンス形式を提供するモジュール。

## 特徴

- **統一されたレスポンス形式**: すべてのAPIエンドポイントで一貫した構造
- **セキュリティ重視**: 本番環境でスタックトレースや内部エラー詳細を隠蔽
- **TypeScript完全対応**: 型安全なエラーハンドリング
- **便利なヘルパー関数**: 一般的なエラーケースに対応

## 基本的な使い方

### API Route Handler

```typescript
import { NextRequest } from 'next/server';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  ApiErrorCode,
  withErrorHandling,
} from '@/lib/api/errors';

// 基本的な使用例
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // バリデーションエラー
  if (!id || !id.startsWith('DTA-')) {
    return createValidationError('Invalid item ID', {
      id: 'Must match format DTA-XXXXXX',
    });
  }

  // データ取得
  const item = await getItem(id);

  // 404エラー
  if (!item) {
    return createNotFoundError('Item');
  }

  // 成功レスポンス
  return createSuccessResponse(item, 200);
}

// エラーハンドリングラッパーを使用
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // バリデーション
  if (!body.title) {
    return createValidationError('Missing required field', {
      title: 'Required',
    });
  }

  // データ作成
  const newItem = await createItem(body);

  // 201 Created
  return createSuccessResponse(newItem, 201);
});
```

### Server Actions

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import {
  createSuccessResponse,
  createAuthError,
  createForbiddenError,
  ApiErrorCode,
  type ApiResponse,
} from '@/lib/api/errors';
import type { ItemDoc } from '@/types/firestore';

export async function updateItem(
  id: string,
  data: Partial<ItemDoc>
): Promise<ApiResponse<ItemDoc>> {
  // 認証チェック
  const session = await getServerSession();
  if (!session) {
    return (await createAuthError()).json();
  }

  // 権限チェック
  const hasPermission = await checkPermission(session.user.id, id);
  if (!hasPermission) {
    return (await createForbiddenError()).json();
  }

  // 更新処理
  const updated = await updateItemInFirestore(id, data);

  // キャッシュ無効化
  revalidatePath(`/items/${id}`);

  return (await createSuccessResponse(updated)).json();
}
```

## エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| `UNAUTHORIZED` | 401 | 認証が必要 |
| `FORBIDDEN` | 403 | アクセス権限なし |
| `VALIDATION_ERROR` | 400 | バリデーションエラー |
| `RATE_LIMITED` | 429 | レート制限超過 |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `INTERNAL_ERROR` | 500 | 内部サーバーエラー |

## ヘルパー関数

### エラーレスポンス作成

```typescript
// 汎用エラーレスポンス
createErrorResponse(
  code: ApiErrorCodeType,
  message?: string,
  details?: unknown,
  status?: number
): NextResponse<ApiErrorResponse>

// バリデーションエラー
createValidationError(
  message: string,
  fieldErrors?: Record<string, string>
): NextResponse<ApiErrorResponse>

// 認証エラー (401)
createAuthError(message?: string): NextResponse<ApiErrorResponse>

// 権限エラー (403)
createForbiddenError(message?: string): NextResponse<ApiErrorResponse>

// Not Found エラー (404)
createNotFoundError(resource?: string): NextResponse<ApiErrorResponse>

// レート制限エラー (429)
createRateLimitError(retryAfter?: number): NextResponse<ApiErrorResponse>
```

### 成功レスポンス作成

```typescript
createSuccessResponse<T>(
  data: T,
  status = 200
): NextResponse<ApiSuccessResponse<T>>
```

### エラーハンドリングラッパー

```typescript
withErrorHandling<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<NextResponse>
): (...args: TArgs) => Promise<NextResponse>
```

## レスポンス型定義

### エラーレスポンス

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCodeType;
    message: string;
    details?: unknown; // 本番環境では省略される場合あり
  };
}
```

### 成功レスポンス

```typescript
interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}
```

## 型ガード

```typescript
// エラーレスポンスかチェック
if (isErrorResponse(response)) {
  console.error(response.error.message);
}

// 成功レスポンスかチェック
if (isSuccessResponse(response)) {
  console.log(response.data);
}
```

## クライアント側での使用

```typescript
async function fetchItem(id: string) {
  const response = await fetch(`/api/items/${id}`);
  const json = await response.json();

  if (!json.success) {
    // エラーハンドリング
    throw new Error(json.error.message);
  }

  // データにアクセス
  return json.data;
}
```

## セキュリティ考慮事項

### 本番環境での動作

1. **内部エラー詳細の隠蔽**: `INTERNAL_ERROR` の詳細は本番環境では露出されません
2. **スタックトレース削除**: エラーオブジェクトから `stack` と `stackTrace` プロパティを削除
3. **汎用的なエラーメッセージ**: 開発環境のみで詳細なエラー情報を提供

### 推奨事項

- ユーザー入力のバリデーションは必ず実施
- 認証/認可エラーは適切なコードを使用
- データベースエラーは `INTERNAL_ERROR` でラップ
- レート制限は `Retry-After` ヘッダーを含める

## 実装例: フルスタック

### API Route (`/app/api/items/[id]/route.ts`)

```typescript
import { NextRequest } from 'next/server';
import {
  createSuccessResponse,
  createNotFoundError,
  createValidationError,
  withErrorHandling,
} from '@/lib/api/errors';
import { getItemById } from '@/lib/firebase/firestore';

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // ID形式チェック
  if (!/^DTA-\d{6}$/.test(id)) {
    return createValidationError('Invalid item ID format', {
      id: 'Must match format DTA-XXXXXX',
    });
  }

  // データ取得
  const item = await getItemById(id);

  if (!item) {
    return createNotFoundError('Item');
  }

  return createSuccessResponse(item);
});
```

### Server Action (`/app/actions/items.ts`)

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createSuccessResponse, createAuthError } from '@/lib/api/errors';
import type { ApiResponse, ItemDoc } from '@/types';

export async function deleteItem(id: string): Promise<ApiResponse<void>> {
  const session = await auth();

  if (!session?.user) {
    return (await createAuthError()).json();
  }

  await deleteItemFromFirestore(id);
  revalidatePath('/catalog');

  return (await createSuccessResponse(undefined, 204)).json();
}
```

### Client Component

```typescript
'use client';

import { useState } from 'react';
import { deleteItem } from '@/app/actions/items';

export function DeleteButton({ itemId }: { itemId: string }) {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const result = await deleteItem(itemId);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    // 成功処理
    router.push('/catalog');
  };

  return (
    <>
      <button onClick={handleDelete}>削除</button>
      {error && <div className="error">{error}</div>}
    </>
  );
}
```

## テスト

```bash
# ユニットテストを実行
npm test src/lib/api/__tests__/errors.test.ts
```

## 関連ドキュメント

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Firebase エラーハンドリング](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
