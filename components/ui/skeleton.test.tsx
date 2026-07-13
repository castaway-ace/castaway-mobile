import { Skeleton } from "@/components/ui/skeleton";
import { renderWithProviders } from "@/test-utils/renderWithProviders";
import { StyleSheet } from "react-native";

describe("Skeleton", () => {
  it("renders a themed block at the given size", async () => {
    const { getByTestId } = await renderWithProviders(
      <Skeleton testID="sk" width={40} height={20} borderRadius={6} />,
    );

    const style = StyleSheet.flatten(getByTestId("sk").props.style);
    expect(style.width).toBe(40);
    expect(style.height).toBe(20);
    expect(style.borderRadius).toBe(6);
    // Fills with the light theme's skeleton token (tests default to light).
    expect(style.backgroundColor).toBe("#E7E1DC");
  });

  it("defaults width to fill its parent and applies the pulse opacity", async () => {
    const { getByTestId } = await renderWithProviders(
      <Skeleton testID="sk" height={10} />,
    );

    const style = StyleSheet.flatten(getByTestId("sk").props.style);
    expect(style.width).toBe("100%");
    // A pulse opacity is applied via the animated style.
    expect(typeof style.opacity).toBe("number");
  });
});
