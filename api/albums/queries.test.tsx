import { albumApi } from "@/api/albums/api";
import { useAlbum, useAlbumCover } from "@/api/albums/queries";
import { makeAlbum } from "@/test-utils/fixtures";
import {
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";

jest.mock("@/api/albums/api", () => ({
  ...jest.requireActual("@/api/albums/api"),
  albumApi: {
    getAll: jest.fn(),
    getOne: jest.fn(),
    getCover: jest.fn(),
    star: jest.fn(),
    unStar: jest.fn(),
  },
}));

const mockGetOne = albumApi.getOne as jest.Mock;
const mockGetCover = albumApi.getCover as jest.Mock;

describe("useAlbum", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = await renderHookWithProviders(() => useAlbum(undefined));

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetOne).not.toHaveBeenCalled();
  });

  it("fetches the album when an id is provided", async () => {
    const album = makeAlbum({ id: "album-1" });
    mockGetOne.mockResolvedValue(album);

    const { result } = await renderHookWithProviders(() => useAlbum("album-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(album);
    expect(mockGetOne).toHaveBeenCalledWith("album-1");
  });
});

describe("useAlbumCover", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = await renderHookWithProviders(() => useAlbumCover(undefined));

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetCover).not.toHaveBeenCalled();
  });

  it("fetches the cover url when an id is provided", async () => {
    mockGetCover.mockResolvedValue("https://cover/album-1.jpg");

    const { result } = await renderHookWithProviders(() => useAlbumCover("album-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("https://cover/album-1.jpg");
    expect(mockGetCover).toHaveBeenCalledWith("album-1");
  });
});
