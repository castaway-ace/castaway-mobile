import { authApi } from "@/api/auth/api";
import { useLogin, useSignUp } from "@/api/auth/mutations";
import {
  act,
  renderHookWithProviders,
} from "@/test-utils/renderWithProviders";

const mockLogIn = jest.fn();
const mockSignUp = jest.fn();

jest.mock("@/contexts/authContext", () => ({
  useAuth: () => ({ logIn: mockLogIn, signUp: mockSignUp }),
}));

jest.mock("@/api/auth/api", () => ({
  authApi: { login: jest.fn(), signup: jest.fn() },
}));

const tokens = { accessToken: "access-1", refreshToken: "refresh-1" };
const credentials = { email: "user@example.com", password: "hunter2hunter2" };

describe("useLogin", () => {
  it("logs in and establishes the session with the returned tokens", async () => {
    (authApi.login as jest.Mock).mockResolvedValue(tokens);

    const { result } = await renderHookWithProviders(() => useLogin());

    await act(async () => {
      await result.current.mutateAsync(credentials);
    });

    expect(authApi.login).toHaveBeenCalledWith(credentials);
    expect(mockLogIn).toHaveBeenCalledWith("access-1", "refresh-1");
  });
});

describe("useSignUp", () => {
  it("signs up and establishes the session with the returned tokens", async () => {
    (authApi.signup as jest.Mock).mockResolvedValue(tokens);
    const signUpValues = { userName: "newuser", ...credentials };

    const { result } = await renderHookWithProviders(() => useSignUp());

    await act(async () => {
      await result.current.mutateAsync(signUpValues);
    });

    expect(authApi.signup).toHaveBeenCalledWith(signUpValues);
    expect(mockSignUp).toHaveBeenCalledWith("access-1", "refresh-1");
  });
});
