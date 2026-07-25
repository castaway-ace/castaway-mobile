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
const detailKey = queryKeys.tracks.detail("track-1");

// Tests the shared useStarMutation engine — the optimistic-update choreography —
// using tracks as the vehicle. Per-consumer wiring (endpoints, toast copy, and
// which keys are invalidated) is covered in each folder's mutations.test.
describe("useStarMutation (via useTrackStar)", () => {
  it("optimistically writes the flipped value before the request resolves", async () => {
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

    // Flipped in the cache while the request is still in flight.
    expect(queryClient.getQueryData(detailKey)).toMatchObject({
      starred: true,
    });

    await act(async () => {
      resolveStar();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // The optimistic value survives a successful settle — no rollback.
    expect(queryClient.getQueryData(detailKey)).toMatchObject({
      starred: true,
    });
  });

  it("flips to unstarred and calls unStar when the entity is already starred", async () => {
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
    expect(queryClient.getQueryData(detailKey)).toMatchObject({
      starred: false,
    });
  });

  it("rolls back the optimistic value and reconciles on failure", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(detailKey, { id: "track-1", starred: false });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    mockStar.mockRejectedValue(new Error("network"));

    const { result } = await renderHookWithProviders(() => useTrackStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "track-1", starred: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // Rolled back to the pre-tap snapshot, with the shared error toast.
    expect(queryClient.getQueryData(detailKey)).toMatchObject({
      starred: false,
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      "Something went wrong. Please try again.",
    );
    // onSettled runs on the error path too, so the cache is still reconciled
    // against the server rather than left on the rolled-back optimistic value.
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: detailKey });
  });

  it("skips the optimistic write when the entity is not cached", async () => {
    const queryClient = createTestQueryClient();
    // Detail intentionally not seeded: the entity may not be cached when the
    // toggle starts, and onMutate must not write a phantom partial entry.
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    mockStar.mockResolvedValue(undefined);

    const { result } = await renderHookWithProviders(() => useTrackStar(), {
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ id: "track-1", starred: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(detailKey)).toBeUndefined();
    // Still reconciles afterward so the authoritative server value populates it.
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: detailKey });
  });
});
