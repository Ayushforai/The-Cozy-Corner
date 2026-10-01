# Customization guide

All main settings live in **`js/config.js`**. Reload the page after edits.

## Featured video (intro + Video Lounge)

Set once:

```javascript
videos: {
  mainSrc: "assets/video/intro.mp4",
  posterSrc: "assets/images/poster.jpg",
},
```

Intro uses this when `intro.videoSrc` is empty. **Video Lounge** is at `pages/video.html` (home nav card).

### Will it play instantly?

| Expectation | Reality |
|-------------|---------|
| Open page → **sound + autoplay** | Often **blocked** by Chrome/Safari/Firefox until the user clicks |
| Open page → **muted autoplay** | Usually **starts**; user unmutes for sound (`videoLounge.autoplayMuted: true`) |
| User clicks **Play** | **Most reliable**; brief buffer possible on first load or large files |
| `file://` path | Can break video paths; use `python -m http.server` locally |

Default on Video Lounge: **click to play** with sound (`videoLounge.clickToPlay: true`).

## Music Lounge (Spotify)

Page: **`pages/music.html`**. Each playlist, track, or artist is its own card with a Spotify embed.

Edit **`js/config.js`** → **`musicLounge.playlists`**, **`musicLounge.tracks`**, **`musicLounge.artists`**.

1. In Spotify: **Share** → **Copy link**.
2. Paste into the matching box’s **`url`** (or use **`uri`** like `spotify:artist:…`).

```javascript
playlists: [
  { label: "Birthday mix", description: "Optional", url: "https://open.spotify.com/playlist/…" },
],
tracks: [
  { label: "Favorite song", url: "https://open.spotify.com/track/…" },
],
artists: [
  { label: "Band name", url: "https://open.spotify.com/artist/…" },
],
```

Replace template placeholders (`YOUR_PLAYLIST_ID`, `YOUR_ARTIST_ID`, etc.) — boxes with placeholders show a hint instead of an embed.

### YouTube / YouTube Music (same embed style as Spotify boxes)

There is no separate “MP3 file” API — use an official **YouTube embed** (works with **music.youtube.com** Share links too):

```javascript
tracks: [
  {
    label: "Song title",
    provider: "youtube",
    url: "https://music.youtube.com/watch?v=VIDEO_ID",
  },
  // or: youtubeId: "VIDEO_ID",
],
```

Omit `provider` if the `url` is already a `youtube.com` / `music.youtube.com` link.

- **`embedHeights.youtube`**: default height for YouTube players (default 200px).

- **`embedHeights`**: default pixel height per type (`playlist` / `track` / `artist`); override one box with **`embedHeight`** on that item.
- **`sectionTitles`**: headings above each group.

Serve over HTTP locally (`python -m http.server`) if embeds behave oddly on `file://`.

## Intro — custom video, timing, audio

**Yes, you can use your own video.**

1. Put your file in e.g. `assets/video/intro.mp4` (MP4 or WebM works best in browsers).
2. Set:

```javascript
intro: {
  videoSrc: "assets/video/intro.mp4",
  posterSrc: "assets/images/intro-poster.jpg", // optional
  minDurationMs: 3000,   // intro won't finish before this
  maxDurationMs: 20000,  // auto-continue after 20s (0 = wait for video end / skip only)
  fadeOutMs: 900,
  showSkipButton: true,
  // ...
}
```

**Audio options:**

| Setup | Config |
|--------|--------|
| Sound baked into the video | `audio.enabled: false`, unmute by setting video volume in a future tweak, or use `video` with audio and we mute only when separate track is used |
| Separate music file | `audio.enabled: true`, `audio.src: "assets/audio/intro.mp3"`, `audio.volume: 0.6` |
| Video silent + separate narration/music | `audio.useSeparateTrack: true` (video stays muted, MP3 plays) |

Browsers often block autoplay with sound until the user clicks **Skip** or interacts; if audio doesn't start, click Skip once — that's normal browser policy.

**No video yet:** leave `videoSrc: ""` — the animated panda fallback runs. Adjust `intro.fallback.headline`, `subline`, and `displayMs`.

**Disable intro entirely:** `intro.enabled: false`.

## Theme colors

Edit `theme.offWhite`, `beige`, `babyPink`, `mustard`, `red`, `text`, `textMuted`. Applied automatically via CSS variables.

## Cartoon images

Replace paths in `images`:

```javascript
images: {
  panda: "assets/images/my-panda.png",
  ramen: "assets/images/my-ramen.png",
  pandaPeek: "assets/images/my-panda.png",
},
```

Nav cards reference keys via `imageKey` in each `navCards` entry.

## Homepage copy & buttons

- `site.title`, `site.tagline`
- `homepage.heroTitle`, `heroSubtitle`, `footerNote`
- `homepage.navCards` — add/remove cards, change `href`, set `disabled: true` for placeholders

## Snowfall background

` snowfall.enabled`, `particleCount`, speeds, opacities, `color` (RGB inside the string is parsed for flakes).

## Scroll show / hide

`scrollReveal.threshold`, `rootMargin`, `hideWhenLeaving`, `durationMs`, `staggerMs`.

## Puzzle game (sliding tiles)

Page: **`pages/puzzle.html`**. Level pictures live in **`assets/images/puzzle-levels/`** — see **`assets/images/puzzle-levels/README.md`**.

**Tutorial:** add **`tutorial-level.jpg`** (or change path in **`puzzleGame.tutorial.level.image`**). Edit popup copy in **`puzzleGame.tutorial.steps`**.

Default filenames: `level-01.jpg` … `level-10.jpg`. Photos are **center-cropped to 3:4 portrait** (`puzzleGame.imageAspect`) before tiles are cut (no stretch). To use your own names or formats, edit each level’s **`image`** in **`js/config.js`** → **`puzzleGame.levels`**:

```javascript
{ id: 1, title: "Warm-up", rows: 3, cols: 3, timeSec: 45, image: "assets/images/puzzle-levels/my-photo.png" },
```

Optional custom SFX: **`puzzleGame.sounds`** (`move`, `tap`, `win`, `star`, `tick`) — leave empty for built-in soft tones. MP3 files can go in **`assets/audio/puzzle/`**.

## Run locally

Open `index.html` in a browser, or from the project folder:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080` (needed for some video/audio paths when testing).
