import Login from "@/app/(auth)/login";
import { fireEvent, renderWithProviders } from "@/test-utils/renderWithProviders";

const mockLogin = jest.fn();

jest.mock("@/api/auth/mutations", () => ({
  useLogin: () => ({
    mutateAsync: mockLogin,
    isPending: false,
    error: null,
  }),
}));

describe("Login screen", () => {
  it("validates and logs in with the entered credentials", async () => {
    mockLogin.mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText } = await renderWithProviders(
      <Login />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("Email Address"),
      "user@example.com",
    );
    await fireEvent.changeText(getByPlaceholderText("Password"), "secret");
    await fireEvent.press(getByText("Log In"));

    expect(mockLogin).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret",
    });
  });

  it("shows validation errors and does not submit invalid input", async () => {
    const { getByText } = await renderWithProviders(<Login />);

    await fireEvent.press(getByText("Log In"));

    expect(getByText("Please enter a valid email address")).toBeTruthy();
    expect(getByText("Password is required")).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
