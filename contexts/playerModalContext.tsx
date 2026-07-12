import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface PlayerModalContextValue {
  /** Whether the full-screen now-playing modal is expanded. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const PlayerModalContext = createContext<PlayerModalContextValue | null>(null);

/**
 * Tracks whether the full-screen player is expanded.
 *
 * @remarks
 * Only the open/closed flag lives here — playback state belongs to the audio
 * player context. Kept separate so the mini-player (which taps to expand) and
 * the modal itself can share one source of truth without depending on each
 * other, and so opening the player is decoupled from what's playing.
 */
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

/**
 * Accessor for the player modal's open state.
 *
 * @throws {Error} When used outside {@link PlayerModalProvider}.
 */
export const usePlayerModal = () => {
  const context = useContext(PlayerModalContext);
  if (!context) {
    throw new Error("usePlayerModal must be used within a PlayerModalProvider");
  }
  return context;
};
