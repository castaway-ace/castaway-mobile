import apiClient, {
  getValidAccessToken,
  refreshTokens,
  setAuthFailureHandler,
} from "@/api/client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import * as SecureStore from "expo-secure-store";

const REFRESH_URL = "http://api.test/auth/refresh";

let clientMock: MockAdapter;
let axiosMock: MockAdapter;
let onAuthFailure: jest.Mock;

const seedTokens = async (access: string | null, refresh: string | null) => {
  if (access) await SecureStore.setItemAsync("accessToken", access);
  if (refresh) await SecureStore.setItemAsync("refreshToken", refresh);
};

const nowSeconds = () => Math.floor(Date.now() / 1000);

// Builds a JWT whose payload carries `exp` (seconds since epoch). Only the
// payload segment matters here — jwtDecode never verifies the signature — so the
// header and signature are placeholders.
const makeJwt = (expSeconds: number): string => {
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString(
    "base64url",
  );
  return `header.${payload}.signature`;
};

beforeEach(() => {
  clientMock = new MockAdapter(apiClient);
  axiosMock = new MockAdapter(axios);
  onAuthFailure = jest.fn();
  setAuthFailureHandler(onAuthFailure);
});

afterEach(() => {
  clientMock.restore();
  axiosMock.restore();
  setAuthFailureHandler(null);
});

describe("request interceptor", () => {
  it("attaches the stored access token as a Bearer header", async () => {
    await seedTokens("stored-token", null);
    clientMock.onGet("/protected").reply(200, { ok: true });

    await apiClient.get("/protected");

    expect(clientMock.history.get[0].headers?.Authorization).toBe(
      "Bearer stored-token",
    );
  });

  it("omits the header when no token is stored", async () => {
    clientMock.onGet("/public").reply(200, { ok: true });

    await apiClient.get("/public");

    expect(clientMock.history.get[0].headers?.Authorization).toBeUndefined();
  });
});

describe("refreshTokens", () => {
  it("throws when there is no refresh token", async () => {
    await expect(refreshTokens()).rejects.toThrow("No refresh token available");
  });

  it("stores and returns the new access token on success", async () => {
    await seedTokens(null, "refresh-token");
    axiosMock.onPost(REFRESH_URL).reply(200, {
      accessToken: "fresh-access",
      refreshToken: "fresh-refresh",
    });

    const token = await refreshTokens();

    expect(token).toBe("fresh-access");
    await expect(SecureStore.getItemAsync("accessToken")).resolves.toBe(
      "fresh-access",
    );
    await expect(SecureStore.getItemAsync("refreshToken")).resolves.toBe(
      "fresh-refresh",
    );
  });

  it("throws on a malformed refresh response", async () => {
    await seedTokens(null, "refresh-token");
    axiosMock.onPost(REFRESH_URL).reply(200, { accessToken: "only-access" });

    await expect(refreshTokens()).rejects.toThrow("Malformed refresh response");
  });
});

describe("getValidAccessToken", () => {
  it("returns null when no token is stored, without attempting a refresh", async () => {
    await expect(getValidAccessToken()).resolves.toBeNull();
    expect(axiosMock.history.post).toHaveLength(0);
  });

  it("returns the stored token unchanged while it is still valid", async () => {
    const token = makeJwt(nowSeconds() + 3600);
    await seedTokens(token, "refresh-token");

    await expect(getValidAccessToken()).resolves.toBe(token);
    expect(axiosMock.history.post).toHaveLength(0);
  });

  it("refreshes and returns a new token when the stored one has expired", async () => {
    await seedTokens(makeJwt(nowSeconds() - 10), "refresh-token");
    axiosMock.onPost(REFRESH_URL).reply(200, {
      accessToken: "fresh-access",
      refreshToken: "fresh-refresh",
    });

    await expect(getValidAccessToken()).resolves.toBe("fresh-access");
    expect(axiosMock.history.post).toHaveLength(1);
  });

  it("refreshes proactively when the token is within the expiry buffer", async () => {
    // 30s of life left — inside the 60s buffer, so it should refresh ahead of
    // the boundary rather than hand back an about-to-expire token.
    await seedTokens(makeJwt(nowSeconds() + 30), "refresh-token");
    axiosMock.onPost(REFRESH_URL).reply(200, {
      accessToken: "fresh-access",
      refreshToken: "fresh-refresh",
    });

    await expect(getValidAccessToken()).resolves.toBe("fresh-access");
  });

  it("treats an undecodable token as expiring and refreshes", async () => {
    await seedTokens("not-a-jwt", "refresh-token");
    axiosMock.onPost(REFRESH_URL).reply(200, {
      accessToken: "fresh-access",
      refreshToken: "fresh-refresh",
    });

    await expect(getValidAccessToken()).resolves.toBe("fresh-access");
  });

  it("falls back to the stored token when a needed refresh fails", async () => {
    const stale = makeJwt(nowSeconds() - 10);
    await seedTokens(stale, "refresh-token");
    axiosMock.onPost(REFRESH_URL).reply(500);

    await expect(getValidAccessToken()).resolves.toBe(stale);
  });
});

describe("response interceptor — 401 handling", () => {
  it("refreshes the token then retries the original request", async () => {
    await seedTokens("old-access", "refresh-token");
    clientMock.onGet("/protected").replyOnce(401);
    clientMock.onGet("/protected").replyOnce(200, { data: "secret" });
    axiosMock.onPost(REFRESH_URL).reply(200, {
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });

    const response = await apiClient.get("/protected");

    expect(response.data).toEqual({ data: "secret" });
    expect(clientMock.history.get[1].headers?.Authorization).toBe(
      "Bearer new-access",
    );
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it("clears tokens and fires the auth-failure handler when no refresh token exists", async () => {
    await seedTokens("old-access", null);
    clientMock.onGet("/protected").reply(401);

    await expect(apiClient.get("/protected")).rejects.toBeDefined();

    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    await expect(SecureStore.getItemAsync("accessToken")).resolves.toBeNull();
    await expect(SecureStore.getItemAsync("refreshToken")).resolves.toBeNull();
  });

  it("clears tokens and fires the auth-failure handler when the refresh is rejected", async () => {
    await seedTokens("old-access", "refresh-token");
    clientMock.onGet("/protected").reply(401);
    axiosMock.onPost(REFRESH_URL).reply(403);

    await expect(apiClient.get("/protected")).rejects.toBeDefined();

    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    await expect(SecureStore.getItemAsync("accessToken")).resolves.toBeNull();
  });

  it("refreshes only once for concurrent 401s (single-flight)", async () => {
    await seedTokens("old-access", "refresh-token");
    clientMock.onGet("/a").replyOnce(401);
    clientMock.onGet("/a").replyOnce(200, { which: "a" });
    clientMock.onGet("/b").replyOnce(401);
    clientMock.onGet("/b").replyOnce(200, { which: "b" });
    axiosMock.onPost(REFRESH_URL).reply(200, {
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });

    const [a, b] = await Promise.all([
      apiClient.get("/a"),
      apiClient.get("/b"),
    ]);

    expect(a.data).toEqual({ which: "a" });
    expect(b.data).toEqual({ which: "b" });
    expect(axiosMock.history.post).toHaveLength(1);
  });

  it("does not refresh again when the retried request also 401s (_retry guard)", async () => {
    await seedTokens("old-access", "refresh-token");
    clientMock.onGet("/protected").reply(401);
    axiosMock.onPost(REFRESH_URL).reply(200, {
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });

    await expect(apiClient.get("/protected")).rejects.toBeDefined();
    expect(axiosMock.history.post).toHaveLength(1);
  });
});
