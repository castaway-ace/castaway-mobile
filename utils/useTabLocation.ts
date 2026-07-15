import { usePathname } from "expo-router";

export type TabLocation = "home" | "library" | "search";

/**
 * Identifies which tab the current route lives under.
 *
 * @remarks
 * Detail screens (album/artist/playlist) are reachable from all three tabs, so
 * navigation must stay within the originating tab's stack. Call sites use this to
 * build in-tab paths like `/(tabs)/${location}/albums/:id`.
 *
 * Falls back to `home` for routes with no stack of their own — settings is a leaf
 * file, but the player and sheets render above every tab, so navigating away from
 * there has to land somewhere. Home is the app's default tab.
 */
export const useTabLocation = (): TabLocation => {
  const pathname = usePathname();
  if (pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/library")) return "library";
  if (pathname.startsWith("/search")) return "search";
  return "home";
};
