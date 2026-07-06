import type { components } from '@/schema';
import axios, { AxiosError, isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

type RefreshResponse = components['schemas']['AuthTokensEntity'];

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

let refreshPromise: Promise<string> | null = null;

let onAuthFailure: (() => void) | null = null;

export function setAuthFailureHandler(handler: (() => void) | null) {
  onAuthFailure = handler;
}

export const refreshTokens = async (): Promise<string> => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const { data } = await axios.post<RefreshResponse>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
  );

  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error('Malformed refresh response');
  }

  await SecureStore.setItemAsync('accessToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
  return data.accessToken;
}

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshTokens().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        let isAuthRejection = false;
        
        if (isAxiosError(refreshError)) {
          const status = refreshError.response?.status;
          isAuthRejection = status === 401 || status === 403;
        }

        if (isAuthRejection) {
          await SecureStore.deleteItemAsync('accessToken').catch(() => {});
          await SecureStore.deleteItemAsync('refreshToken').catch(() => {});
          onAuthFailure?.();
        }

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient