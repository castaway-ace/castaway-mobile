import TrackRow from "@/components/media/trackRow";
import { makeArtistRef } from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { StyleProp, StyleSheet, TextStyle } from "react-native";

const artists = [
  makeArtistRef({ id: "ar1", name: "Radiohead" }),
  makeArtistRef({ id: "ar2", name: "Thom Yorke" }),
];

const renderRow = async (props: Partial<Parameters<typeof TrackRow>[0]> = {}) =>
  renderWithProviders(
    <TrackRow
      title="Airbag"
      artists={artists}
      onPress={jest.fn()}
      onOptionsPress={jest.fn()}
      {...props}
    />,
  );

/**
 * The flattened style of a rendered text node.
 *
 * @remarks
 * Takes the node loosely so callers can hand over whatever a query returned
 * without wrestling its test-renderer types.
 */
const styleOf = (node: { props: Record<string, unknown> }): TextStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<TextStyle>);

describe("TrackRow", () => {
  it("renders the title and a comma-joined byline", async () => {
    const { getByText } = await renderRow();

    expect(getByText("Airbag")).toBeTruthy();
    expect(getByText("Radiohead, Thom Yorke")).toBeTruthy();
  });

  it("reports presses on the row and on the overflow control separately", async () => {
    const onPress = jest.fn();
    const onOptionsPress = jest.fn();
    const { getByText } = await renderRow({ onPress, onOptionsPress });

    await fireEvent.press(getByText("Airbag"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onOptionsPress).not.toHaveBeenCalled();

    // IconSymbol is globally stubbed as a Text node of its icon name.
    await fireEvent.press(getByText("ellipsis"));
    expect(onOptionsPress).toHaveBeenCalledTimes(1);
    // The overflow press must not also fire the row underneath it.
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows no indicator and a plain title when inactive", async () => {
    const { queryByLabelText, getByText } = await renderRow({ isActive: false });

    expect(queryByLabelText("Now playing")).toBeNull();
    expect(queryByLabelText("Paused")).toBeNull();
    // The light theme's primary token (tests default to light).
    expect(styleOf(getByText("Airbag")).color).toBe("#1F1A1C");
  });

  it("marks an active, playing row with a pulsing indicator and an accent title", async () => {
    const { getByLabelText, getByText } = await renderRow({
      isActive: true,
      isPlaying: true,
    });

    expect(getByLabelText("Now playing")).toBeTruthy();
    expect(styleOf(getByText("Airbag")).color).toBe("#AE0558");
  });

  it("keeps the indicator but reports it paused when the active row is not playing", async () => {
    const { getByLabelText, queryByLabelText, getByText } = await renderRow({
      isActive: true,
      isPlaying: false,
    });

    // A paused track is still the active one, so the row stays marked.
    expect(getByLabelText("Paused")).toBeTruthy();
    expect(queryByLabelText("Now playing")).toBeNull();
    expect(styleOf(getByText("Airbag")).color).toBe("#AE0558");
  });

  it("exposes its active state to assistive tech", async () => {
    const { getByRole } = await renderRow({ isActive: true, isPlaying: true });

    expect(getByRole("button", { selected: true })).toBeTruthy();
  });
});
