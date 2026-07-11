import Toast from "@/components/ui/toast";
import { render } from "@/test-utils/renderWithProviders";

describe("Toast", () => {
  it("renders the message text", async () => {
    const { getByText } = await render(
      <Toast message="Added to Liked Songs" visible bottomInset={0} />,
    );
    expect(getByText("Added to Liked Songs")).toBeTruthy();
  });

  it("still renders the message node when hidden", async () => {
    const { getByText } = await render(
      <Toast message="Removed" visible={false} bottomInset={24} />,
    );
    expect(getByText("Removed")).toBeTruthy();
  });
});
