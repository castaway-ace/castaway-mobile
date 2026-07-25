import { albumApi } from "@/api/albums/api";
import { useAlbumStar } from "@/api/albums/mutations";
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
