import ProgressBar from "@/components/player/musicPlayerModal/progressBar";
import { render } from "@/test-utils/renderWithProviders";

jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: () => ({
    currentTime: 65,
    duration: 200,
    moveTarget: jest.fn(),
    play: jest.fn(),
    isPlaying: false,
    coverColor: undefined,
  }),
}));

describe("ProgressBar", () => {
  it("renders the current time and duration", async () => {
    const { getByText } = await render(<ProgressBar />);
    expect(getByText("1:05")).toBeTruthy();
    expect(getByText("3:20")).toBeTruthy();
  });
});
