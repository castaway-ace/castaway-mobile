import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { BottomTabBar } from "expo-router/js-tabs";
import { StyleSheet, View } from "react-native";
import MusicPlayer from "@/components/player/musicPlayer";

const CustomTabBar = (props: any) => {
  const { currentTrack } = useAudioPlayerContext();

  return (
    <View style={styles.container}>
      {currentTrack && <MusicPlayer />}
      <BottomTabBar {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "transparent",
  },
});

export default CustomTabBar;
