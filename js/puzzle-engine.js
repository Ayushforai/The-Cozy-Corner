/**
 * Tile puzzle — swap with neighbor in swipe direction; every cell shows a piece.
 */
(function () {
  const DIRS = {
    up: { dr: -1, dc: 0 },
    down: { dr: 1, dc: 0 },
    left: { dr: 0, dc: -1 },
    right: { dr: 0, dc: 1 },
    upLeft: { dr: -1, dc: -1 },
    upRight: { dr: -1, dc: 1 },
    downLeft: { dr: 1, dc: -1 },
    downRight: { dr: 1, dc: 1 },
  };

  function createState(rows, cols) {
    const n = rows * cols;
    const tiles = [];
    for (let i = 0; i < n; i++) tiles.push(i);
    return { rows, cols, tiles, moveCount: 0 };
  }

  function indexToRC(index, cols) {
    return { r: Math.floor(index / cols), c: index % cols };
  }

  function rcToIndex(r, c, cols) {
    return r * cols + c;
  }

  function neighborInDirection(index, direction, rows, cols) {
    const d = DIRS[direction];
    if (!d) return null;
    const { r, c } = indexToRC(index, cols);
    const nr = r + d.dr;
    const nc = c + d.dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return null;
    return rcToIndex(nr, nc, cols);
  }

  function swapCells(state, i, j) {
    if (i === j) return false;
    const tmp = state.tiles[i];
    state.tiles[i] = state.tiles[j];
    state.tiles[j] = tmp;
    state.moveCount += 1;
    return true;
  }

  function swapWithDirection(state, fromIndex, direction) {
    const to = neighborInDirection(fromIndex, direction, state.rows, state.cols);
    if (to === null) return false;
    return swapCells(state, fromIndex, to);
  }

  function surroundingNeighbors(index, rows, cols) {
    const out = [];
    Object.keys(DIRS).forEach((name) => {
      const n = neighborInDirection(index, name, rows, cols);
      if (n !== null) out.push(n);
    });
    return out;
  }

  function areSurrounding(a, b, rows, cols) {
    if (a === b) return false;
    return surroundingNeighbors(a, rows, cols).includes(b);
  }

  function directionFromDelta(dx, dy, threshold) {
    const t = threshold ?? 24;
    if (Math.abs(dx) < t && Math.abs(dy) < t) return null;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax >= t * 0.55 && ay >= t * 0.55) {
      if (dx > 0 && dy > 0) return "downRight";
      if (dx > 0 && dy < 0) return "upRight";
      if (dx < 0 && dy > 0) return "downLeft";
      return "upLeft";
    }
    if (ax >= ay) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
  }

  function isSolved(state) {
    const n = state.rows * state.cols;
    for (let i = 0; i < n; i++) {
      if (state.tiles[i] !== i) return false;
    }
    return true;
  }

  function shuffle(state, minMoves = 40) {
    const moves = Math.max(minMoves, state.rows * state.cols * 8);
    const n = state.tiles.length;
    for (let i = 0; i < moves; i++) {
      let a = Math.floor(Math.random() * n);
      let b = Math.floor(Math.random() * n);
      while (b === a) b = Math.floor(Math.random() * n);
      swapCells(state, a, b);
    }
    if (isSolved(state) && n > 1) {
      swapCells(state, 0, 1);
    }
    state.moveCount = 0;
    return state;
  }

  function pieceBackgroundStyle(pieceIndex, rows, cols, imageUrl) {
    const col = pieceIndex % cols;
    const row = Math.floor(pieceIndex / cols);
    const xPct = cols > 1 ? (col / (cols - 1)) * 100 : 0;
    const yPct = rows > 1 ? (row / (rows - 1)) * 100 : 0;
    return {
      backgroundImage: imageUrl ? `url("${imageUrl}")` : "none",
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${xPct}% ${yPct}%`,
      backgroundRepeat: "no-repeat",
    };
  }

  function starsForFinish(timeRemainingSec, totalTimeSec, thresholds, peekPenalty = 0) {
    if (timeRemainingSec <= 0) return 0;
    const ratio = timeRemainingSec / totalTimeSec;
    const t3 = thresholds?.three ?? 0.45;
    const t2 = thresholds?.two ?? 0.2;
    let stars = 1;
    if (ratio >= t3) stars = 3;
    else if (ratio >= t2) stars = 2;
    stars = Math.max(0, stars - (peekPenalty || 0));
    return Math.min(3, stars);
  }

  window.PuzzleEngine = {
    createState,
    shuffle,
    swapCells,
    swapWithDirection,
    directionFromDelta,
    neighborInDirection,
    surroundingNeighbors,
    areSurrounding,
    isSolved,
    pieceBackgroundStyle,
    starsForFinish,
  };
})();
