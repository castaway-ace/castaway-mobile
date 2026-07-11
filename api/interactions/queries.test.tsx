import { interactionApi } from "@/api/interactions/api";
import { useInteractions } from "@/api/interactions/queries";
import { makeInteractions } from "@/test-utils/fixtures";
import {
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";

jest.mock("@/api/interactions/api", () => ({
  interactionApi: { getAll: jest.fn() },
}));

const mockGetAll = interactionApi.getAll as jest.Mock;

describe("useInteractions", () => {
  it("fetches the interactions list", async () => {
    const interactions = makeInteractions();
    mockGetAll.mockResolvedValue(interactions);

    const { result } = await renderHookWithProviders(() => useInteractions());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(interactions);
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });
});
