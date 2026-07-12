import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * iOS implementation of the app's icon, rendering a native SF Symbol.
 *
 * @remarks
 * Metro picks this `.ios` file over `iconSymbol.tsx` on iOS automatically, so
 * iOS gets crisp native symbols while Android/web fall back to the mapped Ionicon
 * sibling — both from the same `name`. Here `name` is passed straight through
 * since it's already an SF Symbol identifier.
 */
export const IconSymbol = ({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) => {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
};
