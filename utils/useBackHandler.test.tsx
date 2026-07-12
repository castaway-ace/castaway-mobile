import { renderHook } from "@/test-utils/renderWithProviders";
import { useBackHandler } from "@/utils/useBackHandler";
import { BackHandler } from "react-native";

describe("useBackHandler", () => {
  it("registers a handler when enabled and removes it on unmount", async () => {
    const remove = jest.fn();
    const addSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockReturnValue({ remove } as unknown as ReturnType<
        typeof BackHandler.addEventListener
      >);
    const onBack = jest.fn();

    const { unmount } = await renderHook(() => useBackHandler(true, onBack));

    expect(addSpy).toHaveBeenCalledWith(
      "hardwareBackPress",
      expect.any(Function),
    );

    const handler = addSpy.mock.calls[0][1] as () => boolean;
    expect(handler()).toBe(true);
    expect(onBack).toHaveBeenCalledTimes(1);

    await unmount();
    expect(remove).toHaveBeenCalledTimes(1);

    addSpy.mockRestore();
  });

  it("registers nothing when disabled", async () => {
    const addSpy = jest.spyOn(BackHandler, "addEventListener");

    await renderHook(() => useBackHandler(false, jest.fn()));

    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
  });
});
