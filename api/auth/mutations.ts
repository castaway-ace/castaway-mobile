import { LoginSchemaType, SignUpSchemaType } from "@/constants/validation";
import { useAuth } from "@/contexts/authContext";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "./api";

export const useLogin = () => {
  const { logIn } = useAuth();
  return useMutation({
    mutationFn: (credentials: LoginSchemaType) => authApi.login(credentials),
    onSuccess: (data) => logIn(data.accessToken, data.refreshToken),
  });
};

export const useSignUp = () => {
  const { signUp } = useAuth();
  return useMutation({
    mutationFn: (credentials: SignUpSchemaType) => authApi.signup(credentials),
    onSuccess: (data) => signUp(data.accessToken, data.refreshToken),
  });
};
