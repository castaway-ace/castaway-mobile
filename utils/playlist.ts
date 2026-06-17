export const buildPlaylistCover = (urls: string[] | undefined): string[] => {
    if (!urls) return [];
    switch (urls.length) {
        case 0:
            return [];
        case 1:
            return urls;
        case 2:
            return [urls[0], urls[1], urls[1], urls[0]];
        case 3:
            return [urls[0], urls[1], urls[2], urls[0]];
        default:
            return [urls[0], urls[1], urls[2], urls[3]];
    }
}