# Nexus People OS — Design System

Design tokens and UI primitives extracted from the [Career Coach Agent](https://github.com/michael-olivier/career-coach-agent) prototype (Nexus People OS). This repo is the **source of truth** for visual language; the prototype consumes it as a dependency once integration is wired.

## Documentation site

**https://michael-olivier.github.io/nexus-people-os-design-system/**

Atlassian-style gallery: top nav, sidebar, foundations, and live component previews (GitHub Pages).

## Status

**v0.1.0 — foundation** — tokens, typography, and core components aligned with the current prototype. Layout patterns (sidebar, workspace split, agent chat shell) stay in the app until later packages.

## Quick start

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&display=swap"
  rel="stylesheet"
/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/iconoir@7.12.1/css/iconoir.css" />
<link rel="stylesheet" href="./dist/nexus-ds.css" />
```

Or import in your own CSS:

```css
@import "@michael-olivier/nexus-people-os-design-system/dist/nexus-ds.css";
```

## Package layout

| Path | Purpose |
|------|---------|
| `tokens/` | CSS custom properties + `tokens.json` |
| `foundations/` | Reset, body defaults, type scale |
| `components/` | Buttons, forms, panels, status pills, agent icons, brand |
| `dist/nexus-ds.css` | Bundled entry (generated) |
| `website/` | Documentation site source |
| `site-dist/` | Built gallery (generated, deployed to Pages) |
| `documentation/` | Integration notes for downstream apps |

## Build

```bash
npm run build       # dist/nexus-ds.css
npm run build:site  # site-dist/ documentation gallery
npm run build:all   # both
```

Serve locally: `npx serve site-dist`

### Figma (CSS → library file)

Generate `figma/nexus-spec.json` from CSS, then run the **Import Nexus DS** plugin in Figma. See [documentation/figma-import.md](documentation/figma-import.md).

```bash
npm run figma:spec
```

No runtime dependencies. [Iconoir](https://iconoir.com/) is expected for icon components in product UIs.

## Relationship to the prototype

1. **Refine here** — tokens, naming, component APIs, documentation.
2. **Version** — tag releases (`v0.2.0`, …).
3. **Integrate** — point Career Coach Agent at a release. See [documentation/integration-career-coach.md](documentation/integration-career-coach.md).

## Principles (from the prototype)

- Light, Scandinavian-inspired surfaces with soft shadows and generous radius
- Inter at 300/400 weights; headings use tight negative tracking, not heavy bold
- Palette-1…10 gradient family; semantic roles (`--text`, `--muted`, `--line`, `--accent`)
- Agent identity via tinted icon tiles, not loud illustration

## License

ISC (match prototype); adjust if your org requires otherwise.
