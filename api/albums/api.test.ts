import { albumApi, AlbumOrder } from "@/api/albums/api";
import apiClient from "@/api/client";
import { OrderBy } from "@/constants/api";
import { makeAlbum, makeAlbumSummary } from "@/test-utils/fixtures";
import MockAdapter from "axios-mock-adapter";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe("albumApi.getAll", () => {
  it("requests /albums with paging params and returns the list", async () => {
    const albums = [makeAlbumSummary({ id: "a" }), makeAlbumSummary({ id: "b" })];
    mock.onGet("/albums").reply(200, albums);

    const result = await albumApi.getAll({
      limit: 20,
      offset: 0,
      order: AlbumOrder.YEAR,
      orderBy: OrderBy.DESC,
      starred: false,
    });

    expect(result).toEqual(albums);
    expect(mock.history.get[0].params).toEqual({
      limit: 20,
      offset: 0,
      order: AlbumOrder.YEAR,
      orderBy: OrderBy.DESC,
      starred: false,
    });
  });
});

describe("albumApi.getOne", () => {
  it("requests /albums/:id and returns the album", async () => {
    const album = makeAlbum({ id: "album-1" });
    mock.onGet("/albums/album-1").reply(200, album);

    expect(await albumApi.getOne("album-1")).toEqual(album);
  });
});

describe("albumApi.getCover", () => {
  it("requests /albums/:id/cover and returns the url string", async () => {
    mock.onGet("/albums/album-1/cover").reply(200, "https://cover/album-1.jpg");

    expect(await albumApi.getCover("album-1")).toBe(
      "https://cover/album-1.jpg",
    );
  });
});

describe("albumApi.star / unStar", () => {
  it("POSTs to /albums/:id/star", async () => {
    mock.onPost("/albums/album-1/star").reply(200);

    await expect(albumApi.star("album-1")).resolves.toBeUndefined();
    expect(mock.history.post[0].url).toBe("/albums/album-1/star");
  });

  it("DELETEs /albums/:id/star", async () => {
    mock.onDelete("/albums/album-1/star").reply(200);

    await expect(albumApi.unStar("album-1")).resolves.toBeUndefined();
    expect(mock.history.delete[0].url).toBe("/albums/album-1/star");
  });
});
