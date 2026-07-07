import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

interface PopupModalOptions {
  trackId?: string;
}

interface PopupModalContextValue {
  isOpen: boolean;
  trackId?: string;
  open: (options?: PopupModalOptions) => void;
  close: () => void;
}

const PopupModalContext = createContext<PopupModalContextValue | null>(null);

export const PopupModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [trackId, setTrackId] = useState<string | undefined>(undefined);

  const open = useCallback((options?: PopupModalOptions): void => {
    setTrackId(options?.trackId);
    setIsOpen(true);
  }, []);

  const close = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const value = useMemo<PopupModalContextValue>(
    () => ({ isOpen, trackId, open, close }),
    [isOpen, trackId, open, close],
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
