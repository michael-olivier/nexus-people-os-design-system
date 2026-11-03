# Getting started

## Install (future)

When published to npm:

```bash
npm install @michael-olivier/nexus-people-os-design-system
```

For now, clone the repo or add a git submodule.

## CSS

**Bundled (recommended for prototypes):**

```html
<link rel="stylesheet" href="path/to/dist/nexus-ds.css" />
```

**Modular (for selective overrides):**

```html
<link rel="stylesheet" href="path/to/tokens/tokens.css" />
<link rel="stylesheet" href="path/to/components/buttons.css" />
```

## Icons

Components use [Lucide](https://lucide.dev/icons/) via `data-lucide` attributes. Sync `lucide.min.js` with `npm run icons:sync`.

## Fonts

Load Inter 300 and 400 from Google Fonts or self-host.

## Versioning

Tag releases on GitHub. Downstream apps (Career Coach Agent) should pin a tag when integrating.
