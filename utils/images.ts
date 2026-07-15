import type { ImageSource } from "expo-image";

/**
 * Builds an expo-image source whose cache identity survives presigned-URL
 * rotation.
 *
 * @remarks
 * The API serves artwork as S3 presigned URLs, which carry a fresh signature and
 * timestamp on every call — so the same image arrives under a different URL each
 * time it's requested. expo-image keys its cache on the `uri` by default, so
 * without this every fetch is a cache miss and the artwork is re-downloaded even
 * though the bytes are already on disk.
 *
 * Everything before the query string is the bucket path, which is stable across
 * signings and changes when the underlying object is replaced — so it's both a
 * correct cache key and self-invalidating on upload. It's shared across
 * endpoints too: the interactions feed and the per-entity artwork endpoints
 * presign the same bucket + key, so a feed tile and its detail screen resolve to
 * one cache entry.
 *
 * @param uri - A presigned artwork URL from the API.
 */
export const presignedImageSource = (uri: string): ImageSource => ({
  uri,
  cacheKey: uri.split("?")[0],
});
