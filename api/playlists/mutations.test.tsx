import { playlistApi } from "@/api/playlists/api";
import {
  useAddTrackToPlaylist,
  useCreatePlaylist,
  useDeletePlaylist,
  useRemoveTrackFromPlaylist,
  useUpdatePlaylist,
} from "@/api/playlists/mutations";
import { queryKeys } from "@/api/queryKeys";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import {
  act,
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockShowToast = jest.fn();

jest.mock("@/contexts/toastContext", () => ({
  ToastProvider: ({ children }: { children: ReactNode }) => children,
  useToast: () => ({ showToast: mockShowToast, setBottomInset: jest.fn() }),
}));

jest.mock("@/api/playlists/api", () => ({
  ...jest.requireActual("@/api/playlists/api"),
  playlistApi: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addTrack: jest.fn(),
    deleteTrack: jest.fn(),
  },
}));

const invalidatedKeys = (client: QueryClient) => {
  const spy = client.invalidateQueries as jest.Mock;
  return spy.mock.calls.map((call) => call[0].queryKey);
};

const expectInvalidated = (
  client: QueryClient,
  keys: readonly (readonly unknown[])[],
) => {
  const actual = invalidatedKeys(client);
  for (const key of keys) {
    expect(actual).toContainEqual(key);
  }
};

describe("useCreatePlaylist", () => {
  it("creates a playlist, toasts, and invalidates the playlist list", async () => {
    (playlistApi.create as jest.Mock).mockResolvedValue({
      id: "p1",
      name: "Road Trip",
    });
    const queryClient = createTestQueryClient();
    jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHookWithProviders(
      () => useCreatePlaylist(),
      {
        queryClient,
      },
    );

    await act(async () => {
      await result.current.mutateAsync("Road Trip");
    });

    expect(playlistApi.create).toHaveBeenCalledWith("Road Trip");
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith("Playlist created"),
    );
    expectInvalidated(queryClient, [queryKeys.playlists.all]);
  });
});

describe("useUpdatePlaylist", () => {
  it("updates, toasts, and invalidates the detail + list", async () => {
    (playlistApi.update as jest.Mock).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHookWithProviders(
      () => useUpdatePlaylist(),
      {
        queryClient,
      },
    );

    await act(async () => {
      await result.current.mutateAsync({
        id: "p1",
        body: { name: "Renamed" },
      });
    });

    expect(playlistApi.update).toHaveBeenCalledWith("p1", { name: "Renamed" });
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith("Playlist updated"),
    );
    expectInvalidated(queryClient, [
      queryKeys.playlists.detail("p1"),
      queryKeys.playlists.all,
    ]);
  });
});

describe("useDeletePlaylist", () => {
  it("deletes, toasts, and invalidates detail + list + interactions", async () => {
    (playlistApi.delete as jest.Mock).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHookWithProviders(
      () => useDeletePlaylist(),
      {
        queryClient,
      },
    );

    await act(async () => {
      await result.current.mutateAsync("p1");
    });

    expect(playlistApi.delete).toHaveBeenCalledWith("p1");
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith("Playlist deleted"),
    );
    expectInvalidated(queryClient, [
      queryKeys.playlists.detail("p1"),
      queryKeys.playlists.all,
      queryKeys.interactions,
    ]);
  });
});

describe("useAddTrackToPlaylist", () => {
  it("adds a track, toasts the playlist name, and invalidates all sources", async () => {
    (playlistApi.addTrack as jest.Mock).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHookWithProviders(
      () => useAddTrackToPlaylist(),
      {
        queryClient,
      },
    );

    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "p1",
        trackId: "t1",
        playlistName: "Road Trip",
      });
    });

    expect(playlistApi.addTrack).toHaveBeenCalledWith("p1", "t1");
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith("Added to Road Trip"),
    );
    expectInvalidated(queryClient, [
      queryKeys.playlists.detail("p1"),
      queryKeys.playlists.tracks("p1"),
      queryKeys.playlists.all,
      queryKeys.interactions,
    ]);
  });

  it("falls back to a generic toast when no playlist name is given", async () => {
    (playlistApi.addTrack as jest.Mock).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();

    const { result } = await renderHookWithProviders(
      () => useAddTrackToPlaylist(),
      {
        queryClient,
      },
    );

    await act(async () => {
      await result.current.mutateAsync({ playlistId: "p1", trackId: "t1" });
    });

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith("Added to playlist"),
    );
  });
});

describe("useRemoveTrackFromPlaylist", () => {
  it("removes a track, toasts, and invalidates all sources", async () => {
    (playlistApi.deleteTrack as jest.Mock).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHookWithProviders(
      () => useRemoveTrackFromPlaylist(),
      { queryClient },
    );

    await act(async () => {
      await result.current.mutateAsync({ playlistId: "p1", trackId: "t1" });
    });

    expect(playlistApi.deleteTrack).toHaveBeenCalledWith("p1", "t1");
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith("Removed from playlist"),
    );
    expectInvalidated(queryClient, [
      queryKeys.playlists.detail("p1"),
      queryKeys.playlists.tracks("p1"),
      queryKeys.playlists.all,
      queryKeys.interactions,
    ]);
  });
});
