const SPEC_URL =
  "https://raw.githubusercontent.com/michael-olivier/nexus-people-os-design-system/main/figma/nexus-spec.json";

figma.showUI(__html__, { width: 380, height: 260 });

/** @type {{ family: string, style: string } | null} */
let defaultFont = null;

const hexToRgb = (hex) => {
  if (!hex || typeof hex !== "string") {
    return { r: 0.9, g: 0.9, b: 0.9 };
  }
  const normalized = hex.replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = Number.parseInt(full, 16);
  if (Number.isNaN(int)) {
    return { r: 0.9, g: 0.9, b: 0.9 };
  }
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
};

const tokenColor = (spec, cssVarName) => {
  if (!cssVarName || typeof cssVarName !== "string") {
    return { r: 0.9, g: 0.9, b: 0.9 };
  }
  const key = cssVarName.replace(/^var\(/, "").replace(/\)$/, "").trim();
  const entry = spec.tokens.colors.find(
    (c) => c.cssVar === key || c.name === key.replace(/^--/, ""),
  );
  return entry?.hex ? hexToRgb(entry.hex) : { r: 0.9, g: 0.9, b: 0.9 };
};

const styleFromClasses = (spec, classes) => {
  const primary = classes.find((c) => spec.cssRules[c]) ?? classes[0];
  const rule = spec.cssRules[primary] ?? {};
  return { rule, primary };
};

const clearFrameFills = (node) => {
  node.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 }];
};

async function ensureFont() {
  if (defaultFont) {
    return defaultFont;
  }

  const candidates = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Roboto", style: "Regular" },
    { family: "Arial", style: "Regular" },
  ];

  for (const font of candidates) {
    try {
      await figma.loadFontAsync(font);
      defaultFont = font;
      return font;
    } catch {
      // try next
    }
  }

  throw new Error("Could not load Inter or Roboto. Install Inter in Figma or use a Google Fonts account.");
}

async function createText(characters, size = 14) {
  const font = await ensureFont();
  const text = figma.createText();
  text.fontName = font;
  text.fontSize = size;
  text.characters = characters;
  return text;
}

async function createColorVariables(spec) {
  if (!figma.variables) {
    return null;
  }

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const existing = collections.find((c) => c.name === "Nexus / Colors");
  if (existing) {
    existing.remove();
  }

  const collection = figma.variables.createVariableCollection("Nexus / Colors");
  const modeId = collection.modes[0].modeId;
  const usedNames = new Set();

  for (const color of spec.tokens.colors) {
    let name = color.name.replace(/[^a-zA-Z0-9/_-]/g, "-");
    if (usedNames.has(name)) {
      continue;
    }
    usedNames.add(name);
    const variable = figma.variables.createVariable(name, collection, "COLOR");
    variable.setValueForMode(modeId, hexToRgb(color.hex));
  }

  return collection;
}

async function createTokenSwatches(spec, page) {
  const wrap = figma.createFrame();
  wrap.name = "Color tokens";
  wrap.layoutMode = "HORIZONTAL";
  wrap.itemSpacing = 12;
  wrap.paddingLeft = wrap.paddingRight = wrap.paddingTop = wrap.paddingBottom = 16;
  wrap.primaryAxisSizingMode = "AUTO";
  wrap.counterAxisSizingMode = "AUTO";
  wrap.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  wrap.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.92 } }];
  wrap.cornerRadius = 16;
  page.appendChild(wrap);

  for (const color of spec.tokens.colors) {
    const column = figma.createFrame();
    column.name = color.name;
    column.layoutMode = "VERTICAL";
    column.itemSpacing = 8;
    column.primaryAxisSizingMode = "AUTO";
    column.counterAxisSizingMode = "AUTO";
    clearFrameFills(column);

    const chip = figma.createFrame();
    chip.resize(100, 72);
    chip.cornerRadius = 12;
    chip.fills = [{ type: "SOLID", color: hexToRgb(color.hex) }];
    chip.layoutMode = "NONE";
    column.appendChild(chip);

    const label = await createText(`${color.name}\n${color.hex}`, 10);
    label.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.22 } }];
    column.appendChild(label);

    wrap.appendChild(column);
  }
}

async function createButton(spec, specimen) {
  const { rule } = styleFromClasses(spec, specimen.classes);
  const frame = figma.createFrame();
  frame.name = specimen.classes.join(" ");
  frame.layoutMode = "HORIZONTAL";
  frame.primaryAxisAlignItems = "CENTER";
  frame.counterAxisAlignItems = "CENTER";
  frame.paddingLeft = frame.paddingRight = 18;
  frame.paddingTop = frame.paddingBottom = 12;
  frame.cornerRadius = 999;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";

  const bg = rule.background ?? rule.backgroundColor ?? "var(--surface)";
  const color = rule.color ?? "var(--text)";
  frame.fills = [{ type: "SOLID", color: tokenColor(spec, bg) }];
  if (rule.border || rule.borderWidth) {
    frame.strokes = [{ type: "SOLID", color: tokenColor(spec, "var(--line)") }];
    frame.strokeWeight = 1;
  }

  const text = await createText(specimen.text, 14);
  text.fills = [{ type: "SOLID", color: tokenColor(spec, color) }];
  frame.appendChild(text);
  return frame;
}

async function createSpecimen(spec, specimen) {
  if (specimen.kind === "button") {
    return createButton(spec, specimen);
  }

  if (specimen.kind === "status-pill") {
    const frame = await createButton(spec, { ...specimen, classes: specimen.classes });
    frame.name = specimen.classes.join(" ");
    frame.paddingLeft = frame.paddingRight = 10;
    frame.paddingTop = frame.paddingBottom = 6;
    frame.cornerRadius = 999;
    const text = frame.findOne((n) => n.type === "TEXT");
    if (text) {
      text.fontSize = 10;
      text.characters = specimen.text.toUpperCase();
    }
    const variant = specimen.classes.find((c) => c.startsWith("status-pill-") && c !== "status-pill");
    if (variant === "status-pill-overdue") {
      frame.fills = [{ type: "SOLID", color: hexToRgb("#feecef") }];
      if (text) {
        text.fills = [{ type: "SOLID", color: hexToRgb("#e11d48") }];
      }
    }
    if (variant === "status-pill-pending") {
      frame.fills = [{ type: "SOLID", color: hexToRgb("#fff7ed") }];
      if (text) {
        text.fills = [{ type: "SOLID", color: hexToRgb("#ea580c") }];
      }
    }
    if (variant === "status-pill-progress") {
      frame.fills = [{ type: "SOLID", color: hexToRgb("#ecfdf9") }];
      if (text) {
        text.fills = [{ type: "SOLID", color: hexToRgb("#0d9488") }];
      }
    }
    return frame;
  }

  if (specimen.kind === "agent-icon") {
    const frame = figma.createFrame();
    frame.name = specimen.classes.join(" ");
    frame.resize(28, 28);
    frame.cornerRadius = 8;
    frame.fills = [{ type: "SOLID", color: tokenColor(spec, "var(--accent-soft)") }];
    return frame;
  }

  if (specimen.kind === "panel") {
    const frame = figma.createFrame();
    frame.name = "Panel";
    frame.resize(320, 180);
    frame.cornerRadius = 28;
    frame.fills = [{ type: "SOLID", color: tokenColor(spec, "var(--surface)") }];
    frame.strokes = [{ type: "SOLID", color: tokenColor(spec, "var(--line)") }];
    frame.strokeWeight = 1;
    return frame;
  }

  if (specimen.kind === "input-row") {
    const frame = figma.createFrame();
    frame.name = "Input row";
    frame.layoutMode = "NONE";
    frame.resize(360, 52);
    frame.cornerRadius = 999;
    frame.fills = [{ type: "SOLID", color: tokenColor(spec, "var(--surface)") }];
    frame.strokes = [{ type: "SOLID", color: tokenColor(spec, "var(--line)") }];
    frame.strokeWeight = 1;
    const text = await createText(specimen.text, 14);
    text.fills = [{ type: "SOLID", color: hexToRgb("#9ca3af") }];
    text.x = 16;
    text.y = 16;
    frame.appendChild(text);
    return frame;
  }

  if (specimen.kind === "brand") {
    const frame = figma.createFrame();
    frame.name = "Brand";
    frame.layoutMode = "HORIZONTAL";
    frame.itemSpacing = 12;
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
    frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = 8;
    frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    const title = await createText("Nexus People OS", 14);
    frame.appendChild(title);
    return frame;
  }

  const fallback = figma.createFrame();
  fallback.name = specimen.kind;
  fallback.resize(120, 40);
  fallback.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.96 } }];
  return fallback;
}

async function buildLibrary(spec) {
  if (!spec?.tokens?.colors?.length) {
    throw new Error("Invalid spec: missing tokens.colors");
  }

  await ensureFont();
  await createColorVariables(spec);
  await figma.loadAllPagesAsync();

  let tokensPage = figma.root.children.find((p) => p.name === "Tokens");
  if (!tokensPage) {
    tokensPage = figma.createPage();
    tokensPage.name = "Tokens";
  }

  let componentsPage = figma.root.children.find((p) => p.name === "Components");
  if (!componentsPage) {
    componentsPage = figma.createPage();
    componentsPage.name = "Components";
  }

  await figma.setCurrentPageAsync(tokensPage);
  for (const child of [...tokensPage.children]) {
    child.remove();
  }
  await createTokenSwatches(spec, tokensPage);

  await figma.setCurrentPageAsync(componentsPage);
  for (const child of [...componentsPage.children]) {
    child.remove();
  }

  let y = 0;
  const byPage = groupByPage(spec.specimens ?? []);

  for (const [pageName, items] of Object.entries(byPage)) {
    const section = figma.createFrame();
    section.name = pageName;
    section.layoutMode = "VERTICAL";
    section.itemSpacing = 12;
    section.paddingLeft = section.paddingRight = section.paddingTop = section.paddingBottom = 20;
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.x = 0;
    section.y = y;
    clearFrameFills(section);
    componentsPage.appendChild(section);

    const heading = await createText(pageName, 18);
    section.appendChild(heading);

    const row = figma.createFrame();
    row.name = "Specimens";
    row.layoutMode = "HORIZONTAL";
    row.itemSpacing = 12;
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "AUTO";
    clearFrameFills(row);
    section.appendChild(row);

    for (const specimen of items) {
      const node = await createSpecimen(spec, specimen);
      row.appendChild(node);
    }

    y += section.height + 48;
  }

  await figma.setCurrentPageAsync(componentsPage);
  if (componentsPage.children.length) {
    figma.viewport.scrollAndZoomIntoView(componentsPage.children);
  }

  figma.closePlugin(
    `Imported ${spec.specimens?.length ?? 0} specimens and ${spec.tokens.colors.length} colors.`,
  );
}

function groupByPage(specimens) {
  return specimens.reduce((acc, item) => {
    acc[item.page] = acc[item.page] ?? [];
    acc[item.page].push(item);
    return acc;
  }, {});
}

function fail(message) {
  figma.ui.postMessage({ type: "error", message });
  figma.closePlugin(`Import failed: ${message}`);
}

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "import-url") {
      const res = await fetch(SPEC_URL);
      if (!res.ok) {
        throw new Error(`GitHub fetch failed (${res.status}). Use the local file picker instead.`);
      }
      const spec = await res.json();
      await buildLibrary(spec);
      return;
    }

    if (msg.type === "import-json") {
      const spec = typeof msg.spec === "string" ? JSON.parse(msg.spec) : msg.spec;
      await buildLibrary(spec);
    }
  } catch (error) {
    fail(error?.message ?? String(error));
  }
};
