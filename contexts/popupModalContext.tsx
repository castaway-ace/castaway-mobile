import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

interface CreatePlaylistPopup {
  variant: "createPlaylist";
  trackId?: string;
}

export interface ConfirmPopup {
  variant: "confirm";
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

export type PopupContent = CreatePlaylistPopup | ConfirmPopup;

interface PopupModalContextValue {
  content: PopupContent | null;
  openCreatePlaylist: (options?: { trackId?: string }) => void;
  openConfirm: (options: Omit<ConfirmPopup, "variant">) => void;
  close: () => void;
}

const PopupModalContext = createContext<PopupModalContextValue | null>(null);

export const PopupModalProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<PopupContent | null>(null);

  const openCreatePlaylist = useCallback(
    (options?: { trackId?: string }): void => {
      setContent({ variant: "createPlaylist", trackId: options?.trackId });
    },
    [],
  );

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

export const usePopupModal = (): PopupModalContextValue => {
  const context = useContext(PopupModalContext);
  if (!context) {
    throw new Error("usePopupModal must be used within a PopupModalProvider");
  }
  return context;
};
