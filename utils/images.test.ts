import { presignedImageSource } from "@/utils/images";

// Two signings of the same object, as the interactions feed and the per-entity
// artwork endpoint each produce: same bucket path, different signature and date.
const SIGNING_A =
  "https://storage.test/artist-art/abc123.jpg?X-Amz-Date=20260714T101500Z&X-Amz-Expires=3600&X-Amz-Signature=aaaa";
const SIGNING_B =
  "https://storage.test/artist-art/abc123.jpg?X-Amz-Date=20260714T104500Z&X-Amz-Expires=3600&X-Amz-Signature=bbbb";

describe("presignedImageSource", () => {
  it("passes the url through untouched", () => {
    expect(presignedImageSource(SIGNING_A).uri).toBe(SIGNING_A);
  });

  it("gives two signings of the same object one cache key", () => {
    // The bug this exists for: keyed on the uri, these are separate entries and
    // the image downloads again on every fetch.
    expect(presignedImageSource(SIGNING_A).cacheKey).toBe(
      presignedImageSource(SIGNING_B).cacheKey,
    );
    expect(presignedImageSource(SIGNING_A).cacheKey).toBe(
      "https://storage.test/artist-art/abc123.jpg",
    );
  });

  it("keys different objects separately", () => {
    const other =
      "https://storage.test/artist-art/def456.jpg?X-Amz-Signature=aaaa";
    expect(presignedImageSource(SIGNING_A).cacheKey).not.toBe(
      presignedImageSource(other).cacheKey,
    );
  });

  it("handles a url with no query string", () => {
    const bare = "https://storage.test/artist-art/abc123.jpg";
    expect(presignedImageSource(bare).cacheKey).toBe(bare);
  });
});
