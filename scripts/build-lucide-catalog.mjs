#!/usr/bin/env node
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { icons } from "lucide";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const toKebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

const iconList = Object.keys(icons)
  .map((pascalName) => {
    const slug = toKebab(pascalName);
    return {
      slug,
      label: slug.replace(/-/g, " "),
      pascalName,
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

const pkg = JSON.parse(readFileSync(join(root, "node_modules/lucide/package.json"), "utf8"));

const catalog = {
  library: "Lucide",
  version: pkg.version,
  homepage: "https://lucide.dev/icons/",
  count: iconList.length,
  icons: iconList,
};

const outPath = join(root, "website/data/lucide-catalog.json");
writeFileSync(outPath, `${JSON.stringify(catalog)}\n`);
console.log(`Wrote ${outPath} (${iconList.length} icons)`);
