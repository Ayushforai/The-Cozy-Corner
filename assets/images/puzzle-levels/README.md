# Puzzle level pictures

Place **one image per level** in this folder.

## Tutorial image

Add your tutorial art as **`tutorial-level.jpg`** (or `.png` / `.webp` — update `puzzleGame.tutorial.level.image` in `js/config.js`).

## File names (recommended)

| Level | Filename       |
|-------|----------------|
| 1     | `level-01.jpg` |
| 2     | `level-02.jpg` |
| …     | …              |
| 10    | `level-10.jpg` |

You can also use `.png` or `.webp` — update the `image` path for that level in **`js/config.js`** → `puzzleGame.levels`.

## Tips

- Any aspect ratio is OK — the game **center-crops** to **3:4 portrait** (like “cover”) so nothing is stretched.
- Wider or taller photos lose a bit off the sides or top/bottom; keep the subject near the center.
- To change the crop ratio, edit `imageAspect` in `js/config.js` → `puzzleGame`.
- Aim for at least **600×600 px** (larger is fine; the game scales down).
- Paths in config are relative to the site root, e.g. `assets/images/puzzle-levels/level-01.jpg`.

Until your files are added, the game shows a soft placeholder pattern for missing images.
