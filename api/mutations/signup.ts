import apiClient from '@/api/client';
import { AuthResponseSchema, AuthResponseType, SignUpSchemaType } from '@/constants/schema';
import { useAuth } from '@/contexts/auth-context';
import { useMutation } from '@tanstack/react-query';
import * as Device from "expo-device";
import { getOrCreateClientId } from './utils';

export const useSignUp = () => {
    const { signUp } = useAuth();
    return useMutation({
        mutationFn: async (credentials: SignUpSchemaType) => {
            const clientId = await getOrCreateClientId();
            const response = await apiClient.post('/auth/signup', {
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
            await signUp(data.accessToken, data.refreshToken)
        },
    });
};
