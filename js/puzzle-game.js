/**
 * Puzzle page UI — profile, level map, timed play, preview, swipe moves.
 */
(function () {
  const cfg = () => window.SITE_CONFIG?.puzzleGame || {};
  const levels = () => cfg().levels || [];

  function allLevels() {
    const c = cfg();
    const list = [];
    const tutorialLevel = c.tutorial?.level;
    if (tutorialLevel && c.tutorial?.enabled !== false) {
      list.push({ ...tutorialLevel, tutorial: true });
    }
    list.push(...(c.levels || []));
    return list;
  }

  function getLevelById(levelId) {
    return allLevels().find((l) => l.id === levelId);
  }

  function isTutorialActive() {
    return window.PuzzleTutorial?.isTutorialLevel(activeLevel);
  }

  let view = "profile";
  let activeLevel = null;
  let gameState = null;
  let timerId = null;
  let timeLeft = 0;
  let imageReady = false;
  let resolvedImageUrl = "";
  let peekStarsSpent = 0;
  let isAnimating = false;
  let previewActive = false;
  let timerPaused = false;
  let pointerDrag = null;
  let selectedCell = null;

  const $ = (sel) => document.querySelector(sel);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
  }

  function previewTiming() {
    const c = cfg();
    return {
      hold: c.previewHoldMs ?? 1000,
      fade: c.previewFadeMs ?? 650,
    };
  }

  function moveAnimMs() {
    return cfg().moveAnimMs ?? 280;
  }

  function showProfileGate() {
    const list = window.PuzzleStorage.listProfiles();
    if (list.length > 0) {
      view = "map";
      render();
      return;
    }
    view = "profile-new";
    render();
  }

  function renderProfileForm(root, mode) {
    const isEdit = mode === "edit";
    const isNew = mode === "profile-new" || mode === "new";
    const existing = isEdit ? window.PuzzleStorage.loadProfile().displayName : "";
    const panel = el("section", "puzzle-panel puzzle-panel--profile");
    const atMax = !window.PuzzleStorage.canCreateProfile();
    panel.innerHTML = `
      <h2 class="puzzle-panel__title">${isEdit ? "Edit name" : "Create a profile"}</h2>
      <p class="puzzle-panel__sub">Up to ${window.PuzzleStorage.maxProfiles()} profiles per device — each keeps its own stars and levels.</p>
    `;
    const form = el("form", "puzzle-profile-form");
    const label = el("label", "puzzle-profile-form__label", "Display name");
    label.setAttribute("for", "puzzle-name");
    const input = el("input", "puzzle-profile-form__input");
    input.id = "puzzle-name";
    input.name = "name";
    input.maxLength = 24;
    input.placeholder = "e.g. Ramen Chef";
    input.autocomplete = "nickname";
    if (existing) input.value = existing;
    const btn = el(
      "button",
      "puzzle-btn puzzle-btn--primary",
      isEdit ? "Save name" : "Create & play"
    );
    btn.type = "submit";
    form.append(label, input, btn);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = input.value.trim() || "Player";
      if (isEdit) {
        window.PuzzleStorage.setDisplayName(name);
      } else {
        if (!window.PuzzleStorage.canCreateProfile()) return;
        window.PuzzleStorage.createProfile(name);
      }
      window.PuzzleSounds.unlock();
      view = "map";
      render();
    });
    panel.append(form);
    if (isEdit) {
      const back = el("button", "puzzle-btn puzzle-btn--ghost puzzle-profile-form__back", "Back to levels");
      back.type = "button";
      back.addEventListener("click", () => {
        view = "map";
        render();
      });
      panel.append(back);
    }
    if (isNew && atMax) {
      const note = el("p", "puzzle-panel__sub", "Profile limit reached. Delete a profile from the levels page to add another.");
      panel.append(note);
      btn.disabled = true;
    }
    root.append(panel);
    input.focus();
  }

  function renderProfileSwitcher(parent) {
    const section = el("section", "puzzle-profiles");
    const heading = el("h2", "puzzle-profiles__title", "Profiles");
    const list = window.PuzzleStorage.listProfiles();
    const activeId = window.PuzzleStorage.getActiveProfileId();
    const chips = el("div", "puzzle-profiles__chips");

    list.forEach((p) => {
      const chip = el("button", "puzzle-profile-chip" + (p.id === activeId ? " is-active" : ""));
      chip.type = "button";
      chip.textContent = p.displayName;
      chip.title = `${p.totalStars} stars collected`;
      chip.addEventListener("click", () => {
        if (p.id === activeId) return;
        window.PuzzleStorage.switchProfile(p.id);
        render();
      });
      chips.append(chip);
    });

    section.append(heading, chips);

    const actions = el("div", "puzzle-profiles__actions");
    const canAdd = window.PuzzleStorage.canCreateProfile();
    const newBtn = el("button", "puzzle-btn puzzle-btn--ghost", "New profile");
    newBtn.type = "button";
    newBtn.disabled = !canAdd;
    if (!canAdd) newBtn.title = `Maximum ${window.PuzzleStorage.maxProfiles()} profiles`;
    newBtn.addEventListener("click", () => {
      view = "profile-new";
      render();
    });

    const editBtn = el("button", "puzzle-btn puzzle-btn--ghost", "Edit name");
    editBtn.type = "button";
    editBtn.addEventListener("click", () => {
      view = "profile-edit";
      render();
    });

    const delBtn = el("button", "puzzle-btn puzzle-btn--ghost puzzle-profiles__delete", "Delete profile");
    delBtn.type = "button";
    delBtn.addEventListener("click", () => {
      const current = window.PuzzleStorage.getActiveProfileId();
      const name = window.PuzzleStorage.loadProfile().displayName || "this profile";
      const ok = window.confirm(
        `Delete "${name}"? Stars and level progress for this profile will be lost.`
      );
      if (!ok || !current) return;
      window.PuzzleStorage.deleteProfile(current);
      if (window.PuzzleStorage.listProfiles().length === 0) {
        view = "profile-new";
      }
      render();
    });

    actions.append(newBtn, editBtn, delBtn);
    section.append(actions);
    parent.append(section);
  }

  function renderMap(root) {
    const profile = window.PuzzleStorage.loadProfile();
    const header = el("header", "puzzle-map-header");
    const starsRow = el("p", "puzzle-map-header__stars");
    starsRow.innerHTML = `<span class="puzzle-stars puzzle-stars--inline" aria-hidden="true">${starIcons(profile.totalStars, true)}</span>
      <span>${profile.totalStars} star${profile.totalStars === 1 ? "" : "s"} collected</span>`;
    const greet = el("p", "puzzle-map-header__name", `Hi, ${profile.displayName}!`);
    header.append(greet, starsRow);

    const grid = el("div", "puzzle-level-grid");
    allLevels().forEach((level) => {
      const unlocked = window.PuzzleStorage.isLevelUnlocked(level.id, levels());
      const isTutorial = Boolean(level.tutorial);
      const prog = isTutorial ? null : window.PuzzleStorage.getLevelProgress(level.id);
      const card = el(
        "button",
        "puzzle-level-card" +
          (unlocked ? "" : " puzzle-level-card--locked") +
          (isTutorial ? " puzzle-level-card--tutorial" : "")
      );
      card.type = "button";
      card.disabled = !unlocked;
      const meta = el(
        "span",
        "puzzle-level-card__meta",
        isTutorial
          ? `${level.rows}×${level.cols} · Practice`
          : `${level.rows}×${level.cols} · ${level.timeSec}s`
      );
      const title = el(
        "span",
        "puzzle-level-card__title",
        isTutorial ? "Tutorial" : `Level ${level.id}`
      );
      const subtitle = el(
        "span",
        "puzzle-level-card__sub",
        isTutorial ? level.imageTitle || level.title || "Learn the basics" : level.title || ""
      );
      const stars = el("span", "puzzle-level-card__stars");
      if (isTutorial) {
        stars.textContent = window.PuzzleStorage.isTutorialCompleted() ? "✓ Done" : "Start here";
      } else {
        stars.innerHTML = starIcons(prog?.bestStars ?? 0);
      }
      card.append(title, subtitle, meta, stars);
      if (unlocked) {
        card.addEventListener("click", () => startLevel(level.id));
      }
      grid.append(card);
    });

    root.append(header, grid);
    renderProfileSwitcher(root);
  }

  function starIcons(count, cumulative) {
    const n = cumulative ? Math.min(30, count) : Math.min(3, count);
    let html = "";
    const max = cumulative ? n : 3;
    for (let i = 0; i < max; i++) {
      const filled = cumulative ? true : i < count;
      html += `<span class="puzzle-star${filled ? " is-filled" : ""}">★</span>`;
    }
    if (cumulative && count > 30) html += `<span class="puzzle-star-more">+${count - 30}</span>`;
    return html;
  }

  function startLevel(levelId) {
    const level = getLevelById(levelId);
    if (!level) return;
    stopTimer();
    window.PuzzleTutorial?.closeModal();
    if (level.tutorial) window.PuzzleTutorial?.reset();
    activeLevel = level;
    gameState = window.PuzzleEngine.createState(level.rows, level.cols);
    const minShuffle = level.tutorial ? 8 : level.rows * level.cols * 6;
    window.PuzzleEngine.shuffle(gameState, minShuffle);
    timeLeft = level.timeSec;
    imageReady = false;
    peekStarsSpent = 0;
    selectedCell = null;
    isAnimating = false;
    previewActive = false;
    timerPaused = true;
    resolvedImageUrl = window.resolveSitePath(level.image);
    view = "play";
    render();
    window.PuzzleImage.loadCroppedForPuzzle(resolvedImageUrl).then((croppedUrl) => {
      if (croppedUrl) resolvedImageUrl = croppedUrl;
      imageReady = Boolean(croppedUrl);
      if (view === "play") {
        renderBoardOnly();
        if (imageReady) runLevelPreview(false);
        else if (level.tutorial) window.PuzzleTutorial.notify("previewEnd");
      }
    });
    window.PuzzleSounds.unlock();
  }

  function getPreviewLayer() {
    return $("#puzzle-preview");
  }

  function runLevelPreview(isPeek) {
    const layer = getPreviewLayer();
    if (!layer || !resolvedImageUrl) return;

    previewActive = true;
    if (timerId) timerPaused = true;
    updatePeekUI();
    layer.classList.remove("is-fading", "is-hidden");
    layer.style.opacity = "1";
    layer.style.backgroundImage = `url("${resolvedImageUrl}")`;

    const { hold, fade } = previewTiming();
    const holdMs = isPeek ? hold : hold;

    window.setTimeout(() => {
      layer.classList.add("is-fading");
      layer.style.opacity = "0";
      window.setTimeout(() => {
        layer.classList.add("is-hidden");
        layer.classList.remove("is-fading");
        previewActive = false;
        timerPaused = false;
        updatePeekUI();
        if (!isPeek && isTutorialActive()) {
          window.PuzzleTutorial.notify("previewEnd");
        }
      }, fade);
    }, holdMs);
  }

  function tryPeekPreview() {
    if (previewActive || isAnimating || !imageReady) return;
    const maxPeek = 3;
    if (peekStarsSpent >= maxPeek) return;
    peekStarsSpent += 1;
    updatePeekUI();
    window.PuzzleSounds.play("tap");
    runLevelPreview(true);
  }

  function updatePeekUI() {
    const btn = $("#puzzle-peek-btn");
    const stake = $("#puzzle-stars-stake");
    const remaining = Math.max(0, 3 - peekStarsSpent);
    if (stake) {
      stake.innerHTML = `Reward up to: ${starIcons(remaining)}`;
    }
    if (btn) {
      btn.disabled = previewActive || isAnimating || peekStarsSpent >= 3 || !imageReady;
      btn.textContent = peekStarsSpent >= 3 ? "No peeks left" : "Peek picture (−1★)";
    }
  }

  function startTimer() {
    if (timerId) return;
    stopTimer();
    const tick = () => {
      if (timerPaused || previewActive) return;
      timeLeft -= 0.25;
      const timerEl = $("#puzzle-timer");
      if (timerEl) timerEl.textContent = formatTime(timeLeft);
      if (timeLeft <= 5 && timeLeft > 0 && Math.floor(timeLeft * 4) % 4 === 0) {
        window.PuzzleSounds.play("tick");
      }
      if (timeLeft <= 0) {
        stopTimer();
        onTimeUp();
      }
    };
    timerId = window.setInterval(tick, 250);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function getNextLevelId(currentId) {
    const list = levels();
    const i = list.findIndex((l) => l.id === currentId);
    if (i < 0 || i >= list.length - 1) return null;
    return list[i + 1].id;
  }

  function removeResultOverlay() {
    const existing = $(".puzzle-overlay");
    if (existing) existing.remove();
  }

  function goToLevelMap() {
    removeResultOverlay();
    view = "map";
    render();
  }

  function downloadLevelImage() {
    const level = activeLevel;
    if (!level) return;
    const url = resolvedImageUrl || window.resolveSitePath(level.image);
    if (!url) return;
    const base =
      level.imageTitle ||
      (typeof level.id === "number" ? `level-${String(level.id).padStart(2, "0")}` : String(level.id));
    const filename = `${base}.jpg`;

    const trigger = (href) => {
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      a.rel = "noopener";
      document.body.append(a);
      a.click();
      a.remove();
    };

    if (url.startsWith("data:")) {
      trigger(url);
      return;
    }

    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const obj = URL.createObjectURL(blob);
        trigger(obj);
        URL.revokeObjectURL(obj);
      })
      .catch(() => trigger(url));
  }

  function buildAnimatedStars(earned) {
    const row = el("div", "puzzle-result-stars");
    for (let i = 0; i < 3; i++) {
      const star = el("span", "puzzle-result-star");
      star.textContent = "★";
      star.style.setProperty("--star-i", String(i));
      if (i < earned) star.classList.add("is-earned");
      row.append(star);
    }
    return row;
  }

  function showLevelCleared(stars, subtitle) {
    removeResultOverlay();
    const level = activeLevel;
    const overlay = el("div", "puzzle-overlay puzzle-overlay--result");
    const box = el("div", "puzzle-overlay__box puzzle-overlay__box--result puzzle-overlay__box--cleared");
    box.append(el("p", "puzzle-result-badge", "Level cleared!"));
    const title = el(
      "h3",
      "puzzle-overlay__title",
      level?.tutorial ? "Tutorial complete!" : `Level ${level?.id} complete`
    );
    box.append(title);
    box.append(el("p", "puzzle-overlay__sub", subtitle));
    if (!level?.tutorial) box.append(buildAnimatedStars(stars));

    const actions = el("div", "puzzle-result-actions");

    if (!level?.tutorial) {
      const nextId = getNextLevelId(level.id);
      const nextUnlocked =
        nextId !== null && window.PuzzleStorage.isLevelUnlocked(nextId, levels());
      if (nextId !== null) {
        const nextBtn = el("button", "puzzle-btn puzzle-btn--primary", "Next level");
        nextBtn.type = "button";
        nextBtn.disabled = !nextUnlocked;
        if (!nextUnlocked) nextBtn.title = "Earn at least 1★ on this level to unlock the next.";
        nextBtn.addEventListener("click", () => {
          if (!nextUnlocked) return;
          removeResultOverlay();
          startLevel(nextId);
        });
        actions.append(nextBtn);
      }
    }

    const levelsBtn = el(
      "button",
      "puzzle-btn puzzle-btn--ghost",
      level?.tutorial ? "Go to levels" : "All levels"
    );
    levelsBtn.type = "button";
    levelsBtn.addEventListener("click", goToLevelMap);
    actions.append(levelsBtn);

    const dlBtn = el("button", "puzzle-btn puzzle-btn--ghost", "Download image");
    dlBtn.type = "button";
    dlBtn.addEventListener("click", () => downloadLevelImage());
    actions.append(dlBtn);

    box.append(actions);
    overlay.append(box);
    document.body.append(overlay);
  }

  function showLevelFailed() {
    removeResultOverlay();
    const level = activeLevel;
    const overlay = el("div", "puzzle-overlay puzzle-overlay--result");
    const box = el("div", "puzzle-overlay__box puzzle-overlay__box--result puzzle-overlay__box--failed");
    box.append(el("p", "puzzle-result-badge puzzle-result-badge--fail", "Time's up"));
    box.append(
      el(
        "h3",
        "puzzle-overlay__title",
        level?.tutorial ? "Tutorial not finished" : `Level ${level?.id} failed`
      )
    );
    box.append(
      el(
        "p",
        "puzzle-overlay__sub",
        "The timer ran out. Take another look at the picture and try again!"
      )
    );
    const actions = el("div", "puzzle-result-actions");
    const retryBtn = el("button", "puzzle-btn puzzle-btn--primary", "Retry level");
    retryBtn.type = "button";
    retryBtn.addEventListener("click", () => {
      removeResultOverlay();
      startLevel(level.id);
    });
    const levelsBtn = el("button", "puzzle-btn puzzle-btn--ghost", "All levels");
    levelsBtn.type = "button";
    levelsBtn.addEventListener("click", goToLevelMap);
    actions.append(retryBtn, levelsBtn);
    box.append(actions);
    overlay.append(box);
    document.body.append(overlay);
  }

  function onTimeUp() {
    window.PuzzleSounds.play("tap");
    showLevelFailed();
  }

  function onWin() {
    stopTimer();
    window.PuzzleTutorial?.closeModal();
    if (isTutorialActive()) {
      window.PuzzleStorage.recordLevelResult("tutorial", 0, timeLeft);
      window.PuzzleSounds.play("win");
      showLevelCleared(0, "You're ready for the real levels. Head back and try Level 1.");
      return;
    }
    const thresholds = cfg().starThresholds;
    const stars = window.PuzzleEngine.starsForFinish(
      timeLeft,
      activeLevel.timeSec,
      thresholds,
      peekStarsSpent
    );
    window.PuzzleStorage.recordLevelResult(activeLevel.id, stars, timeLeft);
    window.PuzzleSounds.play("win");
    for (let i = 0; i < stars; i++) {
      setTimeout(() => window.PuzzleSounds.play("star"), 200 + i * 180);
    }
    const msg =
      stars === 3
        ? "Perfect pace — three stars!"
        : stars === 2
          ? "Nice work — two stars!"
          : stars === 1
            ? "You made it — one star!"
            : "Solved! (Peeks used up your stars this round.)";
    showLevelCleared(stars, msg);
  }

  function renderPlay(root) {
    const level = activeLevel;
    if (!level || !gameState) {
      view = "map";
      render();
      return;
    }

    const top = el("div", "puzzle-play-top");
    const back = el("button", "puzzle-play-back", "← Levels");
    back.type = "button";
    back.addEventListener("click", () => {
      stopTimer();
      view = "map";
      render();
    });
    const info = el("div", "puzzle-play-info");
    info.innerHTML = `<span class="puzzle-play-level">Level ${level.id}</span>
      <span id="puzzle-timer" class="puzzle-play-timer">${formatTime(timeLeft)}</span>
      <span class="puzzle-play-moves">${gameState.moveCount} moves</span>`;
    top.append(back, info);

    const aspect = window.PuzzleImage.getAspect();
    const boardWrap = el("div", "puzzle-board-wrap");
    const preview = el("div", "puzzle-preview is-hidden");
    preview.id = "puzzle-preview";
    preview.setAttribute("aria-hidden", "true");
    preview.style.aspectRatio = `${aspect.w} / ${aspect.h}`;
    preview.style.setProperty("--puzzle-preview-fade", `${previewTiming().fade}ms`);
    const board = el("div", "puzzle-board");
    board.id = "puzzle-board";
    board.style.setProperty("--puzzle-cols", String(level.cols));
    board.style.setProperty("--puzzle-rows", String(level.rows));
    board.style.setProperty("--puzzle-move-ms", `${moveAnimMs()}ms`);
    board.style.aspectRatio = `${aspect.w} / ${aspect.h}`;
    boardWrap.append(preview, board);

    const tools = el("div", "puzzle-play-tools");
    const stake = el("p", "puzzle-play-stake");
    stake.id = "puzzle-stars-stake";
    const peekBtn = el("button", "puzzle-btn puzzle-btn--ghost puzzle-peek-btn");
    peekBtn.type = "button";
    peekBtn.id = "puzzle-peek-btn";
    peekBtn.textContent = "Peek picture (−1★)";
    peekBtn.addEventListener("click", tryPeekPreview);
    tools.append(stake, peekBtn);

    const hint = el(
      "p",
      "puzzle-play-hint",
      "Tap two tiles to swap, or drag one onto another. Timer starts on your first swap."
    );

    root.append(top, boardWrap, tools, hint);
    renderBoardOnly();
    updatePeekUI();
  }

  function applyTileVisual(tile, pieceIndex, rows, cols, url) {
    const style = window.PuzzleEngine.pieceBackgroundStyle(pieceIndex, rows, cols, url);
    tile.classList.remove("puzzle-tile--placeholder");
    tile.style.transform = "";
    tile.style.zIndex = "";
    tile.disabled = false;
    tile.setAttribute("aria-label", `Tile piece ${pieceIndex + 1}`);
    if (style.backgroundImage && style.backgroundImage !== "none") {
      tile.style.backgroundImage = style.backgroundImage;
      tile.style.backgroundSize = style.backgroundSize;
      tile.style.backgroundPosition = style.backgroundPosition;
      tile.style.backgroundRepeat = style.backgroundRepeat || "no-repeat";
    } else {
      tile.classList.add("puzzle-tile--placeholder");
      tile.style.backgroundImage = "";
    }
  }

  function renderBoardOnly() {
    const board = $("#puzzle-board");
    if (!board || !gameState || !activeLevel) return;

    const { rows, cols, tiles } = gameState;
    const url = imageReady ? resolvedImageUrl : "";

    if (board.children.length !== tiles.length) {
      board.replaceChildren();
      tiles.forEach((pieceIndex, cellIndex) => {
        const tile = el("button", "puzzle-tile");
        tile.type = "button";
        tile.dataset.cell = String(cellIndex);
        applyTileVisual(tile, pieceIndex, rows, cols, url);
        bindTilePointer(tile, cellIndex);
        board.append(tile);
      });
    } else {
      tiles.forEach((pieceIndex, cellIndex) => {
        const tile = board.children[cellIndex];
        if (!tile) return;
        tile.dataset.cell = String(cellIndex);
        applyTileVisual(tile, pieceIndex, rows, cols, url);
      });
    }

    const movesEl = document.querySelector(".puzzle-play-moves");
    if (movesEl) movesEl.textContent = `${gameState.moveCount} moves`;
    updateSelectionHighlights();
    updatePeekUI();
  }

  function clearSelection() {
    selectedCell = null;
    updateSelectionHighlights();
  }

  function updateSelectionHighlights() {
    const board = $("#puzzle-board");
    if (!board || !gameState) return;
    Array.from(board.children).forEach((tile, i) => {
      tile.classList.toggle("puzzle-tile--selected", i === selectedCell);
      tile.classList.toggle(
        "puzzle-tile--swap-target",
        selectedCell !== null && i !== selectedCell
      );
    });
  }

  function cellIndexFromPoint(clientX, clientY, ignoreEl) {
    if (ignoreEl) ignoreEl.style.pointerEvents = "none";
    const el = document.elementFromPoint(clientX, clientY);
    if (ignoreEl) ignoreEl.style.pointerEvents = "";
    if (!el) return null;
    const tile = el.closest?.(".puzzle-tile");
    if (!tile || !tile.dataset.cell) return null;
    const board = $("#puzzle-board");
    if (!board || !board.contains(tile)) return null;
    return Number(tile.dataset.cell);
  }

  function bindTilePointer(tile, cellIndex) {
    tile.addEventListener("pointerdown", (e) => onPointerDown(e, cellIndex));
  }

  function onPointerDown(e, cellIndex) {
    if (previewActive || isAnimating || !gameState || window.PuzzleTutorial?.isBlocking()) return;

    const tile = e.currentTarget;
    tile.setPointerCapture(e.pointerId);
    pointerDrag = {
      cellIndex,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      tile,
    };
    tile.classList.add("puzzle-tile--held");
    window.PuzzleSounds.play("tap");
  }

  function onPointerMove(e) {
    if (!pointerDrag || pointerDrag.pointerId !== e.pointerId) return;
    const dx = e.clientX - pointerDrag.startX;
    const dy = e.clientY - pointerDrag.startY;
    pointerDrag.tile.style.transform = `translate(${dx}px, ${dy}px)`;
    pointerDrag.tile.style.zIndex = "3";
  }

  function onPointerUp(e) {
    if (!pointerDrag || pointerDrag.pointerId !== e.pointerId) return;
    const { cellIndex, startX, startY, tile } = pointerDrag;
    try {
      tile.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    tile.classList.remove("puzzle-tile--held");
    tile.style.transform = "";
    tile.style.zIndex = "";
    pointerDrag = null;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const threshold = cfg().swipeThresholdPx ?? 22;

    const toIndex = cellIndexFromPoint(e.clientX, e.clientY, tile);
    if (toIndex !== null && toIndex !== cellIndex) {
      clearSelection();
      attemptSwapIndices(cellIndex, toIndex);
      return;
    }

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      handleTapSelect(cellIndex);
      return;
    }

    window.PuzzleSounds.play("tap");
  }

  function handleTapSelect(cellIndex) {
    if (selectedCell === null) {
      selectedCell = cellIndex;
      updateSelectionHighlights();
      window.PuzzleSounds.play("tap");
      if (isTutorialActive()) window.PuzzleTutorial.notify("select");
      return;
    }
    if (selectedCell === cellIndex) {
      clearSelection();
      return;
    }
    const from = selectedCell;
    clearSelection();
    attemptSwapIndices(from, cellIndex);
  }

  function attemptSwapIndices(fromIndex, toIndex) {
    if (isAnimating || !gameState) return;
    if (fromIndex === toIndex) return;

    const board = $("#puzzle-board");
    const tileA = board?.children[fromIndex];
    const tileB = board?.children[toIndex];
    if (!tileA || !tileB) return;

    isAnimating = true;
    const dur = moveAnimMs();

    function measureAndAnimate() {
      const ar = tileA.getBoundingClientRect();
      const br = tileB.getBoundingClientRect();
      const dx = br.left - ar.left;
      const dy = br.top - ar.top;

      tileA.style.transition = "none";
      tileB.style.transition = "none";
      tileA.style.transform = "translate(0, 0)";
      tileB.style.transform = "translate(0, 0)";

      requestAnimationFrame(() => {
        tileA.classList.add("puzzle-tile--moving");
        tileB.classList.add("puzzle-tile--moving");
        tileA.style.zIndex = "2";
        tileB.style.zIndex = "2";
        tileA.style.transition = "";
        tileB.style.transition = "";
        tileA.style.transform = `translate(${dx}px, ${dy}px)`;
        tileB.style.transform = `translate(${-dx}px, ${-dy}px)`;
      });
    }

    measureAndAnimate();

    let finished = false;
    const onTransitionEnd = (ev) => {
      if (ev.propertyName !== "transform") return;
      if (ev.target !== tileA && ev.target !== tileB) return;
      completeSwap();
    };

    function completeSwap() {
      if (finished) return;
      finished = true;
      tileA.removeEventListener("transitionend", onTransitionEnd);
      tileB.removeEventListener("transitionend", onTransitionEnd);
      tileA.style.transition = "none";
      tileB.style.transition = "none";
      tileA.classList.remove("puzzle-tile--moving");
      tileB.classList.remove("puzzle-tile--moving");
      tileA.style.transform = "";
      tileB.style.transform = "";
      tileA.style.zIndex = "";
      tileB.style.zIndex = "";
      window.PuzzleEngine.swapCells(gameState, fromIndex, toIndex);
      window.PuzzleSounds.play("move");
      if (!timerId) {
        timerPaused = false;
        startTimer();
      }
      if (isTutorialActive()) window.PuzzleTutorial.notify("swap");
      isAnimating = false;
      renderBoardOnly();
      requestAnimationFrame(() => {
        tileA.style.transition = "";
        tileB.style.transition = "";
      });
      if (window.PuzzleEngine.isSolved(gameState)) {
        onWin();
      }
    }

    tileA.addEventListener("transitionend", onTransitionEnd);
    tileB.addEventListener("transitionend", onTransitionEnd);
    window.setTimeout(completeSwap, dur + 80);
  }

  function render() {
    const root = $("#puzzle-app-root");
    if (!root) return;
    root.replaceChildren();
    pointerDrag = null;
    selectedCell = null;

    if (view === "profile-edit") {
      renderProfileForm(root, "edit");
      return;
    }
    if (view === "profile-new" || view === "profile") {
      renderProfileForm(root, "new");
      return;
    }
    if (view === "map") {
      renderMap(root);
      return;
    }
    if (view === "play") {
      renderPlay(root);
    }
  }

  function initHeader() {
    const c = cfg();
    const titleEl = $("#puzzle-page-title");
    const subEl = $("#puzzle-page-sub");
    const hintEl = $("#puzzle-page-profile-hint");
    const imgEl = $("#puzzle-page-mascot");
    if (titleEl) titleEl.textContent = c.title || "Puzzle It Up";
    if (subEl) subEl.textContent = c.subtitle || "";
    if (hintEl) {
      const hint = c.profileHint || "";
      hintEl.textContent = hint;
      hintEl.hidden = !hint;
    }
    const key = c.headerImageKey || "panda";
    const imgPath = window.SITE_CONFIG?.images?.[key] || "";
    if (imgEl && imgPath) {
      imgEl.src = window.resolveSitePath(imgPath);
      imgEl.alt = "";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    window.PuzzleTutorial?.setHooks({
      onOpen: () => {
        timerPaused = true;
      },
      onClose: () => {
        if (!previewActive) timerPaused = false;
      },
    });
    showProfileGate();
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  });
})();
