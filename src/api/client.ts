const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      credentials: 'include', // セッションCookie必須
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },

  // multipart/form-data用（画像アップロード）
  async postFormData<T>(url: string, formData: FormData): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
};
