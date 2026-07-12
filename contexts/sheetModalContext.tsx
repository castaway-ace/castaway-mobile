import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/** Which bottom-sheet variant is showing. Discriminant for the {@link SheetContent} union. */
export enum SheetType {
  PLAYLIST = "playlist",
  PLAYLIST_TRACK = "playlist-track",
  PLAYLIST_SELECT = "playlist-select",
  ALBUM_TRACK = "album-track",
  NOW_PLAYING = "now-playing",
}

export type SheetNowPlaying = {
  type: SheetType.NOW_PLAYING;
};

export type SheetAlbumTrack = {
  type: SheetType.ALBUM_TRACK;
  trackId: string;
  id: string;
};

export type SheetPlaylist = {
  type: SheetType.PLAYLIST;
  id: string;
};

export type SheetPlaylistTrack = {
  type: SheetType.PLAYLIST_TRACK;
  trackId: string;
  id: string;
};

export type SheetPlaylistSelect = {
  type: SheetType.PLAYLIST_SELECT;
  trackId: string;
};

/**
 * Everything needed to render the active sheet, tagged by {@link SheetType}.
 *
 * @remarks
 * A discriminated union rather than a bag of optional fields, so each variant
 * declares exactly the ids it needs (e.g. a track sheet requires a `trackId`)
 * and the consumer gets exhaustive, type-safe narrowing when switching on `type`.
 */
export type SheetContent =
  | SheetAlbumTrack
  | SheetPlaylistTrack
  | SheetPlaylistSelect
  | SheetPlaylist
  | SheetNowPlaying;

interface SheetModalContextValue {
  /** The open sheet's content, or `null` when none is showing. */
  active: SheetContent | null;
  open: (content: SheetContent) => void;
  close: () => void;
}

const SheetModalContext = createContext<SheetModalContextValue | null>(null);

/**
 * Coordinates the app's single bottom sheet.
 *
 * @remarks
 * Holds only *which* sheet is open ({@link SheetContent}); the sheet component
 * subscribes to `active` and renders the matching variant. Centralizing this in
 * one host means only one sheet can be open at a time and any screen can open
 * one by describing its content, without owning sheet markup itself.
 */
export const SheetModalProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<SheetContent | null>(null);

  const open = useCallback((content: SheetContent): void => {
    setActive(content);
  }, []);

  const close = useCallback((): void => {
    setActive(null);
  }, []);

  const value = useMemo<SheetModalContextValue>(
    () => ({ active, open, close }),
    [active, open, close],
  );

  return (
    <SheetModalContext.Provider value={value}>
      {children}
    </SheetModalContext.Provider>
  );
};

/**
 * Accessor for opening/closing the shared bottom sheet.
 *
 * @throws {Error} When used outside {@link SheetModalProvider}.
 */
export const useSheetModal = (): SheetModalContextValue => {
  const context = useContext(SheetModalContext);
  if (!context) {
    throw new Error("useSheetModal must be used within a SheetModalProvider");
  }
  return context;
};
