import { artistApi } from "@/api/artists/api";
import { useArtistStar } from "@/api/artists/mutations";
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

jest.mock("@/api/artists/api", () => ({
  ...jest.requireActual("@/api/artists/api"),
  artistApi: { star: jest.fn(), unStar: jest.fn() },
}));

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
