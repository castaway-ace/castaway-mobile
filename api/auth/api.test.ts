import { authApi } from "@/api/auth/api";
import apiClient from "@/api/client";
import MockAdapter from "axios-mock-adapter";

let mock: MockAdapter;

const credentials = { email: "user@example.com", password: "hunter2hunter2" };

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe("authApi.login", () => {
  it("POSTs /auth/login with credentials + deviceInfo and returns tokens", async () => {
    mock.onPost("/auth/login").reply(200, {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const result = await authApi.login(credentials);

    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const body = JSON.parse(mock.history.post[0].data);
    expect(body).toMatchObject({
      email: credentials.email,
      password: credentials.password,
      deviceInfo: {
        clientId: expect.any(String),
        name: "Test Device",
        model: "Test Model",
      },
    });
  });

  it("throws when the response fails schema validation", async () => {
    mock.onPost("/auth/login").reply(200, { accessToken: "" });

    await expect(authApi.login(credentials)).rejects.toThrow(
      "Server returned an invalid auth response",
    );
  });
});

describe("authApi.signup", () => {
  it("POSTs /auth/signup with credentials + deviceInfo and returns tokens", async () => {
    mock.onPost("/auth/signup").reply(201, {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const result = await authApi.signup({
      userName: "newuser",
      ...credentials,
    });

    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    const body = JSON.parse(mock.history.post[0].data);
    expect(body).toMatchObject({
      userName: "newuser",
      email: credentials.email,
      deviceInfo: { clientId: expect.any(String) },
    });
  });
});
