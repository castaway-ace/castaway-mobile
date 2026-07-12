import { useAnimatedBackground } from "@/components/player/useAnimatedBackground";
import { renderHook } from "@/test-utils/renderWithProviders";

describe("useAnimatedBackground", () => {
  it("uses the provided color as the background", async () => {
    const { result } = await renderHook(() =>
      useAnimatedBackground("#123456", "#000000"),
    );
    expect(result.current).toEqual({ backgroundColor: "#123456" });
  });

  it("falls back to the mute color when no color is given", async () => {
    const { result } = await renderHook(() =>
      useAnimatedBackground(undefined, "#abcdef"),
    );
    expect(result.current).toEqual({ backgroundColor: "#abcdef" });
  });
});
