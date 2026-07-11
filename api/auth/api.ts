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

const buildDeviceInfo = async (): Promise<DeviceInfo> => {
  return {
    clientId: await getOrCreateClientId(),
    name: Device.deviceName ?? undefined,
    model: Device.modelName ?? undefined,
  };
};

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

export const authApi = {
  login: (credentials: LoginSchemaType) =>
    authenticate("/auth/login", credentials),
  signup: (credentials: SignUpSchemaType) =>
    authenticate("/auth/signup", credentials),
};
