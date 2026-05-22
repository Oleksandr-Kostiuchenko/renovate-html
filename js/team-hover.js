(function () {
  "use strict";

  // ── AI identity configs ────────────────────────────────────────────────────
  const AI = {
    nova: {
      color: "#3AB5FF",
      glow: "58,181,255",
      bg: "0,100,220",
      count: 65,
      speed: 0.7,
      minR: 1,
      maxR: 3,
      shape: "diamond",
    },
    orion: {
      color: "#00FFD4",
      glow: "0,255,212",
      bg: "0,180,160",
      count: 80,
      speed: 0.45,
      minR: 0.8,
      maxR: 2.5,
      shape: "circle",
    },
    visionx: {
      color: "#FF9500",
      glow: "255,149,0",
      bg: "200,90,0",
      count: 95,
      speed: 1.1,
      minR: 0.5,
      maxR: 3.5,
      shape: "spark",
    },
    codepilot: {
      color: "#FF2DA0",
      glow: "255,45,160",
      bg: "180,0,130",
      count: 70,
      speed: 0.65,
      minR: 1,
      maxR: 2,
      shape: "square",
    },
  };

  // ── DOM setup ──────────────────────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:100;" +
    "opacity:0;transition:opacity 0.7s ease;will-change:opacity;";
  document.body.appendChild(overlay);

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:101;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // ── State ──────────────────────────────────────────────────────────────────
  let particles = [];
  let rafId = null;
  let activeKey = null;
  let activeEl = null;
  let canvasAlpha = 0;
  let targetAlpha = 0;
  let fogTime = 0;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let prevMouseX = mouseX;
  let prevMouseY = mouseY;

  document.addEventListener("mousemove", (e) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // ── Particle class ─────────────────────────────────────────────────────────
  class Particle {
    constructor(cfg, stagger) {
      this.cfg = cfg;
      this.spawn(stagger);
    }

    spawn(stagger) {
      const { minR, maxR, speed } = this.cfg;
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 80;
      this.r = minR + Math.random() * (maxR - minR);
      this.vx = (Math.random() - 0.5) * speed * 0.8;
      this.vy = -(speed * 0.35 + Math.random() * speed * 0.8);
      this.maxLife = 180 + Math.random() * 220;
      this.life = stagger ? Math.random() * this.maxLife * 0.7 : 0;
      this.maxAlpha = 0.28 + Math.random() * 0.62;
      this.alpha = stagger ? this.maxAlpha * (this.life / this.maxLife) : 0;
      this.pFactor = 0.04 + Math.random() * 0.22;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleAmp = (Math.random() - 0.5) * 0.55;
      this.rotAngle = Math.random() * Math.PI * 2;
    }

    update() {
      this.life++;
      this.wobble += 0.018;
      this.rotAngle += 0.02;
      const dx = (mouseX - prevMouseX) * this.pFactor * 0.045;
      const dy = (mouseY - prevMouseY) * this.pFactor * 0.018;
      this.x += this.vx + Math.sin(this.wobble) * this.wobbleAmp + dx;
      this.y += this.vy + dy;

      const t = this.life / this.maxLife;
      if (t < 0.12) this.alpha = (t / 0.12) * this.maxAlpha;
      else if (t > 0.78) this.alpha = ((1 - t) / 0.22) * this.maxAlpha;
      else this.alpha = this.maxAlpha;

      if (this.life >= this.maxLife || this.y < -30) this.spawn(false);
    }

    draw() {
      const { color, glow, shape } = this.cfg;
      const a = this.alpha * canvasAlpha;
      if (a < 0.01) return;

      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowBlur = this.r * 6;
      ctx.shadowColor = `rgba(${glow},1)`;
      ctx.fillStyle = color;

      if (shape === "diamond") {
        const s = this.r;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotAngle * 0.3);
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.6);
        ctx.lineTo(s, 0);
        ctx.lineTo(0, s * 1.6);
        ctx.lineTo(-s, 0);
        ctx.closePath();
        ctx.fill();
      } else if (shape === "square") {
        const s = this.r;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotAngle * 0.25);
        ctx.fillRect(-s, -s, s * 2, s * 2);
      } else if (shape === "spark") {
        const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.r * 0.4, this.r * 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ── Atmosphere (orbiting fog blobs) ────────────────────────────────────────
  function drawAtmosphere(cfg, rect) {
    if (!rect) return;
    fogTime += 0.006;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 3; i++) {
      const angle = fogTime * 0.45 + (i * Math.PI * 2) / 3;
      const dist = 220 + Math.sin(fogTime * 1.5 + i * 1.3) * 90;
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;
      const radius = 200 + Math.sin(fogTime * 2.2 + i) * 50;

      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
      grad.addColorStop(0, `rgba(${cfg.glow},${0.09 * canvasAlpha})`);
      grad.addColorStop(1, "transparent");

      ctx.save();
      ctx.globalAlpha = canvasAlpha * 0.7;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Cursor connection lines ────────────────────────────────────────────────
  function drawCursorLines(cfg) {
    const maxCursorDist = 130;
    const nearby = particles.filter((p) => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      return dx * dx + dy * dy < maxCursorDist * maxCursorDist;
    });

    for (let i = 0; i < nearby.length; i++) {
      for (let j = i + 1; j < nearby.length; j++) {
        const dx = nearby[i].x - nearby[j].x;
        const dy = nearby[i].y - nearby[j].y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 90 * 90) {
          const dist = Math.sqrt(distSq);
          const a = (1 - dist / 90) * 0.35 * canvasAlpha;
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = cfg.color;
          ctx.lineWidth = 0.7;
          ctx.shadowBlur = 5;
          ctx.shadowColor = `rgba(${cfg.glow},0.8)`;
          ctx.beginPath();
          ctx.moveTo(nearby[i].x, nearby[i].y);
          ctx.lineTo(nearby[j].x, nearby[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // ── Render loop ────────────────────────────────────────────────────────────
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvasAlpha += (targetAlpha - canvasAlpha) * 0.045;

    if (activeKey) {
      const cfg = AI[activeKey];
      const rect = activeEl ? activeEl.getBoundingClientRect() : null;
      drawAtmosphere(cfg, rect);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      drawCursorLines(cfg);
    }

    if (canvasAlpha > 0.005 || targetAlpha > 0) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null;
      canvasAlpha = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ── Overlay gradient ───────────────────────────────────────────────────────
  function setOverlay(cfg, rect) {
    const px = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const py = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    overlay.style.background = `
      radial-gradient(ellipse 95vw 95vh at ${px.toFixed(1)}% ${py.toFixed(1)}%,
        rgba(${cfg.bg},0.14) 0%, transparent 68%),
      radial-gradient(ellipse 40vw 40vh at ${px.toFixed(1)}% ${py.toFixed(1)}%,
        rgba(${cfg.glow},0.1) 0%, transparent 55%)
    `;
    overlay.style.opacity = "1";
  }

  // ── Activate / switch / deactivate ─────────────────────────────────────────
  function activate(key, el) {
    const switching = activeKey !== null && activeKey !== key;
    activeKey = key;
    activeEl = el;
    targetAlpha = 1;

    const cfg = AI[key];
    particles = Array.from(
      { length: cfg.count },
      () => new Particle(cfg, !switching)
    );

    if (!rafId) loop();
    setOverlay(cfg, el.getBoundingClientRect());
  }

  function deactivate() {
    activeKey = null;
    activeEl = null;
    targetAlpha = 0;
    overlay.style.opacity = "0";
  }

  // ── Wire up team cards ─────────────────────────────────────────────────────
  const teamList = document.querySelector(".team-list");
  const aiKeys = ["nova", "orion", "visionx", "codepilot"];

  document.querySelectorAll(".team-list-item").forEach((item, i) => {
    const key = aiKeys[i];

    item.addEventListener("mouseenter", () => {
      teamList.classList.add("has-hover");
      activate(key, item);
    });

    item.addEventListener("mouseleave", (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest(".team-list-item")) {
        teamList.classList.remove("has-hover");
        deactivate();
      }
    });
  });
})();
