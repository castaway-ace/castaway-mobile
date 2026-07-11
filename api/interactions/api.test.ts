import apiClient from "@/api/client";
import { interactionApi } from "@/api/interactions/api";
import { makeInteractions } from "@/test-utils/fixtures";
import MockAdapter from "axios-mock-adapter";

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe("interactionApi.getAll", () => {
  it("requests /interactions and returns the list", async () => {
    const interactions = makeInteractions();
    mock.onGet("/interactions").reply(200, interactions);

    expect(await interactionApi.getAll()).toEqual(interactions);
  });
});

describe("interactionApi.createOrUpdate*", () => {
  it("POSTs /interactions/albums/:id", async () => {
    mock.onPost("/interactions/albums/album-1").reply(201);

    await expect(
      interactionApi.createOrUpdateAlbum("album-1"),
    ).resolves.toBeUndefined();
    expect(mock.history.post[0].url).toBe("/interactions/albums/album-1");
  });

  it("POSTs /interactions/artists/:id", async () => {
    mock.onPost("/interactions/artists/artist-1").reply(201);

    await expect(
      interactionApi.createOrUpdateArtist("artist-1"),
    ).resolves.toBeUndefined();
    expect(mock.history.post[0].url).toBe("/interactions/artists/artist-1");
  });

  it("POSTs /interactions/playlists/:id", async () => {
    mock.onPost("/interactions/playlists/playlist-1").reply(201);

    await expect(
      interactionApi.createOrUpdatePlaylist("playlist-1"),
    ).resolves.toBeUndefined();
    expect(mock.history.post[0].url).toBe("/interactions/playlists/playlist-1");
  });
});
