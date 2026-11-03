#!/usr/bin/env node
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const website = join(root, "website");
const outRoot = join(root, "site-dist");

const layout = readFileSync(join(website, "layout.html"), "utf8");
const nav = JSON.parse(readFileSync(join(website, "nav.json"), "utf8"));

const PAGES = [
  {
    content: "index.html",
    out: "index.html",
    title: "Design system",
    description: "Nexus People OS design tokens, foundations, and components.",
    activeSection: "",
    activePage: "",
    topDesign: true,
  },
  {
    content: "get-started.html",
    out: "get-started/index.html",
    title: "Get started",
    description: "Install Nexus People OS CSS, fonts, and icons.",
    activeSection: "get-started",
    activePage: "get-started",
    topStart: true,
  },
  {
    content: "foundations-color.html",
    out: "foundations/color/index.html",
    title: "Color",
    description: "Palette and semantic color tokens.",
    activeSection: "foundations",
    activePage: "color",
  },
  {
    content: "foundations-typography.html",
    out: "foundations/typography/index.html",
    title: "Typography",
    description: "Inter type scale and labels.",
    activeSection: "foundations",
    activePage: "typography",
  },
  {
    content: "components-brand.html",
    out: "components/brand/index.html",
    title: "Brand",
    description: "Nexus mark and wordmark lockup.",
    activeSection: "components",
    activePage: "brand",
  },
  {
    content: "components-buttons.html",
    out: "components/buttons/index.html",
    title: "Buttons",
    description: "Primary, secondary, icon, and prompt chips.",
    activeSection: "components",
    activePage: "buttons",
  },
  {
    content: "components-forms.html",
    out: "components/forms/index.html",
    title: "Forms",
    description: "Chat composer and input rows.",
    activeSection: "components",
    activePage: "forms",
  },
  {
    content: "components-panels.html",
    out: "components/panels/index.html",
    title: "Panels",
    description: "Dashboard panel surfaces.",
    activeSection: "components",
    activePage: "panels",
  },
  {
    content: "components-status-pills.html",
    out: "components/status-pills/index.html",
    title: "Status pills",
    description: "Task and workflow status labels.",
    activeSection: "components",
    activePage: "status-pills",
  },
  {
    content: "components-agent-icons.html",
    out: "components/agent-icons/index.html",
    title: "Agent icons",
    description: "Agent identity tiles.",
    activeSection: "components",
    activePage: "agent-icons",
  },
];

const hrefFrom = (fromOut, targetOut) => {
  const fromDir = dirname(join(outRoot, fromOut));
  const targetPath = join(outRoot, targetOut);
  let href = relative(fromDir, targetPath).replace(/\\/g, "/");
  if (!href.startsWith(".")) {
    href = `./${href}`;
  }
  return href;
};

const assetRootFrom = (fromOut) => {
  const fromDir = dirname(join(outRoot, fromOut));
  let href = relative(fromDir, outRoot).replace(/\\/g, "/");
  if (!href) {
    return "./";
  }
  if (!href.endsWith("/")) {
    href = `${href}/`;
  }
  return href;
};

const renderSidebar = (fromOut, activeSection, activePage) => {
  const groups = nav.sections
    .map((section) => {
      const links = section.pages
        .map((page) => {
          const isActive = section.id === activeSection && page.slug === activePage;
          const href = hrefFrom(fromOut, page.path);
          return `<a class="ds-nav-link${isActive ? " is-active" : ""}" href="${href}">${page.label}</a>`;
        })
        .join("");
      const open = section.id === activeSection ? " open" : "";
      return `<details class="ds-nav-group"${open}><summary>${section.label}</summary><nav class="ds-nav-list">${links}</nav></details>`;
    })
    .join("");

  return `<nav class="ds-nav">${groups}</nav>`;
};

rmSync(outRoot, { recursive: true, force: true });
mkdirSync(join(outRoot, "assets"), { recursive: true });
mkdirSync(join(outRoot, "design-system"), { recursive: true });

cpSync(join(website, "assets/docs.css"), join(outRoot, "assets/docs.css"));
cpSync(join(website, "assets/docs.js"), join(outRoot, "assets/docs.js"));
cpSync(join(root, "examples/nexus-logo.png"), join(outRoot, "assets/nexus-logo.png"));
cpSync(join(root, "dist/nexus-ds.css"), join(outRoot, "design-system/nexus-ds.css"));
writeFileSync(join(outRoot, ".nojekyll"), "");

for (const page of PAGES) {
  const rootPrefix = assetRootFrom(page.out);
  let content = readFileSync(join(website, "content", page.content), "utf8");
  content = content.replaceAll("{{root}}", rootPrefix);

  const html = layout
    .replaceAll("{{title}}", page.title)
    .replaceAll("{{description}}", page.description)
    .replaceAll("{{root}}", rootPrefix)
    .replaceAll("{{content}}", content)
    .replaceAll("{{sidebar}}", renderSidebar(page.out, page.activeSection, page.activePage))
    .replaceAll("{{activeSection}}", page.activeSection)
    .replaceAll("{{activePage}}", page.activePage)
    .replaceAll("{{topDesignActive}}", page.topDesign ? " is-active" : "")
    .replaceAll("{{topStartActive}}", page.topStart ? " is-active" : "");

  const outFile = join(outRoot, page.out);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html);
}

console.log(`Built site → ${outRoot} (${PAGES.length} pages)`);
