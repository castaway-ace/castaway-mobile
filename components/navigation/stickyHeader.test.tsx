import {
  STICKY_HEADER_CONTENT_HEIGHT,
  StickyHeader,
  useStickyHeaderReveal,
} from "@/components/navigation/stickyHeader";
import {
  act,
  fireEvent,
  renderHookWithProviders,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import type { LayoutChangeEvent } from "react-native";

// The shared reanimated mock pins the scroll offset at 0; swap in a handle the
// tests can move so the reveal ramp is actually exercised rather than only ever
// observed at rest.
const mockScrollOffset = { value: 0 };

jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("@/test-utils/mocks/reanimated");
  return {
    ...actual,
    __esModule: true,
    default: actual.default,
    useScrollOffset: () => mockScrollOffset,
  };
});

const makeLayoutEvent = (y: number, height: number) =>
  ({ nativeEvent: { layout: { x: 0, y, width: 300, height } } }) as
    LayoutChangeEvent;

/**
 * Places the title row 300px into the scroll content with a 28px title, as a
 * large cover would. Reveal then completes at 300 + 28 - 48 = 280, fading in
 * across the preceding 64px (216 → 280).
 */
const measure = async (result: {
  current: ReturnType<typeof useStickyHeaderReveal>;
}): Promise<void> => {
  await act(async () => {
    result.current.onHeaderRowLayout(makeLayoutEvent(300, 60));
    result.current.onTitleLayout(makeLayoutEvent(0, 28));
  });
};

const scrollTo = async (
  offset: number,
  rerender: (props?: unknown) => void,
): Promise<void> => {
  mockScrollOffset.value = offset;
  await act(async () => rerender(undefined));
};

beforeEach(() => {
  mockScrollOffset.value = 0;
});

describe("StickyHeader", () => {
  it("renders the title and calls onBack from the back button", async () => {
    const onBack = jest.fn();
    const { getByText } = await renderWithProviders(
      <StickyHeader
        title="Road Trip"
        headerStyle={{ opacity: 1 }}
        onBack={onBack}
      />,
    );

    expect(getByText("Road Trip")).toBeTruthy();

    fireEvent.press(getByText("arrow.backward"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe("useStickyHeaderReveal", () => {
  it("reserves room for the header below the safe-area inset", async () => {
    const { result } = await renderHookWithProviders(() =>
      useStickyHeaderReveal(),
    );

    // Insets are 0 in tests, so this is the bare content-row height.
    expect(result.current.headerBottom).toBe(STICKY_HEADER_CONTENT_HEIGHT);
  });

  it("keeps the header hidden before the title has been measured", async () => {
    const { result } = await renderHookWithProviders(() =>
      useStickyHeaderReveal(),
    );

    expect(result.current.headerStyle).toEqual({ opacity: 0 });
  });

  it("keeps the header hidden until the title nears it", async () => {
    const { result, rerender } = await renderHookWithProviders(() =>
      useStickyHeaderReveal(),
    );
    await measure(result);

    await scrollTo(0, rerender);
    expect(result.current.headerStyle).toEqual({ opacity: 0 });

    // Right at the point the fade begins.
    await scrollTo(216, rerender);
    expect(result.current.headerStyle).toEqual({ opacity: 0 });
  });

  it("fades the header in as the title approaches", async () => {
    const { result, rerender } = await renderHookWithProviders(() =>
      useStickyHeaderReveal(),
    );
    await measure(result);

    await scrollTo(248, rerender);
    expect(result.current.headerStyle).toEqual({ opacity: 0.5 });
  });

  it("holds the header fully visible once the title is behind it", async () => {
    const { result, rerender } = await renderHookWithProviders(() =>
      useStickyHeaderReveal(),
    );
    await measure(result);

    await scrollTo(280, rerender);
    expect(result.current.headerStyle).toEqual({ opacity: 1 });

    // Clamped, not extrapolated past 1, further down the list.
    await scrollTo(2000, rerender);
    expect(result.current.headerStyle).toEqual({ opacity: 1 });
  });
});
