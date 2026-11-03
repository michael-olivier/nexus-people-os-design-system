#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const parts = [
  "tokens/tokens.css",
  "foundations/base.css",
  "foundations/typography.css",
  "components/brand.css",
  "components/buttons.css",
  "components/forms.css",
  "components/panels.css",
  "components/status-pill.css",
  "components/agent-icon.css",
];

const banner = `/*!
 * Nexus People OS Design System v0.1.0
 * https://github.com/michael-olivier/nexus-people-os-design-system
 */\n\n`;

const body = parts
  .map((rel) => readFileSync(join(root, rel), "utf8"))
  .join("\n");

mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "nexus-ds.css"), banner + body);
console.log(`Wrote dist/nexus-ds.css (${parts.length} partials)`);
