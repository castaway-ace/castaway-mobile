/**
 * Expands a playlist's album covers into the tiles its artwork renders.
 *
 * @remarks
 * The UI ({@link PlaylistCover}) draws either a single image or a 2x2 grid. This
 * helper decides which by normalizing the input to a fixed tile count: one cover
 * stays a single tile, while two or three covers are padded back up to four by
 * repeating earlier covers, so the grid is always complete rather than showing a
 * hole. Four or more covers use only the first four. Kept as a pure function so
 * the tiling rule is unit-testable without rendering.
 *
 * @param urls - Album cover URLs for the playlist, in display order.
 * @returns 0, 1, or 4 URLs — the exact tiles to render.
 */
export const buildPlaylistCover = (urls: string[] | undefined): string[] => {
    if (!urls) return [];
    switch (urls.length) {
        case 0:
            return [];
        case 1:
            return urls;
        case 2:
            // Mirror the two covers diagonally so the grid reads as balanced.
            return [urls[0], urls[1], urls[1], urls[0]];
        case 3:
            // Repeat the first cover to fill the empty fourth cell.
            return [urls[0], urls[1], urls[2], urls[0]];
        default:
            return [urls[0], urls[1], urls[2], urls[3]];
    }
}