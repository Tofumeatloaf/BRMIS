// addSubmit.js — dashboard-aware + bind-now
(function () {
  function bind() {
    const form = document.querySelector(".form");
    if (!form) { console.warn("[addSubmit] Form not found"); return; }

    // In case the HTML had an action, neutralize it
    form.setAttribute("action", "");
    form.setAttribute("method", "get");

    if (form.__addSubmitBound) return;
    form.__addSubmitBound = true;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      let key = "", redirect = "";
      if (fd.has("collected_unit_id") && fd.has("barcode")) {
        key = "collectedUnits"; redirect = "collectedUnits.html";
      } else if (fd.has("distribution_unit_id") && fd.has("patient_id")) {
        key = "distributedUnits"; redirect = "distributedUnits.html";
      } else if (fd.has("donor_id") && fd.has("donor_name")) {
        key = "donorInfo"; redirect = "donorInfo.html";
      } else if (fd.has("reservation_id") && fd.has("patient_id")) {
        // ✅ Reservation form (reservation.html)
        key = "reservations"; redirect = "reservationView.html";
      } else if (fd.has("transcription_id") && fd.has("patient_id")) {
        // ✅ Transcription form (transcriptionAdd.html)
        key = "transcriptions"; redirect = "transcriptionView.html";
      } else if (fd.has("patient_id") && fd.has("patient_name")) {
        // ✅ Patient form (patientAdd.html)
        key = "patients"; redirect = "patientView.html";
      } else {
        alert("Unknown form type. Check field names.");
        return;
      }

      // const list = JSON.parse(localStorage.getItem(key) || "[]");
      // list.push(data);
      // localStorage.setItem(key, JSON.stringify(list));
      // sessionStorage.setItem(key, JSON.stringify(list));
      // console.log("[addSubmit] Saved to", key, data);

      // AFTER (vanish on refresh)
      const list = JSON.parse(sessionStorage.getItem(key) || "[]");
      list.push(data);
      sessionStorage.setItem(key, JSON.stringify(list));
      console.log("[addSubmit] Saved to", key, data);

      // presentation only
      form.reset();

      // If we are inside the dashboard, switch the UI to View → Collected
      // (Detect both Inventory and Transcription sections)
      const inDashboard = !!(document.getElementById("inventoryContentArea") || document.getElementById("transcriptionContentArea"));
      if (inDashboard) {
        // Small delay so buttons render, then click the right one
        const clickLater = (id, delay = 250) =>
          setTimeout(() => {
            const el = document.getElementById(id);
            console.log("[addSubmit] trying to click:", id, "found:", !!el);
            el?.click();
          }, delay);

        // 🔧 Utility: repeatedly try to click until the element appears (for dynamic panels)
        const clickWhenReady = (id, attempts = 30, step = 100) => {
          let tries = 0;
          const tick = () => {
            const el = document.getElementById(id);
            console.log("[addSubmit] wait-click:", id, "try:", tries + 1, "found:", !!el);
            if (el) { el.click(); return; }
            if (++tries < attempts) setTimeout(tick, step);
          };
          setTimeout(tick, 0);
        };

        if (key === "collectedUnits") {
          // Inventory: Collected
          document.getElementById("loadView")?.click();
          clickWhenReady("viewCollected");

        } else if (key === "distributedUnits") {
          // Inventory: Distributed
          document.getElementById("loadView")?.click();
          clickWhenReady("viewDistributed");

        } else if (key === "donorInfo") {
          // Inventory: Donor
          document.getElementById("loadView")?.click();
          clickWhenReady("viewDonor");

        } else if (key === "reservations") {
          // ✅ Reservation view inside dashboard
          clickWhenReady("loadReservationView");

          // Fallback hard-redirect if panel didn't open
          setTimeout(() => {
            const paneOpen = document.getElementById("reservationTable");
            if (!paneOpen) window.location.href = redirect;
          }, 3000);

        } else if (key === "transcriptions") {
          // ✅ Transcription view inside dashboard
          // (two-step: open group, then open the actual view)
          clickWhenReady("loadTranscriptionView");
          setTimeout(() => clickWhenReady("viewTranscription"), 250);

          // Fallback: if the view didn't open, hard-redirect after ~3s
          setTimeout(() => {
            const paneOpen = document.getElementById("transcriptionTable"); // provided by view page
            if (!paneOpen) window.location.href = redirect;
          }, 3000);

        } else if (key === "patients") {
          // ✅ Patient view inside dashboard
          // (no loadPatientView button; reuse the Transcription group, then open Patient)
          clickWhenReady("loadTranscriptionView");
          setTimeout(() => clickWhenReady("viewPatient"), 250);

          // Fallback: hard-redirect if the Patient view didn't open
          setTimeout(() => {
            const paneOpen = document.getElementById("patientTable");
            if (!paneOpen) window.location.href = redirect;
          }, 3000);
        }
      } else {
        // Standalone page fallback
        window.location.href = redirect;
      }
    }); // ✅ close submit event listener

    console.log("[addSubmit] Submit handler bound");
  } // ✅ close function bind

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    // Page already loaded -> bind immediately
    bind();
  }
})();
