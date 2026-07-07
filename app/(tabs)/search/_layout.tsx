import { Stack } from "expo-router";

const SearchLayout = () => {
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

export default SearchLayout;
