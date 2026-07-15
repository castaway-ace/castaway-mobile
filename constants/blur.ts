/**
 * Shared BlurHash placeholder shown by every cover/artwork `Image` while the real
 * asset loads, so lists render a soft shimmer instead of blank boxes. One neutral
 * hash is reused everywhere — the exact colors don't matter since it's only a
 * transient stand-in.
 *
 * @remarks
 * The `blurhash:/` scheme is required, not decorative: expo-image only treats a
 * string placeholder as a hash if it matches `isBlurhashString`, whose regex
 * mandates the prefix. Without it the bare hash falls through to being treated as
 * a plain `uri`, expo-image tries to fetch it as a URL, and the placeholder
 * silently never renders.
 */
export const blurHash =
  'blurhash:/|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';
