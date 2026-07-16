import { notifyManager } from "@tanstack/react-query";
import type { ReactNode } from "react";

process.env.EXPO_PUBLIC_API_URL = "http://api.test";

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
      // Forwarded as well as reduced to `uri` above, so tests can tell a missing
      // source apart from a local `require`d asset — both of which have no uri.
      source,
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

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    SafeAreaProvider: ({ children }: { children?: ReactNode }) => children,
    SafeAreaView: ({
      children,
      edges,
      ...props
    }: {
      children?: ReactNode;
      edges?: unknown;
    }) => React.createElement(View, props, children),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    SafeAreaInsetsContext: React.createContext(insets),
  };
});

jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");
  const chain: unknown = new Proxy(() => chain, { get: () => () => chain });
  const Gesture = new Proxy({}, { get: () => () => chain });
  return {
    GestureDetector: ({ children }: { children?: ReactNode }) => children,
    GestureHandlerRootView: ({ children }: { children?: ReactNode }) =>
      React.createElement(View, null, children),
    Gesture,
    State: {},
    Directions: {},
  };
});

jest.mock("@/components/ui/iconSymbol", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    IconSymbol: ({ name }: { name?: string }) =>
      React.createElement(Text, null, name),
  };
});

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const router = {
    navigate: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    dismiss: jest.fn(),
    setParams: jest.fn(),
  };
  const Stack = ({ children }: { children?: ReactNode }) => children;
  Stack.Screen = () => null;
  return {
    router,
    useRouter: () => router,
    useSegments: jest.fn(() => []),
    useLocalSearchParams: jest.fn(() => ({})),
    usePathname: jest.fn(() => "/"),
    Link: ({ children }: { children?: ReactNode }) =>
      React.createElement(Text, null, children),
    Stack,
    Redirect: () => null,
  };
});

afterEach(() => {
  const SecureStore = require("expo-secure-store");
  SecureStore.__store?.clear?.();
  jest.clearAllMocks();
});
