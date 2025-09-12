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
    const title = String(fd.get("title") || "").trim();
    const content = String(fd.get("content") || "").trim();
    const date = String(fd.get("date") || "").trim();        // <-- use date
    const category = String(fd.get("category") || "Announcements");
    const file = fd.get("image");

    if (!title || !content || !date) return;

    const imgSrc = await readFileAsDataURL(file);
    const payload = { title, content, img: imgSrc, date };

    // Dashboard containers
    const annContainer  = document.querySelector("#announcements .announcement-carousel");
    const newsContainer = document.querySelector(".news-card .news-list");

    if (category === "Announcements" && annContainer) {
      annContainer.prepend(makeAnnouncementCard(payload));  // newest first
    } else if (category === "News" && newsContainer) {
      newsContainer.prepend(makeNewsCard(payload));
    }

    // Close popup and clear
    const popup = document.getElementById("announcementPopup");
    const body  = document.getElementById("announcementPopupBody");
    if (popup) popup.style.display = "none";
    if (body) body.innerHTML = "";
  });
})();
