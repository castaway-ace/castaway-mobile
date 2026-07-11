import { buildPlaylistCover } from "@/utils/playlist";

describe("buildPlaylistCover", () => {
  it("returns an empty array for undefined or empty input", () => {
    expect(buildPlaylistCover(undefined)).toEqual([]);
    expect(buildPlaylistCover([])).toEqual([]);
  });

  it("returns the single url unchanged", () => {
    expect(buildPlaylistCover(["a"])).toEqual(["a"]);
  });

  it("mirrors two covers into a 2x2 grid", () => {
    expect(buildPlaylistCover(["a", "b"])).toEqual(["a", "b", "b", "a"]);
  });

  it("repeats the first cover to fill the grid for three covers", () => {
    expect(buildPlaylistCover(["a", "b", "c"])).toEqual(["a", "b", "c", "a"]);
  });

  it("uses the first four covers as-is", () => {
    expect(buildPlaylistCover(["a", "b", "c", "d"])).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("caps at the first four covers when given more", () => {
    expect(buildPlaylistCover(["a", "b", "c", "d", "e", "f"])).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});
