/* Navigation enhancement. Content and project links work without JavaScript. */
(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  const closeMenu = () => {
    nav?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav?.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  });
  nav
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document
    .querySelector(".site-header")
    ?.addEventListener("focusout", (event) => {
      if (
        event.relatedTarget &&
        !event.currentTarget.contains(event.relatedTarget)
      )
        closeMenu();
    });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle?.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  const desktop = matchMedia("(min-width: 861px)");
  const updateLayout = () => {
    if (desktop.matches) closeMenu();
    document.querySelectorAll(".case-sidebar").forEach((outline) => {
      outline.open = desktop.matches;
    });
  };
  desktop.addEventListener("change", updateLayout);
  updateLayout();
  if ("IntersectionObserver" in window) {
    const sections = document.querySelectorAll("main > section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          nav?.querySelectorAll('a[href^="#"]').forEach((link) => {
            if (link.hash === "#" + entry.target.id)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
  }
})();
