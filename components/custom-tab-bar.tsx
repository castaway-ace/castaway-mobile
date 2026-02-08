import { useAudioPlayerContext } from "@/contexts/audio-player-context";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import MusicPlayer from "./music-player";

const CustomTabBar = (props: any) => {
  const { currentTrack } = useAudioPlayerContext();

  return (
    <View>
      {currentTrack && <MusicPlayer />}
      <BottomTabBar {...props} />
    </View>
  );
};

export default CustomTabBar;
