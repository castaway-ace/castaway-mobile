import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const baseUrl = process.env.EXPO_PUBLIC_API_URL

const apiClient = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
  });

  // Request interceptor for authentication
apiClient.interceptors.request.use(
    async (config) => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor for token refresh
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          const { data } = await axios.post(`${baseUrl}/auth/refresh`, {
            refreshToken,
          });
          
          await SecureStore.setItemAsync('accessToken', data.accessToken);
          await SecureStore.setItemAsync('refreshToken', data.refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Handle refresh failure (logout user)
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  export default apiClient;