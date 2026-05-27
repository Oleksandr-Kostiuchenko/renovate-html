(function () {
  "use strict";

  // Modal
  const refs = {
    openModalBtn: document.querySelector("[data-modal-open]"),
    closeModalBtn: document.querySelector("[data-modal-close]"),
    modal: document.querySelector("[data-modal]"),
  };

  refs.openModalBtn.addEventListener("click", openModal);
  refs.closeModalBtn.addEventListener("click", closeModal);

  function openModal() {
    refs.modal.classList.add("is-open");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    refs.modal.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  }

  // ── Logo + button particle system ─────────────────────────────────────────
  const logo = document.querySelector(".page-logo");
  const colors = [
    "#4d5ae5",
    "#7b87ff",
    "#a5b4fc",
    "#6d7aed",
    "#c7d2fe",
    "#3730d4",
  ];

  function spawnParticle(el) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    const size = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 55 + 20;
    const duration = Math.random() * 600 + 500;

    const p = document.createElement("div");
    p.style.cssText =
      "position:fixed; left:" +
      x +
      "px; top:" +
      y +
      "px;" +
      "width:" +
      size +
      "px; height:" +
      size +
      "px;" +
      "border-radius:50%; background:" +
      color +
      ";" +
      "box-shadow:0 0 " +
      (size + 3) +
      "px " +
      color +
      ";" +
      "pointer-events:none; z-index:9999; opacity:1;" +
      "transform:translate(-50%,-50%);" +
      "transition:transform " +
      duration +
      "ms ease-out, opacity " +
      duration +
      "ms ease-out;";
    document.body.appendChild(p);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        p.style.transform =
          "translate(calc(-50% + " +
          Math.cos(angle) * distance +
          "px), calc(-50% + " +
          Math.sin(angle) * distance +
          "px))";
        p.style.opacity = "0";
      }),
    );

    setTimeout(() => p.remove(), duration + 100);
  }

  function attachParticles(el, interval) {
    if (!el) return;
    let timer = null;
    el.addEventListener("mouseenter", () => {
      spawnParticle(el);
      timer = setInterval(() => spawnParticle(el), interval);
    });
    el.addEventListener("mouseleave", () => clearInterval(timer));
  }

  attachParticles(logo, 75);
  attachParticles(document.querySelector(".order-btn"), 60);
})();

// ── Hero video fade-in ────────────────────────────────────────────────────────
(function () {
  "use strict";

  var video = document.querySelector(".hero-bg-video");
  if (!video) return;

  function showVideo() {
    video.style.opacity = "1";
  }

  // Fade in as soon as the browser has enough data to start playing
  video.addEventListener("canplay", showVideo, { once: true });

  // Fallback: force visible after 4s in case canplay never fires (slow network)
  var fallback = setTimeout(showVideo, 4000);

  video.addEventListener(
    "canplay",
    function () {
      clearTimeout(fallback);
    },
    { once: true },
  );
})();

// ── Scroll reveal ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ── Class-based reveal: headings, portfolio, footer ──────────────────────
  const singles = [".team-section-title", ".portfolio-section-title"];

  const staggerGroups = [
    { selector: ".portfolio-list-item", delay: 70 },
    { selector: ".footer-container > div", delay: 110 },
  ];

  const revealEls = [];

  singles.forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.classList.add("js-reveal");
    revealEls.push(el);
  });

  staggerGroups.forEach(({ selector, delay }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add("js-reveal");
      el.style.setProperty("--reveal-delay", i * delay + "ms");
      revealEls.push(el);
    });
  });

  if (reducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  // ── Team cards: inline-style approach (no conflict with cinematic hover) ──
  const teamItems = Array.from(document.querySelectorAll(".team-list-item"));

  if (reducedMotion) return;

  teamItems.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
  });

  const teamObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const i = teamItems.indexOf(el);
        setTimeout(() => {
          el.style.transition =
            "opacity 600ms ease, transform 600ms cubic-bezier(0.16,1,0.3,1)";
          el.style.opacity = "";
          el.style.transform = "";
          el.addEventListener(
            "transitionend",
            () => {
              el.style.transition = "";
            },
            { once: true },
          );
        }, i * 100);
        teamObserver.unobserve(el);
      });
    },
    { threshold: 0.12 },
  );

  teamItems.forEach((el) => teamObserver.observe(el));
})();

// ── Benefits section stagger entrance ────────────────────────────────────────
(function () {
  "use strict";

  const items = Array.from(document.querySelectorAll(".benefits-list-item"));
  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = items.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add("in-view"), index * 110);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );

  items.forEach((el) => observer.observe(el));
})();
