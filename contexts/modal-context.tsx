import { createContext, ReactNode, useContext, useState } from "react";

interface ModalContextValue {
  isOpen: boolean;
  id: string;
  open: (id: string, starred: boolean) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const open = (id: string) => {
    setId(id);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, id, open, close }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
