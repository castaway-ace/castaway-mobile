import { Track } from "@/types/tracks";
import { FC } from "react";
import { View } from "react-native";

interface ModalContentProps {
  track: Track;
}

const ModalContent: FC<ModalContentProps> = ({ track }) => {
  return <View></View>;
};

export default ModalContent;
