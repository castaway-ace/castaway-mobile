import { artistApi, ArtistOrder } from "@/api/artists/api";
import apiClient from "@/api/client";
import { OrderBy } from "@/constants/api";
import { makeArtist, makeArtistSummary } from "@/test-utils/fixtures";
import MockAdapter from "axios-mock-adapter";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe("artistApi.getAll", () => {
  it("requests /artists with paging params and returns the list", async () => {
    const artists = [
      makeArtistSummary({ id: "a" }),
      makeArtistSummary({ id: "b" }),
    ];
    mock.onGet("/artists").reply(200, artists);

    const result = await artistApi.getAll({
      limit: 15,
      offset: 30,
      order: ArtistOrder.NAME,
      orderBy: OrderBy.ASC,
      starred: true,
    });

    expect(result).toEqual(artists);
    expect(mock.history.get[0].params).toEqual({
      limit: 15,
      offset: 30,
      order: ArtistOrder.NAME,
      orderBy: OrderBy.ASC,
      starred: true,
    });
  });
});

describe("artistApi.getOne", () => {
  it("requests /artists/:id and returns the artist", async () => {
    const artist = makeArtist({ id: "artist-1" });
    mock.onGet("/artists/artist-1").reply(200, artist);

    expect(await artistApi.getOne("artist-1")).toEqual(artist);
  });
});

describe("artistApi.getImage", () => {
  it("requests /artists/:id/image and returns the url string", async () => {
    mock.onGet("/artists/artist-1/image").reply(200, "https://img/artist-1.jpg");

    expect(await artistApi.getImage("artist-1")).toBe(
      "https://img/artist-1.jpg",
    );
  });
});

describe("artistApi.star / unStar", () => {
  it("POSTs to /artists/:id/star", async () => {
    mock.onPost("/artists/artist-1/star").reply(200);

    await expect(artistApi.star("artist-1")).resolves.toBeUndefined();
    expect(mock.history.post[0].url).toBe("/artists/artist-1/star");
  });

  it("DELETEs /artists/:id/star", async () => {
    mock.onDelete("/artists/artist-1/star").reply(200);

    await expect(artistApi.unStar("artist-1")).resolves.toBeUndefined();
    expect(mock.history.delete[0].url).toBe("/artists/artist-1/star");
  });
});
