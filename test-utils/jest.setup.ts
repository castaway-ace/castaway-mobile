import { notifyManager } from "@tanstack/react-query";

process.env.EXPO_PUBLIC_API_URL = "http://api.test";

// Flush React Query cache notifications synchronously. By default they are
// batched onto a setTimeout(0) tick, so post-mutation cache updates land after
// the test's act() scope has closed ("not wrapped in act(...)" warnings) and
// leave a dangling timer that keeps the jest worker alive.
notifyManager.setScheduler((cb) => cb());

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    getItemAsync: jest.fn(async (key: string) =>
      store.has(key) ? store.get(key)! : null,
    ),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

jest.mock("expo-crypto", () => {
  let counter = 0;
  return {
    randomUUID: jest.fn(() => `uuid-${++counter}`),
  };
});

jest.mock("expo-device", () => ({
  deviceName: "Test Device",
  modelName: "Test Model",
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(async () => {}),
  notificationAsync: jest.fn(async () => {}),
  selectionAsync: jest.fn(async () => {}),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Image = ({
    source,
    ...props
  }: {
    source?: unknown;
    [key: string]: unknown;
  }) => {
    const uri =
      typeof source === "string"
        ? source
        : source && typeof source === "object" && "uri" in source
          ? (source as { uri?: string }).uri
          : undefined;
    return React.createElement(View, {
      testID: "expo-image",
      accessibilityLabel: uri,
      ...props,
    });
  };
  return { Image };
});

jest.mock("react-native-reanimated", () => require("./mocks/reanimated"));

jest.mock("react-native-worklets", () => ({
  runOnJS:
    (fn: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) =>
      fn(...args),
  runOnUI:
    (fn: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) =>
      fn(...args),
}));

afterEach(() => {
  const SecureStore = require("expo-secure-store");
  SecureStore.__store?.clear?.();
  jest.clearAllMocks();
});
