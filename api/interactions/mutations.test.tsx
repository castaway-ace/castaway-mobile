import { interactionApi } from "@/api/interactions/api";
import {
  useUpdateAlbumInteraction,
  useUpdateArtistInteraction,
  useUpdatePlaylistInteraction,
} from "@/api/interactions/mutations";
import { queryKeys } from "@/api/queryKeys";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import { act, renderHookWithProviders } from "@/test-utils/renderWithProviders";

jest.mock("@/api/interactions/api", () => ({
  interactionApi: {
    createOrUpdateAlbum: jest.fn(),
    createOrUpdateArtist: jest.fn(),
    createOrUpdatePlaylist: jest.fn(),
  },
}));

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
