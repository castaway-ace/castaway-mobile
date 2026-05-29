// contexts/player-modal-context.tsx
import { createContext, ReactNode, useContext, useState } from "react";

interface PlayerModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const PlayerModalContext = createContext<PlayerModalContextValue | null>(null);

export const PlayerModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <PlayerModalContext.Provider value={{ isOpen, open, close }}>
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
