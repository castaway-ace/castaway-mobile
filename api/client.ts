import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const baseUrl = Platform.OS === 'android' 
? 'http://10.0.2.2:3000' 
: 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
  });

export const getAlbumArtUrl = (albumId: string): string => {
  return `${baseUrl}/music/albums/${albumId}/art`;
};

  // Request interceptor for authentication
apiClient.interceptors.request.use(
    async (config) => {
      const token = await SecureStore.getItemAsync('access_token');
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
          const refreshToken = await SecureStore.getItemAsync('refresh_token');
          const { data } = await axios.post(`${process.env.API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          await SecureStore.setItemAsync('access_token', data.accessToken);
          await SecureStore.setItemAsync('refresh_token', data.refreshToken);
          
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