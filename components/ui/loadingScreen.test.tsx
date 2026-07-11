import LoadingScreen from "@/components/ui/loadingScreen";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

describe("LoadingScreen", () => {
  it("mounts with the theme and renders an activity indicator", async () => {
    const { toJSON } = await renderWithProviders(<LoadingScreen />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
    expect(JSON.stringify(tree)).toContain("ActivityIndicator");
  });
});
