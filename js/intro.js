(function initIntro() {
  const cfg = window.SITE_CONFIG?.intro;
  const overlay = document.getElementById("intro-overlay");
  const main = document.getElementById("main-app");
  if (!overlay || !main) return;

  function notifyMainReady() {
    requestAnimationFrame(() => {
      document.dispatchEvent(new CustomEvent("main-app-ready"));
    });
  }

  if (!cfg?.enabled) {
    overlay.classList.add("is-hidden");
    main.classList.remove("is-locked");
    main.classList.add("is-ready");
    notifyMainReady();
    return;
  }

  const storageKey = cfg.seenStorageKey || "pandaRamen.introSeen";
  const timesToShow = Math.max(1, cfg.timesToShow ?? 1);

  function getIntroViewCount() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw == null || raw === "") return 0;
      const n = parseInt(raw, 10);
      if (Number.isFinite(n)) return n;
      return raw === "1" ? 1 : 0;
    } catch {
      return 0;
    }
  }

  if (cfg.showOnce !== false) {
    try {
      if (getIntroViewCount() >= timesToShow) {
        overlay.classList.add("is-hidden");
        main.classList.remove("is-locked");
        main.classList.add("is-ready");
        notifyMainReady();
        return;
      }
    } catch {
      /* private mode / blocked storage — show intro each time */
    }
  }

  function markIntroSeen() {
    if (cfg.showOnce === false) return;
    try {
      localStorage.setItem(storageKey, String(getIntroViewCount() + 1));
    } catch {
      /* ignore */
    }
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
  let audioEl = null;

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
    playAudio();
    scheduleFallbackHold();
  }

  /** Welcome screen stays up for displayMs (and at least minDurationMs), then enters site. */
  function scheduleFallbackHold() {
    if (holdTimer) clearTimeout(holdTimer);
    const displayMs = cfg.fallback?.displayMs ?? 3200;
    const minMs = cfg.minDurationMs ?? 2500;
    const holdMs = Math.max(displayMs, minMs);
    holdTimer = setTimeout(() => finishIntro(false), holdMs);
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

    const minMs = cfg.minDurationMs ?? 2500;
    const elapsed = Date.now() - startTime;
    if (!fromSkip && elapsed < minMs) {
      setTimeout(() => finishIntro(false), minMs - elapsed);
      return;
    }

    finished = true;
    markIntroSeen();
    if (maxTimer) clearTimeout(maxTimer);
    if (holdTimer) clearTimeout(holdTimer);

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
    const min = cfg.minDurationMs ?? 2500;
    const wait = Math.max(0, min - elapsed);
    setTimeout(cb, wait);
  }

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
    setTimeout(() => finishIntro(false), cfg.minDurationMs ?? 2500);
  }
})();
