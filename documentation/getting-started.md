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

Components assume [Iconoir](https://iconoir.com/) class names (`iconoir-*`). Load Iconoir CSS in the host app.

## Fonts

Load Inter 300 and 400 from Google Fonts or self-host.

## Versioning

Tag releases on GitHub. Downstream apps (Career Coach Agent) should pin a tag when integrating.
