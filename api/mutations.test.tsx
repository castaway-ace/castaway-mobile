import { albumApi } from "@/api/albums/api";
import { useAlbumStar } from "@/api/albums/mutations";
import { artistApi } from "@/api/artists/api";
import { useArtistStar } from "@/api/artists/mutations";
import { interactionApi } from "@/api/interactions/api";
import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
  useUpdatePlaylistInteraction,
} from "@/api/interactions/mutations";
import { queryKeys } from "@/api/queryKeys";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import {
  act,
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";
import type { ReactNode } from "react";

const mockShowToast = jest.fn();

jest.mock("@/contexts/toastContext", () => ({
  ToastProvider: ({ children }: { children: ReactNode }) => children,
  useToast: () => ({ showToast: mockShowToast, setBottomInset: jest.fn() }),
}));

jest.mock("@/api/albums/api", () => ({
  ...jest.requireActual("@/api/albums/api"),
  albumApi: { star: jest.fn(), unStar: jest.fn() },
}));

jest.mock("@/api/artists/api", () => ({
  ...jest.requireActual("@/api/artists/api"),
  artistApi: { star: jest.fn(), unStar: jest.fn() },
}));

jest.mock("@/api/interactions/api", () => ({
  interactionApi: {
    createOrUpdateAlbum: jest.fn(),
    createOrUpdateArtist: jest.fn(),
    createOrUpdatePlaylist: jest.fn(),
  },
}));

describe("useAlbumStar", () => {
  it("stars an album, toasts, and invalidates album keys", async () => {
    (albumApi.star as jest.Mock).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHookWithProviders(() => useAlbumStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "album-1", starred: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(albumApi.star).toHaveBeenCalledWith("album-1");
    expect(mockShowToast).toHaveBeenCalledWith("Added to Your Library");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.albums.detail("album-1"),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.albums.all,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.library.all,
    });
  });
});

describe("useArtistStar", () => {
  it("unstars an artist, toasts removed, and invalidates artist keys", async () => {
    (artistApi.unStar as jest.Mock).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHookWithProviders(() => useArtistStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "artist-1", starred: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(artistApi.unStar).toHaveBeenCalledWith("artist-1");
    expect(mockShowToast).toHaveBeenCalledWith("Removed from Your Library");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.artists.all,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.library.all,
    });
  });
});

describe("interaction mutations", () => {
  const cases = [
    {
      name: "useUpdateAlbumInteraction",
      hook: useUpdateAlbumInteraction,
      api: () => interactionApi.createOrUpdateAlbum as jest.Mock,
    },
    {
      name: "useUpdateArtistInteraction",
      hook: useUpdateArtistInteraction,
      api: () => interactionApi.createOrUpdateArtist as jest.Mock,
    },
    {
      name: "useUpdatePlaylistInteraction",
      hook: useUpdatePlaylistInteraction,
      api: () => interactionApi.createOrUpdatePlaylist as jest.Mock,
    },
  ];

  it.each(cases)(
    "$name records the interaction and invalidates both recency-ordered views",
    async ({ hook, api }) => {
      api().mockResolvedValue(undefined);
      const queryClient = createTestQueryClient();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = await renderHookWithProviders(() => hook(), {
        queryClient,
      });

      await act(async () => {
        await result.current.mutateAsync("entity-1");
      });

      expect(api().mock.calls[0][0]).toBe("entity-1");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.interactions,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.library.all,
      });
    },
  );
});
