import apiClient from "@/api/client";
import { AuthProvider, useAuth } from "@/contexts/authContext";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import { act, renderHook, waitFor } from "@/test-utils/renderWithProviders";
import { QueryClientProvider } from "@tanstack/react-query";
import MockAdapter from "axios-mock-adapter";
import * as SecureStore from "expo-secure-store";
import type { ReactNode } from "react";

let mock: MockAdapter;

const user = { id: "u1", email: "user@example.com", name: "User One" };

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

const makeWrapper = () => {
  const client = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  return Wrapper;
};

describe("authContext", () => {
  it("bootstraps to unauthenticated when no token is stored", async () => {
    const { result } = await renderHook(() => useAuth(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("bootstraps the current user when a token is stored", async () => {
    await SecureStore.setItemAsync("accessToken", "tok");
    mock.onGet("/user/me").reply(200, user);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.user).toEqual(user));
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("logs in: persists tokens and loads the user", async () => {
    mock.onGet("/user/me").reply(200, user);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.logIn("access-1", "refresh-1");
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
    await expect(SecureStore.getItemAsync("accessToken")).resolves.toBe(
      "access-1",
    );
    await expect(SecureStore.getItemAsync("refreshToken")).resolves.toBe(
      "refresh-1",
    );
  });

  it("logs out: posts logout, clears tokens and the user", async () => {
    await SecureStore.setItemAsync("accessToken", "tok");
    mock.onGet("/user/me").reply(200, user);
    mock.onPost("/auth/logout").reply(200);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mock.history.post.some((r) => r.url === "/auth/logout")).toBe(true);
    await expect(SecureStore.getItemAsync("accessToken")).resolves.toBeNull();
  });
});
