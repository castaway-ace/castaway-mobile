import { baseUrl } from '@/api/client';
import { AuthResponseSchema, AuthResponseType, SignUpSchemaType } from '@/constants/auth';
import { useAuth } from '@/contexts/auth-context';
import { useMutation } from '@tanstack/react-query';
import * as Device from "expo-device";
import * as SecureStore from 'expo-secure-store';


export const useSignUp = () => {
    const { login } = useAuth();
    return useMutation({
        mutationFn: async (credentials: SignUpSchemaType) => {
            const clientId = await SecureStore.getItemAsync("clientId");
            const data = {
                ...credentials,
                deviceInfo: {
                    name: Device.deviceName,
                    model: Device.modelName,
                    clientId,
                }
            }
            const response = await fetch(`${baseUrl}/auth/signup`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message ?? "Sign up failed");
            }
            const json = await response.json();
            const parsed = AuthResponseSchema.safeParse(json);
            if (!parsed.success) {
            throw new Error("Server returned an invalid auth response");
            }
            return parsed.data;
        },
        onSuccess: async (data: AuthResponseType) => {
            await login(data.accessToken, data.refreshToken)
        },
    });
};
