import {
  PlayerModalProvider,
  usePlayerModal,
} from "@/contexts/playerModalContext";
import { act, renderHook } from "@/test-utils/renderWithProviders";

describe("playerModalContext", () => {
  it("starts closed and toggles open/closed", async () => {
    const { result } = await renderHook(() => usePlayerModal(), {
      wrapper: PlayerModalProvider,
    });

    expect(result.current.isOpen).toBe(false);

    await act(async () => result.current.open());
    expect(result.current.isOpen).toBe(true);

    await act(async () => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("throws when used outside its provider", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(renderHook(() => usePlayerModal())).rejects.toThrow(
      "usePlayerModal must be used within a PlayerModalProvider",
    );
    spy.mockRestore();
  });
});
