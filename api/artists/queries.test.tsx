import { artistApi } from "@/api/artists/api";
import { useArtist, useArtistImage } from "@/api/artists/queries";
import { makeArtist } from "@/test-utils/fixtures";
import {
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";

jest.mock("@/api/artists/api", () => ({
  ...jest.requireActual("@/api/artists/api"),
  artistApi: {
    getAll: jest.fn(),
    getOne: jest.fn(),
    getImage: jest.fn(),
    star: jest.fn(),
    unStar: jest.fn(),
  },
}));

const mockGetOne = artistApi.getOne as jest.Mock;
const mockGetImage = artistApi.getImage as jest.Mock;

describe("useArtist", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = await renderHookWithProviders(() => useArtist(undefined));

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetOne).not.toHaveBeenCalled();
  });

  it("fetches the artist when an id is provided", async () => {
    const artist = makeArtist({ id: "artist-1" });
    mockGetOne.mockResolvedValue(artist);

    const { result } = await renderHookWithProviders(() => useArtist("artist-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(artist);
    expect(mockGetOne).toHaveBeenCalledWith("artist-1");
  });
});

describe("useArtistImage", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = await renderHookWithProviders(() =>
      useArtistImage(undefined),
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetImage).not.toHaveBeenCalled();
  });

  it("fetches the image url when an id is provided", async () => {
    mockGetImage.mockResolvedValue("https://img/artist-1.jpg");

    const { result } = await renderHookWithProviders(() =>
      useArtistImage("artist-1"),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("https://img/artist-1.jpg");
    expect(mockGetImage).toHaveBeenCalledWith("artist-1");
  });
});
