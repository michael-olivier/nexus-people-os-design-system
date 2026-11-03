const menuButton = document.querySelector("#ds-menu-button");
const sidebar = document.querySelector("#ds-sidebar");

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

document.querySelectorAll(".ds-nav-group").forEach((group) => {
  if (group.querySelector(".ds-nav-link.is-active")) {
    group.open = true;
  }
});
