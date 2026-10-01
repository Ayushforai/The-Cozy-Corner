(function buildHomepage() {
  const site = window.SITE_CONFIG?.site;
  const home = window.SITE_CONFIG?.homepage;
  const images = window.SITE_CONFIG?.images;
  if (!home) return;

  document.title = site?.title ? `${site.title} — Home` : "Home";

  const titleEl = document.getElementById("site-title");
  const taglineEl = document.getElementById("site-tagline");
  const headerMascot = document.getElementById("header-mascot");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroBowl = document.getElementById("hero-ramen");
  const navList = document.getElementById("nav-cards");
  const footerNote = document.getElementById("footer-note");

  if (titleEl && site?.title) titleEl.textContent = site.title;
  if (taglineEl && site?.tagline) taglineEl.textContent = site.tagline;
  if (headerMascot && images?.panda) {
    headerMascot.src = images.panda;
    headerMascot.alt = "Panda mascot";
  }
  if (heroSubtitle && home.heroSubtitle) heroSubtitle.textContent = home.heroSubtitle;
  if (heroBowl && images?.ramen) {
    heroBowl.src = images.ramen;
    heroBowl.alt = "Ramen bowl";
  }
  if (footerNote && home.footerNote) footerNote.textContent = home.footerNote;

  if (!navList || !home.navCards) return;
  navList.innerHTML = "";

  home.navCards.forEach((card, index) => {
    const li = document.createElement("li");
    li.className = `nav-card nav-card--${card.accent || "pink"} reveal${card.disabled ? " is-disabled" : ""}`;
    li.style.setProperty("--stagger-index", String(index));

    const href = card.disabled ? "#" : card.href;
    const imgSrc = images?.[card.imageKey] || images?.panda || "";

    li.innerHTML = `
      <a class="nav-card__link" href="${href}" ${card.disabled ? 'aria-disabled="true" tabindex="-1"' : ""} data-card-id="${card.id}">
        <div class="nav-card__img-wrap">
          <img src="${imgSrc}" alt="" loading="lazy" />
        </div>
        <h3 class="nav-card__title">${card.label}</h3>
        <p class="nav-card__desc">${card.description}</p>
        <span class="nav-card__cta">${card.disabled ? '<span class="badge-soon">Coming soon</span>' : "Enter →"}</span>
      </a>
    `;

    if (card.disabled) {
      li.querySelector("a")?.addEventListener("click", (e) => e.preventDefault());
    }

    navList.appendChild(li);
  });

  document.dispatchEvent(new CustomEvent("nav-cards-built"));
})();
