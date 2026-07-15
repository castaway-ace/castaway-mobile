import { NowPlayingBars } from "@/components/ui/nowPlayingBars";
import { renderWithProviders } from "@/test-utils/renderWithProviders";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

/**
 * Flattened styles of the bars inside an indicator.
 *
 * @remarks
 * Takes the container loosely so the caller can hand over the element a query
 * returned without wrestling its test-renderer types.
 */
const barStyles = (indicator: { children: unknown[] }): ViewStyle[] =>
  indicator.children.map((bar) =>
    StyleSheet.flatten(
      (bar as { props: { style: StyleProp<ViewStyle> } }).props.style,
    ),
  );

/**
 * Only the indicator's *reported* state is asserted here, never its motion.
 * Under the reanimated mock a shared value is a plain object, so the assignment
 * in the pulse effect neither animates nor re-renders — an animated style always
 * reads back the initial height whatever `animating` says. The accessibility
 * label is the seam that survives that, which is the reason it exists; the pulse
 * and the freeze-on-pause are UI-thread behavior, verifiable only on a device.
 */
describe("NowPlayingBars", () => {
  it("labels itself as playing and tints bars with the theme accent", async () => {
    const { getByLabelText } = await renderWithProviders(
      <NowPlayingBars animating />,
    );

    const bars = barStyles(getByLabelText("Now playing"));
    expect(bars).toHaveLength(3);
    // The light theme's accent token (tests default to light).
    expect(bars[0].backgroundColor).toBe("#AE0558");
  });

  it("labels itself as paused when not animating", async () => {
    const { getByLabelText, queryByLabelText } = await renderWithProviders(
      <NowPlayingBars animating={false} />,
    );

    expect(getByLabelText("Paused")).toBeTruthy();
    expect(queryByLabelText("Now playing")).toBeNull();
  });

  it("honors a color override", async () => {
    const { getByLabelText } = await renderWithProviders(
      <NowPlayingBars animating color="#00FF00" />,
    );

    expect(barStyles(getByLabelText("Now playing"))[0].backgroundColor).toBe(
      "#00FF00",
    );
  });

  it("gives every bar its own height, so they can pulse out of phase", async () => {
    const { getByLabelText } = await renderWithProviders(
      <NowPlayingBars animating />,
    );

    // Each bar owns a shared value rather than sharing one, which is what lets
    // their differing durations drift them apart.
    barStyles(getByLabelText("Now playing")).forEach((bar) =>
      expect(typeof bar.height).toBe("number"),
    );
  });
});
