import { Tabs } from "expo-router";

import CustomTabBar from "@/components/navigation/customTabBar";
import { HapticTab } from "@/components/navigation/hapticTab";
import MusicPlayerModal from "@/components/player/musicPlayerModal";
import SheetModal from "@/components/sheets/sheetModal";
import PopupModal from "@/components/sheets/popupModal";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useTheme } from "@/contexts/themeContext";

/**
 * The signed-in shell: the bottom tab navigator plus the app-wide overlays.
 *
 * @remarks
 * Uses {@link CustomTabBar} (which docks the mini-player above the bar) and
 * {@link HapticTab} buttons. The player modal, sheet, and popup are rendered as
 * siblings of `Tabs` rather than inside a screen, so they float above every tab
 * and survive tab switches. The player modal mounts only when something is
 * playing.
 */
const TabLayout = () => {
  const { currentTrack } = useAudioPlayerContext();

  const { colors } = useTheme();

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarButton: HapticTab,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.primary,
            height: 72,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            marginTop: 4,
          },
        }}
      >
        {/* Redirect-only entry point; href:null keeps it out of the tab bar. */}
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={28}
                name={focused ? "house.fill" : "house"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",

            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={28}
                name={focused ? "book.fill" : "book"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name={"magnifyingglass"} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={28}
                name={focused ? "gearshape.fill" : "gearshape"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      {currentTrack && <MusicPlayerModal />}
      <SheetModal />
      <PopupModal />
    </>
  );
};

export default TabLayout;
