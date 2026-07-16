import { makeArtistRef } from "@/test-utils/fixtures";
import { isVariousArtists } from "@/utils/artists";

describe("isVariousArtists", () => {
  it("is true when the flag is set", () => {
    expect(isVariousArtists(makeArtistRef({ isVarious: true }))).toBe(true);
  });

  it("is false for a normal artist", () => {
    expect(isVariousArtists(makeArtistRef())).toBe(false);
  });

  it("is false when the artist is missing", () => {
    expect(isVariousArtists(undefined)).toBe(false);
    expect(isVariousArtists(null)).toBe(false);
  });
});
