const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
  },
  LESSONS: {
    BASE: '/lessons',
    BY_ID: (id: string) => `/lessons/${id}`,
    BY_CUSTOMER: (customerId: string) => `/lessons/customer/${customerId}`,
  },
  POSTURES: {
    BASE: '/postures',
    BY_ID: (id: string) => `/postures/${id}`,
    BY_CUSTOMER: (customerId: string) => `/postures/customer/${customerId}`,
    COMPARE: '/postures/compare',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  STORES: {
    BASE: '/stores',
    BY_ID: (id: string) => `/stores/${id}`,
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;