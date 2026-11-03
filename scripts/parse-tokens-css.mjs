const HEX_RE = /#([0-9a-f]{3,8})\b/i;
const RGB_RE = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;

const expandShortHex = (short) => {
  const h = short.slice(1);
  return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
};

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;

const resolvedValueToHex = (resolved) => {
  if (!resolved || typeof resolved !== "string") {
    return null;
  }
  const hexMatch = resolved.match(HEX_RE);
  if (hexMatch) {
    const hex = hexMatch[0];
    return hex.length === 4 ? expandShortHex(hex) : hex.toLowerCase();
  }
  const rgbMatch = resolved.match(RGB_RE);
  if (rgbMatch) {
    return rgbToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]));
  }
  return null;
};

/**
 * Parse tokens/tokens.css :root custom properties.
 * @returns {{ raw: Record<string, string>, resolve: (name: string) => string, hex: (name: string) => string | null }}
 */
export function parseTokensCss(css) {
  const raw = {};
  for (const line of css.split("\n")) {
    const match = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?)\s*;/);
    if (match) {
      raw[match[1]] = match[2].trim();
    }
  }

  const resolve = (name, depth = 0) => {
    if (depth > 8) {
      return raw[name] ?? "";
    }
    const value = raw[name];
    if (value === undefined) {
      return "";
    }
    const varMatch = value.match(/var\((--[\w-]+)\)/);
    if (varMatch) {
      return resolve(varMatch[1], depth + 1);
    }
    return value;
  };

  const hex = (name) => resolvedValueToHex(resolve(name));

  return { raw, resolve, hex };
}

/** @param {ReturnType<typeof parseTokensCss>} tokens */
export function figmaColorEntries(tokens) {
  const { raw, resolve, hex } = tokens;
  const colors = [];
  for (const [name, value] of Object.entries(raw)) {
    const h = hex(name);
    if (
      h &&
      (name.includes("palette") ||
        ["--bg", "--surface", "--text", "--muted", "--line", "--accent", "--accent-soft"].includes(name))
    ) {
      colors.push({ cssVar: name, name: name.replace(/^--/, ""), hex: h, raw: value });
    }
  }
  return colors;
}
