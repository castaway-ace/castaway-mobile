import TrackInfoCarousel from "@/components/player/trackInfoCarousel";
import { makeArtistRef, makeTrack } from "@/test-utils/fixtures";
import { fireEvent, render } from "@/test-utils/renderWithProviders";
import { ComponentProps } from "react";

const makeNamedTrack = (id: string, title: string, artist: string) =>
  makeTrack({
    id,
    title,
    artists: [makeArtistRef({ id: `ar-${id}`, name: artist })],
  });

const current = makeNamedTrack("t1", "Reckoner", "Radiohead");
const previous = makeNamedTrack("t0", "Nude", "Thom Yorke");
const next = makeNamedTrack("t2", "House of Cards", "Jonny Greenwood");

type CarouselProps = ComponentProps<typeof TrackInfoCarousel>;

// Reanimated's animated styles can't be constructed by hand, and the mock ignores
// them anyway — these only need to satisfy the prop types.
const animatedTextStyle = {} as CarouselProps["primaryTextStyle"];
const animatedStripStyle = {} as CarouselProps["stripStyle"];

// The strip can't be dragged here (the gesture-handler mock never invokes pan
// callbacks), so these cover what layout and rendering do on their own.
const baseProps: CarouselProps = {
  previousTrack: previous,
  currentTrack: current,
  nextTrack: next,
  titleStyle: { fontSize: 18 },
  artistStyle: { fontSize: 14 },
  primaryTextStyle: animatedTextStyle,
  secondaryTextStyle: animatedTextStyle,
  stripStyle: animatedStripStyle,
  restingLeft: 0,
  width: 0,
  onViewportLayout: jest.fn(),
};

describe("TrackInfoCarousel", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders only the current track before the viewport is measured", async () => {
    const { getByText, queryByText } = await render(
      <TrackInfoCarousel {...baseProps} />,
    );

    expect(getByText("Reckoner")).toBeTruthy();
    expect(queryByText("Nude")).toBeNull();
    expect(queryByText("House of Cards")).toBeNull();
  });

  // Width arrives as a prop from useTrackSwipe, so a non-zero width *is* "measured"
  // from this component's side; the layout event only feeds the hook.
  it("renders both neighbors once a width is known", async () => {
    const { getByText } = await render(
      <TrackInfoCarousel {...baseProps} width={300} />,
    );

    expect(getByText("Nude")).toBeTruthy();
    expect(getByText("Reckoner")).toBeTruthy();
    expect(getByText("House of Cards")).toBeTruthy();
  });

  it("reports the viewport layout to the swipe hook", async () => {
    const onViewportLayout = jest.fn();
    const { getByTestId } = await render(
      <TrackInfoCarousel {...baseProps} onViewportLayout={onViewportLayout} />,
    );

    await fireEvent(getByTestId("track-info-viewport"), "layout", {
      nativeEvent: { layout: { width: 300, height: 60 } },
    });

    expect(onViewportLayout).toHaveBeenCalled();
  });

  it("renders an empty slot when a neighbor is missing", async () => {
    const { getByText, queryByText } = await render(
      <TrackInfoCarousel {...baseProps} width={300} nextTrack={null} />,
    );

    expect(getByText("Nude")).toBeTruthy();
    expect(queryByText("House of Cards")).toBeNull();
  });

  it("hands the artist press the track it came from", async () => {
    const onArtistPress = jest.fn();
    const { getByText } = await render(
      <TrackInfoCarousel
        {...baseProps}
        width={300}
        onArtistPress={onArtistPress}
      />,
    );

    await fireEvent.press(getByText("Radiohead"));
    expect(onArtistPress).toHaveBeenCalledWith(current);

    // The whole reason the handler takes a track: a peeking neighbor's line has to
    // navigate to its own artist, not the centered track's.
    await fireEvent.press(getByText("Thom Yorke"));
    expect(onArtistPress).toHaveBeenLastCalledWith(previous);
  });
});
