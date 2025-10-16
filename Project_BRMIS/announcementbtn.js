// announcementbtn.js
(function () {
  const form = document.querySelector(".announcement-form");
  if (!form) return;

  // Default the date input to today (YYYY-MM-DD)
  const dateInput = form.querySelector('input[name="date"]');
  if (dateInput && !dateInput.value) {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    dateInput.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  function escapeHtml(s = "") {
    return s.replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  }
  function readFileAsDataURL(file) {
    return new Promise(res => {
      if (!file || !file.size) return res("");
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(file);
    });
  }

  function makeAnnouncementCard({title, content, img, date}) {
    const el = document.createElement("div");
    el.className = "announcement-item";
    el.innerHTML = `
      <img src="${img || ""}" alt="${escapeHtml(title)}" class="announcement-img" />
      <div class="announcement-text">
        <h3>${escapeHtml(title)}</h3>
        <p class="date">${escapeHtml(date)}</p>
        <p>${escapeHtml(content)}</p>
      </div>`;
    return el;
  }
  function makeNewsCard({title, content, img, date}) {
    const el = document.createElement("div");
    el.className = "news-item";
    el.innerHTML = `
      <img class="news-img" src="${img || ""}" alt="${escapeHtml(title)}">
      <div class="news-item-title">${escapeHtml(title)}</div>
      <div class="news-date">${escapeHtml(date)}</div>
      <div class="news-desc">${escapeHtml(content)}</div>`;
    return el;
  }

 form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const title   = String(fd.get("title") || "").trim();
  const content = String(fd.get("content") || "").trim();
  const date    = String(fd.get("date") || "").trim(); // publish date (shown)
  const category = String(fd.get("category") || "Announcements");
  const file    = fd.get("image");

  // NEW: expiry metadata
  const expireStr    = String(fd.get("expire") || "").trim(); // may be blank
  const autoArchive  = fd.get("autoArchive") ? true : false;
  const expiresAt    = expireStr ? new Date(expireStr + "T23:59:59").getTime() : null;

  if (!title || !content || !date) return;

  // read image (if any)
  const imgSrc = await readFileAsDataURL(file);

  // payload saved to storage
  const item = { title, content, img: imgSrc, date, expiresAt, autoArchive };

  // Persist to localStorage so it survives reloads
  const key = (category === "Announcements") ? "bb_announcements" : "bb_news";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.unshift(item);
  localStorage.setItem(key, JSON.stringify(list));

  // Render immediately in the proper column
  const annContainer  = document.querySelector("#announcements .announcement-carousel");
  const newsContainer = document.querySelector(".news-card .news-list");
  if (category === "Announcements" && annContainer) {
    annContainer.prepend(makeAnnouncementCard(item));
  } else if (category === "News" && newsContainer) {
    newsContainer.prepend(makeNewsCard(item));
  }

  // Close popup and clear
  const popup = document.getElementById("announcementPopup");
  const body  = document.getElementById("announcementPopupBody");
  if (popup) popup.style.display = "none";
  if (body) body.innerHTML = "";
});
})();
