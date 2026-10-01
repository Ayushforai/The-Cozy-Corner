/**
 * Site customization — edit values here (or duplicate keys in local overrides).
 * Paths are relative to the site root (folder containing index.html).
 */
window.SITE_CONFIG = {
  site: {
    title: "Panda & Ramen",
    tagline: "Cozy corners, noodle adventures",
  },

  theme: {
    offWhite: "#faf8f5",
    beige: "#e8dcc8",
    babyPink: "#f5d5d8",
    mustard: "#c9a227",
    red: "#c45c4a",
    text: "#3d3429",
    textMuted: "#6b5f52",
  },

  mobile: {
    /** Loads portrait-first CSS; content column capped on phones */
    portraitFirst: true,
  },

  videos: {
    /** Intro splash only (index.html) — separate from Video Lounge */
    introSrc: "",
    introPosterSrc: "",
    /** Birthday Note / pages/video.html only */
    loungeSrc: "assets/video/Happy-Birthday.mp4",
    loungePosterSrc: "",
  },

  /**
   * Music Lounge — pages/music.html (one Spotify embed per box).
   * Paste Share → Copy link into `url`, or use `uri` (spotify:playlist:… / track / artist).
   */
  musicLounge: {
    title: "Music Lounge",
    subtitle: "Chai, Ramen and Studying",
    /** Picture above the title on this page only (not the homepage box) */
    headerImageKey: "musicHeader",
    headerImage: "",
    theme: "",
    sectionTitles: {
      playlists: "Playlists",
      tracks: "Tracks",
      artists: "Artists",
    },
    embedHeights: {
      playlist: 352,
      track: 152,
      artist: 352,
      /** YouTube / YouTube Music embeds (min ~200px tall) */
      youtube: 200,
    },
    playlists: [
      {
        label: "A playlist for You",
        description: "Carefully curated by me",
        url: "https://open.spotify.com/playlist/2lmoqqf8NcVlZ5HA5TPQwT?si=7a77cde4e5c34bda",
      },
      {
        label: "A playlist that makes me think of you",
        description: "You know this one very well by the cover.",
        url: "https://open.spotify.com/playlist/7zK2q1PREl639lNVrJt1Gg?si=ef8bb5266d4e4cef",
      },
      {
        label: "PUNJVB",
        description: "P-Town Represent",
        url: "https://open.spotify.com/playlist/69hgAuCedJPDIxch0jUBfx?si=8ac37f2c265c447e",
      },
    ],
    tracks: [
      {
        label: "Since Tum - JANI, Talha Anjum, superdupersultan",
        description: "One of the many songs that makes me think of you",
        url: "https://open.spotify.com/track/0csuHYu7hgWfZc0e8D4aBz?si=0dd4abbe6ffb4d11",
      },
      {
        label: "HOME - Jokhay, Umair, Talha Anjum, Talha Yunus",
        description: "Ghar...",
        provider: "youtube",
        url: "https://music.youtube.com/watch?v=VI3av8rzXY8&si=0M9S7gVYzwSM7MQx",
      },
    ],
    artists: [
      {
        label: "Sabri Sisters",
        description: "Your fav artists",
        url: "https://open.spotify.com/artist/5LBIpDf0NQMSYa6O42d9Mn?si=y__1mikJTnCg0ubecononw",
      },
      {
        label: "Talha Anjum",
        description: "Mandatory ",
        url: "https://open.spotify.com/artist/69xcFpmqTOmFNOL08Bxyci?si=evS3aab_TNmAi9XEJeJWZw",
      },
    ],
  },

  /** Titles on pages/video.html (homepage card uses homepage.navCards.label) */
  videoLounge: {
    title: "Birthday Note",
    subtitle: "Since it's your birthday, here's a lil smth that i prepped for you.",
    /** Override path; default is videos.loungeSrc */
    videoSrc: "",
    posterSrc: "",
    /** "portrait" = fixed 9:16 box (size scales to screen). "landscape" = 16:9 */
    orientation: "portrait",
    /** Icon above the title — key from images, or set headerImage to a direct path */
    headerImageKey: "bdaycat",
    headerImage: "",
  },

  intro: {
    enabled: true,
    /** After the first visit (skip or finish), intro is hidden on later loads in this browser */
    showOnce: true,
    seenStorageKey: "pandaRamen.introSeen",
    /** "portrait" or "landscape" for intro video frame on phones */
    orientation: "portrait",
    /** Intro-only MP4; leave "" to use videos.introSrc, or fallback if both empty */
    videoSrc: "",
    /** Leave "" to use videos.introPosterSrc */
    posterSrc: "",
    /** Minimum time intro stays visible (ms), even if video is shorter */
    minDurationMs: 2500,
    /** Auto-enter site after this many ms if video hasn't ended (0 = only when video ends or skip) */
    maxDurationMs: 15000,
    /** Fade-out transition length (ms) */
    fadeOutMs: 900,
    showSkipButton: true,
    skipLabel: "Skip intro",
    fallback: {
      headline: "Welcome",
      subline: "What's next is gonna be LEGEN-DARRYYY",
      /** Duration of fallback animation before allowing enter (ms) */
      displayMs: 3200,
    },
    audio: {
      enabled: false,
      /** e.g. "assets/audio/intro.mp3" — plays alongside video or fallback */
      src: "",
      volume: 0.6,
      /** If true, mute video element and use separate audio track */
      useSeparateTrack: false,
    },
  },

  snowfall: {
    enabled: true,
    particleCount: 130,
    speedMin: 0.7,
    speedMax: 2.4,
    opacityMin: 0.25,
    opacityMax: 0.72,
    sizeMin: 1.2,
    sizeMax: 4.2,
    driftMax: 0.75,
    /** Slightly pink-tinted flakes */
    color: "rgba(245, 213, 216, 0.5)",
  },

  scrollReveal: {
    enabled: true,
    /** Fraction of element visible before showing (0–1) */
    threshold: 0.15,
    rootMargin: "0px 0px -8% 0px",
    hideWhenLeaving: true,
    durationMs: 700,
    staggerMs: 80,
  },

  images: {
    /** Replace with your cartoon PNG/SVG paths */
    panda: "assets/images/panda-paint.png",
    ramen: "assets/images/cat ramen.png",
    bdaycat: "assets/images/cat-gift.png",
    /** Music Lounge page header (homepage box uses imageKey: "ramen" on that card) */
    musicHeader: "assets/images/ramen-cartoon.svg",
  },

  /**
   * Sliding-tile puzzle — pages/puzzle.html
   * Put level art in assets/images/puzzle-levels/ (see README there).
   */
  puzzleGame: {
    title: "Puzzle Game",
    subtitle: "Slide the tiles — restore the picture before time runs out.",
    headerImageKey: "panda",
    /** localStorage key for profile + progress */
    storageKey: "pandaRamen.puzzleProfile",
    /** Optional MP3 paths (relative to site root). Leave "" to use built-in soft tones. */
    sounds: {
      move: "",
      tap: "",
      win: "",
      star: "",
      tick: "",
    },
    soundVolume: 0.22,
    /** Level photos are center-cropped to this aspect before tiles are cut */
    imageAspect: { width: 3, height: 4 },
    /** Full picture flash at level start, then fade (ms) */
    previewHoldMs: 1000,
    previewFadeMs: 650,
    /** Swipe must move at least this many px to count */
    swipeThresholdPx: 22,
    /** Tile swap animation duration (ms) */
    moveAnimMs: 280,
    /** Stars: share of time left when you finish (0–1) */
    starThresholds: {
      three: 0.45,
      two: 0.2,
    },
    /**
     * Tutorial — add image: assets/images/puzzle-levels/tutorial-level.jpg (or .png / .webp)
     */
    tutorial: {
      level: {
        id: "tutorial",
        title: "Tutorial",
        imageTitle: "tutorial-level",
        tutorial: true,
        rows: 3,
        cols: 3,
        timeSec: 180,
        image: "assets/images/puzzle-levels/tutorial-level.jpg",
      },
      steps: [
        {
          advanceOn: "previewEnd",
          title: "Welcome!",
          body:
            "Each level shows the finished picture for a moment, then scrambles the tiles. Your job is to put it back together.",
          button: "Next",
        },
        {
          advanceOn: "select",
          title: "Pick a tile",
          body:
            "Tap any tile to select it. Then tap another tile anywhere on the grid to swap them. You can also drag one tile onto another.",
          button: "I'll try it",
        },
        {
          advanceOn: "swap",
          title: "Timer",
          body:
            "The countdown starts when you make your first swap. Finish before time runs out!",
          button: "Got it",
        },
        {
          advanceOn: "button",
          title: "Peek (−1★)",
          body:
            "Stuck? Use Peek picture to see the full image again. Each peek costs one star you could earn that round (up to 3 stars).",
          button: "Continue",
          highlight: "#puzzle-peek-btn",
        },
        {
          advanceOn: "button",
          title: "Stars & levels",
          body:
            "Earn up to 3 stars by finishing with time left. Get at least 1 star on a level to unlock the next one. Good luck!",
          button: "Let's play!",
        },
      ],
    },
    levels: [
      { id: 1, title: "Warm-up", rows: 3, cols: 3, timeSec: 60, image: "assets/images/puzzle-levels/level-01.jpg" },
      { id: 2, title: "We Going Delhi With This", rows: 3, cols: 3, timeSec: 68, image: "assets/images/puzzle-levels/level-02.jpg" },
      { id: 3, title: "HIMYM", rows: 3, cols: 4, timeSec: 76, image: "assets/images/puzzle-levels/level-03.webp" },
      { id: 4, title: "Po", rows: 4, cols: 4, timeSec: 84, image: "assets/images/puzzle-levels/level-04.jpg" },
      { id: 5, title: "Kitchen rush", rows: 4, cols: 4, timeSec: 92, image: "assets/images/puzzle-levels/level-05.jpg" },
      { id: 6, title: "A Cold Treat", rows: 4, cols: 5, timeSec: 100, image: "assets/images/puzzle-levels/level-06.jpg" },
      { id: 7, title: "Morning before the Morning", rows: 5, cols: 5, timeSec: 108, image: "assets/images/puzzle-levels/level-07.png" },
      { id: 8, title: "Panda Inflation", rows: 5, cols: 5, timeSec: 116, image: "assets/images/puzzle-levels/level-08.jpg" },
      { id: 9, title: "Jhumka Grid", rows: 5, cols: 6, timeSec: 124, image: "assets/images/puzzle-levels/level-09.png" },
      { id: 10, title: "Quite A Few Bangles", rows: 6, cols: 6, timeSec: 132, image: "assets/images/puzzle-levels/level-10.jpg" },
    ],
  },

  homepage: {
    heroTitle: "Panda & Ramen Adventures.",
    heroSubtitle: "Pick a path — puzzles, tunes, and more brewing soon.",
    navCards: [
      {
        id: "video",
        label: "Birthday Note",
        description: "A must watch",
        href: "pages/video.html",
        accent: "mustard",
        imageKey: "bdaycat",
      },
      {
        id: "puzzle",
        label: "Puzzle Game",
        description: "Match tiles and chill with our panda chef.",
        href: "pages/puzzle.html",
        accent: "mustard",
        imageKey: "panda",
      },
      {
        id: "music",
        label: "Music Lounge",
        description: "Audible vibes for slurping and studying.",
        href: "pages/music.html",
        accent: "pink",
        imageKey: "ramen",
      },
    ],
    footerNote: "Made with extra noodles · Lots of love n blessings · by the one & only",
  },
};
