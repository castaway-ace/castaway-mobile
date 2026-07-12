import { Redirect } from "expo-router";

/** Default tabs entry — immediately redirects to Home, the app's landing tab. */
const Index = () => {
  return <Redirect href="/(tabs)/home" />;
};

export default Index;
