import { BottomInsetProvider } from "@/contexts/bottomInsetContext";
import { ToastProvider, useToast } from "@/contexts/toastContext";
import {
  fireEvent,
  render,
  renderHook,
} from "@/test-utils/renderWithProviders";
import { Pressable, Text } from "react-native";

const Harness = ({ message }: { message: string }) => {
  const { showToast } = useToast();
  return (
    <Pressable testID="btn" onPress={() => showToast(message)}>
      <Text>go</Text>
    </Pressable>
  );
};

describe("toastContext", () => {
  it("renders the message after showToast is called", async () => {
    const { getByTestId, queryByText } = await render(
      <BottomInsetProvider>
        <ToastProvider>
          <Harness message="Saved!" />
        </ToastProvider>
      </BottomInsetProvider>,
    );

    expect(queryByText("Saved!")).toBeNull();

    await fireEvent.press(getByTestId("btn"));

    expect(queryByText("Saved!")).toBeTruthy();
  });

  it("throws when used outside its provider", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(renderHook(() => useToast())).rejects.toThrow(
      "useToast must be used within a ToastProvider",
    );
    spy.mockRestore();
  });
});
