/**
 * Puzzle profile & level progress (localStorage).
 */
(function () {
  const cfg = () => window.SITE_CONFIG?.puzzleGame || {};
  const storageKey = () => cfg().storageKey || "pandaRamen.puzzleProfile";

  function defaultProfile() {
    return {
      displayName: "",
      createdAt: Date.now(),
      levels: {},
      totalStars: 0,
      tutorialCompleted: false,
    };
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (!raw) return defaultProfile();
      const data = JSON.parse(raw);
      return {
        ...defaultProfile(),
        ...data,
        levels: data.levels && typeof data.levels === "object" ? data.levels : {},
      };
    } catch {
      return defaultProfile();
    }
  }

  function saveProfile(profile) {
    const levels = profile.levels || {};
    let total = 0;
    Object.keys(levels).forEach((id) => {
      const stars = levels[id]?.bestStars ?? 0;
      total += Math.min(3, Math.max(0, stars));
    });
    profile.totalStars = total;
    localStorage.setItem(storageKey(), JSON.stringify(profile));
    return profile;
  }

  function setDisplayName(name) {
    const profile = loadProfile();
    profile.displayName = String(name || "").trim().slice(0, 24);
    return saveProfile(profile);
  }

  function markTutorialCompleted() {
    const profile = loadProfile();
    profile.tutorialCompleted = true;
    return saveProfile(profile);
  }

  function isTutorialCompleted() {
    return Boolean(loadProfile().tutorialCompleted);
  }

  function recordLevelResult(levelId, stars, timeRemainingSec) {
    if (levelId === "tutorial") {
      return markTutorialCompleted();
    }
    const profile = loadProfile();
    const key = String(levelId);
    const prev = profile.levels[key] || { bestStars: 0, bestTimeRemaining: 0 };
    const bestStars = Math.max(prev.bestStars || 0, stars);
    const bestTimeRemaining = Math.max(prev.bestTimeRemaining || 0, timeRemainingSec || 0);
    profile.levels[key] = {
      bestStars,
      bestTimeRemaining,
      lastPlayedAt: Date.now(),
    };
    return saveProfile(profile);
  }

  function isLevelUnlocked(levelId, levelsConfig) {
    if (levelId === "tutorial") return true;
    if (levelId <= 1) return true;
    const prevId = levelId - 1;
    const profile = loadProfile();
    const prev = profile.levels[String(prevId)];
    return (prev?.bestStars ?? 0) >= 1;
  }

  function getLevelProgress(levelId) {
    const profile = loadProfile();
    return profile.levels[String(levelId)] || null;
  }

  window.PuzzleStorage = {
    loadProfile,
    saveProfile,
    setDisplayName,
    recordLevelResult,
    markTutorialCompleted,
    isTutorialCompleted,
    isLevelUnlocked,
    getLevelProgress,
  };
})();
