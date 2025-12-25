# フロントエンド実装ガイド（React + TypeScript）

このドキュメントは、バックエンドREST APIをフロントエンドで使用するための実装ガイドです。

---

## 推奨ファイル構造

### 完全なプロジェクト構成

```bash
fitness-gym-frontend/

├── src/
│   ├── api/
│   │   ├── axiosConfig.ts                # Axiosインスタンス設定（JWT認証）
│   │   ├── authApi.ts                    # 認証API
│   │   ├── admin/
│   │   │   ├── homeApi.ts                # 管理者ホームAPI
│   │   │   ├── usersApi.ts               # ユーザー管理API
│   │   │   ├── customersApi.ts           # 顧客管理API
│   │   │   └── logsApi.ts                # 監査ログAPI
│   │   ├── manager/
│   │   │   ├── homeApi.ts                # 店長ホームAPI
│   │   │   ├── usersApi.ts               # ユーザー管理API（店長）
│   │   │   └── customersApi.ts           # 顧客管理API（店長）
│   │   ├── trainer/
│   │   │   ├── homeApi.ts                # トレーナーホームAPI
│   │   │   └── customersApi.ts           # 顧客一覧API（トレーナー）
│   │   ├── customerApi.ts                # 顧客関連API
│   │   ├── lessonApi.ts                  # レッスンAPI
│   │   └── postureApi.ts                 # 姿勢画像API
│   ├── utils/
│   │   ├── storage.ts                    # セッションストレージ管理（JWT・ユーザー情報）
│   │   └── pagination.ts                 # ページネーション変換ユーティリティ

```

### 主要ディレクトリの役割

| ディレクトリ | 役割 |
|------------|------|
| `src/api/` | バックエンドAPI呼び出し関数を配置（ロール別に分割） |
| `src/components/` | 再利用可能なUIコンポーネント（機能別に分割） |
| `src/pages/` | 画面コンポーネント（ロール別に分割） |
| `src/routes/` | React Routerルート設定・認証チェック |
| `src/hooks/` | カスタムフック（ロジックの共通化） |
| `src/contexts/` | グローバルステート管理（React Context） |
| `src/types/` | TypeScript型定義 |
| `src/utils/` | ユーティリティ関数 |
| `src/styles/` | スタイルシート |

### 注記

画面（pages）は量が膨大になるため、API呼び出しコードを完全網羅し、画面側はそれを呼べば動く状態を想定します。

---

## 1. APIクライアント設定（Axios + JWT）

### `src/api/axiosConfig.ts`

```typescript
import axios from 'axios';
import { storage } from '../utils/storage';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: JWTトークンを自動付与
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター: 401エラー時に自動ログアウト
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### `src/utils/storage.ts`

```typescript
const USER_KEY = 'user';
const TOKEN_KEY = 'token';

export const storage = {
  // ユーザー情報の保存
  setUser: (user: { userId: string; email: string; name: string; role: string }): void => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // ユーザー情報の取得
  getUser: (): { userId: string; email: string; name: string; role: string } | null => {
    const userStr = sessionStorage.getItem(USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  // JWTトークンの保存
  setToken: (token: string): void => {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  // JWTトークンの取得
  getToken: (): string | null => {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  // JWTトークンの削除
  removeToken: (): void => {
    sessionStorage.removeItem(TOKEN_KEY);
  },

  // ユーザー情報の削除
  removeUser: (): void => {
    sessionStorage.removeItem(USER_KEY);
  },

  // 全認証データのクリア
  clear: (): void => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};
```

---

## 2. 認証API

### `src/api/authApi.ts`

```typescript
import axiosInstance from './axiosConfig';
import { storage } from '../utils/storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'TRAINER';
  token?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/api/auth/login', credentials);
    const { token, ...userData } = response.data;
    
    // JWTトークンを保存
    if (token) {
      storage.setToken(token);
    }
    
    // ユーザー情報を保存
    storage.setUser(userData);
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } finally {
      storage.clear();
    }
  },

  checkAuth: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.get<LoginResponse>('/api/auth/login');
    return response.data;
  },
};
```

---

## 3. ホーム / ダッシュボード

### トレーナー

#### `src/api/trainer/homeApi.ts`

```typescript
import axiosInstance from '../axiosConfig';

export interface TrainerHomeResponse {
  // 実際のレスポンス型に合わせて定義
  [key: string]: any;
}

export const trainerHomeApi = {
  getHome: (): Promise<TrainerHomeResponse> =>
    axiosInstance.get<TrainerHomeResponse>('/api/trainers/home').then(res => res.data),
};
```

### 管理者（本部）

#### `src/api/admin/homeApi.ts`

```typescript
import axiosInstance from '../axiosConfig';

export interface AdminHomeResponse {
  // 実際のレスポンス型に合わせて定義
  [key: string]: any;
}

export const adminHomeApi = {
  getHome: (): Promise<AdminHomeResponse> =>
    axiosInstance.get<AdminHomeResponse>('/api/admin/home').then(res => res.data),
};
```

### 店長

#### `src/api/manager/homeApi.ts`

```typescript
import axiosInstance from '../axiosConfig';

export interface ManagerHomeResponse {
  // 実際のレスポンス型に合わせて定義
  [key: string]: any;
}

export const managerHomeApi = {
  getHome: (storeId: string): Promise<ManagerHomeResponse> =>
    axiosInstance.get<ManagerHomeResponse>(`/api/stores/${storeId}/manager/home`).then(res => res.data),
};
```

---

## 4. ユーザー管理

### 管理者（本部）

#### `src/api/admin/usersApi.ts`

```typescript
import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface UserListParams {
  page?: number;
  size?: number;
  name?: string;
  role?: string;
  active?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'TRAINER';
  createdAt: string;
}

export const adminUsersApi = {
  getUsers: (params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<User>>(`/api/admin/users?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getUser: (userId: string): Promise<User> =>
    axiosInstance.get<User>(`/api/admin/users/${userId}`).then(res => res.data),

  createUser: (userData: any): Promise<User> =>
    axiosInstance.post<User>('/api/admin/users', userData).then(res => res.data),

  updateUser: (userId: string, userData: any): Promise<User> =>
    axiosInstance.patch<User>(`/api/admin/users/${userId}`, userData).then(res => res.data),

  deleteUser: (userId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/admin/users/${userId}`).then(res => res.data),
};
```

### 店長

#### `src/api/manager/usersApi.ts`

```typescript
import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'TRAINER';
  createdAt: string;
}

export interface UserListParams {
  page?: number;
  size?: number;
  name?: string;
  role?: string;
  active?: boolean;
}

export const managerUsersApi = {
  getUsers: (storeId: string, params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<User>>(`/api/stores/${storeId}/manager/users?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getUser: (storeId: string, userId: string): Promise<User> =>
    axiosInstance.get<User>(`/api/stores/${storeId}/manager/users/${userId}`).then(res => res.data),

  createUser: (storeId: string, userData: any): Promise<User> =>
    axiosInstance.post<User>(`/api/stores/${storeId}/manager/users`, userData).then(res => res.data),

  updateUser: (storeId: string, userId: string, userData: any): Promise<User> =>
    axiosInstance.patch<User>(`/api/stores/${storeId}/manager/users/${userId}`, userData).then(res => res.data),

  deleteUser: (storeId: string, userId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/stores/${storeId}/manager/users/${userId}`).then(res => res.data),
};
```

---

## 5. 顧客管理

### 管理者（本部）

#### `src/api/admin/customersApi.ts`

```typescript
import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface CustomerListParams {
  page?: number;
  size?: number;
  name?: string;
  kana?: string;
  active?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  shopId: string;
  createdAt: string;
}

export const adminCustomersApi = {
  getCustomers: (params?: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<Customer>>(`/api/admin/customers?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  createCustomer: (customerData: any): Promise<Customer> =>
    axiosInstance.post<Customer>('/api/admin/customers', customerData).then(res => res.data),

  enableCustomer: (customerId: string): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/api/admin/customers/${customerId}/enable`).then(res => res.data),

  disableCustomer: (customerId: string): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/api/admin/customers/${customerId}/disable`).then(res => res.data),

  deleteCustomer: (customerId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/admin/customers/${customerId}`).then(res => res.data),
};
```

### 店長

#### `src/api/manager/customersApi.ts`

```typescript
import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  shopId: string;
  createdAt: string;
}

export interface CustomerListParams {
  page?: number;
  size?: number;
  name?: string;
  kana?: string;
  active?: boolean;
}

export const managerCustomersApi = {
  getCustomers: (storeId: string, params?: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<Customer>>(`/api/stores/${storeId}/manager/customers?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  createCustomer: (storeId: string, customerData: any): Promise<Customer> =>
    axiosInstance.post<Customer>(`/api/stores/${storeId}/manager/customers`, customerData).then(res => res.data),

  enableCustomer: (storeId: string, customerId: string): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/api/stores/${storeId}/manager/customers/${customerId}/enable`).then(res => res.data),

  disableCustomer: (storeId: string, customerId: string): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/api/stores/${storeId}/manager/customers/${customerId}/disable`).then(res => res.data),

  deleteCustomer: (storeId: string, customerId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/stores/${storeId}/manager/customers/${customerId}`).then(res => res.data),
};
```

### トレーナー

#### `src/api/trainer/customersApi.ts`

```typescript
import axiosInstance from '../axiosConfig';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  shopId: string;
  createdAt: string;
}

export const trainerCustomersApi = {
  getCustomers: (storeId: string): Promise<Customer[]> =>
    axiosInstance.get<Customer[]>(`/api/stores/${storeId}/trainers/customers`).then(res => res.data),
};
```

### 顧客プロフィール（共通）

#### `src/api/customerApi.ts`

```typescript
import axiosInstance from './axiosConfig';
import { Customer } from '../types/customer';

export interface VitalsHistory {
  // バイタル履歴の型定義
  [key: string]: any;
}

export const customerApi = {
  getProfile: (customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/api/customers/${customerId}/profile`).then(res => res.data),

  updateProfile: (customerId: string, profileData: any): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/api/customers/${customerId}/profile`, profileData).then(res => res.data),

  getVitalsHistory: (customerId: string): Promise<VitalsHistory> =>
    axiosInstance.get<VitalsHistory>(`/api/customers/${customerId}/vitals/history`).then(res => res.data),
};
```

---

## 6. レッスン管理

### `src/api/lessonApi.ts`

```typescript
import axiosInstance from './axiosConfig';
import { Lesson } from '../types/lesson';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../utils/pagination';

export interface LessonCreateRequest {
  customerId: string;
  storeId: string;
  trainerId: string;
  lessonDate: string;
  trainings: Array<{
    menuName: string;
    weight?: number;
    reps?: number;
    sets?: number;
    duration?: number;
  }>;
}

export const lessonApi = {
  createLesson: (customerId: string, lessonData: LessonCreateRequest): Promise<Lesson> =>
    axiosInstance.post(`/api/customers/${customerId}/lessons`, lessonData).then(res => res.data),

  getLessons: (customerId: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Lesson>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<Lesson>>(`/api/customers/${customerId}/lessons?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getByCustomerId: (customerId: string): Promise<Lesson[]> =>
    axiosInstance.get(`/api/customers/${customerId}/lessons`).then(res => res.data),

  getLesson: (lessonId: string): Promise<Lesson> =>
    axiosInstance.get(`/api/lessons/${lessonId}`).then(res => res.data),

  updateLesson: (lessonId: string, lessonData: any) =>
    axiosInstance.patch(`/api/lessons/${lessonId}`, lessonData).then(res => res.data),
};
```

---

## 7. 姿勢画像管理

### `src/api/postureApi.ts`

```typescript
import axiosInstance from './axiosConfig';

export interface PostureGroup {
  id: string;
  lessonId: string;
  customerId: string;
  // その他のフィールド
  [key: string]: any;
}

export interface PostureImage {
  id: string;
  postureGroupId: string;
  storageKey: string;
  position: string;
  takenAt: string;
  createdAt: string;
  signedUrl: string;
  consentPublication: boolean;
}

export const postureApi = {
  getPostureGroups: (customerId: string): Promise<PostureGroup[]> =>
    axiosInstance.get<PostureGroup[]>(`/api/customers/${customerId}/posture_groups`).then(res => res.data),

  createPostureGroup: (lessonId: string): Promise<PostureGroup> =>
    axiosInstance.post<PostureGroup>(`/api/lessons/${lessonId}/posture_groups`).then(res => res.data),

  uploadImage: async (file: File, postureGroupId: string, position: string): Promise<PostureImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('postureGroupId', postureGroupId);
    formData.append('position', position);
    formData.append('consentPublication', 'false');

    const response = await axiosInstance.post<PostureImage>('/api/posture_images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getBatchSignedUrls: (imageIds: string[], expiresIn: number = 3600): Promise<{ urls: Array<{ imageId: string; signedUrl: string; expiresAt: string }> }> =>
    axiosInstance.post('/api/posture_images/signed-urls', { imageIds, expiresIn }).then(res => res.data),

  deleteImage: (imageId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/posture_images/${imageId}`).then(res => res.data),
};
```

---

## 8. 監査ログ（管理者専用）

### `src/api/admin/logsApi.ts`

```typescript
import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface LogParams {
  page?: number;
  size?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  // その他のフィールド
  [key: string]: any;
}

export const adminLogsApi = {
  getLogs: (params?: LogParams): Promise<PaginatedResponse<AuditLog>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<AuditLog>>(`/api/admin/logs?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },
};
```

---

## 9. React Router ルーティング設計

### `src/routes/AppRouter.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { TrainerHome } from '../pages/trainer/TrainerHome';
// 以下のコンポーネントは実際の実装に合わせてインポートしてください
// import { CustomerSelectPage } from '../pages/trainer/CustomerSelectPage';
// import { UserListPage } from '../pages/admin/UserListPage';
// import { UserDetailPage } from '../pages/admin/UserDetailPage';
// ... その他のページコンポーネント

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/trainer" element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<Navigate to="/trainer/home" replace />} />
          <Route path="home" element={<TrainerHome />} />
          <Route path="customers" element={<CustomerSelectPage />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<Navigate to="/admin/home" replace />} />
          <Route path="home" element={<AdminDashboard />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="users/:userId/detail" element={<UserDetailPage />} />
          <Route path="users/create" element={<UserCreatePage />} />
          <Route path="users/:userId/edit" element={<UserEditPage />} />
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/create" element={<CustomerCreatePage />} />
          <Route path="customers/:customerId/disable" element={<CustomerDisablePage />} />
          <Route path="customers/:customerId/enable" element={<CustomerEnablePage />} />
          <Route path="customers/delete" element={<CustomerDeletePage />} />
          <Route path="logs" element={<AuditLogPage />} />
        </Route>

        <Route path="/manager" element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<Navigate to="/manager/home" replace />} />
          <Route path="home" element={<ManagerDashboard />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="users/:userId/detail" element={<UserDetailPage />} />
          <Route path="users/create" element={<UserCreatePage />} />
          <Route path="users/:userId/edit" element={<UserEditPage />} />
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/create" element={<CustomerCreatePage />} />
          <Route path="customers/:customerId/disable" element={<CustomerDisablePage />} />
          <Route path="customers/:customerId/enable" element={<CustomerEnablePage />} />
          <Route path="customers/delete" element={<CustomerDeletePage />} />
        </Route>

        <Route path="/customer/:customerId" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<CustomerProfilePage />} />
          <Route path="edit" element={<CustomerProfileEditPage />} />
          <Route path="lesson/new" element={<LessonCreatePage />} />
          <Route path="lessons" element={<LessonHistoryPage />} />
          <Route path="vitals" element={<VitalsHistoryPage />} />
          <Route path="posture_groups" element={<PostureGroupListPage />} />
          <Route path="posture/compare" element={<PostureComparePage />} />
        </Route>

        <Route path="/lesson/:lessonId" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<LessonDetailPage />} />
          <Route path="edit" element={<LessonEditPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### ルートとAPIの対応表

| ルートパス | 権限 | 対応するバックエンドAPI |
|-----------|------|----------------------|
| `/login` | Public | `POST /api/auth/login` |
| `/trainer/home` | TRAINER | `GET /api/trainers/home` |
| `/trainer/customers` | TRAINER | `GET /api/stores/{store_id}/trainers/customers` |
| `/admin/home` | ADMIN | `GET /api/admin/home` |
| `/admin/users` | ADMIN | `GET /api/admin/users` |
| `/admin/users/:userId/detail` | ADMIN | `GET /api/admin/users/{user_id}` |
| `/admin/users/create` | ADMIN | `POST /api/admin/users` |
| `/admin/users/:userId/edit` | ADMIN | `PATCH /api/admin/users/{user_id}` |
| `/admin/customers` | ADMIN | `GET /api/admin/customers` |
| `/admin/customers/create` | ADMIN | `POST /api/admin/customers` |
| `/admin/customers/:customerId/disable` | ADMIN | `PATCH /api/admin/customers/{customer_id}/disable` |
| `/admin/customers/:customerId/enable` | ADMIN | `PATCH /api/admin/customers/{customer_id}/enable` |
| `/admin/customers/delete` | ADMIN | `DELETE /api/admin/customers/{customer_id}` |
| `/admin/logs` | ADMIN | `GET /api/admin/logs` |
| `/manager/home` | MANAGER | `GET /api/stores/{store_id}/manager/home` |
| `/manager/users` | MANAGER | `GET /api/stores/{store_id}/manager/users` |
| `/manager/users/:userId/detail` | MANAGER | `GET /api/stores/{store_id}/manager/users/{user_id}` |
| `/manager/users/create` | MANAGER | `POST /api/stores/{store_id}/manager/users` |
| `/manager/users/:userId/edit` | MANAGER | `PATCH /api/stores/{store_id}/manager/users/{user_id}` |
| `/manager/customers` | MANAGER | `GET /api/stores/{store_id}/manager/customers` |
| `/manager/customers/create` | MANAGER | `POST /api/stores/{store_id}/manager/customers` |
| `/manager/customers/:customerId/disable` | MANAGER | `PATCH /api/stores/{store_id}/manager/customers/{customer_id}/disable` |
| `/manager/customers/:customerId/enable` | MANAGER | `PATCH /api/stores/{store_id}/manager/customers/{customer_id}/enable` |
| `/manager/customers/delete` | MANAGER | `DELETE /api/stores/{store_id}/manager/customers/{customer_id}` |
| `/customer/:customerId` | 共通 | `GET /api/customers/{customer_id}/profile` |
| `/customer/:customerId/edit` | 共通 | `PATCH /api/customers/{customer_id}/profile` |
| `/customer/:customerId/lesson/new` | 共通 | `POST /api/customers/{customer_id}/lessons` |
| `/customer/:customerId/lessons` | 共通 | `GET /api/customers/{customer_id}/lessons` |
| `/customer/:customerId/vitals` | 共通 | `GET /api/customers/{customer_id}/vitals/history` |
| `/customer/:customerId/posture_groups` | 共通 | `GET /api/customers/{customer_id}/posture_groups` |
| `/customer/:customerId/posture/compare` | 共通 | `GET /api/customers/{customer_id}/posture_groups` |
| `/lesson/:lessonId` | 共通 | `GET /api/lessons/{lesson_id}` |
| `/lesson/:lessonId/edit` | TRAINER | `PATCH /api/lessons/{lesson_id}` |

---

## 10. 保護されたルート（Protected Route）

### `src/routes/ProtectedRoute.tsx`

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
```

---

## 11. ページネーション変換ユーティリティ

バックエンドはSpring Data JPA形式の `Page<T>` を返しますが、フロントエンドでは統一された形式の `PaginatedResponse<T>` を使用します。変換ユーティリティを作成して使用します。

### `src/utils/pagination.ts`

```typescript
/**
 * ページネーション関連のユーティリティ関数
 * Spring Data JPA形式のPage<T>をフロントエンド形式のPaginatedResponse<T>に変換
 */

/**
 * Spring Data JPA形式のページネーションレスポンス
 */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * フロントエンド形式のページネーションレスポンス
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Spring Data JPA形式のPage<T>をフロントエンド形式のPaginatedResponse<T>に変換
 * @param springPage Spring Data JPA形式のページネーションレスポンス
 * @returns フロントエンド形式のページネーションレスポンス
 */
export function convertPageResponse<T>(springPage: SpringPage<T>): PaginatedResponse<T> {
  return {
    data: springPage.content,
    total: springPage.totalElements,
    page: springPage.number,
    limit: springPage.size,
  };
}
```

**注意**: すべてのページネーション付きAPIでは、バックエンドから返される `SpringPage<T>` を `convertPageResponse` で変換してから返します。

---

## 12. 環境変数設定

### `.env`

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### `.env.example`

```env
VITE_API_BASE_URL=
```

**注意**: Viteでは環境変数に `VITE_` プレフィックスが必要です。環境変数は `import.meta.env.VITE_*` でアクセスします。

---

## 13. 重要な注意点

### 認証方式

- **JWT（JSON Web Token）ベース**
- ログイン成功時にトークンを `sessionStorage` に保存
- 全てのAPIリクエストで `Authorization: Bearer {token}` ヘッダーを自動付与
- 401エラー時は自動的にログアウト・ログインページへリダイレクト

### Axiosインターセプター

- **リクエストインターセプター**: JWTトークンを自動付与
- **レスポンスインターセプター**: 401エラー時に自動ログアウト

### セキュリティ

- `sessionStorage` はタブを閉じるとクリアされる
- トークンはメモリではなく `sessionStorage` で管理
- センシティブな情報（パスワード等）はストレージに保存しない

### ページネーション

- バックエンドはSpring Data JPA形式の `Page<T>` を返す
- フロントエンドでは `convertPageResponse` を使用して `PaginatedResponse<T>` に変換
- すべてのページネーション付きAPIでこの変換を適用する

### 開発環境

- **Vite**を使用した開発環境
- 開発サーバーはデフォルトで `localhost:3000` で起動（`vite.config.ts`で設定可能）
- ビルド出力は `dist/` ディレクトリに生成されます
- 環境変数は `VITE_` プレフィックスが必要で、`import.meta.env.VITE_*` でアクセスします

### CORS

- 同一オリジンなら設定不要
- 別オリジン（例: Vite開発サーバーが `localhost:3000`、バックエンドが `localhost:3001`）の場合はバックエンドでCORS設定が必要
