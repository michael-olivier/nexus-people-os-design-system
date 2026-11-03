# Integrating with Career Coach Agent

The prototype currently ships a monolithic `styles.css`. Target end state:

1. **Replace** duplicated token and component rules with `@import` or a copied `dist/nexus-ds.css`.
2. **Keep** app-specific layout in the prototype: `.app-shell`, `.sidebar`, workspace split, agent chat session, carousels, travel flows.
3. **Diff** after each design-system release; migrate new tokens/components here first, then pull into the app.

## Suggested migration order

| Phase | Scope |
|-------|--------|
| v0.1 | Tokens + buttons + forms + panels + status pills + agent icons (this repo) |
| v0.2 | Navigation patterns (nav-item, sidebar shell) |
| v0.3 | Workspace list/detail, task rows |
| v0.4 | Agent chat + travel chat shells |

## Local development

```bash
# In design-system repo
npm run build

# In career-coach-agent — temporary symlink or copy
cp ../nexus-people-os-design-system/dist/nexus-ds.css ./assets/vendor/nexus-ds.css
```

In `index.html`, load `nexus-ds.css` **before** app-specific `styles.css` so layout overrides still win.

## Private source repo

Keep `career-coach-agent` private; this design-system repo can be **public** for portfolio and reuse.
