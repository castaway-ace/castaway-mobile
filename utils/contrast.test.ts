import { getContrastPalette } from "@/utils/contrast";

const DARK_TEXT = { primary: "#111111", secondary: "rgba(17, 17, 17, 0.64)" };
const LIGHT_TEXT = { primary: "#FFFFFF", secondary: "rgba(255, 255, 255, 0.72)" };

describe("getContrastPalette", () => {
  it("uses dark text on light backgrounds", () => {
    expect(getContrastPalette("#FFFFFF")).toEqual(DARK_TEXT);
    expect(getContrastPalette("#fff")).toEqual(DARK_TEXT);
    expect(getContrastPalette("rgb(255, 255, 255)")).toEqual(DARK_TEXT);
    expect(getContrastPalette("#EEEEEEFF")).toEqual(DARK_TEXT);
  });

  it("uses light text on dark backgrounds", () => {
    expect(getContrastPalette("#000000")).toEqual(LIGHT_TEXT);
    expect(getContrastPalette("rgba(10, 10, 10, 0.9)")).toEqual(LIGHT_TEXT);
  });

  it("falls back to light text for unparseable colors", () => {
    expect(getContrastPalette("not-a-color")).toEqual(LIGHT_TEXT);
    expect(getContrastPalette("#12")).toEqual(LIGHT_TEXT);
  });
});
