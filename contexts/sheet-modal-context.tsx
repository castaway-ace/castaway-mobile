import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type SheetContent = { kind: "track"; id: string } | { kind: "playlist" };

interface SheetModalContextValue {
  active: SheetContent | null;
  trackId: string | null;
  open: (content: SheetContent) => void;
  close: () => void;
}

const SheetModalContext = createContext<SheetModalContextValue | null>(null);

export const SheetModalProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<SheetContent | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);

  const open = useCallback((content: SheetContent): void => {
    if (content.kind === "track") {
      setTrackId(content.id);
    }
    setActive(content);
  }, []);

  const close = useCallback((): void => {
    setActive(null);
  }, []);

  const value = useMemo<SheetModalContextValue>(
    () => ({ active, trackId, open, close }),
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
