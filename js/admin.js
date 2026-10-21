(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const loginView = $("#loginView");
  const dashboard = $("#dashboard");
  const loginForm = $("#loginForm");
  const loginMessage = $("#loginMessage");
  const form = $("#momentForm");
  const formMessage = $("#formMessage");
  const adminList = $("#adminList");
  const logoutButton = $("#logoutButton");
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
  let entries = [];
  let siteLoaded = false;
  let toastTimer = 0;

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2400);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: "same-origin",
      ...options,
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `请求失败（${response.status}）`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function setView(authenticated) {
    loginView.hidden = authenticated;
    dashboard.hidden = !authenticated;
    logoutButton.hidden = !authenticated;
  }

  function setPanel(panelName) {
    const isMoments = panelName === "moments";
    $("#momentsPanel").hidden = !isMoments;
    $("#sitePanel").hidden = isMoments;
    $("#newButton").hidden = !isMoments;
    $$(".admin-tab").forEach((tab) => {
      const active = tab.dataset.panel === panelName;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    if (!isMoments) loadSiteContent();
  }

  function resetForm() {
    form.reset();
    $("#momentId").value = "";
    $("#date").value = new Date()
      .toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" })
      .replaceAll("-", ".");
    $("#category").value = "日常";
    $("#published").checked = true;
    $("#editorMode").textContent = "NEW ENTRY";
    $("#editorTitle").textContent = "新建动态";
    formMessage.textContent = "";
  }

  function fillForm(entry) {
    $("#momentId").value = String(entry.id);
    $("#date").value = entry.date;
    $("#time").value = entry.time || "";
    $("#category").value = entry.category;
    $("#tags").value = entry.tags.join(", ");
    $("#text").value = entry.text;
    $("#image").value = entry.image || "";
    $("#imageAlt").value = entry.imageAlt || "";
    $("#imageCaption").value = entry.imageCaption || "";
    $("#linkLabel").value = entry.link?.label || "";
    $("#linkHref").value = entry.link?.href || "";
    $("#published").checked = entry.published;
    $("#editorMode").textContent = `EDIT / ${entry.id}`;
    $("#editorTitle").textContent = "编辑动态";
    formMessage.textContent = "";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderEntries() {
    $("#dashboardSummary").textContent =
      `共 ${entries.length} 条，${entries.filter((entry) => entry.published).length} 条已发布。`;
    if (!entries.length) {
      adminList.innerHTML = '<p class="empty-state">还没有动态，从左侧写下第一条。</p>';
      return;
    }

    adminList.innerHTML = entries
      .map(
        (entry) => `
          <article class="admin-entry">
            <div class="admin-entry-date">
              ${escapeHtml(entry.date)}<br>${escapeHtml(entry.time || "—")}
            </div>
            <div>
              <div class="status-pill ${entry.published ? "published" : ""}">
                ${escapeHtml(entry.category)} / ${entry.published ? "已发布" : "未发布"}
              </div>
              <h3>${escapeHtml(entry.text.slice(0, 48))}${entry.text.length > 48 ? "…" : ""}</h3>
              <p>${escapeHtml(entry.text)}</p>
            </div>
            <div class="admin-entry-actions">
              <button type="button" data-edit="${entry.id}">编辑</button>
              <button type="button" data-delete="${entry.id}">删除</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  async function loadEntries() {
    try {
      const data = await api("/api/admin/moments");
      entries = data.entries;
      renderEntries();
    } catch (error) {
      if (error.status === 401) {
        setView(false);
        return;
      }
      showToast(error.message);
    }
  }

  async function loadSiteContent(force = false) {
    if (siteLoaded && !force) return;
    $("#siteMessage").textContent = "正在读取整站内容…";
    try {
      const data = await api("/api/admin/site");
      if (!data.content) throw new Error("数据库中没有整站内容，请先执行迁移。");
      $("#siteEditor").value = JSON.stringify(data.content, null, 2);
      $("#siteMessage").textContent = data.updatedAt
        ? `已载入，最后更新：${data.updatedAt}`
        : "已载入。";
      siteLoaded = true;
    } catch (error) {
      if (error.status === 401) {
        setView(false);
        loginMessage.textContent = "登录已过期，请重新登录。";
        return;
      }
      $("#siteMessage").textContent = error.message;
    }
  }

  async function checkSession() {
    try {
      const session = await api("/api/admin/session");
      setView(session.authenticated);
      if (session.authenticated) {
        resetForm();
        setPanel("moments");
        await loadEntries();
      }
    } catch (error) {
      setView(false);
      loginMessage.textContent = "后台服务暂不可用。";
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginMessage.textContent = "正在登录…";
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: $("#password").value })
      });
      loginForm.reset();
      loginMessage.textContent = "";
      setView(true);
      resetForm();
      setPanel("moments");
      await loadEntries();
    } catch (error) {
      loginMessage.textContent = error.message;
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } finally {
      setView(false);
      loginMessage.textContent = "";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.textContent = "正在保存…";
    const id = $("#momentId").value;
    const payload = {
      date: $("#date").value,
      time: $("#time").value,
      category: $("#category").value,
      tags: $("#tags")
        .value.split(/[,，\n]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      text: $("#text").value,
      image: $("#image").value,
      imageAlt: $("#imageAlt").value,
      imageCaption: $("#imageCaption").value,
      linkLabel: $("#linkLabel").value,
      linkHref: $("#linkHref").value,
      published: $("#published").checked
    };

    try {
      await api(id ? `/api/admin/moments/${id}` : "/api/admin/moments", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      showToast(id ? "动态已更新。" : "动态已发布。");
      resetForm();
      await loadEntries();
    } catch (error) {
      if (error.status === 401) {
        setView(false);
        loginMessage.textContent = "登录已过期，请重新登录。";
      }
      formMessage.textContent = error.message;
    }
  });

  $("#newButton").addEventListener("click", () => {
    setPanel("moments");
    resetForm();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#resetButton").addEventListener("click", resetForm);
  $("#refreshButton").addEventListener("click", loadEntries);

  $$(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => setPanel(tab.dataset.panel));
  });

  $("#formatSiteButton").addEventListener("click", () => {
    try {
      const parsed = JSON.parse($("#siteEditor").value);
      $("#siteEditor").value = JSON.stringify(parsed, null, 2);
      $("#siteMessage").textContent = "JSON 格式正确。";
    } catch (error) {
      $("#siteMessage").textContent = `JSON 格式错误：${error.message}`;
    }
  });

  $("#reloadSiteButton").addEventListener("click", () => loadSiteContent(true));

  $("#saveSiteButton").addEventListener("click", async () => {
    let content;
    try {
      content = JSON.parse($("#siteEditor").value);
    } catch (error) {
      $("#siteMessage").textContent = `JSON 格式错误：${error.message}`;
      return;
    }

    $("#siteMessage").textContent = "正在保存整站内容…";
    try {
      await api("/api/admin/site", {
        method: "PUT",
        body: JSON.stringify({ content })
      });
      showToast("整站内容已保存。");
      $("#siteMessage").textContent = "已保存，刷新主页即可看到更新。";
      siteLoaded = false;
    } catch (error) {
      if (error.status === 401) {
        setView(false);
        loginMessage.textContent = "登录已过期，请重新登录。";
      }
      $("#siteMessage").textContent = error.message;
    }
  });

  adminList.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit]");
    if (editButton) {
      const entry = entries.find((item) => item.id === Number(editButton.dataset.edit));
      if (entry) fillForm(entry);
      return;
    }

    const deleteButton = event.target.closest("[data-delete]");
    if (!deleteButton) return;
    const id = Number(deleteButton.dataset.delete);
    if (!window.confirm("确定要删除这条动态吗？此操作不可撤销。")) return;
    try {
      await api(`/api/admin/moments/${id}`, { method: "DELETE" });
      showToast("动态已删除。");
      await loadEntries();
    } catch (error) {
      showToast(error.message);
    }
  });

  checkSession();
})();

