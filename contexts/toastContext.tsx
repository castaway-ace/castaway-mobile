import Toast from "@/components/ui/toast";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface ToastContextValue {
  showToast: (message: string) => void;
  /** Lets the active screen lift the toast above overlapping UI (tab bar, mini-player). */
  setBottomInset: (height: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION = 2200;

/**
 * Hosts the app's single toast and exposes an imperative way to trigger it.
 *
 * @remarks
 * One `Toast` is rendered here as a sibling of `children`, so any screen can
 * raise a message without each mounting its own. Calls are used app-wide for
 * mutation feedback (playlist edits, likes, errors); centralizing avoids
 * stacked/duplicate toasts.
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [bottomInset, setBottomInset] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    setVisible(true);
    // Restart the timer on every call so a rapid second toast resets the full
    // display window rather than inheriting the previous one's remaining time.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), TOAST_DURATION);
  }, []);

  // Clear any pending hide timer on unmount so it can't fire into a gone provider.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    // `setBottomInset` is React's own state setter, which is guaranteed stable,
    // so it needs no memo dependency here.
    () => ({ showToast, setBottomInset }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast message={message} visible={visible} bottomInset={bottomInset} />
    </ToastContext.Provider>
  );
};

/**
 * Accessor for the toast controls.
 *
 * @throws {Error} When used outside {@link ToastProvider}.
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
