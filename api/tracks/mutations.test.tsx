import { queryKeys } from "@/api/queryKeys";
import { trackApi } from "@/api/tracks/api";
import { useTrackStar } from "@/api/tracks/mutations";
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

jest.mock("@/api/tracks/api", () => ({
  ...jest.requireActual("@/api/tracks/api"),
  trackApi: { star: jest.fn(), unStar: jest.fn() },
}));

const mockStar = trackApi.star as jest.Mock;
const mockUnStar = trackApi.unStar as jest.Mock;

// Wiring for the track consumer: correct endpoint, toast copy, and invalidation
// keys. The shared optimistic-update engine is tested in api/starMutation.test.
describe("useTrackStar", () => {
  it("stars a track, toasts, and invalidates the track plus Liked Songs keys", async () => {
    mockStar.mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHookWithProviders(() => useTrackStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "track-1", starred: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockStar).toHaveBeenCalledWith("track-1");
    expect(mockShowToast).toHaveBeenCalledWith("Added to Liked Songs");

    // Liking a track also changes the Liked Songs playlist and the library, so
    // the playlist, interactions, and library caches are refreshed alongside the
    // track's own detail and lists.
    for (const key of [
      queryKeys.tracks.detail("track-1"),
      queryKeys.tracks.all,
      queryKeys.playlists.all,
      queryKeys.interactions,
      queryKeys.library.all,
    ]) {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: key });
    }
  });

  it("unstars a track and toasts the removed message", async () => {
    mockUnStar.mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();

    const { result } = await renderHookWithProviders(() => useTrackStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "track-1", starred: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUnStar).toHaveBeenCalledWith("track-1");
    expect(mockShowToast).toHaveBeenCalledWith("Removed from Liked Songs");
  });
});
