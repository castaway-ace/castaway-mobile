import { createContext, ReactNode, useContext, useMemo, useState } from "react";

/**
 * Breathing room between a scroll view's last item and the docked bottom UI.
 * Added on top of `bottomInset` so content clears the tab bar and mini-player
 * with a gap rather than stopping flush against them.
 */
export const CONTENT_BOTTOM_GAP = 24;

interface BottomInsetContextValue {
  /**
   * Measured height of the UI docked to the bottom of the screen — the tab bar,
   * plus the mini-player stacked above it whenever something is playing.
   */
  bottomInset: number;
  setBottomInset: (height: number) => void;
}

const BottomInsetContext = createContext<BottomInsetContextValue | undefined>(
  undefined,
);

/**
 * Publishes how much of the screen the docked bottom UI occupies.
 *
 * @remarks
 * The mini-player is stacked above the tab bar rather than inside it, so
 * `useBottomTabBarHeight` under-reports the docked stack by the player's height
 * and content padded with it ends up covered. {@link CustomTabBar} measures the
 * whole stack and publishes it here; screens pad their scroll content by it and
 * the toast floats above it, so one measurement keeps everything clear of the
 * player — including when it appears, disappears, or grows with the user's text
 * size.
 */
export const BottomInsetProvider = ({ children }: { children: ReactNode }) => {
  const [bottomInset, setBottomInset] = useState(0);

  const value = useMemo<BottomInsetContextValue>(
    () => ({ bottomInset, setBottomInset }),
    [bottomInset],
  );

  return (
    <BottomInsetContext.Provider value={value}>
      {children}
    </BottomInsetContext.Provider>
  );
};

/**
 * Accessor for the docked bottom UI's measured height.
 *
 * @throws {Error} When used outside {@link BottomInsetProvider}.
 */
export const useBottomInset = (): BottomInsetContextValue => {
  const context = useContext(BottomInsetContext);
  if (!context) {
    throw new Error("useBottomInset must be used within a BottomInsetProvider");
  }
  return context;
};
