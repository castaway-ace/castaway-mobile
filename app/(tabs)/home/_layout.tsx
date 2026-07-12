import { Stack } from "expo-router";

/**
 * Navigation stack for the Home tab (its index plus the album/artist/playlist
 * detail screens).
 *
 * @remarks
 * Each tab has its own stack so navigation history stays scoped to that tab. The
 * three stacks are configured identically (headerless, cross-fade transitions);
 * see also the library and search layouts.
 */
const HomeStackLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 300,
      }}
    />
  );
};

export default HomeStackLayout;
