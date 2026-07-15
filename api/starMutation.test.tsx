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
  trackApi: {
    star: jest.fn(),
    unStar: jest.fn(),
  },
}));

const mockStar = trackApi.star as jest.Mock;
const mockUnStar = trackApi.unStar as jest.Mock;
const detailKey = queryKeys.tracks.detail("track-1");

describe("useStarMutation (via useTrackStar)", () => {
  it("optimistically flips starred, toasts, and invalidates on success", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(detailKey, { id: "track-1", starred: false });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    mockStar.mockResolvedValue(undefined);

    const { result } = await renderHookWithProviders(() => useTrackStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "track-1", starred: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockStar).toHaveBeenCalledWith("track-1");
    expect(mockShowToast).toHaveBeenCalledWith("Added to Liked Songs");

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

  it("optimistically sets starred to true while the request is in flight", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(detailKey, { id: "track-1", starred: false });

    let resolveStar: () => void = () => {};
    mockStar.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveStar = resolve;
      }),
    );

    const { result } = await renderHookWithProviders(() => useTrackStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "track-1", starred: false });
    });

    expect(queryClient.getQueryData(detailKey)).toMatchObject({
      starred: true,
    });

    await act(async () => {
      resolveStar();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("calls unStar and toasts the removed message when already starred", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(detailKey, { id: "track-1", starred: true });
    mockUnStar.mockResolvedValue(undefined);

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

  it("rolls back the optimistic update and toasts an error on failure", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(detailKey, { id: "track-1", starred: false });
    mockStar.mockRejectedValue(new Error("network"));

    const { result } = await renderHookWithProviders(() => useTrackStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "track-1", starred: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(detailKey)).toMatchObject({
      starred: false,
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      "Something went wrong. Please try again.",
    );
  });
});
