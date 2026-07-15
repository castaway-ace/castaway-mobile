import FilterPill from "@/components/ui/filterPill";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { StyleSheet } from "react-native";

describe("FilterPill", () => {
  it("fills with the surface token and primary text when inactive", async () => {
    const { getByTestId, getByText } = await renderWithProviders(
      <FilterPill label="Albums" onPress={jest.fn()} testID="pill" />,
    );

    const style = StyleSheet.flatten(getByTestId("pill").props.style);
    expect(style.backgroundColor).toBe("#FFFFFF");
    expect(StyleSheet.flatten(getByText("Albums").props.style).color).toBe(
      "#1F1A1C",
    );
  });

  it("fills with the accent token and onAccent text when active", async () => {
    const { getByTestId, getByText } = await renderWithProviders(
      <FilterPill label="Albums" active onPress={jest.fn()} testID="pill" />,
    );

    const style = StyleSheet.flatten(getByTestId("pill").props.style);
    expect(style.backgroundColor).toBe("#AE0558");
    expect(StyleSheet.flatten(getByText("Albums").props.style).color).toBe(
      "#FFFFFF",
    );
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await renderWithProviders(
      <FilterPill label="Albums" onPress={onPress} testID="pill" />,
    );

    fireEvent.press(getByTestId("pill"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders the icon variant with the accent fill and a spoken label", async () => {
    const { getByTestId } = await renderWithProviders(
      <FilterPill
        icon="xmark"
        active
        onPress={jest.fn()}
        accessibilityLabel="Clear filter"
        testID="pill"
      />,
    );

    const pill = getByTestId("pill");
    expect(StyleSheet.flatten(pill.props.style).backgroundColor).toBe(
      "#AE0558",
    );
    expect(pill.props.accessibilityLabel).toBe("Clear filter");
  });

  it("exposes its selected state and label to assistive tech", async () => {
    const { getByTestId } = await renderWithProviders(
      <FilterPill label="Artists" active onPress={jest.fn()} testID="pill" />,
    );

    const pill = getByTestId("pill");
    expect(pill.props.accessibilityState).toMatchObject({ selected: true });
    expect(pill.props.accessibilityLabel).toBe("Artists");
  });
});
