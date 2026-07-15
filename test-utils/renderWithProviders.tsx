import { BottomInsetProvider } from "@/contexts/bottomInsetContext";
import ThemeProvider from "@/contexts/themeContext";
import { ToastProvider } from "@/contexts/toastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  renderHook,
  type RenderOptions,
} from "@testing-library/react-native";
import { ReactElement, ReactNode } from "react";
import { createTestQueryClient } from "./createTestQueryClient";

interface ProviderOptions {
  queryClient?: QueryClient;
}

const makeWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BottomInsetProvider>
          <ToastProvider>{children}</ToastProvider>
        </BottomInsetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
  return Wrapper;
};

export const renderWithProviders = async (
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...options
  }: ProviderOptions & Omit<RenderOptions, "wrapper"> = {},
) => {
  const Wrapper = makeWrapper(queryClient);
  const result = await render(ui, { wrapper: Wrapper, ...options });
  return { queryClient, ...result };
};

export const renderHookWithProviders = async <Result, Props>(
  hook: (props: Props) => Result,
  {
    queryClient = createTestQueryClient(),
    initialProps,
  }: ProviderOptions & { initialProps?: Props } = {},
) => {
  const Wrapper = makeWrapper(queryClient);
  const result = await renderHook(hook, { wrapper: Wrapper, initialProps });
  return { queryClient, ...result };
};

export * from "@testing-library/react-native";
