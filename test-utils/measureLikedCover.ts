import { fireEvent } from "@testing-library/react-native";

/** The node type RNTL queries return and `fireEvent` accepts. */
type TestInstance = Parameters<typeof fireEvent>[0];

/**
 * Drives the layout pass that sizes the Liked Songs heart.
 *
 * @remarks
 * `PlaylistCover` measures itself to scale the heart with the cover, and holds
 * the icon back until it has a width — a zero size would reach the icon font as
 * `fontSize: 0` and throw on Android. No layout pass runs under test, so any
 * assertion on the heart has to fake one first.
 *
 * @param getByTestId - The `getByTestId` query from the render being measured.
 * @param width - Cover width in px to report; the heart is a fraction of it.
 */
export const measureLikedCover = async (
  getByTestId: (id: string) => TestInstance,
  width = 100,
) => {
  await fireEvent(getByTestId("liked-cover"), "layout", {
    nativeEvent: { layout: { width, height: width } },
  });
};
