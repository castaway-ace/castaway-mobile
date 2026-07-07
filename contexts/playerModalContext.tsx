import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface PlayerModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const PlayerModalContext = createContext<PlayerModalContextValue | null>(null);

export const PlayerModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<PlayerModalContextValue>(
    () => ({ isOpen, open, close }),
    [isOpen, open, close],
  );

  return (
    <PlayerModalContext.Provider value={value}>
      {children}
    </PlayerModalContext.Provider>
  );
};

export const usePlayerModal = () => {
  const context = useContext(PlayerModalContext);
  if (!context) {
    throw new Error("usePlayerModal must be used within a PlayerModalProvider");
  }
  return context;
};
