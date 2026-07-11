import apiClient from "@/api/client";
import { trackApi, TrackOrder } from "@/api/tracks/api";
import { OrderBy } from "@/constants/api";
import { makeTrack, makeTrackSummary } from "@/test-utils/fixtures";
import MockAdapter from "axios-mock-adapter";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe("trackApi.getAll", () => {
  it("requests /tracks with paging params and returns the list", async () => {
    const tracks = [
      makeTrackSummary({ id: "a" }),
      makeTrackSummary({ id: "b" }),
    ];
    mock.onGet("/tracks").reply(200, tracks);

    const result = await trackApi.getAll({
      limit: 50,
      offset: 10,
      order: TrackOrder.TITLE,
      orderBy: OrderBy.ASC,
      starred: true,
    });

    expect(result).toEqual(tracks);
    expect(mock.history.get[0].params).toEqual({
      limit: 50,
      offset: 10,
      order: TrackOrder.TITLE,
      orderBy: OrderBy.ASC,
      starred: true,
    });
  });

  it("propagates request errors", async () => {
    mock.onGet("/tracks").reply(500);

    await expect(
      trackApi.getAll({
        limit: 10,
        offset: 0,
        order: TrackOrder.TITLE,
        orderBy: OrderBy.ASC,
        starred: false,
      }),
    ).rejects.toThrow();
  });
});

describe("trackApi.getOne", () => {
  it("requests /tracks/:id and returns the track", async () => {
    const track = makeTrack({ id: "track-1" });
    mock.onGet("/tracks/track-1").reply(200, track);

    expect(await trackApi.getOne("track-1")).toEqual(track);
  });

  it("propagates a 404", async () => {
    mock.onGet("/tracks/missing").reply(404);

    await expect(trackApi.getOne("missing")).rejects.toThrow();
  });
});

describe("trackApi.star / unStar", () => {
  it("POSTs to /tracks/:id/star", async () => {
    mock.onPost("/tracks/track-1/star").reply(200);

    await expect(trackApi.star("track-1")).resolves.toBeUndefined();
    expect(mock.history.post[0].url).toBe("/tracks/track-1/star");
  });

  it("DELETEs /tracks/:id/star", async () => {
    mock.onDelete("/tracks/track-1/star").reply(200);

    await expect(trackApi.unStar("track-1")).resolves.toBeUndefined();
    expect(mock.history.delete[0].url).toBe("/tracks/track-1/star");
  });
});
