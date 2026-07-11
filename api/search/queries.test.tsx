import { searchApi } from "@/api/search/api";
import { useSearch } from "@/api/search/queries";
import { makeSearch } from "@/test-utils/fixtures";
import {
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";

jest.mock("@/api/search/api", () => ({
  searchApi: { get: jest.fn() },
}));

const mockGet = searchApi.get as jest.Mock;

describe("useSearch", () => {
  it("is disabled for an empty query", async () => {
    const { result } = await renderHookWithProviders(() => useSearch(""));

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("is disabled for a whitespace-only query", async () => {
    const { result } = await renderHookWithProviders(() => useSearch("   "));

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("fetches with the trimmed query", async () => {
    const results = makeSearch();
    mockGet.mockResolvedValue(results);

    const { result } = await renderHookWithProviders(() => useSearch("  beatles "));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(results);
    expect(mockGet).toHaveBeenCalledWith("beatles");
  });
});
