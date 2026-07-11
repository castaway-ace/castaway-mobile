import apiClient from "@/api/client";
import { searchApi } from "@/api/search/api";
import { makeSearch } from "@/test-utils/fixtures";
import MockAdapter from "axios-mock-adapter";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe("searchApi.get", () => {
  it("requests /search with the query param and returns results", async () => {
    const results = makeSearch();
    mock.onGet("/search").reply(200, results);

    const result = await searchApi.get("beatles");

    expect(result).toEqual(results);
    expect(mock.history.get[0].params).toEqual({ query: "beatles" });
  });
});
