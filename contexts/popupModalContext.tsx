import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

/** New-playlist dialog. An optional `trackId` seeds the playlist with that track on creation. */
interface CreatePlaylistPopup {
  variant: "createPlaylist";
  trackId?: string;
}

/**
 * Generic confirmation dialog.
 *
 * @remarks
 * Caller-supplied copy plus an `onConfirm` callback, so one reusable dialog backs
 * every destructive/irreversible action (delete playlist, etc.) instead of each
 * screen building its own.
 */
export interface ConfirmPopup {
  variant: "confirm";
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

/** The active popup, discriminated by `variant`. */
export type PopupContent = CreatePlaylistPopup | ConfirmPopup;

interface PopupModalContextValue {
  content: PopupContent | null;
  openCreatePlaylist: (options?: { trackId?: string }) => void;
  openConfirm: (options: Omit<ConfirmPopup, "variant">) => void;
  close: () => void;
}

const PopupModalContext = createContext<PopupModalContextValue | null>(null);

/**
 * Coordinates the app's single center popup (create-playlist and confirm
 * dialogs).
 *
 * @remarks
 * Parallels {@link SheetModalProvider} but for centered modals: it holds which
 * popup is open and offers one typed opener per variant, so callers pick a
 * dialog by intent rather than assembling {@link PopupContent} themselves.
 */
export const PopupModalProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<PopupContent | null>(null);

  const openCreatePlaylist = useCallback(
    (options?: { trackId?: string }): void => {
      setContent({ variant: "createPlaylist", trackId: options?.trackId });
    },
    [],
  );

  // Stamp the `variant` here so callers pass only the human-facing config.
  const openConfirm = useCallback(
    (options: Omit<ConfirmPopup, "variant">): void => {
      setContent({ variant: "confirm", ...options });
    },
    [],
  );

  const close = useCallback((): void => {
    setContent(null);
  }, []);

  const value = useMemo<PopupModalContextValue>(
    () => ({ content, openCreatePlaylist, openConfirm, close }),
    [content, openCreatePlaylist, openConfirm, close],
  );

  return (
    <PopupModalContext.Provider value={value}>
      {children}
    </PopupModalContext.Provider>
  );
};

/**
 * Accessor for opening/closing the shared center popup.
 *
 * @throws {Error} When used outside {@link PopupModalProvider}.
 */
export const usePopupModal = (): PopupModalContextValue => {
  const context = useContext(PopupModalContext);
  if (!context) {
    throw new Error("usePopupModal must be used within a PopupModalProvider");
  }
  return context;
};
