import { usePathname } from "expo-router";

export type TabLocation = "home" | "library" | "search";

/**
 * Identifies which tab the current route lives under.
 *
 * @remarks
 * Detail screens (album/artist/playlist) are reachable from all three tabs, so
 * navigation must stay within the originating tab's stack. Call sites use this to
 * build in-tab paths like `/(tabs)/${location}/albums/:id`. Defaults to `search`
 * when the path matches neither home nor library.
 */
export const useTabLocation = (): TabLocation => {
  const pathname = usePathname();
  if (pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/library")) return "library";
  return "search";
};
