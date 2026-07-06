import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export enum SheetType {
  PLAYLIST = "playlist",
  PLAYLIST_TRACK = "playlist-track",
  PLAYLIST_SELECT = "playlist-select",
  ALBUM_TRACK = "album-track",
}

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

export type SheetContent =
  | SheetAlbumTrack
  | SheetPlaylistTrack
  | SheetPlaylistSelect
  | SheetPlaylist;

interface SheetModalContextValue {
  active: SheetContent | null;
  open: (content: SheetContent) => void;
  close: () => void;
}

const SheetModalContext = createContext<SheetModalContextValue | null>(null);

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

export const useSheetModal = (): SheetModalContextValue => {
  const context = useContext(SheetModalContext);
  if (!context) {
    throw new Error("useSheetModal must be used within a SheetModalProvider");
  }
  return context;
};
