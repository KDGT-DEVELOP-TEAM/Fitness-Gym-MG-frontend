const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  CUSTOMERS: {
    BASE: `${API_BASE_URL}/customers`,
    BY_ID: (id: string) => `${API_BASE_URL}/customers/${id}`,
  },
  LESSONS: {
    BASE: `${API_BASE_URL}/lessons`,
    BY_ID: (id: string) => `${API_BASE_URL}/lessons/${id}`,
    BY_CUSTOMER: (customerId: string) => `${API_BASE_URL}/lessons/customer/${customerId}`,
  },
  POSTURES: {
    BASE: `${API_BASE_URL}/postures`,
    BY_ID: (id: string) => `${API_BASE_URL}/postures/${id}`,
    BY_CUSTOMER: (customerId: string) => `${API_BASE_URL}/postures/customer/${customerId}`,
    COMPARE: `${API_BASE_URL}/postures/compare`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  SHOPS: {
    BASE: `${API_BASE_URL}/shops`,
    BY_ID: (id: string) => `${API_BASE_URL}/shops/${id}`,
  },
};

