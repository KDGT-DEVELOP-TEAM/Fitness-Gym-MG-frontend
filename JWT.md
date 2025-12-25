# フロントエンド JWT認証実装プロンプト

## 概要

React + TypeScript フロントエンドで、JWT（JSON Web Token）認証を実装してください。
**localStorage** を使用してトークンを保存し、UXを向上させます（タブを閉じてもログイン状態が維持される）。

## バックエンド仕様

### API エンドポイント

#### ログイン
- **POST** `/api/auth/login`
- **リクエストボディ:**
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **レスポンス（成功時 200）:**
  ```typescript
  {
    userId: string;      // UUID
    email: string;
    name: string;
    role: "ADMIN" | "MANAGER" | "TRAINER";
    token: string;       // JWTトークン
  }
  ```
- **レスポンス（失敗時 401）:** `null` またはエラーレスポンス

#### 認証状態確認
- **GET** `/api/auth/login`
- **レスポンス（認証済み 200）:** 上記と同じ形式（token は `null`）
- **レスポンス（未認証 401）:** 空レスポンス

#### ログアウト
- **POST** `/api/auth/logout`
- **レスポンス（200）:** 空レスポンス

### 認証ヘッダー

すべての認証が必要なAPIリクエストに、以下のヘッダーを付与してください：

```
Authorization: Bearer <JWTトークン>
```

### エラーレスポンス形式

```typescript
{
  code: string;        // エラーコード（例: "JWT_EXPIRED", "JWT_INVALID"）
  message: string;     // エラーメッセージ
  timestamp: string;   // ISO 8601形式のタイムスタンプ
}
```

### JWTトークン仕様

- **有効期限:** 24時間（86400000ms）
- **保存場所:** `localStorage`（キー名: `jwt_token` を推奨）
- **形式:** Bearer トークン形式

## 実装要件

### 1. 認証サービス（AuthService）

以下の機能を持つ認証サービスを実装してください：

```typescript
// services/authService.ts

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_info';  // オプション: ユーザー情報も保存

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'TRAINER';
  token: string;
}

interface UserInfo {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'TRAINER';
}

class AuthService {
  // ログイン処理
  async login(email: string, password: string): Promise<LoginResponse>
  
  // ログアウト処理
  async logout(): Promise<void>
  
  // トークン取得
  getToken(): string | null
  
  // ユーザー情報取得
  getUserInfo(): UserInfo | null
  
  // 認証状態確認
  isAuthenticated(): boolean
  
  // トークン削除
  clearAuth(): void
}
```

### 2. API クライアント設定

Axios または Fetch API を使用して、以下の機能を実装してください：

#### リクエストインターセプター

すべてのAPIリクエストに自動的に `Authorization` ヘッダーを付与：

```typescript
// リクエスト前に実行
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

#### レスポンスインターセプター

401 Unauthorized エラー時に自動的にログアウト処理を実行：

```typescript
// レスポンスエラー時に実行
if (response.status === 401) {
  // トークンを削除
  authService.clearAuth();
  // ログインページにリダイレクト
  window.location.href = '/login';
}
```

### 3. 認証コンテキスト（React Context）

認証状態を管理する Context を実装してください：

```typescript
interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

### 4. 保護されたルート（Protected Route）

認証が必要なページを保護するコンポーネントを実装：

```typescript
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

- 未認証の場合は `/login` にリダイレクト
- 認証済みの場合は子コンポーネントを表示

### 5. ログインページ実装

```typescript
// pages/Login.tsx

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
      // ログイン成功後、適切なページにリダイレクト
      // role に応じて /admin/home, /manager/home, /trainer/home など
    } catch (err) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    }
  };

  // JSX実装...
};
```

### 6. アプリ起動時の認証状態確認

アプリ起動時（またはページリロード時）に、localStorage に保存されたトークンで認証状態を確認：

```typescript
// App.tsx または main.tsx

useEffect(() => {
  const token = authService.getToken();
  if (token) {
    // トークンが存在する場合、認証状態を確認
    checkAuth();
  }
}, []);
```

## 実装のポイント

### localStorage の使用

```typescript
// トークン保存
localStorage.setItem('jwt_token', token);

// トークン取得
const token = localStorage.getItem('jwt_token');

// トークン削除
localStorage.removeItem('jwt_token');
```

### エラーハンドリング

- **401 Unauthorized:** トークンが無効または期限切れ → 自動ログアウト
- **403 Forbidden:** 権限不足 → エラーメッセージ表示
- **500 Internal Server Error:** サーバーエラー → エラーメッセージ表示

### トークンの有効期限管理

- バックエンドで24時間の有効期限が設定されているため、フロントエンド側での明示的な期限チェックは不要
- 401エラーが返ってきた場合は、トークンが期限切れと判断してログアウト処理を実行

### ロールベースのリダイレクト

ログイン成功後、ユーザーのロールに応じて適切なページにリダイレクト：

```typescript
switch (user.role) {
  case 'ADMIN':
    navigate('/admin/home');
    break;
  case 'MANAGER':
    navigate('/manager/home');
    break;
  case 'TRAINER':
    navigate('/trainer/home');
    break;
}
```

## セキュリティ考慮事項

1. **XSS対策:** バックエンドで CSP（Content Security Policy）が設定されているため、XSS攻撃のリスクは低減されています
2. **トークン漏洩対策:** localStorage に保存するため、XSS攻撃を受けた場合にトークンが漏洩する可能性がありますが、CSP設定によりリスクは低減されています
3. **HTTPS必須:** 本番環境では必ず HTTPS を使用してください

## バックエンド接続情報

- **ベースURL:** `http://localhost:8080`（開発環境）
- **APIパス:** `/api`
- **CORS:** 有効（開発環境では `http://localhost:3000` などからアクセス可能）

## 実装チェックリスト

- [ ] AuthService の実装（login, logout, getToken, getUserInfo など）
- [ ] API クライアントの設定（リクエスト/レスポンスインターセプター）
- [ ] 認証コンテキスト（React Context）の実装
- [ ] ProtectedRoute コンポーネントの実装
- [ ] ログインページの実装
- [ ] アプリ起動時の認証状態確認
- [ ] ロールベースのリダイレクト
- [ ] エラーハンドリング（401, 403, 500など）
- [ ] ログアウト機能の実装
- [ ] トークンの自動削除（401エラー時）

## 参考実装例

### Axios を使用した場合

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### React Context を使用した場合

```typescript
// contexts/AuthContext.tsx

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = authService.getToken();
    if (token) {
      try {
        const response = await apiClient.get('/auth/login');
        setUser(response.data);
      } catch (error) {
        authService.clearAuth();
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response);
    localStorage.setItem('jwt_token', response.token);
    localStorage.setItem('user_info', JSON.stringify(response));
  };

  const logout = async () => {
    await authService.logout();
    authService.clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 注意事項

1. **トークンの保存:** `localStorage` を使用することで、タブを閉じてもログイン状態が維持されます
2. **セキュリティ:** XSS攻撃のリスクがあるため、CSP設定が重要です（バックエンドで既に設定済み）
3. **エラーハンドリング:** 401エラー時は必ずトークンを削除し、ログインページにリダイレクトしてください
4. **型安全性:** TypeScript を使用して、型安全性を確保してください

