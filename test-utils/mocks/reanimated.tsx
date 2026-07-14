import * as React from "react";
import { Image, ScrollView, Text, View } from "react-native";

type AnyFn = (...args: unknown[]) => unknown;

const createAnimatedComponent = <T,>(Component: T): T => Component;

const Animated = {
  View,
  Text,
  ScrollView,
  Image,
  createAnimatedComponent,
};

export default Animated;

export const useSharedValue = <T,>(initial: T): { value: T } => {
  const ref = React.useRef({ value: initial });
  return ref.current;
};

export const useDerivedValue = <T,>(factory: () => T): { value: T } => {
  const ref = React.useRef({ value: undefined as T });
  ref.current.value = factory();
  return ref.current;
};

export const useAnimatedStyle = <T,>(factory: () => T): T => factory();

export const useAnimatedProps = <T,>(factory: () => T): T => factory();

export const useAnimatedRef = <T,>() => React.useRef<T | null>(null);

export const useScrollOffset = (): { value: number } => {
  const ref = React.useRef({ value: 0 });
  return ref.current;
};

export const useAnimatedReaction = (): void => {};

export const useAnimatedScrollHandler = () => () => {};

export const withTiming = <T,>(
  target: T,
  _config?: unknown,
  callback?: (finished: boolean) => void,
): T => {
  if (typeof callback === "function") callback(true);
  return target;
};

export const withSpring = withTiming;

export const withDelay = <T,>(_delay: number, animation: T): T => animation;

export const withSequence = <T,>(...animations: T[]): T =>
  animations[animations.length - 1];

export const withRepeat = <T,>(animation: T): T => animation;

export const cancelAnimation = (): void => {};

export const makeMutable = <T,>(initial: T): { value: T } => ({
  value: initial,
});

export const runOnJS =
  (fn: AnyFn) =>
  (...args: unknown[]) =>
    fn(...args);

export const runOnUI =
  (fn: AnyFn) =>
  (...args: unknown[]) =>
    fn(...args);

export const measure = () => null;

export const scrollTo = (): void => {};

export const Extrapolation = {
  CLAMP: "clamp",
  EXTEND: "extend",
  IDENTITY: "identity",
} as const;

export const Extrapolate = Extrapolation;

export const interpolate = (
  value: number,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [0, 1],
): number => {
  const inMin = inputRange[0];
  const inMax = inputRange[inputRange.length - 1];
  const outMin = outputRange[0];
  const outMax = outputRange[outputRange.length - 1];
  if (inMax === inMin) return outMin;
  const clamped = Math.max(inMin, Math.min(inMax, value));
  const t = (clamped - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
};

export const interpolateColor = (
  _value: number,
  _inputRange: number[],
  outputRange: string[],
): string => outputRange[0] ?? "#000000";

export const Easing: Record<string, AnyFn> = new Proxy(
  {},
  { get: () => () => 0 },
);
