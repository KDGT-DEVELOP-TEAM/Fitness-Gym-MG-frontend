# Fitness Gym MG Frontend

フィットネスジム管理システムのフロントエンドアプリケーションです。React + TypeScript + Tailwind CSSで構築されています。

## 技術スタック

- **React** 19.2.0
- **TypeScript** 4.9.5
- **Vite** 5.4.2
- **React Router** 7.10.0
- **Axios** 1.13.2
- **Tailwind CSS** 3.4.18

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
VITE_API_BASE_URL=http://localhost:3001/api
```

**注意**: 
- Viteでは環境変数に `VITE_` プレフィックスが必要です
- 環境変数は `import.meta.env.VITE_*` でアクセスします
- APIベースURLはバックエンドサーバーのURLに合わせて設定してください（デフォルト: http://localhost:3001/api）

### 3. 開発サーバーの起動

```bash
npm run dev
```

または

```bash
npm start
```

ブラウザで [http://localhost:3000](http://localhost:3000) が自動的に開きます。

### 4. ビルド

```bash
npm run build
```

ビルド出力は `dist/` ディレクトリに生成されます。

### 5. プレビュー

ビルドしたアプリケーションをプレビューする場合：

```bash
npm run preview
```

## ディレクトリ構成

```
fitnessgym-mg-frontend/
├── index.html                 # Vite用のエントリーポイント
├── vite.config.ts            # Vite設定ファイル
├── public/                   # 静的ファイル
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
│   │   ├── StoreManagement.tsx
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
├── tsconfig.node.json        # Vite用TypeScript設定
├── vite.config.ts            # Vite設定
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## データベース構造

### Stores（店舗）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ○ | ○ | ○ | ○ | 主キー |
| name | varchar |  | ○ | ○ |  | 店舗名 |

### Users（ユーザー）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ○ | ○ | ○ | ○ | 主キー |
| email | varchar |  | ○ | ○ | ○ | メールアドレス（CHECK制約あり） |
| kana | varchar |  | ○ |  |  | フリガナ |
| name | varchar |  | ○ |  |  | 氏名 |
| pass | varchar(255) |  | ○ |  |  | ハッシュ化パスワード（bcrypt、60文字） |
| role | user_role |  | ○ |  |  | 権限区分 |
| is_active | boolean |  | ○ |  |  | 有効／無効 |
| created_at | timestamptz |  | ○ |  |  | 登録日時 |

### Customers（顧客）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ○ | ○ | ○ | ○ | 主キー |
| kana | varchar |  | ○ |  |  | フリガナ |
| name | varchar |  | ○ |  |  | 氏名 |
| gender | gender |  | ○ |  |  | 性別 |
| birthday | date |  | ○ |  |  | 生年月日 |
| height | numeric |  | ○ |  |  | 身長 |
| email | varchar |  | ○ | ○ |  | メールアドレス |
| phone | varchar |  | ○ |  |  | 電話番号 |
| address | varchar |  | ○ |  |  | 住所 |
| medical | varchar |  |  |  |  | 医療・既往歴 |
| taboo | varchar |  |  |  |  | 禁忌事項 |
| first_posture_group_id | uuid |  |  |  |  | FK → `posture_groups`（初回姿勢画像） |
| memo | varchar |  |  |  |  | 自由記入メモ |
| created_at | timestamptz |  | ○ |  |  | 登録日時 |
| is_active | boolean |  | ○ |  |  | 有効／無効 |

### Lessons（レッスン）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ○ | ○ | ○ | ○ | 主キー |
| store_id | uuid |  | ○ |  |  | FK → `stores` |
| user_id | uuid |  | ○ |  |  | FK → `users`（担当トレーナー） |
| customer_id | uuid |  | ○ |  |  | FK → `customers` |
| posture_group_id | uuid |  |  |  |  | FK → `posture_groups`（レッスン時姿勢） |
| condition | varchar |  |  |  |  | 体調メモ |
| weight | numeric |  |  |  |  | 体重 |
| meal | varchar |  |  |  |  | 食事内容 |
| memo | varchar |  |  |  |  | レッスンメモ |
| start_date | timestamptz |  |  |  |  | レッスン開始日時 |
| end_date | timestamptz |  |  |  |  | レッスン終了日時 |
| next_date | timestamptz |  |  |  |  | 次回予約日時 |
| next_store_id | uuid |  |  |  |  | FK → `stores`（次回予定店舗） |
| next_user_id | uuid |  |  |  |  | FK → `users`（次回担当） |
| created_at | timestamptz |  | ○ |  |  | 追加日時 |

### Trainings（トレーニング）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| lesson_id | uuid | ○ | ○ |  |  | 複合PK（lesson_id + order_no）、FK → `lessons` |
| order_no | int | ○ | ○ |  |  | 複合PK（lesson_id + order_no） |
| name | varchar |  | ○ |  |  | 種目名 |
| reps | int |  | ○ |  |  | 回数 |

### Logs（監査ログ）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ○ | ○ | ○ | ○ | 主キー |
| user_id | uuid |  | ○ |  |  | FK → `users` |
| action | varchar |  | ○ |  |  | 操作内容 |
| target_table | varchar |  | ○ |  |  | 対象テーブル |
| target_id | uuid |  | ○ |  |  | 対象レコードID |
| created_at | timestamptz |  | ○ |  |  | 操作日時 |

### Store_Customers（店舗×顧客）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| store_id | uuid | ○ | ○ |  |  | 複合PK（store_id + customer_id）、FK → `stores` |
| customer_id | uuid | ○ | ○ |  |  | 複合PK（store_id + customer_id）、FK → `customers` |

### User_Stores（ユーザー×店舗）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| user_id | uuid | ○ | ○ |  |  | 複合PK（user_id + store_id）、FK → `users` |
| store_id | uuid | ○ | ○ |  |  | 複合PK（user_id + store_id）、FK → `stores` |

### User_Customers（ユーザー×顧客）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| user_id | uuid | ○ | ○ |  |  | 複合PK（user_id + customer_id）、FK → `users` |
| customer_id | uuid | ○ | ○ |  |  | 複合PK（user_id + customer_id）、FK → `customers` |

### posture_groups（姿勢画像グループ）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ○ | ○ | ○ | ○ | 主キー |
| customer_id | uuid |  | ○ |  |  | FK → `customers` |
| lesson_id | uuid |  | ○ |  |  | FK → `lessons` |
| captured_at | timestamptz |  | ○ |  |  | 撮影日時 |
| created_at | timestamptz |  | ○ |  |  | 追加日時 |

### posture_images（姿勢画像）
| カラム名 | 型 | 主キー | NOT NULL | UNIQUE | INDEX | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ○ | ○ | ○ | ○ | 主キー |
| posture_group_id | uuid |  | ○ |  |  | FK → `posture_groups` |
| storage_key | varchar |  | ○ | ○ |  | ストレージ上のパス |
| consent_publication | boolean |  | ○ |  |  | 公開同意フラグ |
| taken_at | timestamptz |  | ○ |  |  | 撮影日時 |
| created_at | timestamptz |  | ○ |  |  | 追加日時 |
| position | posture_image_position |  | ○ |  |  | 撮影方向 |


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
