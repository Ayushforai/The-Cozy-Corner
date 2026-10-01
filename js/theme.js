(function applyTheme() {
  const cfg = window.SITE_CONFIG?.theme;
  if (!cfg) return;
  const root = document.documentElement;
  root.style.setProperty("--color-off-white", cfg.offWhite);
  root.style.setProperty("--color-beige", cfg.beige);
  root.style.setProperty("--color-baby-pink", cfg.babyPink);
  root.style.setProperty("--color-mustard", cfg.mustard);
  root.style.setProperty("--color-red", cfg.red);
  root.style.setProperty("--color-text", cfg.text);
  root.style.setProperty("--color-text-muted", cfg.textMuted);
  const reveal = window.SITE_CONFIG?.scrollReveal;
  if (reveal?.durationMs) {
    root.style.setProperty("--reveal-duration", `${reveal.durationMs}ms`);
    root.style.setProperty("--stagger-ms", `${reveal.staggerMs ?? 80}ms`);
  }
  if (reveal?.easing) {
    root.style.setProperty("--reveal-ease", reveal.easing);
  }
  if (reveal?.fadeOnly !== false) {
    root.classList.add("reveal-fade-only");
  }
  const intro = window.SITE_CONFIG?.intro;
  if (intro?.fadeOutMs) {
    root.style.setProperty("--intro-fade-ms", `${intro.fadeOutMs}ms`);
  }
  if (window.SITE_CONFIG?.mobile?.portraitFirst !== false) {
    root.classList.add("portrait-first");
  }
  const introWrap = document.getElementById("intro-video-wrap");
  if (introWrap && intro?.orientation === "landscape") {
    introWrap.classList.add("intro-video-wrap--landscape");
  } else if (introWrap) {
    introWrap.classList.add("intro-video-wrap--portrait");
  }
})();
