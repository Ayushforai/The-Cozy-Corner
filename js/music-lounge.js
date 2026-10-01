(function initMusicLounge() {
  const lounge = window.SITE_CONFIG?.musicLounge ?? {};

  const titleEl = document.getElementById("music-page-title");
  const subEl = document.getElementById("music-page-sub");
  const mascotEl = document.getElementById("music-page-mascot");
  const noteEl = document.getElementById("music-page-note");
  const rootEl = document.getElementById("music-lounge-root");
  const resolve = window.resolveSitePath || ((p) => p);

  if (titleEl && lounge.title) titleEl.textContent = lounge.title;
  if (subEl && lounge.subtitle) subEl.textContent = lounge.subtitle;

  const images = window.SITE_CONFIG?.images ?? {};
  const rawHeader =
    lounge.headerImage ||
    (lounge.headerImageKey && images[lounge.headerImageKey]) ||
    images.musicHeader ||
    "";
  if (mascotEl && rawHeader) {
    mascotEl.src = resolve(rawHeader);
    mascotEl.alt = "";
  }

  const theme = lounge.theme === "dark" ? "dark" : "";

  const sectionDefs = [
    {
      key: "playlists",
      title: lounge.sectionTitles?.playlists || "Playlists",
      defaultHeight: Number(lounge.embedHeights?.playlist) || 352,
      items: lounge.playlists,
    },
    {
      key: "tracks",
      title: lounge.sectionTitles?.tracks || "Tracks",
      defaultHeight: Number(lounge.embedHeights?.track) || 152,
      items: lounge.tracks,
    },
    {
      key: "artists",
      title: lounge.sectionTitles?.artists || "Artists",
      defaultHeight: Number(lounge.embedHeights?.artist) || 352,
      items: lounge.artists,
    },
  ];

  function itemProvider(item) {
    const p = String(item.provider || "").toLowerCase();
    if (p === "youtube" || p === "youtubemusic" || p === "youtube-music") {
      return "youtube";
    }
    const raw = [item.url, item.uri].filter(Boolean).join(" ");
    if (/youtube\.com|youtu\.be|music\.youtube\.com/i.test(raw)) {
      return "youtube";
    }
    return "spotify";
  }

  function parseYouTubeVideoId(input) {
    if (!input || typeof input !== "string") return "";
    const trimmed = input.trim();
    if (/^[\w-]{11}$/.test(trimmed) && !/^YOUR_/i.test(trimmed)) {
      return trimmed;
    }
    if (/YOUR_YOUTUBE/i.test(trimmed)) return "";

    try {
      const url = new URL(trimmed);
      const host = url.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        const id = url.pathname.split("/").filter(Boolean)[0];
        return id && !/^YOUR_/i.test(id) ? id : "";
      }
      if (host === "youtube.com" || host === "music.youtube.com" || host === "m.youtube.com") {
        const fromQuery = url.searchParams.get("v");
        if (fromQuery && !/^YOUR_/i.test(fromQuery)) return fromQuery;
        const parts = url.pathname.split("/").filter(Boolean);
        const embedIdx = parts.indexOf("embed");
        if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
        const shortIdx = parts.indexOf("shorts");
        if (shortIdx >= 0 && parts[shortIdx + 1]) return parts[shortIdx + 1];
      }
    } catch {
      /* not a URL */
    }
    return "";
  }

  function youtubeVideoId(item) {
    if (item.youtubeId) {
      const id = parseYouTubeVideoId(String(item.youtubeId));
      if (id) return id;
    }
    if (item.url) {
      const id = parseYouTubeVideoId(String(item.url));
      if (id) return id;
    }
    if (item.uri) {
      const id = parseYouTubeVideoId(String(item.uri));
      if (id) return id;
    }
    return "";
  }

  function spotifyLoadArg(item) {
    const raw = item.uri && String(item.uri).trim()
      ? String(item.uri).trim()
      : item.url && String(item.url).trim()
        ? String(item.url).trim()
        : "";
    if (!raw || /YOUR_(PLAYLIST|TRACK|ARTIST)_ID/i.test(raw)) return "";
    if (/youtube\.com|youtu\.be|music\.youtube\.com/i.test(raw)) return "";
    return raw;
  }

  function mountYouTubeEmbed(host, videoId, height) {
    const h = Math.max(152, Number(height) || 200);
    const iframe = document.createElement("iframe");
    iframe.src =
      "https://www.youtube.com/embed/" +
      encodeURIComponent(videoId) +
      "?rel=0&modestbranding=1";
    iframe.title = "YouTube player";
    iframe.width = "100%";
    iframe.height = String(h);
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    host.appendChild(iframe);
  }

  const spotifyJobs = [];

  if (!rootEl) return;

  rootEl.replaceChildren();

  sectionDefs.forEach((section) => {
    const items = Array.isArray(section.items) ? section.items.filter(Boolean) : [];
    if (!items.length) return;

    const sectionEl = document.createElement("section");
    sectionEl.className = "music-section";
    sectionEl.setAttribute("aria-labelledby", `music-section-${section.key}`);

    const heading = document.createElement("h2");
    heading.id = `music-section-${section.key}`;
    heading.className = "music-section__title";
    heading.textContent = section.title;
    sectionEl.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "music-box-grid";

    items.forEach((item, index) => {
      const provider = itemProvider(item);
      const defaultHeight =
        provider === "youtube"
          ? Number(lounge.embedHeights?.youtube) ||
            Number(item.embedHeight) ||
            section.defaultHeight
          : section.defaultHeight;
      const height = Number(item.embedHeight) || defaultHeight;

      const box = document.createElement("article");
      box.className = "music-box";
      if (provider === "youtube") box.classList.add("music-box--youtube");

      const boxTitle = document.createElement("h3");
      boxTitle.className = "music-box__title";
      boxTitle.textContent =
        item.label || item.title || `${section.title} ${index + 1}`;
      box.appendChild(boxTitle);

      if (item.description) {
        const desc = document.createElement("p");
        desc.className = "music-box__desc";
        desc.textContent = item.description;
        box.appendChild(desc);
      }

      const embedWrap = document.createElement("div");
      embedWrap.className = "music-box__embed";

      if (provider === "youtube") {
        const videoId = youtubeVideoId(item);
        if (!videoId) {
          box.classList.add("music-box--placeholder");
          const hint = document.createElement("p");
          hint.className = "music-box__placeholder";
          hint.innerHTML =
            'Paste a YouTube or YouTube Music Share link (or <code>youtubeId</code>) in <code>musicLounge.' +
            section.key +
            "</code> and set <code>provider: \"youtube\"</code>.";
          embedWrap.appendChild(hint);
        } else {
          const ytHeight =
            provider === "youtube" ? Math.max(200, height) : height;
          mountYouTubeEmbed(embedWrap, videoId, ytHeight);
        }
      } else {
        const loadArg = spotifyLoadArg(item);
        if (!loadArg) {
          box.classList.add("music-box--placeholder");
          const hint = document.createElement("p");
          hint.className = "music-box__placeholder";
          hint.innerHTML =
            'Paste a Spotify Share link in <code>js/config.js</code> → <code>musicLounge.' +
            section.key +
            "</code> for this box.";
          embedWrap.appendChild(hint);
        } else {
          spotifyJobs.push({ host: embedWrap, loadArg, height });
        }
      }

      box.appendChild(embedWrap);
      grid.appendChild(box);
    });

    sectionEl.appendChild(grid);
    rootEl.appendChild(sectionEl);
  });

  const hasAnySection = rootEl.children.length > 0;
  const hasAnySpotify = spotifyJobs.length > 0;

  if (!hasAnySection) {
    if (noteEl) {
      noteEl.innerHTML =
        'Add playlists, tracks, or artists in <code>js/config.js</code> → <code>musicLounge.playlists</code>, <code>tracks</code>, <code>artists</code>, then reload.';
    }
    return;
  }

  if (!hasAnySpotify && noteEl) {
    noteEl.textContent = "";
  }

  if (!hasAnySpotify) return;

  function buildOptions(loadArg, height) {
    const options = {
      width: "100%",
      height: String(height),
    };
    if (/^https?:\/\//i.test(loadArg)) {
      options.url = loadArg;
    } else {
      options.uri = loadArg;
    }
    if (theme === "dark") options.theme = "dark";
    return options;
  }

  function mountSpotifyEmbeds(IFrameAPI) {
    spotifyJobs.forEach(({ host, loadArg, height }) => {
      IFrameAPI.createController(host, buildOptions(loadArg, height), () => {});
    });
    if (noteEl) noteEl.textContent = "";
  }

  window.onSpotifyIframeApiReady = mountSpotifyEmbeds;

  if (!document.querySelector('script[data-spotify-iframe-api="true"]')) {
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.dataset.spotifyIframeApi = "true";
    document.body.appendChild(script);
  }
})();
