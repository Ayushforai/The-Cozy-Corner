(function initIntro() {
  const cfg = window.SITE_CONFIG?.intro;
  const overlay = document.getElementById("intro-overlay");
  const main = document.getElementById("main-app");
  if (!overlay || !main) return;

  if (!cfg?.enabled) {
    overlay.classList.add("is-hidden");
    main.classList.remove("is-locked");
    main.classList.add("is-ready");
    return;
  }

  const storageKey = cfg.seenStorageKey || "pandaRamen.introSeen";
  if (cfg.showOnce !== false) {
    try {
      if (localStorage.getItem(storageKey) === "1") {
        overlay.classList.add("is-hidden");
        main.classList.remove("is-locked");
        main.classList.add("is-ready");
        return;
      }
    } catch {
      /* private mode / blocked storage — show intro each time */
    }
  }

  function markIntroSeen() {
    if (cfg.showOnce === false) return;
    try {
      localStorage.setItem(storageKey, "1");
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
  let audioEl = null;

  if (fallbackTitle && cfg.fallback?.headline) {
    fallbackTitle.textContent = cfg.fallback.headline;
  }
  if (fallbackSub && cfg.fallback?.subline) {
    fallbackSub.textContent = cfg.fallback.subline;
  }
  if (fallbackArt && window.SITE_CONFIG?.images?.panda) {
    fallbackArt.src = window.SITE_CONFIG.images.panda;
    fallbackArt.alt = "Panda mascot";
  }

  if (skipBtn) {
    skipBtn.textContent = cfg.skipLabel ?? "Skip intro";
    skipBtn.hidden = !cfg.showSkipButton;
    skipBtn.addEventListener("click", () => finishIntro());
  }

  function setupAudio() {
    const a = cfg.audio;
    if (!a?.enabled || !a.src) return null;
    audioEl = new Audio(a.src);
    audioEl.volume = Math.min(1, Math.max(0, a.volume ?? 0.6));
    return audioEl;
  }

  function playAudio() {
    const el = setupAudio();
    if (!el) return;
    el.play().catch(() => {
      /* autoplay blocked until user gesture — skip button counts */
    });
  }

  function finishIntro() {
    if (finished) return;
    finished = true;
    markIntroSeen();
    if (maxTimer) clearTimeout(maxTimer);
    if (audioEl) {
      audioEl.pause();
      audioEl = null;
    }
    overlay.classList.add("is-leaving");
    main.classList.remove("is-locked");
    requestAnimationFrame(() => main.classList.add("is-ready"));
    setTimeout(() => {
      overlay.classList.add("is-hidden");
    }, cfg.fadeOutMs ?? 900);
  }

  function scheduleMaxDuration() {
    const max = cfg.maxDurationMs ?? 0;
    if (max > 0) {
      maxTimer = setTimeout(finishIntro, max);
    }
  }

  function afterMinDuration(cb) {
    const elapsed = Date.now() - startTime;
    const min = cfg.minDurationMs ?? 0;
    const wait = Math.max(0, min - elapsed);
    setTimeout(cb, wait);
  }

  const resolve = window.resolveSitePath || ((p) => p);
  const rawIntro =
    cfg.videoSrc || window.SITE_CONFIG?.videos?.introSrc || "";
  const rawIntroPoster =
    cfg.posterSrc || window.SITE_CONFIG?.videos?.introPosterSrc || "";
  const resolvedVideoSrc = resolve(rawIntro);
  const resolvedPosterSrc = resolve(rawIntroPoster);

  const hasVideo = Boolean(rawIntro);

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

    video.addEventListener("loadeddata", () => {
      playAudio();
      video.play().catch(() => {});
    });

    video.addEventListener("ended", () => {
      afterMinDuration(finishIntro);
    });

    scheduleMaxDuration();
  } else if (fallback && videoWrap) {
    videoWrap.hidden = true;
    fallback.hidden = false;
    playAudio();
    scheduleMaxDuration();
    const displayMs = cfg.fallback?.displayMs ?? 3200;
    const minMs = cfg.minDurationMs ?? 2500;
    setTimeout(finishIntro, Math.max(displayMs, minMs));
  } else {
    finishIntro();
  }
})();
