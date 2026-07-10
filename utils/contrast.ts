interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface ContrastPalette {
  primary: string;
  secondary: string;
}

const LIGHT_PRIMARY = "#FFFFFF";
const LIGHT_SECONDARY = "rgba(255, 255, 255, 0.72)";
const DARK_PRIMARY = "#111111";
const DARK_SECONDARY = "rgba(17, 17, 17, 0.64)";

const parseColor = (input: string): Rgb | null => {
  const value = input.trim();

  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (hex.length === 8) hex = hex.slice(0, 6);
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const parts = match[1].split(",").map((p) => parseFloat(p.trim()));
    if (parts.length >= 3 && parts.slice(0, 3).every((p) => !Number.isNaN(p))) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }

  return null;
};

const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const getContrastPalette = (background: string): ContrastPalette => {
  const rgb = parseColor(background);
  const luminance = rgb ? relativeLuminance(rgb) : 0;

  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  const useDarkText = contrastWithBlack >= contrastWithWhite;

  return useDarkText
    ? { primary: DARK_PRIMARY, secondary: DARK_SECONDARY }
    : { primary: LIGHT_PRIMARY, secondary: LIGHT_SECONDARY };
};
