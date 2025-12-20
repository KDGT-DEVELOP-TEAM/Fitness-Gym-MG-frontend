# Fitness Gym MG Frontend

フィットネスジム管理システムのフロントエンドアプリケーションです。React + TypeScript + Tailwind CSSで構築されています。

## 技術スタック

- **React** 19.2.0
- **TypeScript** 4.9.5
- **React Router** 7.10.0
- **Axios** 1.13.2
- **Tailwind CSS** 4.1.17

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を参考に`.env`ファイルを作成してください。

```bash
cp .env.example .env
```

`.env`ファイルに以下の環境変数を設定してください：

```
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### 3. 開発サーバーの起動

```bash
npm start
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ディレクトリ構成

```
fitnessgym-mg-frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/                    # API通信関連
│   │   ├── axiosConfig.ts      # Axios設定
│   │   ├── authApi.ts          # 認証API
│   │   ├── customerApi.ts      # 顧客API
│   │   ├── lessonApi.ts        # レッスンAPI
│   │   ├── postureApi.ts       # 姿勢API
│   │   └── userApi.ts          # ユーザーAPI
│   │
│   ├── components/             # コンポーネント
│   │   ├── common/            # 汎用コンポーネント
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── customer/          # 顧客関連コンポーネント
│   │   │   ├── CustomerCard.tsx
│   │   │   └── CustomerForm.tsx
│   │   │
│   │   ├── lesson/            # レッスン関連コンポーネント
│   │   │   ├── LessonCard.tsx
│   │   │   └── LessonForm.tsx
│   │   │
│   │   └── posture/           # 姿勢関連コンポーネント
│   │       ├── PostureCard.tsx
│   │       └── PostureComparisonView.tsx
│   │
│   ├── pages/                 # ページコンポーネント
│   │   ├── Login.tsx
│   │   ├── storeManagement.tsx
│   │   ├── CustomerSelect.tsx
│   │   ├── LessonForm.tsx
│   │   ├── LessonHistory.tsx
│   │   ├── CustomerProfile.tsx
│   │   ├── PostureList.tsx
│   │   ├── PostureDetail.tsx
│   │   ├── PostureCompare.tsx
│   │   ├── CustomerManagement.tsx
│   │   ├── CustomerList.tsx
│   │   ├── UserManagement.tsx
│   │   └── UserList.tsx
│   │
│   ├── hooks/                 # カスタムフック
│   │   ├── useAuth.ts
│   │   ├── useCustomer.ts
│   │   ├── useLesson.ts
│   │   └── usePosture.ts
│   │
│   ├── context/               # Context API
│   │   └── AuthContext.tsx
│   │
│   ├── types/                 # TypeScript型定義
│   │   ├── auth.ts
│   │   ├── customer.ts
│   │   ├── lesson.ts
│   │   ├── posture.ts
│   │   ├── user.ts
│   │   └── common.ts
│   │
│   ├── utils/                 # ユーティリティ関数
│   │   ├── dateFormatter.ts
│   │   ├── validators.ts
│   │   └── apiErrorHandler.ts
│   │
│   ├── constants/             # 定数
│   │   ├── apiEndpoints.ts
│   │   └── routes.ts
│   │
│   ├── styles/                # スタイル
│   │   └── index.css
│   │
│   ├── App.tsx                # メインアプリケーション
│   ├── index.tsx              # エントリーポイント
│   └── routes.tsx             # ルーティング設定
│
├── .env                       # 環境変数（個人で作成）
├── .env.example              # 環境変数サンプル
├── .gitignore
├── package.json
├── tsconfig.json             # TypeScript設定
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 主な機能

### 認証機能
- ログイン/ログアウト
- 認証状態の管理（Context API）

### 顧客管理
- 顧客一覧表示
- 顧客プロフィール表示
- 顧客選択機能

### レッスン管理
- レッスン登録
- レッスン履歴表示
- 顧客別レッスン一覧

### 姿勢管理
- 姿勢画像のアップロード
- 姿勢一覧表示
- 姿勢詳細表示
- 姿勢比較機能

### ユーザー管理
- ユーザー一覧表示
- ユーザー管理機能
