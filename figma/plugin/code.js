const SPEC_URL =
  "https://raw.githubusercontent.com/michael-olivier/nexus-people-os-design-system/main/figma/nexus-spec.json";

figma.showUI(__html__, { width: 360, height: 220 });

const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = Number.parseInt(full, 16);
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
};

const tokenColor = (spec, cssVarName) => {
  const key = cssVarName?.replace(/^var\(/, "").replace(/\)$/, "").trim();
  const entry = spec.tokens.colors.find((c) => c.cssVar === key || c.name === key?.replace(/^--/, ""));
  return entry?.hex ? hexToRgb(entry.hex) : { r: 0.9, g: 0.9, b: 0.9 };
};

const styleFromClasses = (spec, classes) => {
  const primary = classes.find((c) => spec.cssRules[c]) ?? classes[0];
  const rule = spec.cssRules[primary] ?? {};
  return { rule, primary };
};

async function ensureFont() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
}

async function createColorVariables(spec) {
  const existing = figma.variables.getLocalVariableCollections().find((c) => c.name === "Nexus / Colors");
  if (existing) {
    existing.remove();
  }

  const collection = figma.variables.createVariableCollection("Nexus / Colors");
  const modeId = collection.modes[0].modeId;

  for (const color of spec.tokens.colors) {
    const variable = figma.variables.createVariable(color.name, collection, "COLOR");
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
  wrap.layoutWrap = "WRAP";
  wrap.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  wrap.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.92 } }];
  wrap.cornerRadius = 16;
  page.appendChild(wrap);

  for (const color of spec.tokens.colors) {
    const chip = figma.createFrame();
    chip.name = color.name;
    chip.resize(120, 96);
    chip.layoutMode = "VERTICAL";
    chip.primaryAxisSizingMode = "FIXED";
    chip.counterAxisSizingMode = "FIXED";
    chip.fills = [{ type: "SOLID", color: hexToRgb(color.hex) }];
    chip.cornerRadius = 12;

    const label = figma.createText();
    label.characters = `${color.name}\n${color.hex}`;
    label.fontSize = 10;
    label.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.22 } }];
    label.y = 104;
    label.x = 0;

    wrap.appendChild(chip);
    chip.appendChild(label);
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
  } else {
    frame.strokes = [];
  }

  const text = figma.createText();
  text.characters = specimen.text;
  text.fontSize = 14;
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
    frame.resize(360, 52);
    frame.cornerRadius = 999;
    frame.fills = [{ type: "SOLID", color: tokenColor(spec, "var(--surface)") }];
    frame.strokes = [{ type: "SOLID", color: tokenColor(spec, "var(--line)") }];
    frame.strokeWeight = 1;
    const text = figma.createText();
    text.characters = specimen.text;
    text.fontSize = 14;
    text.fills = [{ type: "SOLID", color: hexToRgb("#9ca3af") }];
    text.x = 16;
    text.y = 16;
    frame.appendChild(text);
    return frame;
  }

  const fallback = figma.createFrame();
  fallback.name = specimen.kind;
  fallback.resize(120, 40);
  fallback.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.96 } }];
  return fallback;
}

async function buildLibrary(spec) {
  await ensureFont();
  await createColorVariables(spec);

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

  figma.currentPage = tokensPage;
  for (const child of [...tokensPage.children]) {
    child.remove();
  }
  await createTokenSwatches(spec, tokensPage);

  figma.currentPage = componentsPage;
  for (const child of [...componentsPage.children]) {
    child.remove();
  }

  let y = 0;
  const byPage = groupByPage(spec.specimens);

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
    section.fills = [];
    componentsPage.appendChild(section);

    const heading = figma.createText();
    heading.characters = pageName;
    heading.fontSize = 18;
    section.appendChild(heading);

    const row = figma.createFrame();
    row.name = "Specimens";
    row.layoutMode = "HORIZONTAL";
    row.itemSpacing = 12;
    row.layoutWrap = "WRAP";
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "AUTO";
    row.fills = [];
    section.appendChild(row);

    for (const specimen of items) {
      const node = await createSpecimen(spec, specimen);
      row.appendChild(node);
    }

    section.layoutSizingHorizontal = "HUG";
    section.layoutSizingVertical = "HUG";
    y += section.height + 48;
  }

  figma.currentPage = componentsPage;
  figma.viewport.scrollAndZoomIntoView(componentsPage.children);
  figma.closePlugin(`Imported ${spec.specimens.length} specimens and ${spec.tokens.colors.length} colors.`);
}

function groupByPage(specimens) {
  return specimens.reduce((acc, item) => {
    acc[item.page] = acc[item.page] ?? [];
    acc[item.page].push(item);
    return acc;
  }, {});
}

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "import-url") {
      const res = await fetch(SPEC_URL);
      if (!res.ok) {
        throw new Error(`Fetch failed (${res.status})`);
      }
      const spec = await res.json();
      await buildLibrary(spec);
      return;
    }

    if (msg.type === "import-json") {
      const spec = JSON.parse(msg.spec);
      await buildLibrary(spec);
    }
  } catch (error) {
    figma.closePlugin(`Import failed: ${error.message}`);
  }
};
