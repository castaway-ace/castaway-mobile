import ConfirmContent from "@/components/sheets/popupModal/confirmContent";
import type { ConfirmPopup } from "@/contexts/popupModalContext";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";

const mockClose = jest.fn();

jest.mock("@/contexts/popupModalContext", () => ({
  usePopupModal: () => ({ close: mockClose }),
}));

const makeContent = (onConfirm = jest.fn()): ConfirmPopup => ({
  variant: "confirm",
  title: "Delete Playlist",
  message: "This cannot be undone",
  confirmLabel: "Delete",
  cancelLabel: "Cancel",
  onConfirm,
});

describe("ConfirmContent", () => {
  it("renders the title and message", async () => {
    const { getByText } = await renderWithProviders(
      <ConfirmContent content={makeContent()} />,
    );
    expect(getByText("Delete Playlist")).toBeTruthy();
    expect(getByText("This cannot be undone")).toBeTruthy();
  });

  it("closes without confirming on cancel", async () => {
    const onConfirm = jest.fn();
    const { getByText } = await renderWithProviders(
      <ConfirmContent content={makeContent(onConfirm)} />,
    );

    await fireEvent.press(getByText("Cancel"));

    expect(mockClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("closes and runs onConfirm on confirm", async () => {
    const onConfirm = jest.fn();
    const { getByText } = await renderWithProviders(
      <ConfirmContent content={makeContent(onConfirm)} />,
    );

    await fireEvent.press(getByText("Delete"));

    expect(mockClose).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
