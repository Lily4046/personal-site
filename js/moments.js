(async function () {
  "use strict";

  let data = window.MOMENTS;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const pad = (value) => String(value).padStart(2, "0");
  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[char]
    );

  try {
    const response = await fetch(root.dataset.momentsApi || "/api/moments", {
      headers: { accept: "application/json" },
      cache: "no-store"
    });
    if (response.ok) {
      const remote = await response.json();
      if (Array.isArray(remote.entries)) data = remote;
    }
  } catch (error) {
    /* Keep the bundled entries when the API is unavailable. */
  }

  if (!data) {
    console.error("MOMENTS is missing. Check js/moments-data.js.");
    return;
  }

  function setText(selector, text) {
    const node = $(selector);
    if (node) node.textContent = text;
  }

  /* -------------------------------------------------------
     Header, theme and clock
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
      /* localStorage may be unavailable. */
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
      /* localStorage may be unavailable. */
    }
    syncLayoutUI();
  });

  syncLayoutUI();

  const clockFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  });

  function updateClock() {
    const now = new Date();
    setText("#clock", "HARBIN " + clockFormatter.format(now));
    setText(
      "#nowTime",
      new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(now)
    );
    const dateParts = Object.fromEntries(
      dateFormatter.formatToParts(now).map((part) => [part.type, part.value])
    );
    setText(
      "#nowDate",
      `${dateParts.year}.${dateParts.month}.${dateParts.day} / ${dateParts.weekday}`
    );
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  setText("#nowTitle", data.status.title);
  setText("#nowNote", data.status.note);
  setText("#lastUpdate", data.updated);
  setText("#momentsCountLabel", pad(data.entries.length));
  setText("#year", String(new Date().getFullYear()));

  /* -------------------------------------------------------
     Mobile navigation
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
     Scroll UI
     ------------------------------------------------------- */

  const header = $("#siteHeader");
  const progress = $("#scrollProgress");
  let ticking = false;

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;
    header.classList.toggle("is-scrolled", scrollTop > 12);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollUI);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateScrollUI();

  /* -------------------------------------------------------
     Moments feed
     ------------------------------------------------------- */

  const list = $("#momentList");
  const filters = $("#momentFilters");
  const count = $("#momentCount");
  const empty = $("#momentEmpty");
  let activeFilter = "全部";

  function categoryCount(category) {
    if (category === "全部") return data.entries.length;
    return data.entries.filter((entry) => entry.category === category).length;
  }

  function renderFilters() {
    filters.innerHTML = data.categories
      .map((category) => {
        const active = category === activeFilter;
        return `
          <button
            class="moment-filter${active ? " is-active" : ""}"
            type="button"
            data-filter="${escapeHtml(category)}"
            aria-pressed="${active}"
          >
            ${escapeHtml(category)}<span>${pad(categoryCount(category))}</span>
          </button>`;
      })
      .join("");
  }

  function renderEntries() {
    list.innerHTML = data.entries
      .map((entry, index) => {
        const tags = entry.tags
          .map((tag) => `<span>${escapeHtml(tag)}</span>`)
          .join("");
        let link = "";

        if (entry.link) {
          const external = /^https?:\/\//i.test(entry.link.href);
          link = `
            <a class="moment-link" href="${escapeHtml(entry.link.href)}" ${
              external ? 'target="_blank" rel="noreferrer noopener"' : ""
            }>
              ${escapeHtml(entry.link.label)}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="${external ? "M7 17 17 7M8 7h9v9" : "M5 12h13M13 6l6 6-6 6"}"></path>
              </svg>
            </a>`;
        }

        const photo = entry.image
          ? `
            <figure class="moment-photo">
              <a
                href="${escapeHtml(entry.image)}"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="查看这张动态照片的大图"
              >
                <img
                  src="${escapeHtml(entry.image)}"
                  alt="${escapeHtml(entry.imageAlt || "动态照片")}"
                  loading="lazy"
                  decoding="async"
                >
              </a>
              ${
                entry.imageCaption
                  ? `<figcaption><span>${escapeHtml(entry.imageCaption)}</span><span>OPEN ↗</span></figcaption>`
                  : ""
              }
            </figure>`
          : "";

        return `
          <article
            class="moment-entry"
            data-category="${escapeHtml(entry.category)}"
            data-reveal
            style="--delay: ${index * 45}ms"
          >
            <div class="moment-time">
              <span>${escapeHtml(entry.date)}</span>
              <span>${escapeHtml(entry.time)}</span>
            </div>
            <div class="moment-body">
              <div class="moment-tags">${tags}</div>
              <p>${escapeHtml(entry.text)}</p>
              ${photo}
              ${link}
            </div>
          </article>`;
      })
      .join("");
  }

  function applyFilter(category) {
    activeFilter = category;
    let visible = 0;

    $$(".moment-entry", list).forEach((entry) => {
      const show = category === "全部" || entry.dataset.category === category;
      entry.hidden = !show;
      if (show) visible += 1;
    });

    $$(".moment-filter", filters).forEach((button) => {
      const active = button.dataset.filter === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    count.textContent = `${pad(visible)} / ${pad(data.entries.length)} 条`;
    empty.hidden = visible !== 0;
  }

  renderFilters();
  renderEntries();
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (button) applyFilter(button.dataset.filter);
  });
  applyFilter("全部");

  /* -------------------------------------------------------
     Reveal
     ------------------------------------------------------- */

  function setupReveal() {
    const items = $$("[data-reveal]");

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    items.forEach((item) => observer.observe(item));
  }

  setupReveal();
})();
