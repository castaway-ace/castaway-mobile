import { trackApi, TrackOrder } from "@/api/tracks/api";
import { useTrack, useTracks } from "@/api/tracks/queries";
import { OrderBy } from "@/constants/api";
import { makeTrack, makeTrackSummary } from "@/test-utils/fixtures";
import {
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";

jest.mock("@/api/tracks/api", () => ({
  ...jest.requireActual("@/api/tracks/api"),
  trackApi: {
    getAll: jest.fn(),
    getOne: jest.fn(),
    star: jest.fn(),
    unStar: jest.fn(),
  },
}));

const mockGetAll = trackApi.getAll as jest.Mock;
const mockGetOne = trackApi.getOne as jest.Mock;

describe("useTracks", () => {
  it("fetches the first page with default options and reports hasNextPage", async () => {
    const page = [makeTrackSummary({ id: "a" }), makeTrackSummary({ id: "b" })];
    mockGetAll.mockResolvedValue(page);

    const { result } = await renderHookWithProviders(() =>
      useTracks({ limit: 2 }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(page);
    expect(result.current.hasNextPage).toBe(true);
    expect(mockGetAll).toHaveBeenCalledWith({
      limit: 2,
      offset: 0,
      order: TrackOrder.TITLE,
      orderBy: OrderBy.ASC,
      starred: false,
    });
  });

  it("stops paginating when the last page is smaller than the limit", async () => {
    mockGetAll.mockResolvedValue([makeTrackSummary()]);

    const { result } = await renderHookWithProviders(() =>
      useTracks({ limit: 2 }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe("useTrack", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = await renderHookWithProviders(() => useTrack(undefined));

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetOne).not.toHaveBeenCalled();
  });

  it("fetches the track when an id is provided", async () => {
    const track = makeTrack({ id: "track-1" });
    mockGetOne.mockResolvedValue(track);

    const { result } = await renderHookWithProviders(() => useTrack("track-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(track);
    expect(mockGetOne).toHaveBeenCalledWith("track-1");
  });
});
