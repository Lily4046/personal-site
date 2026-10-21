(async function () {
  "use strict";

  let content = window.SITE_CONTENT;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const galleries = {};

  if (!content) {
    console.error("SITE_CONTENT is missing. Check js/content.js.");
    return;
  }

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function setText(selector, text) {
    const node = $(selector);
    if (node) node.textContent = text;
  }

  /* -------------------------------------------------------
     Content
     ------------------------------------------------------- */

  function renderContent() {
    if (content.seo?.title) document.title = content.seo.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && content.seo?.description) {
      description.setAttribute("content", content.seo.description);
    }

    const identity = content.identity;
    const work = content.work;
    const log = content.log;
    const now = content.now;
    const contact = content.contact;

    setText("#heroKicker", identity.kicker);
    $("#heroTitle").innerHTML = identity.title;
    setText("#heroLead", identity.lead);
    $("#heroPrimary").href = identity.primaryCta.href;
    $("#heroPrimary span").textContent = identity.primaryCta.label;
    $("#heroSecondary").href = identity.secondaryCta.href;
    $("#heroSecondary > span:first-child").textContent = identity.secondaryCta.label;

    const meta = [
      identity.coordinates,
      "GRID " + identity.grid,
      identity.status
    ];
    $("#heroMeta").innerHTML = meta
      .map((item, index) =>
        index === meta.length - 1
          ? `<span><i></i>${item}</span>`
          : `<span>${item}</span>`
      )
      .join("");

    setText("#stationCallsign", identity.station[0][1]);
    $("#stationList").innerHTML = identity.station
      .map(([label, value]) => {
        if (label !== "QTH") {
          return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
        }

        return `
          <div class="station-list-qth">
            <dt>${label}</dt>
            <dd>
              <span>${value}</span>
              <button
                class="station-qth-button station-qth-copy"
                type="button"
                data-copy-qth="${value}"
                data-copy-label="复制"
                aria-label="复制 QTH 地址"
              >复制</button>
            </dd>
          </div>
        `;
      })
      .join("");

    setText("#stationDialogCallsign", identity.station[0][1]);
    $("#stationDialogList").innerHTML = identity.station
      .map(([label, value]) => {
        if (label !== "QTH") {
          return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
        }

        return `
          <div class="station-dialog-qth">
            <dt>${label}</dt>
            <dd>
              <span class="station-dialog-address">${value}</span>
              <button
                class="station-qth-button"
                type="button"
                data-copy-qth="${value}"
                data-copy-label="复制地址"
              >复制地址</button>
            </dd>
          </div>
        `;
      })
      .join("");

    const tickerItems = identity.ticker
      .map((item) => `<span class="ticker-item">${item}</span>`)
      .join("");
    $("#tickerTrack").innerHTML = `
      <div class="ticker-group">${tickerItems}</div>
      <div class="ticker-group" aria-hidden="true">${tickerItems}</div>
    `;

    setText("#workKicker", work.kicker);
    setText("#workTitle", work.title);
    setText("#workIntro", work.intro);
    $("#workGrid").innerHTML = work.projects
      .map((project, index) => renderProject(project, index))
      .join("");

    setText("#logKicker", log.kicker);
    setText("#logTitle", log.title);
    setText("#logIntro", log.intro);
    $("#logList").innerHTML = log.entries
      .map((entry, index) => renderLogEntry(entry, index))
      .join("");
    setText("#qslKicker", log.qsl.kicker);
    setText("#qslTitle", log.qsl.title);
    setText("#qslText", log.qsl.text);
    const qth = identity.station.find(([label]) => label === "QTH")?.[1] || "";
    setText("#qslQth", qth);
    $("#qslQthCopy").dataset.copyQth = qth;
    setText("#qslGalleryLabel", log.qsl.galleryLabel);
    setText("#qslLinkLabel", log.qsl.qrzLabel);
    $("#qslLink").href = log.qsl.href;
    $("#qslGalleryButton").setAttribute(
      "aria-label",
      log.qsl.galleryLabel + "：QSL CARD / 2026"
    );

    setText("#nowKicker", now.kicker);
    setText("#nowTitle", now.title);
    setText("#nowIntro", now.intro);
    $("#nowGrid").innerHTML = now.cards
      .map(
        (card, index) => `
        <article class="now-card" data-index="0${index + 1}" data-reveal style="--delay: ${index * 90}ms">
          <span class="now-label">${card.label}</span>
          <h3>${card.title}</h3>
          <ul>${card.items.map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>`
      )
      .join("");

    setText("#contactKicker", contact.kicker);
    setText("#contactTitle", contact.title);
    setText("#contactLead", contact.lead);
    setText("#contactCallsign", contact.callsign);
    setText("#contactNote", contact.note);
    $("#contactLinks").innerHTML = contact.links
      .map(
        (link) => `
        <a class="contact-link" href="${link.href}" target="_blank" rel="noreferrer noopener">
          <span>
            <span class="contact-link-label">${link.label}</span>
            <span class="contact-link-value">${link.value}</span>
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 17 17 7M8 7h9v9"></path>
          </svg>
        </a>`
      )
      .join("");

    setText("#year", String(new Date().getFullYear()));
  }

  async function syncRemoteContent() {
    try {
      const response = await fetch("/api/site", {
        headers: { accept: "application/json" },
        cache: "no-store"
      });
      if (!response.ok) return;
      const remote = await response.json();
      if (
        remote.content &&
        typeof remote.content === "object" &&
        JSON.stringify(remote.content) !== JSON.stringify(content)
      ) {
        content = remote.content;
        renderContent();
        setupReveal();
      }
    } catch (error) {
      /* Use the bundled content when the API is unavailable. */
    }
  }

  function renderProject(project, index) {
    const classes = ["work-card"];
    if (project.featured) classes.push("is-featured");

    let media = `<div class="work-visual">${renderVisual(project.visual)}</div>`;

    if (project.visual === "image") {
      const galleryKey = project.galleryKey || "project-" + index;
      const hasGallery = Array.isArray(project.gallery) && project.gallery.length > 0;
      if (hasGallery) galleries[galleryKey] = project.gallery;

      const image = `
        <img src="${project.image}" alt="${project.alt}" loading="lazy" decoding="async" fetchpriority="low">
        ${
          hasGallery
            ? `<span class="work-media-hint" aria-hidden="true">
                 <svg viewBox="0 0 24 24">
                   <circle cx="10.5" cy="10.5" r="6.5"></circle>
                   <path d="m15.5 15.5 4.5 4.5M8 10.5h5M10.5 8v5"></path>
                 </svg>
                 VIEW / 0${project.gallery.length}
               </span>`
            : ""
        }`;

      media = hasGallery
        ? `<div class="work-media">
             <button class="work-image-button" type="button" data-gallery-key="${galleryKey}" data-project-title="${project.title}" aria-label="查看 ${project.title} 的设计图">
               ${image}
             </button>
           </div>`
        : `<div class="work-media">${image}</div>`;
    }

    const tags = project.tags
      .map((tag) => `<span>${tag}</span>`)
      .join("");

    const link = project.link
      ? `<a class="work-link" href="${project.link}" target="_blank" rel="noreferrer noopener" aria-label="打开 ${project.title} 项目">
           <svg viewBox="0 0 24 24" aria-hidden="true">
             <path d="M7 17 17 7M8 7h9v9"></path>
           </svg>
         </a>`
      : "";

    return `
      <article class="${classes.join(" ")}" data-reveal style="--delay: ${index * 70}ms">
        ${media}
        <div class="work-body">
          <div class="work-index">${project.index} / SELECTED WORK</div>
          <h3 class="work-title">${project.title}</h3>
          <p class="work-subtitle">${project.subtitle}</p>
          <p class="work-description">${project.description}</p>
          <div class="work-tags">${tags}</div>
          <div class="work-footer">
            <span class="work-meta">${project.meta}</span>
            ${link}
          </div>
        </div>
      </article>`;
  }

  function renderLogEntry(entry, index) {
    const tags = entry.tags
      .map((tag) => `<span>${tag}</span>`)
      .join("");
    const action = entry.action;
    let actionMarkup = "";

    if (action.type === "gallery") {
      actionMarkup = `
        <button
          class="log-action"
          type="button"
          data-gallery-key="${action.galleryKey}"
          data-project-title="${action.projectTitle}"
        >
          <span>${action.label}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 17 17 7M8 7h9v9"></path>
          </svg>
        </button>`;
    } else if (action.href) {
      const external = /^https?:/i.test(action.href);
      actionMarkup = `
        <a
          class="log-action"
          href="${action.href}"
          ${external ? 'target="_blank" rel="noreferrer noopener"' : ""}
        >
          <span>${action.label}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="${external ? "M7 17 17 7M8 7h9v9" : "M5 12h13M13 6l6 6-6 6"}"></path>
          </svg>
        </a>`;
    }

    return `
      <article class="log-entry" data-reveal style="--delay: ${index * 80}ms">
        <div class="log-date">${entry.date}</div>
        <div class="log-main">
          <div class="log-tags">${tags}</div>
          <h3>${entry.title}</h3>
          <p>${entry.excerpt}</p>
        </div>
        ${actionMarkup}
      </article>`;
  }

  function renderVisual(type) {
    if (type === "ui") {
      return `
        <div class="mock-ui" aria-hidden="true">
          <div class="mock-top">
            <i></i><i></i><i></i>
            <span>CLUB / WORKBENCH</span>
          </div>
          <div class="mock-body">
            <div class="mock-side">
              <i></i><i></i><i></i><i></i><i></i>
            </div>
            <div class="mock-content">
              <div class="mock-title"></div>
              <div class="mock-stats"><i></i><i></i><i></i></div>
              <div class="mock-table">
                <i></i><i></i><i></i><i></i><i></i><i></i>
              </div>
            </div>
          </div>
        </div>`;
    }

    return `
      <div class="poster-mini" aria-hidden="true">
        <div class="poster-mini-top">
          <span>CN / SPACE / 70</span>
          <span>1956—2026</span>
        </div>
        <span class="poster-mini-red"></span>
        <span class="poster-mini-number">70</span>
        <span class="poster-mini-cn">中国航天 · 七十载</span>
      </div>`;
  }

  /* -------------------------------------------------------
     Theme
     ------------------------------------------------------- */

  function syncThemeUI() {
    const isDark = root.dataset.theme === "dark";
    const toggle = $("#themeToggle");
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "切换浅色模式" : "切换深色模式");
    if (themeMeta) themeMeta.content = isDark ? "#0f1415" : "#f2ede3";
  }

  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("bg2hhw-theme", next);
    } catch (error) {
      /* localStorage can be unavailable in private contexts. */
    }
    syncThemeUI();
  });

  syncThemeUI();

  function syncLayoutUI() {
    const isCompact = root.dataset.layout === "compact";
    const toggle = $("#layoutToggle");
    const nextLabel = isCompact ? "切换为舒展布局" : "切换为紧凑布局";
    toggle.setAttribute("aria-pressed", String(isCompact));
    toggle.setAttribute("aria-label", nextLabel);
    toggle.title = nextLabel;
  }

  $("#layoutToggle").addEventListener("click", () => {
    const next = root.dataset.layout === "compact" ? "spacious" : "compact";
    root.dataset.layout = next;
    try {
      localStorage.setItem("bg2hhw-layout", next);
    } catch (error) {
      /* localStorage can be unavailable in private contexts. */
    }
    syncLayoutUI();
  });

  syncLayoutUI();

  /* -------------------------------------------------------
     Clock — the user is in Asia/Shanghai
     ------------------------------------------------------- */

  const clockFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  function updateClock() {
    setText("#clock", "HARBIN " + clockFormatter.format(new Date()));
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  /* -------------------------------------------------------
     Navigation & mobile menu
     ------------------------------------------------------- */

  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");

  function closeMenu() {
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "打开菜单");
    mobileMenu.setAttribute("aria-hidden", "true");
  }

  menuToggle.addEventListener("click", () => {
    const willOpen = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", willOpen);
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "关闭菜单" : "打开菜单");
    mobileMenu.setAttribute("aria-hidden", String(!willOpen));
  });

  $$("#mobileMenu a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });

  /* -------------------------------------------------------
     Scroll progress & active section
     ------------------------------------------------------- */

  const header = $("#siteHeader");
  const progress = $("#scrollProgress");
  const navLinks = $$(".desktop-nav a");
  let scrollTicking = false;

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;
    header.classList.toggle("is-scrolled", scrollTop > 12);
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollUI);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  updateScrollUI();

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", isActive);
          if (isActive) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-36% 0px -56% 0px", threshold: 0 }
  );

  ["about", "work", "log", "now", "contact"].forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });

  /* -------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------- */

  function setupReveal() {
    const items = $$("[data-reveal]");

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -9% 0px", threshold: 0.08 }
    );

    items.forEach((item) => revealObserver.observe(item));
  }

  /* -------------------------------------------------------
     Copy callsign
     ------------------------------------------------------- */

  const toast = $("#toast");
  let toastTimer = 0;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function fallbackCopy(text) {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    if (!fallbackCopy(text)) {
      throw new Error("copy unavailable");
    }
  }

  $("#copyCallsign").addEventListener("click", async () => {
    const callsign = content.contact.callsign;
    try {
      await copyText(callsign);
      showToast(`呼号 ${callsign} 已复制`);
    } catch (error) {
      showToast(`呼号是 ${callsign}`);
    }
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-qth]");
    if (!button) return;

    const originalLabel = button.dataset.copyLabel || "复制";
    try {
      await copyText(button.dataset.copyQth);
      button.textContent = "已复制";
      button.classList.add("is-copied");
      showToast("QTH 地址已复制");
    } catch (error) {
      showToast("复制失败，请手动选择地址");
    }

    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.classList.remove("is-copied");
    }, 1600);
  });

  const stationDialog = $("#stationDialog");
  const stationCard = $(".station-card");
  const openStationDialog = () => {
    stationDialog.showModal();
    document.body.classList.add("lightbox-open");
    $("#stationDialogClose").focus();
  };

  stationCard.addEventListener("click", (event) => {
    if (event.target.closest("[data-copy-qth]")) return;
    openStationDialog();
  });

  stationCard.addEventListener("keydown", (event) => {
    if (event.target !== stationCard) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openStationDialog();
  });
  $("#stationDialogClose").addEventListener("click", () => stationDialog.close());
  stationDialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
  });

  /* -------------------------------------------------------
     Image gallery
     ------------------------------------------------------- */

  const imageDialog = $("#imageDialog");
  const lightboxImage = $("#lightboxImage");
  const lightboxKicker = $("#lightboxKicker");
  const lightboxTitle = $("#lightboxTitle");
  const lightboxDescription = $("#lightboxDescription");
  const lightboxCount = $("#lightboxCount");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");
  let activeGallery = [];
  let activeGalleryIndex = 0;

  function renderGalleryFrame() {
    const item = activeGallery[activeGalleryIndex];
    if (!item) return;

    lightboxImage.src = item.src;
    lightboxImage.alt = `${item.title} — ${item.caption}`;
    lightboxTitle.textContent = item.title;
    lightboxDescription.textContent = item.caption;
    lightboxCount.textContent = `0${activeGalleryIndex + 1} / 0${activeGallery.length}`;

    const multiple = activeGallery.length > 1;
    lightboxPrev.hidden = !multiple;
    lightboxNext.hidden = !multiple;
  }

  function stepGallery(direction) {
    if (activeGallery.length < 2) return;
    activeGalleryIndex =
      (activeGalleryIndex + direction + activeGallery.length) % activeGallery.length;
    renderGalleryFrame();
  }

  function openGallery(key, projectTitle) {
    const gallery = galleries[key];
    if (!gallery || !gallery.length) return;

    activeGallery = gallery;
    activeGalleryIndex = 0;
    lightboxKicker.textContent = projectTitle;
    renderGalleryFrame();

    if (typeof imageDialog.showModal === "function") {
      imageDialog.showModal();
    } else {
      imageDialog.setAttribute("open", "");
    }

    document.body.classList.add("lightbox-open");
    $("#lightboxClose").focus();
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-gallery-key]");
    if (!trigger) return;
    openGallery(trigger.dataset.galleryKey, trigger.dataset.projectTitle);
  });

  $("#lightboxClose").addEventListener("click", () => imageDialog.close());
  lightboxPrev.addEventListener("click", () => stepGallery(-1));
  lightboxNext.addEventListener("click", () => stepGallery(1));

  imageDialog.addEventListener("click", (event) => {
    if (event.target === imageDialog) imageDialog.close();
  });

  imageDialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
  });

  document.addEventListener("keydown", (event) => {
    if (!imageDialog.open) return;
    if (event.key === "ArrowLeft") stepGallery(-1);
    if (event.key === "ArrowRight") stepGallery(1);
  });

  /* -------------------------------------------------------
     Signal wave canvas
     ------------------------------------------------------- */

  const canvas = $("#signalCanvas");
  const context = canvas.getContext("2d");
  let canvasWidth = 0;
  let canvasHeight = 0;
  let waveFrame = 0;
  let lastWaveDraw = 0;
  let wavesVisible = true;
  let waveStart = performance.now();

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawWaves(now) {
    if (!canvasWidth || !canvasHeight) return;

    const styles = getComputedStyle(root);
    const red = styles.getPropertyValue("--red").trim();
    const ink = styles.getPropertyValue("--ink").trim();
    const time = (now - waveStart) / 1000;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const waves = [
      { color: red, alpha: 0.5, amp: 10, freq: 0.021, speed: 0.75, offset: 0 },
      { color: ink, alpha: 0.22, amp: 16, freq: 0.012, speed: 0.42, offset: 20 },
      { color: ink, alpha: 0.1, amp: 23, freq: 0.008, speed: 0.24, offset: 38 }
    ];

    waves.forEach((wave) => {
      context.beginPath();
      context.strokeStyle = wave.color;
      context.globalAlpha = wave.alpha;
      context.lineWidth = 1;

      for (let x = 0; x <= canvasWidth; x += 3) {
        const y =
          canvasHeight * 0.47 +
          Math.sin(x * wave.freq + time * wave.speed + wave.offset) * wave.amp +
          Math.sin(x * 0.004 - time * 0.2 + wave.offset) * wave.amp * 0.45;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.stroke();
    });

    context.globalAlpha = 1;
  }

  function animateWaves(now) {
    if (now - lastWaveDraw >= 33) {
      drawWaves(now);
      lastWaveDraw = now;
    }
    if (!reduceMotion.matches && !document.hidden && wavesVisible) {
      waveFrame = window.requestAnimationFrame(animateWaves);
    }
  }

  function startWaves() {
    window.cancelAnimationFrame(waveFrame);
    sizeCanvas();
    waveStart = performance.now();
    if (reduceMotion.matches) {
      drawWaves(performance.now());
    } else {
      waveFrame = window.requestAnimationFrame(animateWaves);
    }
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(startWaves, 140);
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !reduceMotion.matches && wavesVisible) {
      window.cancelAnimationFrame(waveFrame);
      waveFrame = window.requestAnimationFrame(animateWaves);
    }
  });

  if ("IntersectionObserver" in window) {
    const waveObserver = new IntersectionObserver(
      ([entry]) => {
        wavesVisible = entry.isIntersecting;
        if (wavesVisible) {
          startWaves();
        } else {
          window.cancelAnimationFrame(waveFrame);
        }
      },
      { rootMargin: "120px" }
    );
    waveObserver.observe(canvas.closest(".wave-band"));
  }

  reduceMotion.addEventListener("change", startWaves);

  /* -------------------------------------------------------
     Boot
     ------------------------------------------------------- */

  renderContent();
  setupReveal();
  startWaves();
  window.requestAnimationFrame(syncRemoteContent);
})();
