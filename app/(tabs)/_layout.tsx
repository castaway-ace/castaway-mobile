import { Tabs } from "expo-router";
import React from "react";

import CustomTabBar from "@/components/(tabs)/custom-tab-bar";
import { HapticTab } from "@/components/(tabs)/haptic-tab";
import Modal from "@/components/(tabs)/modal";
import ModalContent from "@/components/(tabs)/modal/content";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { usePlayerModal } from "@/contexts/player-modal-context";
import { useTheme } from "@/contexts/theme-context";

const TabLayout = () => {
  const { colors } = useTheme();
  const { isOpen, close } = usePlayerModal();
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
          },
          tabBarLabelStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
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
              <IconSymbol
                size={28}
                name={
                  focused ? "magnifyingglass.circle.fill" : "magnifyingglass"
                }
                color={color}
              />
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
      {currentTrack && (
        <Modal
          visible={isOpen}
          onClose={close}
          backgroundColor={colors.background}
        >
          <ModalContent track={currentTrack} />
        </Modal>
      )}
    </>
  );
};

export default TabLayout;
