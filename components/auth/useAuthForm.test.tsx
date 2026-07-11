import { useAuthForm } from "@/components/auth/useAuthForm";
import { LoginSchema, SignUpSchema } from "@/constants/validation";
import { act, renderHook } from "@/test-utils/renderWithProviders";

describe("useAuthForm", () => {
  it("returns parsed data and no errors for valid input", async () => {
    const { result } = await renderHook(() => useAuthForm(LoginSchema));

    let parsed: unknown;
    await act(async () => {
      parsed = result.current.validate({
        email: "user@example.com",
        password: "secret",
      });
    });

    expect(parsed).toEqual({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.current.errors).toEqual({});
  });

  it("returns null and maps Zod issues to field errors for invalid input", async () => {
    const { result } = await renderHook(() => useAuthForm(LoginSchema));

    let parsed: unknown;
    await act(async () => {
      parsed = result.current.validate({ email: "not-an-email", password: "" });
    });

    expect(parsed).toBeNull();
    expect(result.current.errors.email).toBe("Please enter a valid email address");
    expect(result.current.errors.password).toBe("Password is required");
  });

  it("clears a single field error", async () => {
    const { result } = await renderHook(() => useAuthForm(LoginSchema));

    await act(async () => {
      result.current.validate({ email: "bad", password: "" });
    });
    expect(result.current.errors.email).toBeTruthy();

    await act(async () => {
      result.current.clearError("email");
    });
    expect(result.current.errors.email).toBeUndefined();
  });

  it("maps the username rule for the signup schema", async () => {
    const { result } = await renderHook(() => useAuthForm(SignUpSchema));

    await act(async () => {
      result.current.validate({
        email: "user@example.com",
        userName: "ab",
        password: "Password1234",
      });
    });

    expect(result.current.errors.userName).toBe(
      "User name must be at least 3 characters",
    );
  });
});
