import { AuthResponseSchema, AuthResponseType, LoginSchemaType } from '@/constants/schema';
import { useAuth } from '@/contexts/auth-context';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import * as Device from "expo-device";
import apiClient from '../client';
import { getOrCreateClientId } from '../utils';

export const useLogin = () => {
    const { logIn } = useAuth();

    return useMutation({
        mutationFn: async (credentials: LoginSchemaType) => {
            const clientId = await getOrCreateClientId();
            const response = await apiClient.post('/auth/login', {
                ...credentials,
                deviceInfo: {
                    name: Device.deviceName,
                    model: Device.modelName,
                    clientId,
                },
            });
            const parsed = AuthResponseSchema.safeParse(response.data);
            if (!parsed.success) {
                throw new Error("Server returned an invalid auth response");
            }
            return parsed.data;
        },
        onSuccess: async (data: AuthResponseType) => {
            await logIn(data.accessToken, data.refreshToken)
        },
        onError: async (error) => {
            if (isAxiosError(error)) {
                console.log('Requested URL:', error.config?.baseURL, error.config?.url);
                console.log('Status:', error.response?.status);
              } else {
                console.log(error);
              }
        }
    });
};
