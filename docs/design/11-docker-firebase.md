# Docker による Firebase 開発環境

## 概要

Firebase Emulator Suite を Docker コンテナで管理し、開発環境の一貫性と再現性を確保する。

## 目的

| 課題 | Docker による解決 |
|------|-------------------|
| 開発者ごとに環境が異なる | コンテナで統一 |
| Java / Firebase CLI のインストールが必要 | コンテナ内に封じ込め |
| CI/CD で同じ環境を使いたい | 同一イメージを使用可能 |
| エミュレータデータの共有・リセット | ボリュームで管理 |

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│  Host Machine                                               │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │  Next.js App    │    │  Docker Container               │ │
│  │  (yarn dev)     │    │  ┌───────────────────────────┐  │ │
│  │                 │◄──►│  │  Firebase Emulator Suite  │  │ │
│  │  localhost:3000 │    │  │  ├─ Firestore  :8080      │  │ │
│  └─────────────────┘    │  │  ├─ Auth       :9099      │  │ │
│                         │  │  ├─ Storage    :9199      │  │ │
│         ▲               │  │  └─ UI         :4000      │  │ │
│         │               │  └───────────────────────────┘  │ │
│         │               │              ▲                  │ │
│  ┌──────┴──────┐        │              │                  │ │
│  │  Browser    │────────┼──────────────┘                  │ │
│  │  Emulator UI│        │  Volume: ./firebase-data        │ │
│  └─────────────┘        └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## ファイル構成

```
project-root/
├── docker/
│   └── firebase/
│       └── Dockerfile
├── docker-compose.yml
├── firebase.json              # 既存（更新）
├── firestore.rules            # 既存
├── firestore.indexes.json     # 既存
├── .firebaserc                # 新規
└── firebase-data/             # エミュレータデータ（gitignore）
    ├── firestore-export/
    └── auth-export/
```

## 設計詳細

### 1. Dockerfile

```dockerfile
# docker/firebase/Dockerfile
FROM node:20-slim

# Java (Firestore Emulator に必要)
RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jre-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Firebase CLI
RUN npm install -g firebase-tools

WORKDIR /app

# 設定ファイルをコピー
COPY firebase.json firestore.rules firestore.indexes.json ./
COPY .firebaserc ./

# データ永続化用ディレクトリ
RUN mkdir -p /app/data

# ポート公開
EXPOSE 4000 8080 9099 9199

# エントリポイント
CMD ["firebase", "emulators:start", "--import=/app/data", "--export-on-exit=/app/data"]
```

### 2. docker-compose.yml

```yaml
# docker-compose.yml
services:
  firebase:
    build:
      context: .
      dockerfile: docker/firebase/Dockerfile
    ports:
      - "4000:4000"   # Emulator UI
      - "8080:8080"   # Firestore
      - "9099:9099"   # Authentication
      - "9199:9199"   # Storage
    volumes:
      # 設定ファイルの同期（ルール変更を即時反映）
      - ./firestore.rules:/app/firestore.rules:ro
      - ./firestore.indexes.json:/app/firestore.indexes.json:ro
      # データ永続化
      - ./firebase-data:/app/data
    environment:
      - FIREBASE_PROJECT_ID=demo-dta
      - FIRESTORE_EMULATOR_HOST=0.0.0.0:8080
      - FIREBASE_AUTH_EMULATOR_HOST=0.0.0.0:9099
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### 3. firebase.json（更新）

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "firestore": {
      "host": "0.0.0.0",
      "port": 8080
    },
    "auth": {
      "host": "0.0.0.0",
      "port": 9099
    },
    "storage": {
      "host": "0.0.0.0",
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "host": "0.0.0.0",
      "port": 4000
    },
    "singleProjectMode": true
  }
}
```

### 4. .firebaserc

```json
{
  "projects": {
    "default": "demo-dta"
  }
}
```

### 5. 環境変数（.env.local 更新）

```bash
# Firebase Emulator 接続設定
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
NEXT_PUBLIC_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_STORAGE_EMULATOR_HOST=localhost:9199

# 本番環境用（エミュレータ使用時は不要）
# NEXT_PUBLIC_FIREBASE_API_KEY=xxx
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
```

## 使用方法

### 基本コマンド

```bash
# エミュレータ起動
docker compose up -d

# ログ確認
docker compose logs -f firebase

# 停止（データは保持）
docker compose down

# 停止 + データ削除
docker compose down -v
rm -rf firebase-data/
```

### package.json スクリプト（追加）

```json
{
  "scripts": {
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:logs": "docker compose logs -f firebase",
    "docker:reset": "docker compose down && rm -rf firebase-data && docker compose up -d"
  }
}
```

## Next.js アプリからの接続

### lib/firebase/client.ts（更新例）

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-dta.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-dta',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-dta.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// エミュレータ接続
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { app, db, auth, storage };
```

## データ管理

### シードデータの投入

```bash
# エミュレータ起動後
yarn db:seed
```

### データのエクスポート/インポート

```bash
# 手動エクスポート
docker compose exec firebase firebase emulators:export /app/data --force

# コンテナ再起動時は自動でインポートされる
```

### データのリセット

```bash
# 完全リセット
yarn docker:reset
```

## CI/CD との統合

### GitHub Actions 例

```yaml
# .github/workflows/test.yml
name: Test with Firebase Emulator

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      firebase:
        image: ghcr.io/${{ github.repository }}/firebase-emulator:latest
        ports:
          - 4000:4000
          - 8080:8080
          - 9099:9099
          - 9199:9199
        options: >-
          --health-cmd "curl -f http://localhost:4000"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: yarn install
      - run: yarn test
        env:
          NEXT_PUBLIC_USE_FIREBASE_EMULATOR: 'true'
          NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: localhost:8080
```

## .gitignore への追加

```gitignore
# Firebase Emulator data
firebase-data/
```

## 注意事項

1. **ホスト設定**: Docker 内から外部に公開するため `0.0.0.0` にバインド
2. **プロジェクトID**: エミュレータでは `demo-` プレフィックスで本番と分離
3. **データ永続化**: `--import` / `--export-on-exit` で停止時もデータ保持
4. **セキュリティルール**: ボリュームマウントで変更即時反映（再起動不要）

## 今後の拡張

- [ ] Cloud Functions エミュレータの追加
- [ ] Pub/Sub エミュレータの追加
- [ ] Firebase Hosting エミュレータの追加
