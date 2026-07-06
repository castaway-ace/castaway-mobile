import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

interface PopupModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const PopupModalContext = createContext<PopupModalContextValue | null>(null);

export const PopupModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const open = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const close = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const value = useMemo<PopupModalContextValue>(
    () => ({ isOpen, open, close }),
    [isOpen, open, close],
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
