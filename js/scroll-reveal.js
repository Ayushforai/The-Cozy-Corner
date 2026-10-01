(function initScrollReveal() {
  const cfg = window.SITE_CONFIG?.scrollReveal || {};

  function getRootMargin() {
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    if (narrow && cfg.mobileRootMargin) return cfg.mobileRootMargin;
    return cfg.rootMargin ?? "0px 0px -4% 0px";
  }

  function buildThresholds() {
    if (cfg.progressiveFade === false) {
      return [cfg.threshold ?? 0.1];
    }
    const steps = Math.min(50, Math.max(8, cfg.thresholdSteps ?? 24));
    const list = [];
    for (let i = 0; i <= steps; i++) list.push(i / steps);
    return list;
  }

  function applyProgressiveOpacity(el, ratio) {
    const boost = cfg.opacityBoost ?? 1.15;
    const opacity = Math.min(1, Math.max(0, ratio * boost));
    el.style.setProperty("--reveal-opacity", String(opacity));
    el.classList.add("reveal--progressive");
    if (opacity > 0.06) {
      el.classList.add("is-visible");
      el.classList.remove("is-hidden");
    } else if (cfg.hideWhenLeaving !== false) {
      el.classList.remove("is-visible");
      el.classList.add("is-hidden");
    }
  }

  function applyBinaryVisibility(el, visible) {
    el.classList.remove("reveal--progressive");
    el.style.removeProperty("--reveal-opacity");
    if (visible) {
      el.classList.add("is-visible");
      el.classList.remove("is-hidden");
    } else if (cfg.hideWhenLeaving !== false) {
      el.classList.remove("is-visible");
      el.classList.add("is-hidden");
    }
  }

  function createObserver() {
    const progressive = cfg.progressiveFade !== false;

    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (progressive) {
            applyProgressiveOpacity(entry.target, entry.intersectionRatio);
          } else if (entry.isIntersecting) {
            applyBinaryVisibility(entry.target, true);
          } else if (cfg.hideWhenLeaving !== false) {
            applyBinaryVisibility(entry.target, false);
          }
        });
      },
      {
        threshold: buildThresholds(),
        rootMargin: getRootMargin(),
      }
    );
  }

  function resetObserver() {
    if (window.__revealObserver) {
      window.__revealObserver.disconnect();
      window.__revealObserver = null;
    }
    document.querySelectorAll(".reveal[data-reveal-observed]").forEach((el) => {
      delete el.dataset.revealObserved;
    });
  }

  function observeAll() {
    if (cfg.enabled === false) {
      document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("is-visible");
        el.style.setProperty("--reveal-opacity", "1");
      });
      return;
    }

    if (!window.__revealObserver) {
      window.__revealObserver = createObserver();
    }

    document.querySelectorAll(".reveal:not([data-reveal-observed])").forEach((el) => {
      el.dataset.revealObserved = "1";
      if (cfg.progressiveFade !== false) {
        el.classList.add("reveal--progressive");
        el.style.setProperty("--reveal-opacity", "0");
      }
      window.__revealObserver.observe(el);
    });
  }

  function boot() {
    resetObserver();
    observeAll();
  }

  function debounce(fn, ms) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  const onResize = debounce(() => {
    resetObserver();
    observeAll();
  }, 200);

  window.observeRevealElements = boot;
  window.refreshScrollReveal = boot;

  document.addEventListener("nav-cards-built", boot);
  document.addEventListener("main-app-ready", boot);
  window.addEventListener("resize", onResize);

  boot();
})();
