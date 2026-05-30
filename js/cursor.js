(function () {
  "use strict";

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dot  = document.getElementById("cursor-dot");
  var ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  var mx = -200, my = -200;
  var rx = -200, ry = -200;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    dot.style.left = mx + "px";
    dot.style.top  = my + "px";

    rx = reduced ? mx : lerp(rx, mx, 0.12);
    ry = reduced ? my : lerp(ry, my, 0.12);

    ring.style.left = rx + "px";
    ring.style.top  = ry + "px";

    requestAnimationFrame(loop);
  }

  document.addEventListener("mousemove", function (e) {
    mx = e.clientX;
    my = e.clientY;
  });

  var HOVER = "a, button, .order-btn, .nav-link, .team-member-icons-list-item, .portfolio-list-item, .benefits-list-item, .footer-social-media-icon";

  document.addEventListener("mouseover", function (e) {
    if (e.target.closest(HOVER)) document.body.classList.add("cursor-hover");
  });

  document.addEventListener("mouseout", function (e) {
    if (e.target.closest(HOVER)) document.body.classList.remove("cursor-hover");
  });

  document.addEventListener("click", function (e) {
    if (reduced) return;
    var r = document.createElement("div");
    r.className = "cursor-ripple";
    r.style.left = e.clientX + "px";
    r.style.top  = e.clientY + "px";
    document.body.appendChild(r);
    setTimeout(function () { r.remove(); }, 460);
  });

  dot.style.display  = "block";
  ring.style.display = "block";
  requestAnimationFrame(loop);
})();
