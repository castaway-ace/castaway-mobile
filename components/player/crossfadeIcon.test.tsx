import { CrossfadeIcon } from "@/components/player/crossfadeIcon";
import { render } from "@/test-utils/renderWithProviders";

describe("CrossfadeIcon", () => {
  it("renders the icon for the given name", async () => {
    const { getAllByText } = await render(
      <CrossfadeIcon name="heart.fill" size={32} color="#ffffff" />,
    );
    expect(getAllByText("heart.fill").length).toBeGreaterThan(0);
  });
});
