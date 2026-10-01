/**
 * Center-crop level art to a fixed aspect (default 3:4 portrait) — cover fit, no stretch.
 */
(function () {
  const MAX_WIDTH = 1024;

  function getAspect() {
    const a = window.SITE_CONFIG?.puzzleGame?.imageAspect;
    const w = Number(a?.width) > 0 ? Number(a.width) : 3;
    const h = Number(a?.height) > 0 ? Number(a.height) : 4;
    return { w, h };
  }

  /**
   * @param {HTMLImageElement} img
   * @param {number} aspectW
   * @param {number} aspectH
   * @returns {string} data URL
   */
  function centerCropAspectDataUrl(img, aspectW, aspectH) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error("Invalid image dimensions");

    const target = aspectW / aspectH;
    const source = w / h;
    let cropW;
    let cropH;
    let sx;
    let sy;

    if (source > target) {
      cropH = h;
      cropW = h * target;
      sx = (w - cropW) / 2;
      sy = 0;
    } else {
      cropW = w;
      cropH = w / target;
      sx = 0;
      sy = (h - cropH) / 2;
    }

    const outW = Math.min(Math.round(cropW), MAX_WIDTH);
    const outH = Math.round(outW * (aspectH / aspectW));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");

    ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, outW, outH);

    return canvas.toDataURL("image/jpeg", 0.92);
  }

  /**
   * @param {string} url resolved image URL
   * @returns {Promise<string|null>}
   */
  function loadCroppedForPuzzle(url) {
    const { w, h } = getAspect();
    return new Promise((resolve) => {
      if (!url) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        try {
          resolve(centerCropAspectDataUrl(img, w, h));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  window.PuzzleImage = {
    loadCroppedForPuzzle,
    centerCropAspectDataUrl,
    getAspect,
  };
})();
