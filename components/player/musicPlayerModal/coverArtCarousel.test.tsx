import { useAlbumCover } from "@/api/albums/queries";
import CoverArtCarousel from "@/components/player/musicPlayerModal/coverArtCarousel";
import { makeAlbumRef, makeTrack } from "@/test-utils/fixtures";
import { fireEvent, render } from "@/test-utils/renderWithProviders";
import { ComponentProps } from "react";

jest.mock("@/api/albums/queries", () => ({
  useAlbumCover: jest.fn(),
}));

const mockedCover = useAlbumCover as jest.Mock;

const makeAlbumTrack = (id: string) =>
  makeTrack({ id, album: makeAlbumRef({ id: `al-${id}` }) });

const current = makeAlbumTrack("t1");
const previous = makeAlbumTrack("t0");
const next = makeAlbumTrack("t2");

type CarouselProps = ComponentProps<typeof CoverArtCarousel>;

const baseProps: CarouselProps = {
  previousTrack: previous,
  currentTrack: current,
  nextTrack: next,
  stripStyle: {} as CarouselProps["stripStyle"],
  restingLeft: 0,
  width: 0,
  onViewportLayout: jest.fn(),
};

const coverFor = (track: { album: { id: string } }) =>
  `https://cdn/${track.album.id}.jpg`;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCover.mockImplementation((id?: string) => ({
    data: id ? `https://cdn/${id}.jpg` : undefined,
  }));
});

describe("CoverArtCarousel", () => {
  it("renders only the current cover before the viewport is measured", async () => {
    const { getByLabelText, queryByLabelText } = await render(
      <CoverArtCarousel {...baseProps} />,
    );

    expect(getByLabelText(coverFor(current))).toBeTruthy();
    expect(queryByLabelText(coverFor(previous))).toBeNull();
    expect(queryByLabelText(coverFor(next))).toBeNull();
  });

  // Each block resolves its own album rather than reusing the current track's art.
  it("renders each neighbor's own cover once a width is known", async () => {
    const { getByLabelText } = await render(
      <CoverArtCarousel {...baseProps} width={342} />,
    );

    expect(getByLabelText(coverFor(previous))).toBeTruthy();
    expect(getByLabelText(coverFor(current))).toBeTruthy();
    expect(getByLabelText(coverFor(next))).toBeTruthy();
  });

  it("renders an empty slot when a neighbor is missing", async () => {
    const { getByLabelText, queryByLabelText } = await render(
      <CoverArtCarousel {...baseProps} width={342} nextTrack={null} />,
    );

    expect(getByLabelText(coverFor(previous))).toBeTruthy();
    expect(queryByLabelText(coverFor(next))).toBeNull();
    // An absent neighbor skips the query entirely rather than fetching undefined.
    expect(mockedCover).toHaveBeenCalledWith(undefined);
  });

  it("reports the viewport layout to the swipe hook", async () => {
    const onViewportLayout = jest.fn();
    const { getByTestId } = await render(
      <CoverArtCarousel {...baseProps} onViewportLayout={onViewportLayout} />,
    );

    await fireEvent(getByTestId("cover-art-viewport"), "layout", {
      nativeEvent: { layout: { width: 342, height: 342 } },
    });

    expect(onViewportLayout).toHaveBeenCalled();
  });
});
