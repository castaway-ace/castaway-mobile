import { usePathname } from "expo-router";

export type TabLocation = "home" | "library" | "search";

export const useTabLocation = (): TabLocation => {
  const pathname = usePathname();
  if (pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/library")) return "library";
  return "search";
};
