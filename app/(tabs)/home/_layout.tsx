import { Stack } from "expo-router";

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
