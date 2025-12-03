## 環境変数は個人で作成お願いします
.env
.env.example

## ディレクトリ構成

```
fitness-gym-frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/                    # API通信関連
│   │   ├── axiosConfig.js     # Axios設定
│   │   ├── authApi.js         # 認証API
│   │   ├── customerApi.js     # 顧客API
│   │   ├── lessonApi.js       # レッスンAPI
│   │   ├── postureApi.js      # 姿勢API
│   │   └── userApi.js         # ユーザーAPI
│   │
│   ├── components/             # 共通コンポーネント
│   │   ├── common/            # 汎用コンポーネント
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── Header.jsx
│   │   │
│   │   ├── customer/          # 顧客関連コンポーネント
│   │   │   ├── CustomerCard.jsx
│   │   │   └── CustomerForm.jsx
│   │   │
│   │   ├── lesson/            # レッスン関連コンポーネント
│   │   │   ├── LessonCard.jsx
│   │   │   └── LessonForm.jsx
│   │   │
│   │   └── posture/           # 姿勢関連コンポーネント
│   │       ├── PostureCard.jsx
│   │       └── PostureComparisonView.jsx
│   │
│   ├── pages/                 # ページコンポーネント
│   │   ├── Login.jsx
│   │   ├── ShopManagement.jsx
│   │   ├── CustomerSelect.jsx
│   │   ├── LessonForm.jsx
│   │   ├── LessonHistory.jsx
│   │   ├── CustomerProfile.jsx
│   │   ├── PostureList.jsx
│   │   ├── PostureDetail.jsx
│   │   ├── PostureCompare.jsx
│   │   ├── CustomerManagement.jsx
│   │   ├── CustomerList.jsx
│   │   ├── UserManagement.jsx
│   │   └── UserList.jsx
│   │
│   ├── hooks/                 # カスタムフック
│   │   ├── useAuth.js
│   │   ├── useCustomer.js
│   │   └── useLesson.js
│   │
│   ├── context/               # Context API
│   │   └── AuthContext.jsx
│   │
│   ├── utils/                 # ユーティリティ関数
│   │   ├── dateFormatter.js
│   │   └── validators.js
│   │
│   ├── constants/             # 定数
│   │   └── apiEndpoints.js
│   │
│   ├── styles/                # スタイル
│   │   └── index.css
│   │
│   ├── App.jsx                # メインアプリケーション
│   ├── index.js               # エントリーポイント
│   └── routes.jsx             # ルーティング設定
│
├── .env                       # 環境変数
├── .env.example              # 環境変数サンプル
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```