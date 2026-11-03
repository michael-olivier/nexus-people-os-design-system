/** Iconoir slug (no prefix) → Lucide `data-lucide` name */
export const ICONOIR_TO_LUCIDE = {
  "nav-arrow-left": "chevron-left",
  "nav-arrow-right": "chevron-right",
  "nav-arrow-down": "chevron-down",
  "task-list": "list-todo",
  group: "users",
  "graph-up": "trending-up",
  "message-text": "message-square-text",
  "book-stack": "library-big",
  "layout-left": "panel-left",
  sparks: "sparkles",
  "chat-bubble": "message-circle",
  microphone: "mic",
  "emoji-sad": "frown",
  "emoji-blink-right": "meh",
  "warning-circle": "alert-circle",
  collapse: "chevrons-up",
  expand: "chevrons-down",
  airplane: "plane",
  pin: "map-pin",
  xmark: "x",
  check: "check",
  spark: "sparkles",
  search: "search",
};

export function iconoirSlugToLucide(slug) {
  return ICONOIR_TO_LUCIDE[slug] ?? slug;
}

export function migrateIconoirMarkup(html) {
  return html.replace(
    /<i\s+class="iconoir-([a-z0-9-]+)([^"]*)"([^>]*)>/gi,
    (_match, slug, extraClasses, tail) => {
      const lucide = iconoirSlugToLucide(slug);
      const cls = extraClasses.trim();
      const classAttr = cls ? ` class="${cls}"` : "";
      return `<i data-lucide="${lucide}"${classAttr}${tail}>`;
    },
  );
}
