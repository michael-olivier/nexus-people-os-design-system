# Figma import (CSS → file)

Figma’s REST API **cannot** create a full design file from GitHub alone. This repo uses a **two-step pipeline**: generate a JSON spec from CSS, then run a **Figma plugin** that builds variables and frames.

## 1. Generate the spec (from CSS + doc previews)

```bash
npm run figma:spec
```

Writes **`figma/nexus-spec.json`** with:

- **Color tokens** parsed from `tokens/tokens.css`
- **CSS rules** for simple class selectors in `components/*.css`
- **Specimens** extracted from live preview markup in `website/content/*.html`

Edit **`figma/sources.json`** if you add component CSS files or new doc preview pages.

## 2. Install the plugin (one time)

1. Open Figma → **Plugins** → **Development** → **Import plugin from manifest…**
2. Choose `figma/plugin/manifest.json` in this repo.
3. If you update the plugin code, use **Development → Reset plugin** or re-import the manifest.

## 3. Create the library file

1. Create a new Figma design file (e.g. “Nexus People OS — Library”).
2. Run **Plugins → Development → Import Nexus DS**.
3. Prefer **choose local spec file** → pick `figma/nexus-spec.json` from this repo (most reliable).
4. Or click **Import from GitHub** (requires network access; Figma will prompt to allow `raw.githubusercontent.com` the first time).

If import fails with a font error, open the file once in Figma and add **Inter** from Google Fonts (or the plugin will fall back to Roboto).

The plugin will:

- Create a **Nexus / Colors** variable collection
- Add a **Tokens** page (swatches)
- Add a **Components** page (buttons, pills, panels, etc. from previews)

## 4. Keep Figma in sync with code

Whenever you change tokens or components:

```bash
npm run figma:spec
git add figma/nexus-spec.json && git commit -m "Update Figma spec" && git push
```

Re-run the plugin in Figma (it replaces the Tokens / Components pages).

## Limits

- Only **simple** CSS selectors are parsed (single class, no `:hover` in Figma output).
- **Structure** comes from doc previews, not CSS alone (CSS has no component tree).
- **Lucide** icons are rendered in code/docs; Figma specimens use placeholders unless you add SVG assets manually.
- For pixel-perfect parity, refine components in Figma after import (expected for v1).

## Alternative: html.to.design

You can also import the live docs site URL into Figma with third-party plugins; the pipeline above keeps the file tied to **your** token names and repo versions.
