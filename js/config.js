/**
 * Site customization — edit values here (or duplicate keys in local overrides).
 * Paths are relative to the site root (folder containing index.html).
 */
window.SITE_CONFIG = {
  site: {
    title: "The Cozy Corner",
    tagline: "Cozy Setbacks, Ramen Adventures",
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
      {
        label: "Rahat Fateh Ali Khan",
        description: "Mandatory ",
        url: "https://open.spotify.com/artist/3OLGltG8UPIea8sA4w0yg0?si=2rW4gcxxSSK4GNgGmz_dgg",
      },
      {
        label: "Aditya Rikhari",
        description: "Samjho Na Sahiba...",
        url: "https://open.spotify.com/artist/3ozYqVCLohfpXIhalkhM8D?si=CFmktgpMSqSG6B0_RuyCtg"

      }
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
    /**
     * Separate MP3/M4A — like intro.audio. Put file in assets/audio/ (path from site root).
     * With useSeparateTrack, the MP4 stays muted and this track stays synced to the video.
     */
    audio: {
      enabled: true,
      src: "assets/audio/birthday-audio.mp3",
      volume: 0.85,
      useSeparateTrack: true,
      /** Sound starts with video play/pause/scrub — not on page load */
      autoplayOnVisit: false,
    },
  },

  /**
   * Custom note — pages/message.html
   * Edit messagePage.body (or paragraphs) for the text inside the rounded box.
   */
  messagePage: {
    title: "The Message",
    subtitle: "",
    headerImageKey: "messageHeader",
    headerImage: "",
    /**
     * Main text in the rounded box. Use blank lines for new paragraphs,
     * or set paragraphs: ["Line one", "Line two"] instead of body.
     */
    body: "Heyy! Long time since we last conversed. First of all, Janmdin Mubarak apko, Fiza. 🎉 It's your day, make the most of it. I wanted to wish you in my own way (nerd shii). I made this lil space called The Cozy Corner for you, one n only. Hoping you tried the activities. 🐼\n\nNot a single day goes by when I don't wish that we'd still stay in touch and stay close like we were for those months. 🌇 Us talking and spending time together was the best part of my day. I felt lotta comfort, peace and love with you. I hope I made you feel the same. 🥢\n\nWe clearly got off on the wrong foot that night. You said you were still processing your stuff and yet I failed to understand your point. I could've done better. I should've done better. 🤦🏻 Instead, I messed up big time and possibly ruined your perception of me and how you'd see me as a person. That's not who I am. \n\nIf you like then we can work things out, figure it all out to our own pace n comfort and meanwhile be each other's best friend like we were. I'm working day n night to get myself somewhere and make both of us proud. 🤞🏻 Having you by my side is no less than being the luckiest guy and I couldn't be more grateful. If you wish to rethink about me, do give me a call or text me and if not, then it's alright (not really tho) :/  Even if we don't get to talking again, I'll be happy knowing that I got to make the prettiest girl smile hoping that she tried some of the things in The Cozy Corner muehehe.\n\nI miss your voice, Fiza. I miss you... 🤍",
    paragraphs: null,
    footerNote: "",
  },

  intro: {
    enabled: true,
    /** When true, stop showing intro after timesToShow completes/skips in this browser */
    showOnce: true,
    /** Full intro plays before later loads skip it (each finish or Skip counts as one) */
    timesToShow: 2,
    seenStorageKey: "pandaRamen.introSeen",
    /** "portrait" or "landscape" for intro video frame on phones */
    orientation: "portrait",
    /** Intro-only MP4; leave "" to use videos.introSrc, or fallback if both empty */
    videoSrc: "",
    /** Leave "" to use videos.introPosterSrc */
    posterSrc: "",
    /** Minimum time intro stays visible (ms), even if video is shorter */
    minDurationMs: 2500,
    /** Cap for intro VIDEO only (0 = no cap). Welcome screen uses fallback.displayMs + minDurationMs. */
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
    /** Key in images.* for intro cartoon (e.g. introArt) */
    fallbackImageKey: "introArt",
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
    particleCount: 155,
    speedMin: 0.7,
    speedMax: 2.4,
    /** +15% visibility vs previous 0.25 / 0.72 */
    opacityMin: 0.29,
    opacityMax: 0.83,
    sizeMin: 1.2,
    sizeMax: 4.2,
    driftMax: 0.75,
    /** Baby pink flakes — matches theme babyPink */
    color: "245, 213, 216",
    /** Creme / off-white flakes — matches theme offWhite */
    colorCreme: "250, 248, 245",
  },

  scrollReveal: {
    enabled: true,
    /** Smooth opacity while scrolling (each box fades in/out with scroll position) */
    progressiveFade: true,
    thresholdSteps: 24,
    opacityBoost: 1.12,
    /** Fade only (no slide) when progressiveFade is false */
    fadeOnly: true,
    threshold: 0.1,
    rootMargin: "0px 0px -4% 0px",
    /** Tighter on phones so each Explore box animates as you scroll */
    mobileRootMargin: "0px 0px -12% 0px",
    hideWhenLeaving: true,
    durationMs: 1300,
    staggerMs: 140,
    easing: "ease-in-out",
  },

  images: {
    /** Homepage: mascot beside site title ("The Cozy Corner") */
    siteHeader: "assets/images/panda-paint.png",
    /** Intro splash (Skip screen) — intro.fallbackImageKey */
    introArt: "assets/images/panda-hand.png",
    /** Puzzle page: image above "Puzzle It Up" title — puzzleGame.headerImageKey */
    puzzleHeader: "assets/images/panda-paint.png",
    /** Homepage Explore card for puzzle — navCards[].imageKey: "puzzleNav" */
    puzzleNav: "assets/images/panda-cartoon.svg",
    /** Hero banner bowl (wiggles on homepage) — not used for nav cards */
    ramen: "assets/images/lily.png",
    /** Homepage Explore card for Music Lounge — homepage.navCards music.imageKey */
    musicNav: "assets/images/cat ramen.png",
    bdaycat: "assets/images/cat-gift.png",
    /** Music page only — musicLounge.headerImageKey (not the homepage card) */
    musicHeader: "assets/images/ramen-cartoon.svg",
    /** Message page header — messagePage.headerImageKey */
    messageHeader: "assets/images/panda-hand.png",
    /** Homepage Explore card for The Message — navCards message.imageKey */
    messageNav: "assets/images/vanilla.png",
  },

  /**
   * Sliding-tile puzzle — pages/puzzle.html
   * Put level art in assets/images/puzzle-levels/ (see README there).
   */
  puzzleGame: {
    title: "Puzzle It Up",
    subtitle: "Slide the tiles — restore the picture before time runs out.",
    profileHint: "Switch or manage profiles at the bottom of this page.",
    headerImageKey: "puzzleHeader",
    /** localStorage key for profile + progress */
    storageKey: "pandaRamen.puzzleProfile",
    /** Max saved player profiles on this device */
    maxProfiles: 4,
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
    /** Full image flash after solving, before level-cleared popup (ms) */
    victoryRevealHoldMs: 1600,
    victoryRevealFadeMs: 550,
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
        label: "Puzzle It Up",
        description: "Match tiles and chill with our panda chef.",
        href: "pages/puzzle.html",
        accent: "mustard",
        imageKey: "puzzleNav",
      },
      {
        id: "music",
        label: "Music Lounge",
        description: "Audible vibes for slurping and studying.",
        href: "pages/music.html",
        accent: "pink",
        imageKey: "musicNav",
      },
      {
        id: "message",
        label: "The Message",
        description: "A note just for you.",
        href: "pages/message.html",
        accent: "red",
        imageKey: "messageNav",
      },
    ],
    footerNote: "Made with extra corn dogs · Lots of love n blessings · By Ayush :3",
  },
};
