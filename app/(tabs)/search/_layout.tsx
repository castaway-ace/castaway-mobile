import { Stack } from "expo-router";

/** Navigation stack for the Search tab; configured identically to the Home stack (see its layout). */
const SearchLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
};

export default SearchLayout;
