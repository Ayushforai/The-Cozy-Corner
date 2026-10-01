/**
 * Soft puzzle SFX — optional MP3 from config, else Web Audio tones.
 */
(function () {
  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function cfg() {
    return window.SITE_CONFIG?.puzzleGame || {};
  }

  function volume() {
    const v = cfg().soundVolume;
    return typeof v === "number" ? Math.min(1, Math.max(0, v)) : 0.22;
  }

  function playTone(freq, duration, type = "sine", gainPeak = 0.08) {
    const ctx = getCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    const peak = gainPeak * volume();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  function playFile(src) {
    if (!src) return false;
    const url = window.resolveSitePath ? window.resolveSitePath(src) : src;
    const audio = new Audio(url);
    audio.volume = volume();
    audio.play().catch(() => {});
    return true;
  }

  function play(kind) {
    const sounds = cfg().sounds || {};
    const src = sounds[kind];
    if (src && playFile(src)) return;

    switch (kind) {
      case "tap":
        playTone(520, 0.06, "sine", 0.06);
        break;
      case "move":
        playTone(380, 0.09, "triangle", 0.07);
        break;
      case "win":
        playTone(523, 0.12, "sine", 0.09);
        setTimeout(() => playTone(659, 0.14, "sine", 0.08), 90);
        setTimeout(() => playTone(784, 0.18, "sine", 0.07), 200);
        break;
      case "star":
        playTone(880, 0.1, "sine", 0.05);
        break;
      case "tick":
        playTone(240, 0.04, "sine", 0.03);
        break;
      default:
        break;
    }
  }

  function unlock() {
    getCtx();
  }

  window.PuzzleSounds = { play, unlock };
})();
