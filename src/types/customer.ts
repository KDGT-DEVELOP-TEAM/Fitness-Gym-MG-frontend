export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  shopId: string;
}

