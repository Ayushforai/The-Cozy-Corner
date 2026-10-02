(function initMessagePage() {
  const page = window.SITE_CONFIG?.messagePage ?? {};
  const resolve = window.resolveSitePath || ((p) => p);
  const images = window.SITE_CONFIG?.images ?? {};

  const titleEl = document.getElementById("message-page-title");
  const subEl = document.getElementById("message-page-sub");
  const mascotEl = document.getElementById("message-page-mascot");
  const bodyEl = document.getElementById("message-page-body");
  const noteEl = document.getElementById("message-page-note");

  const siteTitle = window.SITE_CONFIG?.site?.title || "The Cozy Corner";
  document.title = page.title ? `${page.title} — ${siteTitle}` : document.title;

  if (titleEl && page.title) titleEl.textContent = page.title;

  if (subEl) {
    if (page.subtitle) {
      subEl.textContent = page.subtitle;
      subEl.hidden = false;
    } else {
      subEl.hidden = true;
    }
  }

  const rawHeader =
    page.headerImage ||
    (page.headerImageKey && images[page.headerImageKey]) ||
    images.messageHeader ||
    "";
  if (mascotEl && rawHeader) {
    mascotEl.src = resolve(rawHeader);
    mascotEl.alt = "";
  }

  if (bodyEl) {
    bodyEl.innerHTML = "";
    const chunks = Array.isArray(page.paragraphs)
      ? page.paragraphs.filter((s) => String(s).trim())
      : String(page.body ?? "")
          .split(/\n\n+/)
          .map((block) => block.replace(/\n/g, " ").trim())
          .filter(Boolean);

    if (!chunks.length) {
      const p = document.createElement("p");
      p.textContent = "Add your text in js/config.js → messagePage.body";
      bodyEl.appendChild(p);
    } else {
      chunks.forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        bodyEl.appendChild(p);
      });
    }
  }

  if (noteEl) {
    if (page.footerNote) {
      noteEl.textContent = page.footerNote;
      noteEl.hidden = false;
    } else {
      noteEl.hidden = true;
    }
  }
})();
