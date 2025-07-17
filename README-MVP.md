# MustMe MVP - Firebase Authentication Implementation

MustMeのMVPでは、Firebase Authenticationを使用したユーザー認証機能を実装しました。

## 🔐 実装された認証機能

### 1. ユーザー登録 (/signup)
- **メールアドレス + パスワード**でアカウント作成
- **ユーザー名（表示名）入力**機能
- **Googleアカウント**でのサインアップ対応
- アカウント作成成功時に**「MustMeの一員になりました」**演出
- 新規ユーザーには**レビュアーバッジ**を表示

### 2. ログイン (/login)
- **メールアドレス + パスワード**認証
- **Googleログイン**対応
- **パスワードリセット**機能
- ログイン画面のコピー：**「信じるレビューに、会いにいこう。」**
- returnUrlパラメータによる認証後のリダイレクト機能

### 3. ログアウト (/logout)
- 安全なログアウト処理
- ログアウト確認画面
- ログアウト後に **/login** へリダイレクト
- 「ありがとうございました！またのご利用をお待ちしています」メッセージ

### 4. 認証保護機能
- **AuthGuard**コンポーネントによる認証チェック
- 非ログイン時の自動リダイレクト処理
- 認証が必要なページ：
  - **ホーム (/)** - メインフィード
  - **レビュー作成 (/write-review)**
  - **検索 (/search)**
  - **商品詳細ページ**

### 5. ユーザーデータ連動
- **投稿・共感機能とユーザーIDの連動**
- ユーザー情報はFirestoreに保存
- リアルタイムでのユーザー状態管理
- ユーザープロフィール情報の表示

## 🎨 MustMe特有の体験デザイン

### ログイン体験の「らしさ」
- **ウェルカム画面**に「今日の共感王」「あなたにおすすめの愛用品」表示
- **新規ユーザー**には特別なアニメーション付きバッジ演出
- **信頼できるレビュープラットフォーム**としてのブランドメッセージ

### デザインシステム
- **Primary Color**: オレンジ (#ea580c) - CTAボタン、ブランド要素
- **Typography**: Inter フォント - モダンで読みやすい
- **UI Components**: グラデーション背景、アニメーション効果

## 🔧 技術仕様

### Firebase設定
```typescript
// 必要な環境変数
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

### 認証コンテキスト
- **AuthProvider**: React Contextによるグローバル状態管理
- **useAuth**: フック形式でのユーザー情報アクセス
- **エラーハンドリング**: 日本語エラーメッセージ

### データベース構造 (Firestore)
```typescript
// ユーザーコレクション
users/{userId} {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  createdAt: timestamp;
  isNewUser: boolean;
}

// 投稿コレクション（今後実装）
posts/{postId} {
  userId: string;
  content: object;
  engagement: object;
  timestamp: timestamp;
}
```

## 📱 ユーザーフロー

```mermaid
graph TD
    A[ランディング] --> B{ログイン済み?}
    B -->|No| C[/login]
    B -->|Yes| D[ウェルカムダッシュボード]
    C --> E[認証処理]
    E --> F{認証成功?}
    F -->|Yes| D
    F -->|No| C
    D --> G[メインフィード]
    G --> H[レビュー機能]
    G --> I[検索機能]
    H --> J[投稿とユーザーID連動]
    I --> K[商品詳細ページ]
```

## 🚀 セットアップ手順

### 1. Firebase プロジェクト作成
```bash
# 1. https://console.firebase.google.com/ でプロジェクト作成
# 2. Authentication を有効化（Email/Password、Google）
# 3. Firestore Database を作成
# 4. Storage を有効化（オプション）
```

### 2. 環境変数設定
```bash
# .env.exampleを.env.localにコピー
cp .env.example .env.local

# Firebase設定値を入力
# プロジェクト設定 > 全般 > アプリからコピー
```

### 3. 依存関係のインストール
```bash
npm install firebase
```

### 4. 開発サーバー起動
```bash
npm run dev
```

## 🔒 セキュリティ機能

- **Client/Server分離**: 認証処理は Firebase SDK で安全に
- **Protected Routes**: 未認証ユーザーの自動リダイレクト
- **Error Handling**: 適切なエラーメッセージとフォールバック
- **CSRF Protection**: Firebase Authの組み込みセキュリティ

## 🎯 今後の拡張予定

1. **メール認証**: メールアドレス確認機能
2. **プロフィール編集**: ユーザー情報更新機能
3. **ソーシャル機能**: フォロー/フォロワー機能
4. **通知システム**: リアルタイム通知機能
5. **管理者機能**: ユーザー管理・コンテンツモデレーション

---

この認証システムにより、MustMeはセキュアで使いやすいレビュープラットフォームとして機能します。ユーザーは安心してアカウントを作成し、信頼できるレビューコミュニティに参加できます。