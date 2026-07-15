import apiClient from "@/api/client";
import { libraryApi } from "@/api/library/api";
import { makeLibrary } from "@/test-utils/fixtures";
import MockAdapter from "axios-mock-adapter";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe("libraryApi.getAll", () => {
  it("requests /library and returns the list", async () => {
    const library = makeLibrary();
    mock.onGet("/library").reply(200, library);

    expect(await libraryApi.getAll({ limit: 200, offset: 0 })).toEqual(library);
  });

  it("passes pagination through as query params", async () => {
    mock.onGet("/library").reply(200, []);

    await libraryApi.getAll({ limit: 50, offset: 10 });

    expect(mock.history.get[0].params).toEqual({ limit: 50, offset: 10 });
  });
});
