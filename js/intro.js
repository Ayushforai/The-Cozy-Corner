(function initIntro() {
  const cfg = window.SITE_CONFIG?.intro;
  const overlay = document.getElementById("intro-overlay");
  const main = document.getElementById("main-app");
  if (!overlay || !main) return;

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  function dismissIntroImmediately() {
    overlay.classList.remove("intro-pending");
    overlay.classList.add("is-hidden");
    main.classList.remove("is-locked");
    main.classList.add("is-ready");
    notifyMainReady();
  }

  function revealIntroOverlay() {
    overlay.classList.remove("intro-pending");
  }

  function notifyMainReady() {
    requestAnimationFrame(() => {
      document.dispatchEvent(new CustomEvent("main-app-ready"));
    });
  }

  if (!cfg?.enabled) {
    dismissIntroImmediately();
    return;
  }

  const visitKey = cfg.visitStorageKey || "pandaRamen.introHomeVisits";
  const visitPattern = cfg.visitPattern || "alternate";

  function readHomeVisitCount() {
    try {
      const n = parseInt(localStorage.getItem(visitKey), 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    } catch {
      return 0;
    }
  }

  function writeHomeVisitCount(n) {
    try {
      localStorage.setItem(visitKey, String(n));
    } catch {
      /* private mode — show intro each time */
    }
  }

  /** Returns true when the welcome intro should run on this homepage load. */
  function shouldShowIntroThisVisit() {
    if (cfg.showOnce === false) return true;
    if (visitPattern !== "alternate") return true;
    try {
      const visitNumber = readHomeVisitCount() + 1;
      writeHomeVisitCount(visitNumber);
      return visitNumber % 2 === 1;
    } catch {
      return true;
    }
  }

  if (!shouldShowIntroThisVisit()) {
    dismissIntroImmediately();
    return;
  }

  function markIntroSeen() {
    /* Visit count already recorded in shouldShowIntroThisVisit */
  }

  const video = document.getElementById("intro-video");
  const videoWrap = document.getElementById("intro-video-wrap");
  const fallback = document.getElementById("intro-fallback");
  const skipBtn = document.getElementById("intro-skip");
  const fallbackTitle = document.getElementById("intro-fallback-title");
  const fallbackSub = document.getElementById("intro-fallback-sub");
  const fallbackArt = document.getElementById("intro-fallback-art");

  let finished = false;
  let startTime = Date.now();
  let maxTimer = null;
  let holdTimer = null;
  let holdUntil = 0;
  let audioEl = null;

  function getMinDurationMs() {
    let minMs = cfg.minDurationMs ?? 2500;
    if (isMobile) {
      minMs = Math.max(minMs, cfg.mobileMinDurationMs ?? 4500);
    }
    return minMs;
  }

  function getFallbackHoldMs() {
    const displayMs = cfg.fallback?.displayMs ?? 3200;
    let display = displayMs;
    if (isMobile) {
      display = Math.max(displayMs, cfg.fallback?.mobileDisplayMs ?? 5500);
    }
    return Math.max(display, getMinDurationMs());
  }

  function clearHoldTimer() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function scheduleHoldExpiry() {
    clearHoldTimer();
    const remaining = Math.max(0, holdUntil - Date.now());
    if (remaining <= 0) {
      finishIntro(false);
      return;
    }
    holdTimer = setTimeout(scheduleHoldExpiry, remaining);
  }

  document.addEventListener("visibilitychange", () => {
    if (finished || document.hidden || !holdUntil) return;
    scheduleHoldExpiry();
  });

  if (fallbackTitle && cfg.fallback?.headline) {
    fallbackTitle.textContent = cfg.fallback.headline;
  }
  if (fallbackSub && cfg.fallback?.subline) {
    fallbackSub.textContent = cfg.fallback.subline;
  }

  const resolve = window.resolveSitePath || ((p) => p);
  const introImageKey = cfg.fallbackImageKey || "introArt";
  const introImagePath =
    cfg.fallbackImage ||
    (introImageKey && window.SITE_CONFIG?.images?.[introImageKey]) ||
    window.SITE_CONFIG?.images?.introArt ||
    "";
  if (fallbackArt && introImagePath) {
    fallbackArt.src = resolve(introImagePath);
    fallbackArt.alt = "";
  }

  const rawIntro =
    cfg.videoSrc || window.SITE_CONFIG?.videos?.introSrc || "";
  const rawIntroPoster =
    cfg.posterSrc || window.SITE_CONFIG?.videos?.introPosterSrc || "";
  const resolvedVideoSrc = resolve(rawIntro);
  const resolvedPosterSrc = resolve(rawIntroPoster);
  const hasVideo = Boolean(rawIntro);

  function showFallbackScreen() {
    if (videoWrap) videoWrap.hidden = true;
    if (fallback) fallback.hidden = false;
    startTime = Date.now();
    playAudio();
    scheduleFallbackHold();
  }

  /** Welcome screen stays up for displayMs (and at least minDurationMs), then enters site. */
  function scheduleFallbackHold() {
    clearHoldTimer();
    holdUntil = Date.now() + getFallbackHoldMs();
    scheduleHoldExpiry();
  }

  function scheduleVideoMaxDuration() {
    const max = cfg.maxDurationMs ?? 0;
    if (max > 0) {
      maxTimer = setTimeout(() => finishIntro(false), max);
    }
  }

  if (skipBtn) {
    skipBtn.textContent = cfg.skipLabel ?? "Skip intro";
    skipBtn.hidden = !cfg.showSkipButton;
    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      finishIntro(true);
    });
  }

  function setupAudio() {
    const a = cfg.audio;
    if (!a?.enabled || !a.src) return null;
    audioEl = new Audio(resolve(a.src));
    audioEl.volume = Math.min(1, Math.max(0, a.volume ?? 0.6));
    return audioEl;
  }

  function playAudio() {
    const el = setupAudio();
    if (!el) return;
    el.play().catch(() => {});
  }

  function finishIntro(fromSkip) {
    if (finished) return;

    const minMs = getMinDurationMs();
    const elapsed = Date.now() - startTime;
    if (!fromSkip && elapsed < minMs) {
      setTimeout(() => finishIntro(false), minMs - elapsed);
      return;
    }

    finished = true;
    markIntroSeen();
    if (maxTimer) clearTimeout(maxTimer);
    clearHoldTimer();
    holdUntil = 0;

    if (audioEl) {
      audioEl.pause();
      audioEl = null;
    }

    overlay.classList.add("is-leaving");
    main.classList.remove("is-locked");
    requestAnimationFrame(() => main.classList.add("is-ready"));

    const fadeMs = cfg.fadeOutMs ?? 900;
    setTimeout(() => {
      overlay.classList.add("is-hidden");
      notifyMainReady();
    }, fadeMs);
  }

  function afterMinDuration(cb) {
    const elapsed = Date.now() - startTime;
    const min = getMinDurationMs();
    const wait = Math.max(0, min - elapsed);
    setTimeout(cb, wait);
  }

  revealIntroOverlay();

  if (hasVideo && video && videoWrap && fallback) {
    fallback.hidden = true;
    videoWrap.hidden = false;
    video.poster = resolvedPosterSrc;
    video.src = resolvedVideoSrc;
    if (cfg.audio?.enabled && cfg.audio.useSeparateTrack) {
      video.muted = true;
    } else if (cfg.audio?.enabled && !cfg.audio.useSeparateTrack) {
      video.muted = false;
    } else {
      video.muted = true;
    }

    video.addEventListener("error", () => {
      showFallbackScreen();
    });

    video.addEventListener("loadeddata", () => {
      playAudio();
      video.play().catch(() => {});
    });

    video.addEventListener("ended", () => {
      afterMinDuration(() => finishIntro(false));
    });

    scheduleVideoMaxDuration();
  } else if (fallback) {
    showFallbackScreen();
  } else {
    setTimeout(() => finishIntro(false), getMinDurationMs());
  }
})();
