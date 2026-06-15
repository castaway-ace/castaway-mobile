import { Tabs } from "expo-router";
import React from "react";

import CustomTabBar from "@/components/(tabs)/custom-tab-bar";
import { HapticTab } from "@/components/(tabs)/haptic-tab";
import MusicPlayerModal from "@/components/(tabs)/musicPlayerModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { useTheme } from "@/contexts/theme-context";
import Modal from "../../components/(tabs)/modal";

const TabLayout = () => {
  const { colors } = useTheme();
  const { currentTrack } = useAudioPlayerContext();

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
            tabBarIcon: ({ color, focused }) => (
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
      <Modal />
    </>
  );
};

export default TabLayout;
