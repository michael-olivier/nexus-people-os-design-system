const grid = document.querySelector("#icon-grid");
const searchInput = document.querySelector("#icon-search");
const countEl = document.querySelector("#icon-count");
const emptyEl = document.querySelector("#icon-empty");
const gallery = document.querySelector("#icon-gallery");
const strokeInput = document.querySelector("#icon-stroke");
const strokeValueEl = document.querySelector("#icon-stroke-value");
const sizeTabs = document.querySelectorAll(".ds-icon-size-tab");
const toastEl = document.querySelector("#ds-icon-toast");

const getRootPrefix = () => {
  const script = document.querySelector('script[src*="icons-gallery.js"]');
  if (!script?.src) {
    return "./";
  }
  const url = new URL(script.src);
  return url.pathname.replace(/assets\/icons-gallery\.js.*$/, "");
};

const rootPrefix = getRootPrefix();

let strokeWidth = 1.5;
let iconSizePx = 24;
let toastTimer;

const applyPreviewVars = () => {
  gallery?.style.setProperty("--ds-icon-preview-size", `${iconSizePx}px`);
  gallery?.style.setProperty("--ds-icon-stroke-width", String(strokeWidth));
};

const applyStrokeWidth = (root) => {
  const scope = root ?? grid;
  if (!scope) {
    return;
  }
  scope.querySelectorAll("svg.lucide").forEach((svg) => {
    svg.setAttribute("stroke-width", String(strokeWidth));
    svg.querySelectorAll("path, line, circle, rect, polyline, polygon, ellipse").forEach((node) => {
      node.setAttribute("stroke-width", String(strokeWidth));
    });
  });
};

const paintIcons = (root) => {
  if (typeof lucide === "undefined") {
    return;
  }
  lucide.createIcons(
    {
      attrs: {
        "stroke-width": String(strokeWidth),
        "aria-hidden": "true",
      },
    },
    root ?? document,
  );
  applyStrokeWidth(root ?? grid);
};

const showToast = (message) => {
  if (!toastEl) {
    return;
  }
  toastEl.textContent = message;
  toastEl.hidden = false;
  toastEl.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
    window.setTimeout(() => {
      toastEl.hidden = true;
    }, 220);
  }, 2600);
};

const copySlug = async (slug) => {
  let copied = false;
  try {
    await navigator.clipboard.writeText(slug);
    copied = true;
  } catch {
    copied = false;
  }
  showToast(
    copied ? `Copied “${slug}” to clipboard` : `Could not copy “${slug}” — check browser permissions`,
  );
};

let lastCount = 0;

const updateMeta = (count) => {
  lastCount = count;
  countEl.textContent = `${count.toLocaleString()} icon${count === 1 ? "" : "s"} · ${iconSizePx}px · stroke ${strokeWidth}px · click a tile to copy its name`;
};

const render = (catalog, query) => {
  const q = query.trim().toLowerCase();
  let items = catalog.icons;
  if (q) {
    items = items.filter((icon) => icon.slug.includes(q) || icon.label.includes(q));
  }

  grid.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (const icon of items) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "ds-icon-tile";
    tile.role = "listitem";
    tile.innerHTML = `<span class="ds-icon-tile-visual"><i data-lucide="${icon.slug}"></i></span><span class="ds-icon-hover-label">${icon.slug}</span>`;
    tile.addEventListener("click", () => copySlug(icon.slug));
    fragment.appendChild(tile);
  }

  grid.appendChild(fragment);
  applyPreviewVars();
  paintIcons(grid);
  emptyEl.hidden = items.length > 0;
  updateMeta(items.length);
};

const refreshPreview = () => {
  applyPreviewVars();
  applyStrokeWidth(grid);
  updateMeta(grid.querySelectorAll(".ds-icon-tile").length);
};

const boot = async () => {
  if (!grid || !searchInput) {
    return;
  }

  applyPreviewVars();

  strokeInput?.addEventListener("input", () => {
    strokeWidth = Number.parseFloat(strokeInput.value);
    if (strokeValueEl) {
      strokeValueEl.textContent = `${strokeWidth}px`;
    }
    strokeInput.setAttribute("aria-valuenow", String(strokeWidth));
    refreshPreview();
  });

  sizeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      iconSizePx = Number.parseInt(tab.dataset.size ?? "24", 10);
      sizeTabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.classList.toggle("is-active", selected);
      });
      refreshPreview();
    });
  });

  const res = await fetch(`${rootPrefix}assets/lucide-catalog.json`);
  if (!res.ok) {
    countEl.textContent = "Could not load icon catalog.";
    return;
  }
  const catalog = await res.json();
  window.__lucideCatalog = catalog;

  const update = () => render(catalog, searchInput.value);
  searchInput.addEventListener("input", update);
  update();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
