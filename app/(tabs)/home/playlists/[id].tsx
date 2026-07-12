/**
 * Route: `/(tabs)/home/playlists/[id]` — a playlist opened from the Home tab.
 *
 * @remarks
 * Expo Router turns every file under `app/` into a screen, but the three tabs
 * (home, library, search) each need their own copy of this route so navigation
 * stays within the active tab's stack. To avoid duplicating the screen itself,
 * each route file re-exports the shared {@link PlaylistPage} factory; the file's
 * location in the tree is the only thing that differs.
 */
export { default } from "@/components/pages/playlistPage";
