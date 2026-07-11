import Signup from "@/app/(auth)/signup";
import { fireEvent, renderWithProviders } from "@/test-utils/renderWithProviders";

const mockSignup = jest.fn();

jest.mock("@/api/auth/mutations", () => ({
  useSignUp: () => ({
    mutateAsync: mockSignup,
    isPending: false,
    error: null,
  }),
}));

describe("Signup screen", () => {
  it("validates and signs up with the entered details", async () => {
    mockSignup.mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText } = await renderWithProviders(
      <Signup />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("Email Address"),
      "user@example.com",
    );
    await fireEvent.changeText(getByPlaceholderText("User name"), "newuser");
    await fireEvent.changeText(getByPlaceholderText("Password"), "Password1234");
    await fireEvent.press(getByText("Sign Up"));

    expect(mockSignup).toHaveBeenCalledWith({
      email: "user@example.com",
      userName: "newuser",
      password: "Password1234",
    });
  });

  it("shows a username validation error and does not submit", async () => {
    const { getByText, getByPlaceholderText } = await renderWithProviders(
      <Signup />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("Email Address"),
      "user@example.com",
    );
    await fireEvent.changeText(getByPlaceholderText("User name"), "ab");
    await fireEvent.changeText(getByPlaceholderText("Password"), "Password1234");
    await fireEvent.press(getByText("Sign Up"));

    expect(getByText("User name must be at least 3 characters")).toBeTruthy();
    expect(mockSignup).not.toHaveBeenCalled();
  });
});
