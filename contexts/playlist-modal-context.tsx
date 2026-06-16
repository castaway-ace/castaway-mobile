import { createContext, ReactNode, useContext, useState } from "react";

interface PlaylistModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const PlaylistModalContext = createContext<PlaylistModalContextValue | null>(
  null,
);

export const PlaylistModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => {
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <PlaylistModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </PlaylistModalContext.Provider>
  );
};

export const usePlaylistModal = () => {
  const context = useContext(PlaylistModalContext);
  if (!context) {
    throw new Error(
      "usePlaylistModal must be used within a PlaylistModalProvider",
    );
  }
  return context;
};
