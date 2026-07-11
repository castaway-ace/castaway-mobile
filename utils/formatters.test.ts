import { formatDate, formatTime } from "@/utils/formatters";

describe("formatTime", () => {
  it("formats whole minutes and zero-pads seconds", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(600)).toBe("10:00");
    expect(formatTime(3599)).toBe("59:59");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(125.9)).toBe("2:05");
  });

  it("returns 0:00 for invalid or negative input", () => {
    expect(formatTime(-5)).toBe("0:00");
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(Infinity)).toBe("0:00");
  });
});

describe("formatDate", () => {
  it("returns an empty string for missing input", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
  });

  it("formats an ISO date as `Mon DD, YYYY`", () => {
    const result = formatDate("2024-06-15T12:00:00.000Z");
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{2}, \d{4}$/);
    expect(result).toContain("Jun");
    expect(result).toContain("2024");
  });
});
