import Ionicons from "@expo/vector-icons/Ionicons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  house: "home-outline",
  magnifyingglass: "search",
  "magnifyingglass.circle.fill": "search-outline",
  "book.fill": "library",
  book: "library-outline",
  "person.fill": "person",
  person: "person-outline",
  "chevron.right": "chevron-forward",
  "chevron.left": "chevron-back",
  "chevron.down": "chevron-down",
  ellipsis: "ellipsis-vertical",
  "plus.circle": "add-circle-outline",
  plus: "add-outline",
  checkmark: "checkmark",
  "minus.circle": "remove-circle-outline",
  "pause.fill": "pause",
  "play.fill": "play",
  "play.circle.fill": "play-circle",
  "pause.circle.fill": "pause-circle",
  heart: "heart-outline",
  "heart.fill": "heart",
  shuffle: "shuffle",
  repeat: "repeat",
  "repeat.1": "repeat",
  "forward.end": "play-skip-forward-outline",
  "backward.end": "play-skip-back-outline",
  "circle.badge.plus": "add-circle-outline",
  "square.stack.fill": "albums",
  "music.note": "musical-note",
  "music.note.list": "musical-notes",
  "gearshape.fill": "settings",
  gearshape: "settings-outline",
  "opticaldisc.fill": "disc-sharp",
} satisfies Record<string, IoniconName>;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export const IconSymbol = ({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) => {
  return (
    <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />
  );
};
