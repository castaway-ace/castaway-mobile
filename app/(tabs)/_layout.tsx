import { Tabs } from "expo-router";
import { useMemo } from "react";
import Toast, { BaseToast, ToastConfig } from "react-native-toast-message";

import CustomTabBar from "@/components/navigation/customTabBar";
import { HapticTab } from "@/components/navigation/hapticTab";
import MusicPlayerModal from "@/components/player/musicPlayerModal";
import SheetModal from "@/components/sheets/sheetModal";
import PopupModal from "@/components/sheets/popupModal";
import { IconSymbol } from "@/components/ui/iconSymbol";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useTheme } from "@/contexts/themeContext";

const TabLayout = () => {
  const { currentTrack } = useAudioPlayerContext();

  const { colors } = useTheme();

  const toastConfig: ToastConfig = useMemo(
    () => ({
      success: (props) => (
        <BaseToast
          {...props}
          style={{
            borderLeftColor: colors.accent,
            backgroundColor: colors.primary,
          }}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          text1Style={{
            fontSize: 16,
            fontWeight: "400",
            color: colors.background,
          }}
        />
      ),
    }),
    [colors],
  );

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
      <Toast config={toastConfig} />
    </>
  );
};

export default TabLayout;
