(function initSnowfall() {
  const cfg = window.SITE_CONFIG?.snowfall;
  if (!cfg?.enabled) return;

  const canvas = document.getElementById("snowfall-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let w = 0;
  let h = 0;
  let raf = 0;
  const baseColor = cfg.color ?? "245, 213, 216";

  function parseRgb() {
    const m = String(baseColor).match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
    return [245, 213, 216];
  }

  const rgb = parseRgb();

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const base = cfg.particleCount ?? 50;
    const n = narrow ? Math.round(base * 0.72) : base;
    const sizeMin = cfg.sizeMin ?? 1;
    const sizeMax = cfg.sizeMax ?? 2.5;
    const driftMax = cfg.driftMax ?? 0.4;
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: sizeMin + Math.random() * (sizeMax - sizeMin),
        speed:
          (cfg.speedMin ?? 0.4) +
          Math.random() * ((cfg.speedMax ?? 1.2) - (cfg.speedMin ?? 0.4)),
        drift: (Math.random() - 0.5) * driftMax,
        opacity:
          (cfg.opacityMin ?? 0.15) +
          Math.random() * ((cfg.opacityMax ?? 0.45) - (cfg.opacityMin ?? 0.15)),
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.y += p.speed;
      p.x += p.drift;
      if (p.y > h) {
        p.y = -5;
        p.x = Math.random() * w;
      }
      if (p.x > w) p.x = 0;
      if (p.x < 0) p.x = w;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.opacity})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  resize();
  createParticles();
  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.style.display = "none";
    return;
  }
  tick();
})();