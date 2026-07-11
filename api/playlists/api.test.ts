import apiClient from "@/api/client";
import { playlistApi, PlaylistOrder } from "@/api/playlists/api";
import { OrderBy } from "@/constants/api";
import {
  makePlaylist,
  makePlaylistRef,
  makePlaylistSummary,
  makePlaylistTrack,
} from "@/test-utils/fixtures";
import MockAdapter from "axios-mock-adapter";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe("playlistApi.getAll", () => {
  it("requests /playlists with paging params (incl. onlyUser)", async () => {
    const playlists = [makePlaylistSummary({ id: "a" })];
    mock.onGet("/playlists").reply(200, playlists);

    const result = await playlistApi.getAll({
      limit: 25,
      offset: 0,
      order: PlaylistOrder.NAME,
      orderBy: OrderBy.ASC,
      onlyUser: true,
    });

    expect(result).toEqual(playlists);
    expect(mock.history.get[0].params).toEqual({
      limit: 25,
      offset: 0,
      order: PlaylistOrder.NAME,
      orderBy: OrderBy.ASC,
      onlyUser: true,
    });
  });
});

describe("playlistApi.getOne", () => {
  it("requests /playlists/:id and returns the playlist", async () => {
    const playlist = makePlaylist({ id: "playlist-1" });
    mock.onGet("/playlists/playlist-1").reply(200, playlist);

    expect(await playlistApi.getOne("playlist-1")).toEqual(playlist);
  });
});

describe("playlistApi.create", () => {
  it("POSTs /playlists with the name in the body and returns the ref", async () => {
    const ref = makePlaylistRef({ id: "new", name: "Road Trip" });
    mock.onPost("/playlists").reply(201, ref);

    const result = await playlistApi.create("Road Trip");

    expect(result).toEqual(ref);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ name: "Road Trip" });
  });
});

describe("playlistApi.update", () => {
  it("PATCHes /playlists/:id with the body", async () => {
    mock.onPatch("/playlists/playlist-1").reply(200);

    await expect(
      playlistApi.update("playlist-1", { name: "Renamed" }),
    ).resolves.toBeUndefined();
    expect(mock.history.patch[0].url).toBe("/playlists/playlist-1");
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ name: "Renamed" });
  });
});

describe("playlistApi.delete", () => {
  it("DELETEs /playlists/:id", async () => {
    mock.onDelete("/playlists/playlist-1").reply(204);

    await expect(playlistApi.delete("playlist-1")).resolves.toBeUndefined();
    expect(mock.history.delete[0].url).toBe("/playlists/playlist-1");
  });
});

describe("playlistApi.getAllTracks", () => {
  it("requests /playlists/:id/tracks and returns the tracks", async () => {
    const tracks = [makePlaylistTrack({ id: "pt-1" })];
    mock.onGet("/playlists/playlist-1/tracks").reply(200, tracks);

    expect(await playlistApi.getAllTracks("playlist-1")).toEqual(tracks);
  });
});

describe("playlistApi.getTrack", () => {
  it("requests /playlists/:id/tracks/:trackId", async () => {
    const track = makePlaylistTrack({ trackId: "track-9" });
    mock.onGet("/playlists/playlist-1/tracks/track-9").reply(200, track);

    expect(await playlistApi.getTrack("playlist-1", "track-9")).toEqual(track);
  });
});

describe("playlistApi.addTrack / deleteTrack", () => {
  it("POSTs /playlists/:id/tracks/:trackId", async () => {
    mock.onPost("/playlists/playlist-1/tracks/track-9").reply(201);

    await expect(
      playlistApi.addTrack("playlist-1", "track-9"),
    ).resolves.toBeUndefined();
    expect(mock.history.post[0].url).toBe("/playlists/playlist-1/tracks/track-9");
  });

  it("DELETEs /playlists/:id/tracks/:trackId", async () => {
    mock.onDelete("/playlists/playlist-1/tracks/track-9").reply(204);

    await expect(
      playlistApi.deleteTrack("playlist-1", "track-9"),
    ).resolves.toBeUndefined();
    expect(mock.history.delete[0].url).toBe(
      "/playlists/playlist-1/tracks/track-9",
    );
  });
});
