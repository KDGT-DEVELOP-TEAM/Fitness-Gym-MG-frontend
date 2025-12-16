export interface Customer {
  id: string;
  name: string;
  email: string; // DBスキーマでNOT NULL
  phone: string; // DBスキーマでNOT NULL
  shopId: string;
  createdAt: string; // DBスキーマでNOT NULL
  // updatedAt: DBスキーマに存在しないため削除
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  shopId: string;
}

