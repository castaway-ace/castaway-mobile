import { libraryApi } from "@/api/library/api";
import { useLibrary } from "@/api/library/queries";
import { makeLibrary } from "@/test-utils/fixtures";
import {
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";
import { LibraryItemType } from "@/types/library";

jest.mock("@/api/library/api", () => ({
  libraryApi: { getAll: jest.fn() },
}));

const mockGetAll = libraryApi.getAll as jest.Mock;

describe("useLibrary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches the library", async () => {
    const library = makeLibrary();
    mockGetAll.mockResolvedValue(library);

    const { result } = await renderHookWithProviders(() => useLibrary());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(library);
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });

  it("defaults to the endpoint's maximum page so nothing is hidden", async () => {
    mockGetAll.mockResolvedValue([]);

    await renderHookWithProviders(() => useLibrary());

    await waitFor(() =>
      expect(mockGetAll).toHaveBeenCalledWith({ limit: 200, offset: 0 }),
    );
  });

  it("merges caller overrides over the defaults", async () => {
    mockGetAll.mockResolvedValue([]);

    await renderHookWithProviders(() => useLibrary({ limit: 10 }));

    await waitFor(() =>
      expect(mockGetAll).toHaveBeenCalledWith({ limit: 10, offset: 0 }),
    );
  });

  it("passes a type filter through to the request", async () => {
    mockGetAll.mockResolvedValue([]);

    await renderHookWithProviders(() =>
      useLibrary({ type: LibraryItemType.ALBUM }),
    );

    await waitFor(() =>
      expect(mockGetAll).toHaveBeenCalledWith({
        limit: 200,
        offset: 0,
        type: LibraryItemType.ALBUM,
      }),
    );
  });

  it("keeps the previous list on screen while a new filter loads", async () => {
    const library = makeLibrary();
    mockGetAll.mockResolvedValue(library);

    const { result, rerender } = await renderHookWithProviders(
      ({ type }: { type?: LibraryItemType }) => useLibrary({ type }),
      { initialProps: {} as { type?: LibraryItemType } },
    );

    await waitFor(() => expect(result.current.data).toEqual(library));

    // Never resolves, so the filtered query stays in flight.
    mockGetAll.mockReturnValue(new Promise(() => {}));
    rerender({ type: LibraryItemType.ARTIST });

    // Without keepPreviousData this would be undefined and the screen would
    // fall back to skeletons on every pill tap.
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(true));
    expect(result.current.data).toEqual(library);
    expect(result.current.isLoading).toBe(false);
  });
});
