import { Stack } from "expo-router";

/** Navigation stack for the Library tab; configured identically to the Home stack (see its layout). */
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
