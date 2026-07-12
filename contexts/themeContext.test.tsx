import { Themes } from "@/constants/theme";
import ThemeProvider, { useTheme } from "@/contexts/themeContext";
import { act, renderHook } from "@/test-utils/renderWithProviders";

describe("themeContext", () => {
  it("exposes a theme and switches palettes via changeTheme", async () => {
    const { result } = await renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.colors).toEqual(Themes.light);

    await act(async () => result.current.changeTheme("dark"));

    expect(result.current.theme).toBe("dark");
    expect(result.current.colors).toEqual(Themes.dark);
  });
});
