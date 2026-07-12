import {
  SheetModalProvider,
  SheetType,
  useSheetModal,
} from "@/contexts/sheetModalContext";
import { act, renderHook } from "@/test-utils/renderWithProviders";

describe("sheetModalContext", () => {
  it("opens with content and closes back to null", async () => {
    const { result } = await renderHook(() => useSheetModal(), {
      wrapper: SheetModalProvider,
    });

    expect(result.current.active).toBeNull();

    await act(async () =>
      result.current.open({ type: SheetType.PLAYLIST, id: "p1" }),
    );
    expect(result.current.active).toEqual({
      type: SheetType.PLAYLIST,
      id: "p1",
    });

    await act(async () => result.current.close());
    expect(result.current.active).toBeNull();
  });

  it("throws when used outside its provider", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(renderHook(() => useSheetModal())).rejects.toThrow(
      "useSheetModal must be used within a SheetModalProvider",
    );
    spy.mockRestore();
  });
});
