import { playlistApi } from "@/api/playlists/api";
import {
  usePlaylist,
  usePlaylistsContainingTrack,
  usePlaylistTrack,
  usePlaylistTracks,
} from "@/api/playlists/queries";
import { makePlaylist, makePlaylistTrack } from "@/test-utils/fixtures";
import {
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";

jest.mock("@/api/playlists/api", () => ({
  ...jest.requireActual("@/api/playlists/api"),
  playlistApi: {
    getAll: jest.fn(),
    getOne: jest.fn(),
    getAllTracks: jest.fn(),
    getTrack: jest.fn(),
  },
}));

const mockGetOne = playlistApi.getOne as jest.Mock;
const mockGetAllTracks = playlistApi.getAllTracks as jest.Mock;
const mockGetTrack = playlistApi.getTrack as jest.Mock;

describe("usePlaylist", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = await renderHookWithProviders(() =>
      usePlaylist(undefined),
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetOne).not.toHaveBeenCalled();
  });

  it("fetches the playlist when an id is provided", async () => {
    const playlist = makePlaylist({ id: "playlist-1" });
    mockGetOne.mockResolvedValue(playlist);

    const { result } = await renderHookWithProviders(() =>
      usePlaylist("playlist-1"),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(playlist);
    expect(mockGetOne).toHaveBeenCalledWith("playlist-1");
  });
});

describe("usePlaylistTracks", () => {
  it("does not fetch when playlistId is undefined", async () => {
    const { result } = await renderHookWithProviders(() =>
      usePlaylistTracks(undefined),
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetAllTracks).not.toHaveBeenCalled();
  });

  it("fetches the playlist tracks when a playlistId is provided", async () => {
    const tracks = [makePlaylistTrack({ id: "pt-1" })];
    mockGetAllTracks.mockResolvedValue(tracks);

    const { result } = await renderHookWithProviders(() =>
      usePlaylistTracks("playlist-1"),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(tracks);
    expect(mockGetAllTracks).toHaveBeenCalledWith("playlist-1");
  });
});

describe("usePlaylistTrack", () => {
  it("does not fetch until both playlistId and trackId are provided", async () => {
    const { result } = await renderHookWithProviders(() =>
      usePlaylistTrack("playlist-1", undefined),
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetTrack).not.toHaveBeenCalled();
  });

  it("fetches a single playlist track", async () => {
    const track = makePlaylistTrack({ trackId: "track-9" });
    mockGetTrack.mockResolvedValue(track);

    const { result } = await renderHookWithProviders(() =>
      usePlaylistTrack("playlist-1", "track-9"),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(track);
    expect(mockGetTrack).toHaveBeenCalledWith("playlist-1", "track-9");
  });
});

describe("usePlaylistsContainingTrack", () => {
  it("returns an empty set when trackId is undefined", async () => {
    const { result } = await renderHookWithProviders(() =>
      usePlaylistsContainingTrack(["p1", "p2"], undefined),
    );

    expect(result.current.size).toBe(0);
  });

  it("returns the ids of playlists that contain the track", async () => {
    mockGetAllTracks.mockImplementation((playlistId: string) =>
      Promise.resolve(
        playlistId === "p1" ? [makePlaylistTrack({ trackId: "t1" })] : [],
      ),
    );

    const { result } = await renderHookWithProviders(() =>
      usePlaylistsContainingTrack(["p1", "p2"], "t1"),
    );

    await waitFor(() => expect(result.current.size).toBe(1));
    expect(result.current.has("p1")).toBe(true);
    expect(result.current.has("p2")).toBe(false);
  });
});
