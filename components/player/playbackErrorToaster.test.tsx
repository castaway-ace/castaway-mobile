import { render } from "@testing-library/react-native";
import PlaybackErrorToaster from "./playbackErrorToaster";

const mockShowToast = jest.fn();
jest.mock("@/contexts/toastContext", () => ({
  useToast: () => ({ showToast: mockShowToast, setBottomInset: jest.fn() }),
}));

let mockError: Error | null = null;
jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: () => ({ error: mockError }),
}));

beforeEach(() => {
  mockError = null;
  mockShowToast.mockClear();
});

describe("PlaybackErrorToaster", () => {
  it("shows a toast when a playback error is present", async () => {
    mockError = new Error("stream 401");
    await render(<PlaybackErrorToaster />);

    expect(mockShowToast).toHaveBeenCalledTimes(1);
  });

  it("stays quiet when there is no error", async () => {
    await render(<PlaybackErrorToaster />);

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("toasts once per distinct failure, not on every render", async () => {
    mockError = new Error("first");
    const { rerender } = await render(<PlaybackErrorToaster />);
    expect(mockShowToast).toHaveBeenCalledTimes(1);

    // Same error still set on a re-render: no duplicate toast.
    await rerender(<PlaybackErrorToaster />);
    expect(mockShowToast).toHaveBeenCalledTimes(1);

    // A genuinely new failure (new Error instance) toasts again.
    mockError = new Error("second");
    await rerender(<PlaybackErrorToaster />);
    expect(mockShowToast).toHaveBeenCalledTimes(2);
  });
});
