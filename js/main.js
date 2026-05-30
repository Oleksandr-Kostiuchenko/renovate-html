(function () {
  "use strict";

  // Modal
  const refs = {
    openModalBtn: document.querySelector("[data-modal-open]"),
    closeModalBtn: document.querySelector("[data-modal-close]"),
    modal: document.querySelector("[data-modal]"),
    modalWindow: document.querySelector("[data-modal-window]"),
  };

  refs.openModalBtn.addEventListener("click", openModal);
  refs.closeModalBtn.addEventListener("click", closeModal);

  function openModal() {
    refs.modal.classList.add("is-open");
    refs.modalWindow.classList.add("is-open");
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
  }

  function closeModal() {
    refs.modal.classList.remove("is-open");
    refs.modalWindow.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.remove("no-scroll");
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && refs.modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  // Menu
  const refsMenu = {
    openMenuBtn: document.querySelector("[data-menu-open]"),
    closeMenuBtn: document.querySelector("[data-menu-close]"),
    menu: document.querySelector("[data-menu]"),
    anchorLink: document.querySelectorAll("[anchor-link]"),
  };

  refsMenu.openMenuBtn.addEventListener("click", openMenu);
  refsMenu.closeMenuBtn.addEventListener("click", closeMenu);
  refsMenu.anchorLink.forEach((element) => {
    element.addEventListener("click", closeMenu);
  });

  function openMenu() {
    refsMenu.menu.classList.add("is-open");
    refsMenu.openMenuBtn.classList.add("is-rotated");
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    refsMenu.menu.classList.remove("is-open");
    refsMenu.openMenuBtn.classList.remove("is-rotated");
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

// ── Sticky header ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  const header = document.querySelector(".page-header");
  if (!header) return;

  let spacer = null;
  let isSticky = false;

  function makeSticky() {
    if (isSticky) return;
    isSticky = true;
    const height = header.offsetHeight;
    spacer = document.createElement("div");
    spacer.id = "header-spacer";
    spacer.style.height = height + "px";
    header.parentNode.insertBefore(spacer, header.nextSibling);
    header.classList.add("is-sticky");
  }

  function makeNormal() {
    if (!isSticky) return;
    isSticky = false;
    if (spacer) {
      spacer.remove();
      spacer = null;
    }
    header.classList.remove("is-sticky");
  }

  window.addEventListener(
    "scroll",
    function () {
      window.scrollY > 80 ? makeSticky() : makeNormal();
    },
    { passive: true },
  );
})();

// ── Page loader ───────────────────────────────────────────────────────────────
(function () {
  "use strict";

  const loader = document.getElementById("page-loader");
  if (!loader || loader.style.display === "none") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    loader.remove();
    sessionStorage.setItem("aistudio-loaded", "1");
    return;
  }

  setTimeout(function () {
    loader.style.transition = "transform 600ms cubic-bezier(0.76, 0, 0.24, 1)";
    loader.style.transform = "translateX(100%)";
    setTimeout(function () {
      loader.remove();
      sessionStorage.setItem("aistudio-loaded", "1");
    }, 650);
  }, 1600);
})();

// ── Typing hero animation ─────────────────────────────────────────────────────
(function () {
  "use strict";

  const phraseEl = document.querySelector(".hero-typing-phrase");
  if (!phraseEl) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const phrases = [
    "for Sales Teams",
    "for Customer Support",
    "for Data Analytics",
    "for Marketing",
    "for Enterprises",
  ];

  let current = 0;
  const VISIBLE = 2500;
  const FADE = 400;

  function cycle() {
    phraseEl.style.transition = "opacity " + FADE + "ms ease";
    phraseEl.style.opacity = "0";

    setTimeout(function () {
      current = (current + 1) % phrases.length;
      phraseEl.textContent = phrases[current];
      phraseEl.style.opacity = "1";
      setTimeout(cycle, VISIBLE);
    }, FADE);
  }

  setTimeout(cycle, VISIBLE);
})();

// ── Stats counters + radial rings ─────────────────────────────────────────────
(function () {
  "use strict";

  const section = document.getElementById("stats-section");
  if (!section) return;

  const CIRC = 2 * Math.PI * 38;
  const CONFIG = [
    { target: 500, suffix: "+", fill: 0.75 },
    { target: 98, suffix: "%", fill: 0.98 },
    { target: 40, suffix: "+", fill: 0.6 },
    { target: 3, suffix: "×", fill: 0.8 },
  ];

  const numberEls = section.querySelectorAll(".stats-number");
  const ringEls = section.querySelectorAll(".stats-ring-fill");

  ringEls.forEach(function (r) {
    r.style.strokeDasharray = CIRC;
    r.style.strokeDashoffset = CIRC;
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    numberEls.forEach(function (el, i) {
      el.textContent = CONFIG[i].target + CONFIG[i].suffix;
    });
    ringEls.forEach(function (el, i) {
      el.style.strokeDashoffset = CIRC * (1 - CONFIG[i].fill);
    });
    return;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el, cfg, delay) {
    setTimeout(function () {
      var start = performance.now();
      var dur = 1800;
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(easeOutCubic(p) * cfg.target) + cfg.suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
  }

  function animateRing(el, fill, delay) {
    setTimeout(function () {
      var target = CIRC * (1 - fill);
      var start = performance.now();
      var dur = 1800;
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        el.style.strokeDashoffset = CIRC - (CIRC - target) * easeOutCubic(p);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
  }

  var fired = false;
  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || fired) return;
        fired = true;
        obs.disconnect();
        numberEls.forEach(function (el, i) {
          animateCounter(el, CONFIG[i], i * 120);
        });
        ringEls.forEach(function (el, i) {
          animateRing(el, CONFIG[i].fill, i * 120);
        });
      });
    },
    { threshold: 0.3 },
  );

  obs.observe(section);
})();

// ── Footer email input error handling ─────────────────────────────────────────
(function () {
  "use strict";

  const footerForm = document.querySelector(".footer-form");
  if (!footerForm) return;

  const inputWrap = footerForm.querySelector(".t-input-wrap");
  const inputEl = footerForm.querySelector(".t-input");
  const emailInput = footerForm.querySelector(".footer-email-input");

  if (!inputWrap || !inputEl || !emailInput) return;

  // Validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Trigger shake animation by restarting the animation
  function triggerShake() {
    // Remove the animation class to stop it
    inputEl.classList.remove("is-shaking");
    // Force a reflow to reset the animation state
    void inputEl.offsetWidth;
    // Re-add the animation class to restart it
    inputEl.classList.add("is-shaking");

    // Get shake duration from CSS variables
    const root = document.documentElement;
    const durationA = parseFloat(
      getComputedStyle(root).getPropertyValue("--shake-dur-a"),
    );
    const durationB = parseFloat(
      getComputedStyle(root).getPropertyValue("--shake-dur-b"),
    );
    const totalDuration = durationA * 2 + durationB * 2;

    // Remove shake class after animation completes so it can be restarted
    setTimeout(() => {
      inputEl.classList.remove("is-shaking");
    }, totalDuration);
  }

  // Show error state
  function showError() {
    inputWrap.classList.add("is-error");
    inputEl.classList.add("is-error");
    triggerShake();

    // Get the revert timing from CSS variables
    const root = document.documentElement;
    const revertHold = parseInt(
      getComputedStyle(root).getPropertyValue("--revert-hold"),
      10,
    );

    // After revert-hold time, remove error classes
    setTimeout(() => {
      inputWrap.classList.remove("is-error");
      inputEl.classList.remove("is-error");
    }, revertHold);
  }

  // Handle form submission
  footerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!isValidEmail(email)) {
      showError();
    } else {
      // On success, clear any existing error state and submit
      inputWrap.classList.remove("is-error");
      inputEl.classList.remove("is-error");

      // Submit the form
      footerForm.submit();
    }
  });
})();
