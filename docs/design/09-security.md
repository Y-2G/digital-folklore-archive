# Firestore セキュリティルール・インデックス

## セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    match /items/{id} {
      allow read: if resource.data.status == "PUBLISHED";
      allow create, update, delete: if isAdmin();

      match /revisions/{revId} {
        allow read: if get(/databases/$(database)/documents/items/$(id)).data.status == "PUBLISHED";
        allow write: if isAdmin();
      }

      match /annotations/{noteId} {
        allow read: if get(/databases/$(database)/documents/items/$(id)).data.status == "PUBLISHED";
        allow write: if isAdmin();
      }
    }

    match /collections/{slug} {
      allow read: if resource.data.status == "PUBLISHED";
      allow write: if isAdmin();
    }
  }
}
```

## ポイント

- **読み取り**: `status == "PUBLISHED"` の資料のみ公開
- **書き込み**: 管理者（`admin` カスタムクレーム）のみ許可
- **サブコレクション**: 親ドキュメントの status を参照

---

## インデックス

Firestore の案内リンクに従って作成するのが確実。典型例:

| フィールド | 条件 |
|-----------|------|
| `status`, `updatedAt` | `status == PUBLISHED` + `orderBy(updatedAt desc)` |
| `status`, `type`, `updatedAt` | Type絞り込み + 更新順 |
| `status`, `language`, `updatedAt` | Language絞り込み + 更新順 |
| `status`, `confidence`, `updatedAt` | Confidence絞り込み + 更新順 |
| `status`, `motifs`, `updatedAt` | Motif絞り込み（array-contains） + 更新順 |
| `status`, `searchTokens`, `updatedAt` | 検索 + 更新順 |
