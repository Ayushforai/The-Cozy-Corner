/**
 * Puzzle profiles & level progress (localStorage, up to 4 profiles).
 */
(function () {
  const cfg = () => window.SITE_CONFIG?.puzzleGame || {};
  const storageKey = () => cfg().storageKey || "pandaRamen.puzzleProfile";
  const maxProfiles = () => {
    const n = cfg().maxProfiles;
    return typeof n === "number" && n > 0 ? Math.min(4, Math.floor(n)) : 4;
  };

  function newId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function defaultProfileData() {
    return {
      displayName: "",
      createdAt: Date.now(),
      levels: {},
      totalStars: 0,
      tutorialCompleted: false,
    };
  }

  function recomputeTotalStars(profile) {
    const levels = profile.levels || {};
    let total = 0;
    Object.keys(levels).forEach((id) => {
      total += Math.min(3, Math.max(0, levels[id]?.bestStars ?? 0));
    });
    profile.totalStars = total;
    return profile;
  }

  function normalizeProfile(data) {
    const base = defaultProfileData();
    return recomputeTotalStars({
      ...base,
      ...data,
      levels: data?.levels && typeof data.levels === "object" ? data.levels : {},
    });
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (!raw) {
        return { version: 2, activeProfileId: null, profiles: {} };
      }
      const data = JSON.parse(raw);

      if (data.profiles && typeof data.profiles === "object") {
        const profiles = {};
        Object.keys(data.profiles).forEach((id) => {
          profiles[id] = normalizeProfile(data.profiles[id]);
        });
        let activeProfileId = data.activeProfileId;
        if (activeProfileId && !profiles[activeProfileId]) {
          activeProfileId = Object.keys(profiles)[0] || null;
        }
        return { version: 2, activeProfileId, profiles };
      }

      if (data.displayName !== undefined || data.levels) {
        const id = newId();
        const profiles = { [id]: normalizeProfile(data) };
        const store = { version: 2, activeProfileId: id, profiles };
        saveStore(store);
        return store;
      }

      return { version: 2, activeProfileId: null, profiles: {} };
    } catch {
      return { version: 2, activeProfileId: null, profiles: {} };
    }
  }

  function saveStore(store) {
    Object.keys(store.profiles).forEach((id) => {
      store.profiles[id] = recomputeTotalStars(store.profiles[id]);
    });
    localStorage.setItem(storageKey(), JSON.stringify(store));
    return store;
  }

  function ensureActiveProfile() {
    const store = loadStore();
    const ids = Object.keys(store.profiles);
    if (!ids.length) {
      store.activeProfileId = null;
      saveStore(store);
      return null;
    }
    if (!store.activeProfileId || !store.profiles[store.activeProfileId]) {
      store.activeProfileId = ids[0];
      saveStore(store);
    }
    return store.activeProfileId;
  }

  function loadProfile() {
    const id = ensureActiveProfile();
    if (!id) return defaultProfileData();
    const store = loadStore();
    return store.profiles[id] || defaultProfileData();
  }

  function saveProfile(profile) {
    const store = loadStore();
    const id = ensureActiveProfile();
    if (!id) return profile;
    store.profiles[id] = recomputeTotalStars({ ...profile });
    saveStore(store);
    return store.profiles[id];
  }

  function listProfiles() {
    const store = loadStore();
    return Object.keys(store.profiles)
      .map((id) => {
        const p = store.profiles[id];
        return {
          id,
          displayName: p.displayName || "Player",
          totalStars: p.totalStars ?? 0,
          createdAt: p.createdAt ?? 0,
        };
      })
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  function getActiveProfileId() {
    return ensureActiveProfile();
  }

  function switchProfile(profileId) {
    const store = loadStore();
    if (!store.profiles[profileId]) return false;
    store.activeProfileId = profileId;
    saveStore(store);
    return true;
  }

  function createProfile(name) {
    const store = loadStore();
    const ids = Object.keys(store.profiles);
    if (ids.length >= maxProfiles()) return null;
    const id = newId();
    const profile = normalizeProfile({
      displayName: String(name || "").trim().slice(0, 24) || "Player",
      createdAt: Date.now(),
    });
    store.profiles[id] = profile;
    store.activeProfileId = id;
    saveStore(store);
    return id;
  }

  function deleteProfile(profileId) {
    const store = loadStore();
    if (!store.profiles[profileId]) return false;
    delete store.profiles[profileId];
    if (store.activeProfileId === profileId) {
      const remaining = Object.keys(store.profiles);
      store.activeProfileId = remaining[0] || null;
    }
    saveStore(store);
    return true;
  }

  function setDisplayName(name) {
    const profile = loadProfile();
    profile.displayName = String(name || "").trim().slice(0, 24) || "Player";
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
    profile.levels[key] = {
      bestStars: Math.max(prev.bestStars || 0, stars),
      bestTimeRemaining: Math.max(prev.bestTimeRemaining || 0, timeRemainingSec || 0),
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

  function canCreateProfile() {
    return Object.keys(loadStore().profiles).length < maxProfiles();
  }

  window.PuzzleStorage = {
    loadProfile,
    saveProfile,
    listProfiles,
    getActiveProfileId,
    switchProfile,
    createProfile,
    deleteProfile,
    setDisplayName,
    recordLevelResult,
    markTutorialCompleted,
    isTutorialCompleted,
    isLevelUnlocked,
    getLevelProgress,
    canCreateProfile,
    maxProfiles,
  };
})();
