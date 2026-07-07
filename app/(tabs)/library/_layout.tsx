import { Stack } from "expo-router";

const LibraryLayout = () => {
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

export default LibraryLayout;
