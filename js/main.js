(function () {
  "use strict";

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
