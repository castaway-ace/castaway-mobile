import { renderHook, waitFor } from "@/test-utils/renderWithProviders";
import { useDebouncedValue } from "@/utils/useDebouncedValue";

describe("useDebouncedValue", () => {
  it("returns the initial value immediately", async () => {
    const { result } = await renderHook(() => useDebouncedValue("a", 50));
    expect(result.current).toBe("a");
  });

  it("delays updates until the value settles", async () => {
    const { result, rerender } = await renderHook(
      (props: { value: string }) => useDebouncedValue(props.value, 50),
      { initialProps: { value: "a" } },
    );

    await rerender({ value: "b" });
    expect(result.current).toBe("a");

    await waitFor(() => expect(result.current).toBe("b"));
  });

  it("only emits the latest value across rapid changes", async () => {
    const { result, rerender } = await renderHook(
      (props: { value: string }) => useDebouncedValue(props.value, 50),
      { initialProps: { value: "a" } },
    );

    await rerender({ value: "b" });
    await rerender({ value: "c" });

    await waitFor(() => expect(result.current).toBe("c"));
    expect(result.current).not.toBe("b");
  });
});
