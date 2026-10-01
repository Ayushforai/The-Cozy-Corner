/**
 * Tutorial level — step popups tied to player actions.
 */
(function () {
  const cfg = () => window.SITE_CONFIG?.puzzleGame || {};
  const steps = () => cfg().tutorial?.steps || [];

  let stepIndex = 0;
  let modalOpen = false;
  let onModalClose = null;
  let hooks = { onOpen: null, onClose: null };

  function setHooks(next) {
    hooks = { ...hooks, ...next };
  }

  function isTutorialLevel(level) {
    return Boolean(level?.tutorial);
  }

  function reset() {
    stepIndex = 0;
    modalOpen = false;
    onModalClose = null;
    closeModal();
  }

  function closeModal() {
    const existing = document.getElementById("puzzle-tutorial-modal");
    if (existing) existing.remove();
    modalOpen = false;
  }

  function isBlocking() {
    return modalOpen;
  }

  function currentStep() {
    return steps()[stepIndex] || null;
  }

  function showStep(step, onClose) {
    closeModal();
    modalOpen = true;
    onModalClose = onClose || null;
    if (hooks.onOpen) hooks.onOpen();

    const overlay = document.createElement("div");
    overlay.id = "puzzle-tutorial-modal";
    overlay.className = "puzzle-tutorial-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const box = document.createElement("div");
    box.className = "puzzle-tutorial-modal__box";

    const title = document.createElement("h3");
    title.className = "puzzle-tutorial-modal__title";
    title.textContent = step.title || "Tip";

    const body = document.createElement("p");
    body.className = "puzzle-tutorial-modal__body";
    body.textContent = step.body || "";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "puzzle-btn puzzle-btn--primary";
    btn.textContent = step.button || "Next";

    btn.addEventListener("click", () => {
      if (hooks.onClose) hooks.onClose();
      closeModal();
      const cb = onModalClose;
      onModalClose = null;
      stepIndex += 1;
      if (cb) cb();
      maybeShowPendingButtonStep();
    });

    box.append(title, body, btn);
    overlay.append(box);
    document.body.append(overlay);

    if (step.highlight) {
      const target = document.querySelector(step.highlight);
      if (target) {
        target.classList.add("puzzle-tutorial-highlight");
        overlay.addEventListener(
          "click",
          () => target.classList.remove("puzzle-tutorial-highlight"),
          { once: true }
        );
        btn.addEventListener("click", () => {
          target.classList.remove("puzzle-tutorial-highlight");
        });
      }
    }
  }

  function maybeShowPendingButtonStep() {
    const step = currentStep();
    if (!step || step.advanceOn !== "button") return;
    showStep(step);
  }

  function tryAdvance(action) {
    if (modalOpen) return;
    const step = currentStep();
    if (!step || step.advanceOn !== action) return;
    showStep(step);
  }

  function notify(action) {
    if (!steps().length) return;
    tryAdvance(action);
  }

  window.PuzzleTutorial = {
    isTutorialLevel,
    reset,
    notify,
    isBlocking,
    closeModal,
    setHooks,
  };
})();
