import Ionicons from "@expo/vector-icons/Ionicons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

/**
 * SF Symbol name → Ionicons name. Call sites always use the SF Symbol vocabulary
 * (so the iOS and non-iOS implementations share one API); this table translates
 * each to its closest Ionicon for Android/web. Any name used in the app must have
 * an entry here — `satisfies` makes a missing or misspelled Ionicon a type error.
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
 * Android/web implementation of the app's icon, rendering an Ionicon.
 *
 * @remarks
 * This is the default of a platform-split pair: Metro resolves `iconSymbol.tsx`
 * on Android/web and `iconSymbol.ios.tsx` (native SF Symbols) on iOS, so both
 * platforms are driven by the same `name` prop from a single call site. `name`
 * is an SF Symbol identifier, mapped to an Ionicon via {@link MAPPING}.
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
