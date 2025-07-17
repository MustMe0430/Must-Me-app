# Firebase Setup Guide / Firebase セットアップガイド

This is a comprehensive guide for setting up Firebase for the MustMe application, including both development (emulator) and production environments.

これは、開発環境（エミュレーター）と本番環境の両方を含む、MustMe アプリケーション用の Firebase セットアップの包括的なガイドです。

## Table of Contents / 目次

1. [Prerequisites / 前提条件](#prerequisites--前提条件)
2. [Firebase Emulator Setup / Firebase エミュレーターのセットアップ](#firebase-emulator-setup--firebase-エミュレーターのセットアップ)
3. [Environment Configuration / 環境設定](#environment-configuration--環境設定)
4. [Quick Start Guide / クイックスタートガイド](#quick-start-guide--クイックスタートガイド)
5. [Production Setup / 本番環境のセットアップ](#production-setup--本番環境のセットアップ)
6. [Testing Guide / テストガイド](#testing-guide--テストガイド)
7. [Development Workflow / 開発ワークフロー](#development-workflow--開発ワークフロー)
8. [Security Rules / セキュリティルール](#security-rules--セキュリティルール)
9. [CLI Commands Reference / CLI コマンドリファレンス](#cli-commands-reference--cli-コマンドリファレンス)
10. [Troubleshooting / トラブルシューティング](#troubleshooting--トラブルシューティング)
11. [FAQ](#faq)

## Prerequisites / 前提条件

### Required Software / 必要なソフトウェア

- **Node.js** (v18 or later) / (v18 以上)
- **npm** or **pnpm** or **yarn**
- **Java** (for Firebase Emulator) / (Firebase エミュレーター用)

### Installation / インストール

# Check Node.js version / Node.js バージョンを確認
node --version

# Install Firebase CLI globally / Firebase CLI をグローバルにインストール
npm install -g firebase-tools

# Verify Firebase CLI installation / Firebase CLI インストールを確認
firebase --version
## Firebase Emulator Setup / Firebase エミュレーターのセットアップ

### Step 1: Initialize Firebase Project / ステップ 1: Firebase プロジェクトの初期化

# Navigate to your project directory / プロジェクトディレクトリに移動
cd your-mustme-project

# Login to Firebase / Firebase にログイン
firebase login

# Initialize Firebase in your project / プロジェクトで Firebase を初期化
firebase init
### Step 2: Firebase Init Configuration / ステップ 2: Firebase 初期化設定

When running `firebase init`, select:
`firebase init` を実行する際は以下を選択：

? Which Firebase CLI features do you want to set up for this folder?
 ◉ Firestore: Configure security rules and indexes files for Firestore
 ◉ Functions: Configure a Cloud Functions directory and files
 ◉ Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys
 ◉ Storage: Configure a security rules file for Cloud Storage
 ◉ Emulators: Set up local emulators for Firebase products

? Please select an option:
❯ Use an existing project (recommended for emulator setup)
  Create a new project
  Add Firebase to an existing Google Cloud Platform project

? Which Firebase emulators do you want to set up?
 ◉ Authentication Emulator
 ◉ Functions Emulator  
 ◉ Firestore Emulator
 ◉ Storage Emulator
 ◉ Hosting Emulator
### Step 3: Configure firebase.json / ステップ 3: firebase.json の設定

Create or update `firebase.json`:
`firebase.json` を作成または更新：

{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8088
    },
    "storage": {
      "port": 9199
    },
    "hosting": {
      "port": 5001
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
### Step 4: Security Rules Files / ステップ 4: セキュリティルールファイル

Create `firestore.rules`:
`firestore.rules` を作成：

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to profiles for display purposes
    match /profiles/{profileId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == profileId;
    }
    
    // Posts - users can read all, write their own
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.authorId;
    }
  }
}
Create `storage.rules`:
`storage.rules` を作成：

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own directory
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public profile images
    match /profiles/{userId}/avatar.{ext} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
## Environment Configuration / 環境設定

### Step 1: Environment Files / ステップ 1: 環境ファイル

Create `.env.local` for development:
開発用の `.env.local` を作成：

# Firebase Configuration for Development (Emulator)
# 開発用 Firebase 設定（エミュレーター）
NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Emulator Configuration / エミュレーター設定
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=localhost

# Emulator Ports / エミュレーターポート
NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT=8088
NEXT_PUBLIC_AUTH_EMULATOR_PORT=9099
NEXT_PUBLIC_STORAGE_EMULATOR_PORT=9199

# Application Settings / アプリケーション設定
NEXT_PUBLIC_APP_ENV=development
Create `.env.production` for production:
本番用の `.env.production` を作成：

# Firebase Configuration for Production
# 本番用 Firebase 設定
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Production Settings / 本番設定
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
NEXT_PUBLIC_APP_ENV=production
### Step 2: Firebase Configuration File / ステップ 2: Firebase 設定ファイル

Create `lib/firebase.ts`:
`lib/firebase.ts` を作成：

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
  
  // Connect Auth Emulator
  if (!auth._delegate._config?.emulator) {
    connectAuthEmulator(
      auth, 
      `http://${emulatorHost}:${process.env.NEXT_PUBLIC_AUTH_EMULATOR_PORT}`
    );
  }
  
  // Connect Firestore Emulator
  if (!firestore._delegate._databaseId.projectId.includes('demo-')) {
    connectFirestoreEmulator(
      firestore, 
      emulatorHost, 
      parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8088')
    );
  }
  
  // Connect Storage Emulator
  if (!storage._delegate._location.bucket.includes('demo-')) {
    connectStorageEmulator(
      storage, 
      emulatorHost, 
      parseInt(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || '9199')
    );
  }
}

export default app;
## Quick Start Guide / クイックスタートガイド

### 1. Install Dependencies / 依存関係のインストール

# Install Firebase SDK / Firebase SDK をインストール
npm install firebase

# Install development dependencies / 開発依存関係をインストール
npm install -D firebase-tools
### 2. Start Emulator / エミュレーターの起動

# Start Firebase emulators / Firebase エミュレーターを起動
npm run dev:emulator

# Or manually / または手動で
firebase emulators:start
### 3. Start Development Server / 開発サーバーの起動

# In another terminal / 別のターミナルで
npm run dev
### 4. Access Emulator UI / エミュレーター UI にアクセス

Open your browser and navigate to:
ブラウザを開いて以下にアクセス：

- **Emulator UI**: http://localhost:4000
- **Your App**: http://localhost:3000
- **Firebase Console**: https://console.firebase.google.com

## Production Setup / 本番環境のセットアップ

### Step 1: Create Firebase Project / ステップ 1: Firebase プロジェクトの作成

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" / "プロジェクトを作成" をクリック
3. Enter project name (e.g., "mustme-production")
4. Enable Google Analytics (optional) / Google Analytics を有効化（任意）
5. Choose or create Google Analytics account / Google Analytics アカウントを選択または作成

### Step 2: Enable Services / ステップ 2: サービスの有効化

# Enable Authentication / 認証を有効化
# Go to Authentication > Sign-in method in Firebase Console
# Enable Email/Password, Google, and any other providers you need

# Enable Firestore / Firestore を有効化
# Go to Firestore Database > Create database
# Start in test mode, then apply your security rules

# Enable Storage / ストレージを有効化
# Go to Storage > Get started
# Set up security rules as needed
### Step 3: Get Configuration / ステップ 3: 設定の取得

# Add web app to your Firebase project
# プロジェクトにウェブアプリを追加

# Copy the configuration object to your .env.production file
# 設定オブジェクトを .env.production ファイルにコピー
### Step 4: Deploy Security Rules / ステップ 4: セキュリティルールのデプロイ

# Deploy Firestore rules / Firestore ルールをデプロイ
firebase deploy --only firestore:rules

# Deploy Storage rules / ストレージルールをデプロイ
firebase deploy --only storage

# Deploy all / すべてをデプロイ
firebase deploy
## Testing Guide / テストガイド

### Unit Testing Authentication / 認証のユニットテスト

Create `__tests__/auth.test.ts`:
`__tests__/auth.test.ts` を作成：

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Mock users for testing / テスト用のモックユーザー
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

describe('Authentication', () => {
  beforeAll(() => {
    // Ensure emulator is running / エミュレーターが動作していることを確認
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Tests should run against emulator');
    }
  });

  test('should create user with email and password', async () => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      testUser.email,
      testUser.password
    );
    
    expect(userCredential.user).toBeDefined();
    expect(userCredential.user.email).toBe(testUser.email);
  });

  test('should sign in existing user', async () => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      testUser.email,
      testUser.password
    );
    
    expect(userCredential.user).toBeDefined();
    expect(userCredential.user.email).toBe(testUser.email);
  });
});
### Integration Testing / 統合テスト

Create `__tests__/integration.test.ts`:
`__tests__/integration.test.ts` を作成：

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../pages/login';

describe('Login Integration', () => {
  test('should authenticate user on login', async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
## Development Workflow / 開発ワークフロー

### Daily Workflow / 日常のワークフロー

# 1. Start emulators / エミュレーターを開始
npm run dev:emulator

# 2. Start development server (in new terminal)
# 開発サーバーを開始（新しいターミナルで）
npm run dev

# 3. Make changes and test / 変更を加えてテスト
# - Authentication flows / 認証フロー
# - Firestore operations / Firestore 操作
# - Storage uploads / ストレージアップロード

# 4. Run tests / テストを実行
npm run test

# 5. Build and preview / ビルドとプレビュー
npm run build
npm run start
### Data Management / データ管理

# Export emulator data / エミュレーターデータをエクスポート
firebase emulators:export ./backup

# Import emulator data / エミュレーターデータをインポート
firebase emulators:start --import ./backup

# Clear emulator data / エミュレーターデータをクリア
# Stop emulators and restart / エミュレーターを停止して再起動
### Environment Switching / 環境の切り替え

# Development with emulators / エミュレーターでの開発
export NODE_ENV=development
npm run dev

# Testing with emulators / エミュレーターでのテスト
export NODE_ENV=test
npm run test

# Production build / 本番ビルド
export NODE_ENV=production
npm run build
## Security Rules / セキュリティルール

### Firestore Rules Explained / Firestore ルールの説明

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions / ヘルパー関数
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidUser(userId) {
      return userId == request.auth.uid
        && 'email' in request.resource.data
        && 'displayName' in request.resource.data;
    }

    // Users collection / ユーザーコレクション
    match /users/{userId} {
      // Users can only access their own documents
      // ユーザーは自分のドキュメントのみアクセス可能
      allow read, write: if isOwner(userId);
      allow create: if isAuthenticated() && isValidUser(userId);
    }
    
    // Public profiles / 公開プロフィール
    match /profiles/{profileId} {
      // Anyone can read profiles for social features
      // ソーシャル機能のため誰でもプロフィールを読み取り可能
      allow read: if true;
      // Only the profile owner can update
      // プロフィール所有者のみ更新可能
      allow write: if isOwner(profileId);
    }
    
    // Posts collection / 投稿コレクション
    match /posts/{postId} {
      // Anyone can read posts for discovery
      // 発見機能のため誰でも投稿を読み取り可能
      allow read: if true;
      // Users can create posts with their authId
      // ユーザーは自分のauthIdで投稿作成可能
      allow create: if isAuthenticated() 
        && request.auth.uid == request.resource.data.authorId;
      // Only the author can update their posts
      // 作者のみ自分の投稿を更新可能
      allow update, delete: if isAuthenticated() 
        && request.auth.uid == resource.data.authorId;
    }
  }
}
### Storage Rules Explained / ストレージルールの説明

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // User private files / ユーザーのプライベートファイル
    match /users/{userId}/{allPaths=**} {
      // Users can only access their own files
      // ユーザーは自分のファイルのみアクセス可能
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Profile images (public) / プロフィール画像（公開）
    match /profiles/{userId}/avatar.{extension} {
      // Anyone can read profile images
      // 誰でもプロフィール画像を読み取り可能
      allow read: if true;
      // Only the user can upload their profile image
      // ユーザーのみ自分のプロフィール画像をアップロード可能
      allow write: if request.auth != null 
        && request.auth.uid == userId
        // Validate file type / ファイルタイプを検証
        && extension.matches('(jpg|jpeg|png|webp)')
        // Limit file size to 5MB / ファイルサイズを5MBに制限
        && request.resource.size < 5 * 1024 * 1024;
    }
    
    // Post images / 投稿画像
    match /posts/{postId}/{fileName} {
      // Anyone can read post images
      // 誰でも投稿画像を読み取り可能
      allow read: if true;
      // Authenticated users can upload post images
      // 認証済みユーザーは投稿画像をアップロード可能
      allow write: if request.auth != null
        // Validate image file types / 画像ファイルタイプを検証
        && fileName.matches('.*\\.(jpg|jpeg|png|webp|gif)$')
        // Limit file size to 10MB / ファイルサイズを10MBに制限
        && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
## CLI Commands Reference / CLI コマンドリファレンス

### Package.json Scripts / package.json スクリプト

Add these to your `package.json`:
これらを `package.json` に追加：

{
  "scripts": {
    "dev": "next dev",
    "dev:emulator": "firebase emulators:start",
    "dev:full": "concurrently \"npm run dev:emulator\" \"npm run dev\"",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:emulator": "firebase emulators:exec \"npm test\"",
    "firebase:login": "firebase login",
    "firebase:logout": "firebase logout",
    "firebase:deploy": "firebase deploy",
    "firebase:deploy:rules": "firebase deploy --only firestore:rules,storage",
    "firebase:export": "firebase emulators:export ./emulator-data",
    "firebase:import": "firebase emulators:start --import ./emulator-data",
    "firebase:shell": "firebase firestore:shell",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
### Firebase CLI Commands / Firebase CLI コマンド

# Authentication / 認証
firebase login                    # Login to Firebase / Firebase にログイン
firebase logout                   # Logout from Firebase / Firebase からログアウト
firebase projects:list             # List all projects / 全プロジェクトを一覧表示

# Project Management / プロジェクト管理
firebase use [project-id]          # Switch to project / プロジェクトを切り替え
firebase use --add                 # Add project alias / プロジェクトエイリアスを追加
firebase projects:create           # Create new project / 新しいプロジェクトを作成

# Emulators / エミュレーター
firebase emulators:start           # Start all emulators / 全エミュレーターを開始
firebase emulators:start --only auth,firestore  # Start specific emulators
firebase emulators:export ./data   # Export emulator data / エミュレーターデータをエクスポート
firebase emulators:exec "npm test" # Run command with emulators / エミュレーター付きでコマンド実行

# Deployment / デプロイ
firebase deploy                    # Deploy all / 全てをデプロイ
firebase deploy --only hosting     # Deploy hosting only / ホスティングのみデプロイ
firebase deploy --only firestore   # Deploy Firestore rules / Firestoreルールをデプロイ
firebase deploy --only functions   # Deploy functions / 関数をデプロイ

# Database / データベース
firebase firestore:indexes         # List Firestore indexes / Firestoreインデックスを一覧表示
firebase firestore:delete /path    # Delete Firestore data / Firestoreデータを削除

# Functions (if using) / 関数（使用している場合）
firebase functions:log             # View function logs / 関数ログを表示
firebase functions:shell           # Functions shell / 関数シェル
## Troubleshooting / トラブルシューティング

### Common Issues / よくある問題

#### 1. Emulator Connection Issues / エミュレーター接続の問題

**Problem**: Cannot connect to emulator
**問題**: エミュレーターに接続できない

# Solution 1: Check if emulators are running
# 解決策 1: エミュレーターが動作しているか確認
firebase emulators:start

# Solution 2: Check ports are available
# 解決策 2: ポートが使用可能か確認
lsof -i :4000  # Emulator UI
lsof -i :8088  # Firestore
lsof -i :9099  # Auth
lsof -i :9199  # Storage

# Solution 3: Change ports in firebase.json
# 解決策 3: firebase.json でポートを変更
#### 2. Authentication Not Working / 認証が動作しない

**Problem**: Authentication fails in emulator
**問題**: エミュレーターで認証が失敗する

// Solution: Ensure proper emulator connection
// 解決策: 適切なエミュレーター接続を確保
import { connectAuthEmulator } from 'firebase/auth';

// Only connect once / 一度だけ接続
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.log('Emulator already connected');
  }
}
#### 3. CORS Issues / CORS エラー

**Problem**: CORS errors when accessing Firebase
**問題**: Firebase アクセス時の CORS エラー

// Solution: Add to next.config.js
// 解決策: next.config.js に追加
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};
#### 4. Environment Variables Not Loading / 環境変数が読み込まれない

**Problem**: Environment variables return undefined
**問題**: 環境変数が undefined を返す

# Solution 1: Check file naming
# 解決策 1: ファイル名を確認
.env.local          # ✅ Correct for Next.js / Next.js では正しい
.env               # ❌ Won't work in Next.js / Next.js では動作しない

# Solution 2: Restart development server
# 解決策 2: 開発サーバーを再起動
npm run dev

# Solution 3: Check variable prefix
# 解決策 3: 変数のプレフィックスを確認
NEXT_PUBLIC_FIREBASE_API_KEY=...  # ✅ Accessible in browser / ブラウザでアクセス可能
FIREBASE_API_KEY=...              # ❌ Server-side only / サーバーサイドのみ
#### 5. Build Issues / ビルドの問題

**Problem**: Build fails with Firebase errors
**問題**: Firebase エラーでビルドが失敗

// Solution: Dynamic imports for client-side only code
// 解決策: クライアントサイド専用コードの動的インポート

// Instead of / 代わりに
import { auth } from '../lib/firebase';

// Use / 使用
useEffect(() => {
  import('../lib/firebase').then(({ auth }) => {
    // Use auth here / ここで auth を使用
  });
}, []);
### Performance Issues / パフォーマンスの問題

#### 1. Slow Emulator Startup / エミュレーターの起動が遅い

# Solution 1: Increase Java heap size / Java ヒープサイズを増加
export JAVA_OPTS="-Xmx4g"
firebase emulators:start

# Solution 2: Only start needed emulators / 必要なエミュレーターのみ起動
firebase emulators:start --only auth,firestore

# Solution 3: Use emulator data import / エミュレーターデータインポートを使用
firebase emulators:start --import ./emulator-data
#### 2. Memory Issues / メモリの問題

# Check memory usage / メモリ使用量を確認
ps aux | grep firebase

# Solution: Restart emulators periodically / 定期的にエミュレーターを再起動
pkill -f firebase
npm run dev:emulator
### Debugging Tips / デバッグのコツ

#### 1. Enable Debug Mode / デバッグモードを有効化

# Enable Firebase debug logging / Firebase デバッグログを有効化
export FIREBASE_CLI_DEBUG=true
firebase emulators:start

# Enable Firestore debug / Firestore デバッグを有効化
export FIRESTORE_EMULATOR_DEBUG=true
#### 2. Check Emulator Logs / エミュレーターログを確認

# View Firestore logs / Firestore ログを表示
tail -f ~/.firebase/emulators/firestore-debug.log

# View Auth logs / 認証ログを表示
tail -f ~/.firebase/emulators/auth-debug.log
#### 3. Network Inspection / ネットワーク検査

// Add request logging / リクエストログを追加
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Monitor network state / ネットワーク状態を監視
window.addEventListener('online', () => {
  console.log('Online - enabling Firestore network');
  enableNetwork(firestore);
});

window.addEventListener('offline', () => {
  console.log('Offline - disabling Firestore network');
  disableNetwork(firestore);
});
## FAQ

### General Questions / 一般的な質問

**Q: Do I need a real Firebase project for development?**
**質問: 開発には実際の Firebase プロジェクトが必要ですか？**

A: No, you can develop entirely using Firebase Emulators. However, some features like push notifications require a real project.

回答: いいえ、Firebase エミュレーターだけで完全に開発できます。ただし、プッシュ通知などの一部の機能には実際のプロジェクトが必要です。

**Q: Can I use emulator data in production?**
**質問: エミュレーターのデータを本番環境で使用できますか？**

A: No, emulator data is local only. You need to migrate data manually or use Firebase's import/export tools.

回答: いいえ、エミュレーターのデータはローカル専用です。データを手動で移行するか、Firebase のインポート/エクスポートツールを使用する必要があります。

**Q: How do I handle different environments?**
**質問: 異なる環境をどのように扱いますか？**

A: Use environment variables and different Firebase projects:
- Development: Local emulators
- Staging: Firebase staging project  
- Production: Firebase production project

回答: 環境変数と異なる Firebase プロジェクトを使用：
- 開発: ローカルエミュレーター
- ステージング: Firebase ステージングプロジェクト
- 本番: Firebase 本番プロジェクト

### Authentication Questions / 認証に関する質問

**Q: How do I test different auth providers?**
**質問: 異なる認証プロバイダーをテストするには？**

A: The emulator supports all auth providers. For Google/Facebook, you can use test accounts without real OAuth.

回答: エミュレーターは全ての認証プロバイダーをサポートします。Google/Facebook の場合、実際の OAuth なしでテストアカウントを使用できます。

**Q: Can I import existing users to emulator?**
**質問: 既存のユーザーをエミュレーターにインポートできますか？**

A: Yes, you can export users from production and import to emulator:

回答: はい、本番環境からユーザーをエクスポートしてエミュレーターにインポートできます：

# Export from production / 本番からエクスポート
firebase auth:export users.json --project production-project

# Import to emulator / エミュレーターにインポート
firebase auth:import users.json --project demo-project
### Firestore Questions / Firestore に関する質問

**Q: How do I seed emulator data?**
**質問: エミュレーターデータをシードするには？**

A: Create a seeding script:

回答: シードスクリプトを作成します：

// scripts/seed-data.ts
import { firestore } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const seedData = async () => {
  // Create sample users / サンプルユーザーを作成
  const users = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  for (const user of users) {
    await setDoc(doc(collection(firestore, 'users'), user.id), user);
  }

  console.log('Data seeded successfully');
};

seedData().catch(console.error);
**Q: How do I test security rules?**
**質問: セキュリティルールをテストするには？**

A: Use the Firebase Emulator Suite testing tools:

回答: Firebase Emulator Suite テストツールを使用します：

# Install testing SDK / テスト SDK をインストール
npm install -D @firebase/rules-unit-testing

# Run security rules tests / セキュリティルールテストを実行
npm test -- --testPathPattern=rules
### Performance Questions / パフォーマンスに関する質問

**Q: Why is the emulator slow?**
**質問: エミュレーターが遅いのはなぜですか？**

A: Common causes and solutions:
1. Insufficient Java memory - increase with `export JAVA_OPTS="-Xmx4g"`
2. Too many emulators running - use `--only` flag
3. Large datasets - use smaller seed data for development

回答: 一般的な原因と解決策：
1. Java メモリ不足 - `export JAVA_OPTS="-Xmx4g"` で増加
2. 多すぎるエミュレーター - `--only` フラグを使用
3. 大きなデータセット - 開発用に小さなシードデータを使用

**Q: How do I optimize for production?**
**質問: 本番環境用に最適化するには？**

A: Follow these best practices:
1. Use Firestore indexes for complex queries
2. Implement proper caching strategies
3. Use Firebase Performance Monitoring
4. Optimize security rules for read/write patterns

回答: これらのベストプラクティスに従ってください：
1. 複雑なクエリには Firestore インデックスを使用
2. 適切なキャッシュ戦略を実装
3. Firebase Performance Monitoring を使用
4. 読み取り/書き込みパターンに合わせてセキュリティルールを最適化

---

## Support / サポート

If you encounter any issues not covered in this guide, please:
このガイドで扱われていない問題が発生した場合：

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase) with `firebase` tag
3. Review [Firebase GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)
4. Join [Firebase Discord Community](https://discord.gg/firebase)

1. [Firebase ドキュメント](https://firebase.google.com/docs)を確認
2. `firebase` タグで [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase) を検索
3. [Firebase GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues) をレビュー
4. [Firebase Discord Community](https://discord.gg/firebase) に参加

Happy coding! / 頑張ってコーディング！ 🚀