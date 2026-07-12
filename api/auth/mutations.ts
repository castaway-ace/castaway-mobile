import { LoginSchemaType, SignUpSchemaType } from "@/constants/validation";
import { useAuth } from "@/contexts/authContext";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "./api";

/**
 * Login mutation.
 *
 * @remarks
 * On success it hands the returned tokens to {@link useAuth}'s `logIn`, which
 * persists them and flips the app into its authenticated state. The mutation
 * itself intentionally holds no error UI — callers read its `error`/`isPending`
 * to drive the form, keeping this hook a thin bridge between the API and context.
 */
export const useLogin = () => {
  const { logIn } = useAuth();
  return useMutation({
    mutationFn: (credentials: LoginSchemaType) => authApi.login(credentials),
    onSuccess: (data) => logIn(data.accessToken, data.refreshToken),
  });
};

/**
 * Signup mutation. Mirrors {@link useLogin}, routing the new session's tokens
 * through {@link useAuth}'s `signUp` so a registered user is immediately logged in.
 */
export const useSignUp = () => {
  const { signUp } = useAuth();
  return useMutation({
    mutationFn: (credentials: SignUpSchemaType) => authApi.signup(credentials),
    onSuccess: (data) => signUp(data.accessToken, data.refreshToken),
  });
};
