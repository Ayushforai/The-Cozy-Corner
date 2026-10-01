(function initScrollReveal() {
  const cfg = window.SITE_CONFIG?.scrollReveal;

  function observeAll() {
    if (!cfg?.enabled) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!window.__revealObserver) {
      window.__revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              entry.target.classList.remove("is-hidden");
            } else if (cfg.hideWhenLeaving) {
              entry.target.classList.remove("is-visible");
              entry.target.classList.add("is-hidden");
            }
          });
        },
        {
          threshold: cfg.threshold ?? 0.15,
          rootMargin: cfg.rootMargin ?? "0px",
        }
      );
    }

    document.querySelectorAll(".reveal:not([data-reveal-observed])").forEach((el) => {
      el.dataset.revealObserved = "1";
      window.__revealObserver.observe(el);
    });
  }

  window.observeRevealElements = observeAll;
  document.addEventListener("nav-cards-built", observeAll);
  observeAll();
})();
