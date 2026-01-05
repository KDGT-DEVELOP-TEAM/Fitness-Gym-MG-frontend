# バックエンド・フロントエンド整合性確認レポート

## 重大な不一致点

### 1. レッスン作成エンドポイントの不一致

**バックエンド:**
- `POST /api/customers/{customer_id}/lessons`
- `customerId`はパスパラメータとして送信
- リクエストボディには`customerId`を含めない

**フロントエンド:**
- `POST /api/lessons`
- `customerId`をリクエストボディに含める
- `src/api/lessonApi.ts`の`create`メソッド

**影響:**
- レッスン作成が失敗する

**修正方法:**
```typescript
// src/api/lessonApi.ts
create: async (customerId: string, data: Omit<LessonRequest, 'customerId'>): Promise<Lesson> => {
  const response = await axiosInstance.post<Lesson>(
    `/api/customers/${customerId}/lessons`,
    data
  );
  return response.data;
}
```

### 2. LessonRequestのフィールド不一致

**バックエンド (`LessonRequest.java`):**
```java
- customerId: 存在しない（パスパラメータ）
- trainerId: UUID (必須)
- storeId: UUID (必須)
- condition: String (オプショナル)
- weight: BigDecimal (オプショナル、0.0-500.0)
- meal: String (オプショナル)
- memo: String (オプショナル)
- startDate: LocalDateTime (必須)
- endDate: LocalDateTime (必須)
- nextDate: LocalDateTime (オプショナル)
- nextStoreId: UUID (オプショナル)
- nextTrainerId: UUID (オプショナル)
- trainings: List<TrainingRequest> (オプショナル)
- postureGroupId: 存在しない
```

**フロントエンド (`src/types/lesson.ts`):**
```typescript
- customerId: string (必須) ❌ バックエンドには存在しない
- trainerId: string (必須) ✓
- storeId: string (必須) ✓
- condition?: string ✓
- weight?: number | null ✓
- bmi?: number | null ❌ バックエンドには存在しない（レスポンスのみ）
- meal?: string | null ✓
- memo?: string | null ✓
- startDate: string (必須) ✓
- endDate: string (必須) ✓
- nextDate?: string | null ✓
- nextStoreId?: string | null ✓
- nextTrainerId?: string | null ✓
- postureGroupId?: string | null ❌ バックエンドには存在しない
```

**修正方法:**
```typescript
export interface LessonRequest {
  trainerId: string;
  storeId: string;
  condition?: string;
  weight?: number | null;
  meal?: string | null;
  memo?: string | null;
  startDate: string;
  endDate: string;
  nextDate?: string | null;
  nextStoreId?: string | null;
  nextTrainerId?: string | null;
  trainings?: TrainingRequest[];
  // customerId と postureGroupId を削除
}
```

### 3. TrainingRequestの構造不一致

**バックエンド (`TrainingRequest.java`):**
```java
- orderNo: Integer (必須、1以上)
- name: String (必須、100文字以内)
- reps: Integer (必須、1以上)
```

**フロントエンド (`TrainingInput`):**
```typescript
- orderNo?: number (オプショナル) ❌ バックエンドでは必須
- name: string (必須) ✓
- reps: number (必須) ✓
```

**修正方法:**
```typescript
export interface TrainingInput {
  name: string;
  reps: number;
  orderNo: number; // 必須にする
}
```

### 4. LessonResponseの構造不一致

**バックエンド (`LessonResponse.java`):**
```java
- id: UUID
- startDate: LocalDateTime
- endDate: LocalDateTime
- storeName: String (名前のみ)
- trainerName: String (名前のみ)
- customerId: UUID
- customerName: String (名前のみ)
- condition: String
- weight: BigDecimal
- bmi: BigDecimal (計算値)
- meal: String
- memo: String
- nextDate: LocalDateTime
- nextStoreName: String (名前のみ)
- nextTrainerName: String (名前のみ)
- trainings: List<TrainingResponse>
- postureImages: List<PostureImageResponse>
```

**フロントエンド (`Lesson`):**
```typescript
- id: string ✓
- customer: Customer (オブジェクト) ❌ バックエンドは customerId + customerName
- trainer: User (オブジェクト) ❌ バックエンドは trainerName のみ
- store: Store (オブジェクト) ❌ バックエンドは storeName のみ
- startDate: string ✓
- endDate: string ✓
- condition: string | null ✓
- weight: number | null ✓
- bmi: number | null ✓
- meal: string | null ✓
- memo: string | null ✓
- nextDate: string | null ✓
- nextStore?: Store | null ❌ バックエンドは nextStoreName のみ
- nextTrainer?: User | null ❌ バックエンドは nextTrainerName のみ
- postureGroupId?: string | null ✓
- trainings?: TrainingResponse[] ✓
```

**修正方法:**
```typescript
export interface Lesson {
  id: string;
  customerId: string;
  customerName: string;
  trainerName: string;
  storeName: string;
  startDate: string;
  endDate: string;
  condition: string | null;
  weight: number | null;
  bmi: number | null;
  meal: string | null;
  memo: string | null;
  nextDate: string | null;
  nextStoreName: string | null;
  nextTrainerName: string | null;
  postureGroupId?: string | null;
  trainings?: TrainingResponse[];
  postureImages?: PostureImageResponse[];
}
```

### 5. 存在しないエンドポイント

**フロントエンドが使用しているがバックエンドに存在しない:**

1. **`GET /api/lessons/history`**
   - `src/api/lessonApi.ts`の`getHistory`メソッド
   - バックエンドには存在しない

2. **`GET /api/lessons/chart`**
   - `src/api/lessonApi.ts`の`getChartData`メソッド
   - バックエンドには存在しない

3. **`DELETE /api/lessons/{lessonId}`**
   - `src/api/lessonApi.ts`の`delete`メソッド
   - バックエンドには存在しない

**対応方法:**
- バックエンドに実装を追加する
- または、フロントエンドからこれらの機能を削除する

### 6. 日付フォーマット

**バックエンド:**
- `LocalDateTime`を使用（ISO8601形式、例: `2024-01-15T10:30:00`）

**フロントエンド:**
- `datetime-local`入力（`YYYY-MM-DDTHH:mm`形式）
- タイムゾーン情報なし

**対応:**
- `datetime-local`の値はそのまま送信可能（バックエンドがタイムゾーンなしの`LocalDateTime`を期待する場合）
- ただし、ISO8601形式に変換することを推奨

## まとめ

### 優先度：高

1. レッスン作成エンドポイントの修正（`/api/lessons` → `/api/customers/{customerId}/lessons`）
2. `LessonRequest`から`customerId`と`postureGroupId`を削除
3. `TrainingInput`の`orderNo`を必須に変更

### 優先度：中

4. `Lesson`型を`LessonResponse`の構造に合わせて修正（オブジェクト → 文字列名）
5. 存在しないエンドポイント（`/api/lessons/history`、`/api/lessons/chart`、`DELETE /api/lessons/{lessonId}`）の対応

### 優先度：低

6. 日付フォーマットの統一（必要に応じて）

