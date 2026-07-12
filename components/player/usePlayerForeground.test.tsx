import { usePlayerForeground } from "@/components/player/usePlayerForeground";
import { Themes } from "@/constants/theme";
import { renderHook } from "@/test-utils/renderWithProviders";

describe("usePlayerForeground", () => {
  it("derives a contrast palette from the cover color", async () => {
    const { result } = await renderHook(() =>
      usePlayerForeground("#FFFFFF", Themes.light),
    );

    expect(result.current.palette).toEqual({
      primary: "#111111",
      secondary: "rgba(17, 17, 17, 0.64)",
    });
    expect(result.current.primaryTextStyle).toEqual({ color: "#111111" });
    expect(result.current.primaryBgStyle).toEqual({
      backgroundColor: "#111111",
    });
  });

  it("falls back to the theme colors when there is no cover color", async () => {
    const { result } = await renderHook(() =>
      usePlayerForeground(undefined, Themes.light),
    );

    expect(result.current.palette).toEqual({
      primary: Themes.light.primary,
      secondary: Themes.light.secondary,
    });
    expect(result.current.secondaryTextStyle).toEqual({
      color: Themes.light.secondary,
    });
  });
});
