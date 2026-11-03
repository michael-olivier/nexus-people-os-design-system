#!/usr/bin/env node
/**
 * Build figma/nexus-spec.json from tokens + component CSS + doc preview HTML.
 * Consumed by figma/plugin (Import Nexus DS).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sources = JSON.parse(readFileSync(join(root, "figma/sources.json"), "utf8"));

const HEX_RE = /#([0-9a-f]{3,8})\b/i;
const RGB_RE = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;

const parseTokensCss = (css) => {
  const raw = {};
  for (const line of css.split("\n")) {
    const match = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?)\s*;/);
    if (match) {
      raw[match[1]] = match[2].trim();
    }
  }

  const resolve = (value, depth = 0) => {
    if (depth > 8) {
      return value;
    }
    const varMatch = value.match(/var\((--[\w-]+)\)/);
    if (varMatch) {
      return resolve(raw[varMatch[1]] ?? value, depth + 1);
    }
    return value;
  };

  const colors = [];
  for (const [name, value] of Object.entries(raw)) {
    const resolved = resolve(value);
    let hex = null;
    const hexMatch = resolved.match(HEX_RE);
    if (hexMatch) {
      hex = hexMatch[0].length === 4 ? expandShortHex(hexMatch[0]) : hexMatch[0];
    } else {
      const rgbMatch = resolved.match(RGB_RE);
      if (rgbMatch) {
        hex = rgbToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]));
      }
    }
    if (hex && (name.includes("palette") || ["--bg", "--surface", "--text", "--muted", "--line", "--accent", "--accent-soft"].includes(name))) {
      colors.push({ cssVar: name, name: name.replace(/^--/, ""), hex, raw: value });
    }
  }

  return { raw, colors };
};

const expandShortHex = (short) => {
  const h = short.slice(1);
  return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
};

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;

const parseSimpleRules = (css) => {
  const rules = {};
  const blockRe = /([^{]+)\{([^}]+)\}/g;
  let match;
  while ((match = blockRe.exec(css)) !== null) {
    const selector = match[1].trim();
    if (selector.includes(",") || selector.includes(":") || selector.includes(" ")) {
      continue;
    }
    const className = selector.replace(/^\./, "");
    if (!className) {
      continue;
    }
    const props = {};
    for (const decl of match[2].split(";")) {
      const [prop, val] = decl.split(":").map((s) => s?.trim());
      if (prop && val) {
        props[prop] = val;
      }
    }
    rules[className] = props;
  }
  return rules;
};

const extractPreviewSpecimens = (html, pageTitle) => {
  const specimens = [];
  const sectionRe = /<section class="ds-section">\s*<h2>([^<]+)<\/h2>\s*<div class="ds-preview[^"]*">([\s\S]*?)<\/div>\s*<\/section>/g;
  let sectionMatch;
  while ((sectionMatch = sectionRe.exec(html)) !== null) {
    const section = sectionMatch[1].trim();
    const block = sectionMatch[2];

    const buttonRe = /<button[^>]*class="([^"]*)"[^>]*>([^<]*)<\/button>/g;
    let buttonMatch;
    while ((buttonMatch = buttonRe.exec(block)) !== null) {
      specimens.push({
        page: pageTitle,
        section,
        kind: "button",
        classes: buttonMatch[1].split(/\s+/).filter(Boolean),
        text: buttonMatch[2].trim() || "Button",
      });
    }

    const pillRe = /<span class="(status-pill[^"]*)">[\s\S]*?<\/span>\s*([^<]+)/g;
    let pillMatch;
    while ((pillMatch = pillRe.exec(block)) !== null) {
      specimens.push({
        page: pageTitle,
        section,
        kind: "status-pill",
        classes: pillMatch[1].split(/\s+/).filter(Boolean),
        text: pillMatch[2].trim(),
      });
    }

    const agentRe = /<span class="(agent-icon[^"]*)"[^>]*title="([^"]*)"/g;
    let agentMatch;
    while ((agentMatch = agentRe.exec(block)) !== null) {
      specimens.push({
        page: pageTitle,
        section,
        kind: "agent-icon",
        classes: agentMatch[1].split(/\s+/).filter(Boolean),
        text: agentMatch[2],
      });
    }

    if (block.includes("class=\"panel\"")) {
      specimens.push({
        page: pageTitle,
        section,
        kind: "panel",
        classes: ["panel"],
        text: "Panel",
      });
    }

    if (block.includes("class=\"input-row")) {
      specimens.push({
        page: pageTitle,
        section,
        kind: "input-row",
        classes: ["input-row"],
        text: "Ask People OS…",
      });
    }

    if (block.includes("class=\"brand\"")) {
      specimens.push({
        page: pageTitle,
        section,
        kind: "brand",
        classes: ["brand"],
        text: "Nexus People OS",
      });
    }
  }

  return specimens;
};

const tokensCss = readFileSync(join(root, "tokens/tokens.css"), "utf8");
const tokens = parseTokensCss(tokensCss);

const cssRules = {};
for (const file of sources.componentCss) {
  const css = readFileSync(join(root, file), "utf8");
  Object.assign(cssRules, parseSimpleRules(css));
}

const specimens = [];
for (const page of sources.previewPages) {
  const html = readFileSync(join(root, page.file), "utf8");
  specimens.push(...extractPreviewSpecimens(html, page.title));
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const spec = {
  meta: {
    name: "Nexus People OS",
    version: pkg.version,
    generatedAt: new Date().toISOString(),
    sourceRepo: "https://github.com/michael-olivier/nexus-people-os-design-system",
  },
  tokens,
  cssRules,
  specimens,
};

const outPath = join(root, "figma/nexus-spec.json");
writeFileSync(outPath, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`Wrote ${outPath} (${tokens.colors.length} colors, ${Object.keys(cssRules).length} css rules, ${specimens.length} specimens)`);
