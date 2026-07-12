import { useTabLocation } from "@/utils/useTabLocation";
import { renderHook } from "@/test-utils/renderWithProviders";
import { usePathname } from "expo-router";

describe("useTabLocation", () => {
  it.each([
    ["/home/index", "home"],
    ["/library/albums/1", "library"],
    ["/search", "search"],
    ["/somewhere/else", "search"],
  ])("maps %s to the %s tab", async (pathname, expected) => {
    (usePathname as jest.Mock).mockReturnValue(pathname);

    const { result } = await renderHook(() => useTabLocation());

    expect(result.current).toBe(expected);
  });
});
