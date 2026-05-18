import { useAuth } from '@/contexts/auth-context';
import { useMutation } from '@tanstack/react-query';

interface LoginCredentials {
    email: string;
    password: string;
    deviceInfo: {
        name: string;
        model: string;
    }
}

export const useLogin = () => {
    const { login } = useAuth();
    return useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) throw new Error('Login failed');
            return response.json();
        },
        onSuccess: async (data) => {
            await login(String(data.accessToken), String(data.refreshToken))
        },
    });
};
