# バックエンド・フロントエンド整合性調査結果（追加）

## 発見された不整合

### 1. 重大: Auth API のレスポンス型不一致（優先度: 高）

**問題**: 
- バックエンド: `LoginResponse`はフラットな構造（`userId`, `email`, `name`, `role`, `token`）
- フロントエンド: `AuthResponse`はネストされた構造（`user: User`, `token: string`）

**影響ファイル**:
- `src/api/authApi.ts` - `login`メソッドが`AuthResponse`を期待しているが、実際は`LoginResponse`が返される
- `src/types/auth.ts` - `AuthResponse`型定義がバックエンドと不一致

**対応**: 
- `AuthResponse`を`LoginResponse`に合わせて修正するか、レスポンス変換ロジックを追加する必要がある

---

### 2. 重大: authApi.getCurrentUser が存在しない（優先度: 高）

**問題**: 
- `AuthContext.tsx`で`authApi.getCurrentUser()`を呼び出しているが、`authApi.ts`に`getCurrentUser`メソッドが存在しない
- バックエンドには`GET /api/auth/login`エンドポイントが存在（認証状態の確認）

**影響ファイル**:
- `src/context/AuthContext.tsx` - `getCurrentUser()`を呼び出しているが未定義
- `src/api/authApi.ts` - `getCurrentUser`メソッドが存在しない

**対応**: 
- `authApi.ts`に`getCurrentUser`メソッドを追加する必要がある
- または、`checkAuth`メソッドを`/auth/login`エンドポイントに修正する必要がある

---

### 3. 重大: userApi.ts のエンドポイント不一致（優先度: 高）

**問題**: 
- `src/api/userApi.ts`は`/users`エンドポイントを使用しているが、バックエンドには存在しない
- バックエンドは`/api/admin/users`または`/api/stores/{store_id}/manager/users`のみ提供

**影響ファイル**:
- `src/api/userApi.ts` - 未使用の可能性があるが、確認が必要

**対応**: 
- `userApi.ts`を削除するか、コメントアウトする必要がある

---

### 4. 中程度: UserResponse型のフィールド不一致（優先度: 中）

**問題**: 
- バックエンド: `UserResponse.active`（boolean）
- フロントエンド: `User.isActive`（boolean）
- バックエンド: `UserResponse.storeIds`（`Set<UUID>`）
- フロントエンド: `User.storeIds`（`string[] | null`）

**影響ファイル**:
- `src/types/api/user.ts` - フィールド名と型が不一致

**対応**: 
- バックエンドの`UserResponse`に合わせて、フロントエンドの`User`型を修正する必要がある
- `active` → `isActive`への変換ロジック、または型定義の統一が必要

---

### 5. 重大: Home API のレスポンス型が完全に不一致（優先度: 高）

**問題**: 
- バックエンド: `HomeResponse`は`recentLessons`, `totalLessonCount`, `chartData`, `upcomingLessons`を含む
- フロントエンド: `AdminHomeResponse`は`stats`と`notices`を含む（全く異なる構造）
- フロントエンド: `ManagerHomeResponse`は`totalCustomers`, `activeCustomers`, `pendingLessons`を含む（全く異なる構造）

**影響ファイル**:
- `src/types/admin/home.ts` - `AdminHomeResponse`がバックエンドと不一致
- `src/types/manager/home.ts` - `ManagerHomeResponse`がバックエンドと不一致
- `src/api/admin/homeApi.ts` - レスポンス型が不一致
- `src/api/manager/homeApi.ts` - レスポンス型が不一致

**対応**: 
- バックエンドの`HomeResponse`に合わせて、フロントエンドの型定義を修正する必要がある
- または、使用しているコンポーネントを確認し、実際に必要なフィールドを特定する必要がある

---

### 6. 情報: Store API の存在確認（優先度: 低）

**問題**: 
- バックエンドに`StoreApiController`が存在しない（調査したが見つからなかった）
- フロントエンドの`src/api/storeApi.ts`は`/stores`エンドポイントを呼び出している

**対応**: 
- 店舗情報の取得方法を確認する必要がある（おそらく`optionsApi`経由で取得）

---

## 修正の優先順位

1. **最優先**: authApi.getCurrentUserの実装（認証機能が動作しない）
2. **高**: Auth APIのレスポンス型不一致（ログイン機能が正しく動作しない可能性）
3. **高**: Home APIのレスポンス型不一致（ダッシュボードが正しく動作しない可能性）
4. **高**: userApi.tsのエンドポイント不一致（未使用の場合は削除）
5. **中**: UserResponse型のフィールド不一致（ユーザー管理機能でエラーが発生する可能性）

