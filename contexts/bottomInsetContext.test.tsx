import {
  BottomInsetProvider,
  useBottomInset,
} from "@/contexts/bottomInsetContext";
import {
  fireEvent,
  render,
  renderHook,
} from "@/test-utils/renderWithProviders";
import { Pressable, Text } from "react-native";

const Harness = ({ height }: { height: number }) => {
  const { bottomInset, setBottomInset } = useBottomInset();
  return (
    <Pressable testID="btn" onPress={() => setBottomInset(height)}>
      <Text>{`inset:${bottomInset}`}</Text>
    </Pressable>
  );
};

describe("bottomInsetContext", () => {
  it("starts at zero and publishes the height passed to setBottomInset", async () => {
    const { getByTestId, queryByText } = await render(
      <BottomInsetProvider>
        <Harness height={157} />
      </BottomInsetProvider>,
    );

    expect(queryByText("inset:0")).toBeTruthy();

    await fireEvent.press(getByTestId("btn"));

    expect(queryByText("inset:157")).toBeTruthy();
  });

  it("throws when used outside its provider", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(renderHook(() => useBottomInset())).rejects.toThrow(
      "useBottomInset must be used within a BottomInsetProvider",
    );
    spy.mockRestore();
  });
});
