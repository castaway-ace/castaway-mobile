import { Stack } from "expo-router";

/** Navigation stack for the signed-out flow (login and signup), headerless with cross-fade transitions. */
const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
};

export default AuthLayout;
