#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseTokensCss } from "./parse-tokens-css.mjs";
import { highlightDocCode } from "./highlight-content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensCss = readFileSync(join(root, "tokens/tokens.css"), "utf8");
const colorTokens = parseTokensCss(tokensCss);
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
    description: "Start designing and developing with Nexus People OS.",
    activeSection: "get-started",
    activePage: "get-started",
    topStart: true,
  },
  {
    content: "get-started-overview.html",
    out: "get-started/overview/index.html",
    title: "Overview",
    description: "Install Nexus People OS CSS, fonts, and icons.",
    activeSection: "get-started",
    activePage: "get-started-overview",
    topStart: true,
  },
  {
    content: "get-started-design.html",
    out: "get-started/design/index.html",
    title: "Design",
    description: "Design with Nexus People OS tokens and Figma.",
    activeSection: "get-started",
    activePage: "get-started-design",
    topStart: true,
  },
  {
    content: "get-started-develop.html",
    out: "get-started/develop/index.html",
    title: "Develop",
    description: "Develop with the Nexus People OS CSS bundle.",
    activeSection: "get-started",
    activePage: "get-started-develop",
    topStart: true,
  },
  {
    content: "get-started-about.html",
    out: "get-started/about/index.html",
    title: "About the Design System",
    description: "About Nexus People OS Design System.",
    activeSection: "get-started",
    activePage: "get-started-about",
    topStart: true,
  },
  {
    content: "foundations-index.html",
    out: "foundations/index.html",
    title: "Foundations",
    description: "Nexus People OS design foundations.",
    activeSection: "foundations",
    activePage: "foundations",
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
    content: "foundations-icons.html",
    out: "foundations/icons/index.html",
    title: "Icons",
    description: "Iconoir library with searchable gallery.",
    activeSection: "foundations",
    activePage: "icons",
  },
  {
    content: "foundations-content.html",
    out: "foundations/content/index.html",
    title: "Content",
    description: "Writing guidelines for Nexus People OS product copy.",
    activeSection: "foundations",
    activePage: "content",
  },
  {
    content: "foundations-content-style-grammar.html",
    out: "foundations/content/style-grammar-punctuation/index.html",
    title: "Style, Grammar, and Punctuation",
    description: "Style, grammar, and punctuation for Nexus People OS UI copy.",
    activeSection: "foundations",
    activePage: "content-style-grammar",
  },
  {
    content: "foundations-content-voice-tone.html",
    out: "foundations/content/voice-tone/index.html",
    title: "Voice and Tone",
    description: "Voice and tone for Nexus People OS experiences.",
    activeSection: "foundations",
    activePage: "content-voice-tone",
  },
  {
    content: "foundations-content-date-time.html",
    out: "foundations/content/date-time/index.html",
    title: "Date and Time",
    description: "Date and time formats for Nexus People OS UI.",
    activeSection: "foundations",
    activePage: "content-date-time",
  },
  {
    content: "foundations-content-messages.html",
    out: "foundations/content/messages/index.html",
    title: "Messages",
    description: "Message patterns for Nexus People OS UI.",
    activeSection: "foundations",
    activePage: "content-messages",
  },
  {
    content: "foundations-content-messages-empty-state.html",
    out: "foundations/content/messages/empty-state/index.html",
    title: "Empty State",
    description: "Empty state messages for Nexus People OS.",
    activeSection: "foundations",
    activePage: "content-messages-empty-state",
  },
  {
    content: "foundations-content-messages-error-message.html",
    out: "foundations/content/messages/error-message/index.html",
    title: "Error Message",
    description: "Error messages for Nexus People OS.",
    activeSection: "foundations",
    activePage: "content-messages-error-message",
  },
  {
    content: "foundations-content-messages-feature-discovery.html",
    out: "foundations/content/messages/feature-discovery/index.html",
    title: "Feature Discovery",
    description: "Feature discovery and education messages.",
    activeSection: "foundations",
    activePage: "content-messages-feature-discovery",
  },
  {
    content: "foundations-content-messages-info.html",
    out: "foundations/content/messages/info-messages/index.html",
    title: "Info Messages",
    description: "Informational messages for Nexus People OS.",
    activeSection: "foundations",
    activePage: "content-messages-info",
  },
  {
    content: "foundations-content-messages-success.html",
    out: "foundations/content/messages/success-messages/index.html",
    title: "Success Messages",
    description: "Success messages for Nexus People OS.",
    activeSection: "foundations",
    activePage: "content-messages-success",
  },
  {
    content: "foundations-content-messages-warning.html",
    out: "foundations/content/messages/warning-messages/index.html",
    title: "Warning Messages",
    description: "Warning messages for Nexus People OS.",
    activeSection: "foundations",
    activePage: "content-messages-warning",
  },
  {
    content: "components-index.html",
    out: "components/index.html",
    title: "Components",
    description: "Nexus People OS UI components.",
    activeSection: "components",
    activePage: "components",
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

const pageHrefFrom = (fromOut, pagePath) => {
  const rootPrefix = assetRootFrom(fromOut);
  return `${rootPrefix}${pagePath}`;
};

const renderNavLinks = (fromOut, sectionId, activeSection, activePage, pages, nested = false) =>
  pages
    .map((page) => {
      const isActive = sectionId === activeSection && page.slug === activePage;
      const href = pageHrefFrom(fromOut, page.path);
      const nestedClass = nested ? " ds-nav-link--nested" : "";
      return `<a class="ds-nav-link${nestedClass}${isActive ? " is-active" : ""}" href="${href}">${page.label}</a>`;
    })
    .join("");

const renderSidebar = (fromOut, activeSection, activePage) => {
  const groups = nav.sections
    .map((section) => {
      const nestedPages = Boolean(section.path);
      let links = renderNavLinks(
        fromOut,
        section.id,
        activeSection,
        activePage,
        section.pages,
        nestedPages,
      );
      for (const subsection of section.subsections ?? []) {
        const branchSlugs = [subsection.slug, ...subsection.pages.map((page) => page.slug)];
        const branchHref = pageHrefFrom(fromOut, subsection.path);
        const branchActive =
          section.id === activeSection && activePage === subsection.slug ? " is-active" : "";
        const childLinks = renderNavLinks(
          fromOut,
          section.id,
          activeSection,
          activePage,
          subsection.pages,
          true,
        );
        links += `<details class="ds-nav-subgroup" data-nav-id="${subsection.slug}"><summary class="ds-nav-subgroup-summary"><button type="button" class="ds-nav-chevron-btn" aria-label="Toggle ${subsection.label}"><span class="ds-nav-chevron" aria-hidden="true">›</span></button><a class="ds-nav-link ds-nav-link--branch${branchActive}" href="${branchHref}">${subsection.label}</a></summary><nav class="ds-nav-sublist">${childLinks}</nav></details>`;
      }
      const branchActive =
        section.id === activeSection && activePage === section.slug ? " is-active" : "";
      const chevronBtn = `<button type="button" class="ds-nav-chevron-btn" aria-label="Toggle ${section.label}"><span class="ds-nav-chevron" aria-hidden="true">›</span></button>`;
      const summary = section.path
        ? `<summary class="ds-nav-group-summary">${chevronBtn}<a class="ds-nav-link ds-nav-link--branch${branchActive}" href="${pageHrefFrom(fromOut, section.path)}">${section.label}</a></summary>`
        : `<summary class="ds-nav-group-summary">${chevronBtn}<span class="ds-nav-group-label">${section.label}</span></summary>`;
      return `<details class="ds-nav-group" data-nav-id="${section.id}">${summary}<nav class="ds-nav-list">${links}</nav></details>`;
    })
    .join("");

  return `<nav class="ds-nav">${groups}</nav>`;
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const swatchHtml = (cssVar, title, subtitle) => {
  const varName = escapeHtml(cssVar);
  const chipStyle = `background:var(${varName})`;
  return `<div class="ds-swatch"><div class="ds-swatch-chip" style="${chipStyle}"></div><div class="ds-swatch-meta"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(subtitle)}</span></div></div>`;
};

const PALETTE_ROWS = [
  { var: "--nx-palette-1", title: "palette-1" },
  { var: "--nx-palette-2", title: "palette-2" },
  { var: "--nx-palette-3", title: "palette-3" },
  { var: "--nx-palette-4", title: "palette-4" },
  { var: "--nx-palette-5", title: "palette-5" },
  { var: "--nx-palette-6", title: "palette-6" },
  { var: "--nx-palette-7", title: "palette-7 / nexus-cyan" },
  { var: "--nx-palette-8", title: "palette-8" },
  { var: "--nx-palette-9", title: "palette-9" },
];

const SEMANTIC_ROWS = [
  { var: "--bg", description: "Page background" },
  { var: "--surface", description: "Cards & inputs" },
  { var: "--surface-muted", description: "Muted surfaces" },
  { var: "--text", description: "Primary text" },
  { var: "--muted", description: "Secondary text" },
  { var: "--line", description: "Borders & dividers" },
  { var: "--accent", description: "Brand accent (alias)" },
  { var: "--accent-soft", description: "Soft accent fill" },
  { var: "--nexus-cyan", description: "Cyan highlight (alias)" },
];

const renderColorSwatches = () => {
  const paletteSwatches = PALETTE_ROWS.map(({ var: cssVar, title }) => {
    const hex = colorTokens.hex(cssVar) ?? "—";
    return swatchHtml(cssVar, title, hex);
  }).join("\n    ");

  const semanticSwatches = SEMANTIC_ROWS.map(({ var: cssVar, description }) => {
    const hex = colorTokens.hex(cssVar) ?? "—";
    return swatchHtml(cssVar, cssVar, `${hex} · ${description}`);
  }).join("\n    ");

  return { paletteSwatches, semanticSwatches };
};

const colorSwatchBlocks = renderColorSwatches();

const distCss = join(root, "dist/nexus-ds.css");
const lucideJs = join(root, "assets/vendor/lucide.min.js");
const lucideCatalog = join(website, "data/lucide-catalog.json");

if (!existsSync(distCss)) {
  throw new Error("Missing dist/nexus-ds.css — run: npm run build");
}
for (const file of [lucideJs, lucideCatalog]) {
  if (!existsSync(file)) {
    throw new Error(`Missing ${file} — run: npm install && npm run icons:sync && npm run icons:catalog`);
  }
}

rmSync(outRoot, { recursive: true, force: true });
mkdirSync(join(outRoot, "assets"), { recursive: true });
mkdirSync(join(outRoot, "assets/vendor"), { recursive: true });
mkdirSync(join(outRoot, "design-system"), { recursive: true });

cpSync(join(root, "assets/vendor/lucide.min.js"), join(outRoot, "assets/vendor/lucide.min.js"));
cpSync(join(website, "data/lucide-catalog.json"), join(outRoot, "assets/lucide-catalog.json"));

cpSync(join(website, "assets/docs.css"), join(outRoot, "assets/docs.css"));
cpSync(join(website, "assets/docs-code.css"), join(outRoot, "assets/docs-code.css"));
cpSync(join(website, "assets/docs.js"), join(outRoot, "assets/docs.js"));
cpSync(join(website, "assets/icons-gallery.js"), join(outRoot, "assets/icons-gallery.js"));
const logoSrc = existsSync(join(root, "assets/nexus-logo.png"))
  ? join(root, "assets/nexus-logo.png")
  : join(root, "examples/nexus-logo.png");
cpSync(logoSrc, join(outRoot, "assets/nexus-logo.png"));
cpSync(join(root, "dist/nexus-ds.css"), join(outRoot, "design-system/nexus-ds.css"));
writeFileSync(join(outRoot, ".nojekyll"), "");

for (const page of PAGES) {
  const rootPrefix = assetRootFrom(page.out);
  let content = readFileSync(join(website, "content", page.content), "utf8");
  content = content.replaceAll("{{root}}", rootPrefix);
  if (page.content === "foundations-color.html") {
    content = content
      .replaceAll("{{paletteSwatches}}", colorSwatchBlocks.paletteSwatches)
      .replaceAll("{{semanticSwatches}}", colorSwatchBlocks.semanticSwatches);
  }
  content = highlightDocCode(content);

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
