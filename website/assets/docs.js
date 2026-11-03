const menuButton = document.querySelector("#ds-menu-button");
const sidebar = document.querySelector("#ds-sidebar");

const navStorageKey = (id) => `ds-nav:${id}`;

menuButton?.addEventListener("click", () => {
  const open = sidebar?.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(Boolean(open)));
});

document.addEventListener("click", (event) => {
  if (!sidebar?.classList.contains("is-open")) {
    return;
  }

  if (event.target.closest("#ds-sidebar") || event.target.closest("#ds-menu-button")) {
    return;
  }

  sidebar.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
});

const persistNavOpenState = () => {
  document.querySelectorAll("details[data-nav-id]").forEach((details) => {
    const id = details.dataset.navId;
    if (!id) {
      return;
    }
    sessionStorage.setItem(navStorageKey(id), details.open ? "open" : "closed");
  });
};

const initNavGroups = () => {
  document.querySelectorAll("details.ds-nav-group, details.ds-nav-subgroup").forEach((details) => {
    const id = details.dataset.navId;
    const summary = details.querySelector(":scope > summary");
    if (!summary) {
      return;
    }

    const hasActive = details.querySelector(".ds-nav-link.is-active");
    const stored = id ? sessionStorage.getItem(navStorageKey(id)) : null;

    if (stored === "open") {
      details.open = true;
    } else if (stored === "closed") {
      details.open = false;
    } else if (hasActive) {
      details.open = true;
    }

    summary.addEventListener("click", (event) => {
      if (event.target.closest(".ds-nav-link--branch") || event.target.closest(".ds-nav-chevron-btn")) {
        return;
      }
      event.preventDefault();
    });

    summary.querySelectorAll(".ds-nav-chevron-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        details.open = !details.open;
        persistNavOpenState();
      });
    });

    summary.querySelectorAll(".ds-nav-link--branch").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.stopPropagation();
        persistNavOpenState();
      });
    });

    details.addEventListener("toggle", () => {
      if (id) {
        sessionStorage.setItem(navStorageKey(id), details.open ? "open" : "closed");
      }
    });
  });

  window.addEventListener("pagehide", persistNavOpenState);
};

const initLucide = () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons({ attrs: { "stroke-width": "1.5" } });
  }
};

const boot = () => {
  initNavGroups();
  initLucide();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
