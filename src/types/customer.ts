export interface Customer {
  id: string;
  name: string;
  furigana?: string;
  email?: string;
  phone?: string;
  shopId: string;
  gender?: string;
  birthDate?: string;
  age?: number;
  height?: number;
  address?: string;
  medicalHistory?: string;
  contraindications?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  furigana?: string;
  email?: string;
  phone?: string;
  shopId: string;
  gender?: string;
  birthDate?: string;
  height?: number;
  address?: string;
  medicalHistory?: string;
  contraindications?: string;
  memo?: string;
}

