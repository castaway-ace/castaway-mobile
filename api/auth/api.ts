import {
  AuthResponseSchema,
  AuthResponseType,
  LoginSchemaType,
  SignUpSchemaType,
} from "@/constants/validation";
import type { components } from "@/api/schema";
import * as Device from "expo-device";
import apiClient from "../client";
import { getOrCreateClientId } from "../utils";

type DeviceInfo = components["schemas"]["DeviceDto"];

/**
 * Collects the device metadata sent with every auth request so the backend can
 * bind the session to a device and manage per-device refresh tokens.
 *
 * @remarks
 * The {@link getOrCreateClientId | client id} is the stable key; name and model
 * are best-effort labels and left `undefined` when the OS won't report them.
 */
const buildDeviceInfo = async (): Promise<DeviceInfo> => {
  return {
    clientId: await getOrCreateClientId(),
    name: Device.deviceName ?? undefined,
    model: Device.modelName ?? undefined,
  };
};

/**
 * Shared login/signup flow: posts credentials plus device info and validates the
 * response before trusting it.
 *
 * @remarks
 * Login and signup hit different endpoints but return the same token payload, so
 * the request and — crucially — the response validation live here once. The auth
 * response gates access to the whole app, so it's run through
 * {@link AuthResponseSchema} rather than cast: a malformed body fails loudly here
 * instead of surfacing later as tokens that don't work.
 *
 * @throws {Error} When the server's response doesn't match the expected shape.
 */
const authenticate = async (
  path: "/auth/login" | "/auth/signup",
  credentials: LoginSchemaType | SignUpSchemaType,
): Promise<AuthResponseType> => {
  const response = await apiClient.post(path, {
    ...credentials,
    deviceInfo: await buildDeviceInfo(),
  });

  const parsed = AuthResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new Error("Server returned an invalid auth response");
  }
  return parsed.data;
};

/** Transport layer for authentication. Both methods resolve to a validated token pair. */
export const authApi = {
  /** Authenticates an existing user. */
  login: (credentials: LoginSchemaType) =>
    authenticate("/auth/login", credentials),
  /** Registers a new user, returning tokens for an immediately signed-in session. */
  signup: (credentials: SignUpSchemaType) =>
    authenticate("/auth/signup", credentials),
};
