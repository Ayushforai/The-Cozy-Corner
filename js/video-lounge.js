(function initVideoLounge() {
  const lounge = window.SITE_CONFIG?.videoLounge ?? {};
  const videos = window.SITE_CONFIG?.videos ?? {};
  const resolve = window.resolveSitePath || ((p) => p);

  const rawSrc = lounge.videoSrc || videos.loungeSrc || "";
  const rawPoster =
    lounge.posterSrc || videos.loungePosterSrc || "";

  const src = resolve(rawSrc);
  const poster = resolve(rawPoster);

  const titleEl = document.getElementById("video-page-title");
  const subEl = document.getElementById("video-page-sub");
  const mascotEl = document.getElementById("video-page-mascot");
  const noteEl = document.getElementById("video-page-note");
  const stage = document.getElementById("video-stage");
  const video = document.getElementById("lounge-video");
  const playOverlay = document.getElementById("video-play-overlay");
  const overlayLabel = document.getElementById("video-overlay-label");
  const playBtn = document.getElementById("video-play-btn");
  const playBtnText = document.getElementById("video-play-btn-text");
  const playBtnIcon = document.getElementById("video-play-btn-icon");

  if (titleEl && lounge.title) titleEl.textContent = lounge.title;
  if (subEl && lounge.subtitle) subEl.textContent = lounge.subtitle;

  const images = window.SITE_CONFIG?.images ?? {};
  const rawHeader =
    lounge.headerImage ||
    (lounge.headerImageKey && images[lounge.headerImageKey]) ||
    images.bdaycat ||
    images.panda ||
    "";
  if (mascotEl && rawHeader) {
    mascotEl.src = resolve(rawHeader);
    mascotEl.alt = "";
  }

  const frame = document.querySelector(".video-frame");
  const orientation = lounge.orientation === "landscape" ? "landscape" : "portrait";
  if (frame) {
    frame.classList.remove("video-frame--portrait", "video-frame--landscape");
    frame.classList.add(
      orientation === "landscape" ? "video-frame--landscape" : "video-frame--portrait"
    );
  }

  if (!rawSrc) {
    if (noteEl) {
      noteEl.innerHTML =
        'Add your MP4 in <code>js/config.js</code> → <code>videos.loungeSrc</code>, then reload.';
    }
    playOverlay?.classList.add("is-hidden");
    if (playBtn) playBtn.disabled = true;
    return;
  }

  if (!video) return;

  video.removeAttribute("src");
  video.innerHTML = "";
  const source = document.createElement("source");
  source.src = src;
  source.type = "video/mp4";
  video.appendChild(source);
  if (poster) video.poster = poster;
  video.controls = lounge.showControls !== false;
  video.loop = Boolean(lounge.loop);
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = lounge.preload || "auto";
  video.load();

  let hasStarted = false;

  function showStartOverlay() {
    playOverlay?.classList.remove("is-hidden");
    if (overlayLabel) {
      overlayLabel.textContent = hasStarted && video.ended ? "Play again" : "Play video";
    }
  }

  function hideStartOverlay() {
    playOverlay?.classList.add("is-hidden");
  }

  function syncPlayButton() {
    if (!playBtn || !playBtnText || !playBtnIcon) return;
    if (video.paused || video.ended) {
      playBtn.classList.remove("is-pause");
      playBtnText.textContent = video.ended ? "Play again" : "Play";
      playBtnIcon.textContent = "▶";
      playBtn.setAttribute("aria-label", video.ended ? "Play again" : "Play video");
    } else {
      playBtn.classList.add("is-pause");
      playBtnText.textContent = "Pause";
      playBtnIcon.textContent = "❚❚";
      playBtn.setAttribute("aria-label", "Pause video");
    }
  }

  function showLoadError(message) {
    if (noteEl) noteEl.textContent = message;
    showStartOverlay();
  }

  function playWithSound() {
    video.muted = false;
    const attempt = video.play();
    if (attempt && typeof attempt.then === "function") {
      attempt
        .then(() => {
          hasStarted = true;
          hideStartOverlay();
          syncPlayButton();
        })
        .catch(() => {
          showLoadError("Playback blocked or failed. Click Play again, or use the controls on the video.");
          showStartOverlay();
        });
    }
  }

  function togglePlayPause() {
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      playWithSound();
    } else {
      video.pause();
    }
  }

  playOverlay?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (video.ended) video.currentTime = 0;
    playWithSound();
  });

  playBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    togglePlayPause();
  });

  video.addEventListener("play", () => {
    hasStarted = true;
    hideStartOverlay();
    syncPlayButton();
  });

  video.addEventListener("pause", () => {
    syncPlayButton();
    if (video.ended) {
      showStartOverlay();
    } else if (!hasStarted) {
      showStartOverlay();
    } else {
      hideStartOverlay();
    }
  });

  video.addEventListener("ended", () => {
    syncPlayButton();
    showStartOverlay();
  });

  video.addEventListener("error", () => {
    showLoadError(
      `Video file not found or unsupported. Confirm the file exists at "${rawSrc}" under your site folder (config path is from site root, not the pages folder).`
    );
  });

  showStartOverlay();
  syncPlayButton();

  if (noteEl) {
    noteEl.textContent =
      "Click Play to start. Use the bar on the video for volume, timeline, and fullscreen.";
  }

  if (Boolean(lounge.autoplayMuted)) {
    video.muted = true;
    video
      .play()
      .then(() => {
        hasStarted = true;
        hideStartOverlay();
        syncPlayButton();
      })
      .catch(showStartOverlay);
  }
})();
