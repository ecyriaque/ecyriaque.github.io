/* Small native interactions; navigation and content never depend on motion. */
(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  const header = document.querySelector(".site-header");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const desktop = matchMedia("(min-width: 861px)");
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
  header?.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget))
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
    if (
      event.target instanceof Element &&
      !event.target.closest(".site-header")
    )
      closeMenu();
  });
  const layout = () => {
    if (desktop.matches) closeMenu();
    document.querySelectorAll(".case-sidebar").forEach((outline) => {
      outline.open = desktop.matches;
    });
  };
  desktop.addEventListener("change", layout);
  layout();

  const running = new Set();
  const seen = new WeakSet();
  const ease = "cubic-bezier(.22,1,.36,1)";
  const play = (element, frames, options) => {
    if (reduced.matches || typeof element?.animate !== "function") return;
    const animation = element.animate(frames, options);
    running.add(animation);
    animation.finished.then(
      () => running.delete(animation),
      () => running.delete(animation),
    );
  };
  document.querySelectorAll(".hero-word").forEach((word, index) => {
    play(
      word,
      [
        { transform: "translateY(105%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 950, delay: index * 115, easing: ease, fill: "backwards" },
    );
  });
  document
    .querySelectorAll(".hero-top, .hero-bottom, .case-lead")
    .forEach((element, index) => {
      play(
        element,
        [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 750,
          delay: 160 + index * 85,
          easing: ease,
          fill: "backwards",
        },
      );
    });

  const targets = document.querySelectorAll(
    ".section-head, .project-card, .experiment, .timeline-item, .skill-item, .about-copy, .education, .contact-grid, .case-article h2",
  );
  let reveal;
  const observe = () => {
    reveal?.disconnect();
    if (reduced.matches || !("IntersectionObserver" in window)) return;
    reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          reveal.unobserve(entry.target);
          play(
            entry.target,
            [
              { opacity: 0, transform: "translateY(26px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 700, easing: ease },
          );
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -25px 0px" },
    );
    targets.forEach((element) => {
      if (!seen.has(element)) reveal.observe(element);
    });
  };
  observe();

  const progress = document.createElement("span");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  header?.append(progress);
  const visuals = [...document.querySelectorAll(".project-visual")];
  let frame = 0;
  const updateScroll = () => {
    frame = 0;
    const height = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0})`;
    visuals.forEach((visual) => {
      const image = visual.querySelector("img");
      if (reduced.matches || !desktop.matches) {
        image?.style.removeProperty("--shift");
        return;
      }
      const rect = visual.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const shift = Math.max(
        -18,
        Math.min(
          18,
          ((innerHeight / 2 - rect.top - rect.height / 2) / innerHeight) * 30,
        ),
      );
      image?.style.setProperty("--shift", shift.toFixed(2) + "px");
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  addEventListener("pageshow", schedule);
  addEventListener("pagehide", () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  });
  schedule();

  visuals.forEach((visual) => {
    const badge = document.createElement("span");
    badge.className = "project-cursor";
    badge.textContent = "Ouvrir ↗";
    badge.setAttribute("aria-hidden", "true");
    visual.append(badge);
    visual.addEventListener("pointermove", (event) => {
      if (reduced.matches || !fine.matches) return;
      const rect = visual.getBoundingClientRect();
      badge.style.setProperty("--cx", event.clientX - rect.left - 42 + "px");
      badge.style.setProperty("--cy", event.clientY - rect.top - 42 + "px");
      visual.classList.add("pointer-inside");
    });
    visual.addEventListener("pointerleave", () =>
      visual.classList.remove("pointer-inside"),
    );
  });
  document.querySelectorAll("[data-magnetic]").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (reduced.matches || !fine.matches) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty(
        "--mx",
        (event.clientX - rect.left - rect.width / 2) * 0.1 + "px",
      );
      button.style.setProperty(
        "--my",
        (event.clientY - rect.top - rect.height / 2) * 0.12 + "px",
      );
    });
    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("--mx");
      button.style.removeProperty("--my");
    });
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      running.forEach((animation) => animation.cancel());
      document
        .querySelectorAll(".pointer-inside")
        .forEach((el) => el.classList.remove("pointer-inside"));
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        el.style.removeProperty("--mx");
        el.style.removeProperty("--my");
      });
    }
    observe();
    schedule();
  });

  if ("IntersectionObserver" in window) {
    const active = new IntersectionObserver(
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
    document
      .querySelectorAll("main > section[id]")
      .forEach((section) => active.observe(section));
  }
})();
