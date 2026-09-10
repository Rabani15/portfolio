/* =========================================================
   Rabani Chadha — Portfolio
   1) Fluid spinning orb background (canvas)
   2) Scroll-linked fade so the About section stays readable
   3) Nav state, reveal-on-scroll, misc
   ========================================================= */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 1. ORBS ---------------- */
  const canvas = document.getElementById("orbs");
  const layer = document.querySelector(".orb-layer");
  const ctx = canvas.getContext("2d", { alpha: false });

  // Render at a fraction of screen size; CSS blur does the smoothing.
  const RENDER_SCALE = 0.4;
  let W = 0, H = 0, vw = 0, vh = 0;

  const PALETTE = [
    { rgb: [249, 201, 214], size: 0.34 }, // pink
    { rgb: [191, 215, 242], size: 0.38 }, // blue
    { rgb: [255, 214, 184], size: 0.32 }, // peach
    { rgb: [207, 227, 196], size: 0.36 }, // matcha
    { rgb: [249, 201, 214], size: 0.26 }, // pink (small)
    { rgb: [191, 215, 242], size: 0.28 }, // blue (small)
    { rgb: [224,  38,  28], size: 0.13 }, // red accent — small & sparing
  ];

  // Each orb orbits a drifting center with its own speed, radius, and wobble.
  const orbs = PALETTE.map((p, i) => ({
    ...p,
    angle: (Math.PI * 2 * i) / PALETTE.length + Math.random() * 0.6,
    speed: (0.10 + Math.random() * 0.12) * (i % 2 === 0 ? 1 : -1), // rad/s, alternating spin direction
    orbit: 0.16 + Math.random() * 0.22,                               // fraction of min(vw, vh)
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.35 + Math.random() * 0.4,
    parallax: 0.04 + Math.random() * 0.06,                            // pointer influence
    x: 0, y: 0,
  }));

  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false };

  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    W = Math.max(1, Math.round(vw * RENDER_SCALE));
    H = Math.max(1, Math.round(vh * RENDER_SCALE));
    canvas.width = W;
    canvas.height = H;
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  window.addEventListener("pointermove", (e) => {
    pointer.tx = e.clientX / vw;
    pointer.ty = e.clientY / vh;
    pointer.active = true;
  }, { passive: true });

  window.addEventListener("pointerleave", () => { pointer.active = false; });

  let last = performance.now();
  let t = 0;
  let running = true;

  function render(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;

    // Ease pointer toward target (or back to center when idle)
    const targetX = pointer.active ? pointer.tx : 0.5;
    const targetY = pointer.active ? pointer.ty : 0.5;
    pointer.x += (targetX - pointer.x) * 0.045;
    pointer.y += (targetY - pointer.y) * 0.045;

    const minDim = Math.min(W, H);
    const cx = W * 0.5 + (pointer.x - 0.5) * W * 0.12;
    const cy = H * 0.46 + (pointer.y - 0.5) * H * 0.12;

    // Background: warm paper
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fbfbf9";
    ctx.fillRect(0, 0, W, H);

    // Orbs
    for (const o of orbs) {
      o.angle += o.speed * dt;
      const wobble = Math.sin(t * o.wobbleSpeed + o.wobblePhase) * 0.06 * minDim;
      const orbitR = o.orbit * Math.max(W, H) + wobble;

      // Elliptical orbit so it reads as fluid, not mechanical
      const ex = 1.15, ey = 0.85;
      o.x = cx + Math.cos(o.angle) * orbitR * ex + (pointer.x - 0.5) * W * o.parallax * 4;
      o.y = cy + Math.sin(o.angle) * orbitR * ey + (pointer.y - 0.5) * H * o.parallax * 4;

      const r = o.size * minDim * (1 + Math.sin(t * 0.6 + o.wobblePhase) * 0.08);
      const [R, G, B] = o.rgb;
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
      g.addColorStop(0,   `rgba(${R},${G},${B},0.95)`);
      g.addColorStop(0.55,`rgba(${R},${G},${B},0.55)`);
      g.addColorStop(1,   `rgba(${R},${G},${B},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(now) {
    if (!running) return;
    render(now);
    requestAnimationFrame(draw);
  }

  if (prefersReducedMotion) {
    // Static: paint a couple of frames so the canvas is presented, then stop.
    running = false;
    requestAnimationFrame((n) => { render(n); requestAnimationFrame(render); });
  } else {
    requestAnimationFrame(draw);
  }

  // Pause the loop when the tab is hidden (battery-friendly)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
    } else if (!prefersReducedMotion) {
      running = true;
      last = performance.now();
      requestAnimationFrame(draw);
    }
  });

  /* ---------------- 2. SCROLL FADE ---------------- */
  const nav = document.querySelector(".nav");
  const hero = document.getElementById("hero");

  // Orbs are fully visible in the hero and fade to a faint wash
  // by the time the About section begins, so text always sits on
  // near-solid paper.
  const MIN_OPACITY = 0.10;

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    const heroH = hero.offsetHeight || vh;
    const progress = Math.min(1, Math.max(0, y / (heroH * 0.75)));
    // smoothstep for an Apple-ish ease
    const eased = progress * progress * (3 - 2 * progress);
    const opacity = 1 - eased * (1 - MIN_OPACITY);
    layer.style.opacity = opacity.toFixed(3);

    // Stop rendering when the orbs are barely visible (perf)
    const shouldRun = opacity > MIN_OPACITY + 0.01 && !document.hidden && !prefersReducedMotion;
    if (shouldRun && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(draw);
    } else if (!shouldRun && running && !prefersReducedMotion) {
      running = false;
    }

    nav.classList.toggle("is-scrolled", y > 24);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- 3. REVEAL ON SCROLL ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- 4. MISC ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
