// view-loader.js — run-now when injected after DOMContentLoaded
console.log("view-loader injected");

(function () {
  const ESC = (s="") => String(s)
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");

  // view-loader.js
  function appendRows(tableId, items, renderRow) {
    const table = document.getElementById(tableId);
    if (!table || !table.tBodies.length) return;
    const tbody = table.tBodies[0];

    // If there are no items, keep whatever is already in the HTML (sample rows)
    if (!items || items.length === 0) {
      table.dataset.rowsLoaded = "1";
      return;
    }

    // Start fresh only when we actually have items to render
    tbody.innerHTML = "";

    items.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = renderRow(r);
      tbody.appendChild(tr);
    });

    table.dataset.rowsLoaded = "1";
  }
  function run() {
    // // Collected view
    // if (document.getElementById("collectedTable")) {
    //   const rows = JSON.parse(localStorage.getItem("collectedUnits") || "[]");
    //   console.log("[view-loader] collectedUnits:", rows.length);
    //   appendRows("collectedTable", rows, (r) => `
    //     <td>${ESC(r.collected_unit_id)}</td>
    //     <td>${ESC(r.collected_blood_unit)}</td>
    //     <td>${ESC(r.blood_type)}</td>
    //     <td>${ESC(r.collection_date)}</td>
    //     <td>${ESC(r.expiration_date)}</td>
    //     <td>${ESC(r.barcode)}</td>
    //     <td>${ESC(r.blood_donor_id)}</td>
    //     <td>${ESC(r.last_update_timestamp)}</td>
    //     <td>${ESC(r.last_updated_by)}</td>
    //     <td>${ESC(r.status)}</td>
    //   `);
    // }

    // // Distributed view
    // if (document.getElementById("distributedTable")) {
    //   const rows = JSON.parse(localStorage.getItem("distributedUnits") || "[]");
    //   console.log("[view-loader] distributedUnits:", rows.length);
    //   appendRows("distributedTable", rows, (r) => `
    //     <td>${ESC(r.distribution_unit_id)}</td>
    //     <td>${ESC(r.distributed_blood_unit)}</td>
    //     <td>${ESC(r.patient_id)}</td>
    //     <td>${ESC(r.patient_ward)}</td>
    //     <td>${ESC(r.blood_donor_id)}</td>
    //     <td>${ESC(r.last_update_timestamp)}</td>
    //     <td>${ESC(r.last_updated_by)}</td>
    //   `);
    // }

    // // Donor view
    // if (document.getElementById("donorTable")) {
    //   const rows = JSON.parse(localStorage.getItem("donorInfo") || "[]");
    //   console.log("[view-loader] donorInfo:", rows.length);
    //   appendRows("donorTable", rows, (r) => `
    //     <td>${ESC(r.donor_id)}</td>
    //     <td>${ESC(r.donor_name)}</td>
    //     <td>${ESC(r.blood_type)}</td>
    //     <td>${ESC(r.collected_blood_unit)}</td>
    //     <td>${ESC(r.birthdate)}</td>
    //     <td>${ESC(r.donation_date)}</td>
    //     <td>${ESC(r.contact_number)}</td>
    //     <td>${ESC(r.address)}</td>
    //     <td>${ESC(r.last_update_timestamp)}</td>
    //     <td>${ESC(r.last_updated_by)}</td>
    //   `);
    // }
   
    // presentation only 
    // Collected view
    if (document.getElementById("collectedTable")) {
      const rows = JSON.parse(sessionStorage.getItem("collectedUnits") || "[]");
      appendRows("collectedTable", rows, (r) => `
        <td>${ESC(r.collected_unit_id)}</td>
        <td>${ESC(r.collected_blood_unit)}</td>
        <td>${ESC(r.blood_type)}</td>
        <td>${ESC(r.collection_date)}</td>
        <td>${ESC(r.expiration_date)}</td>
        <td>${ESC(r.barcode)}</td>
        <td>${ESC(r.blood_donor_id)}</td>
        <td>${ESC(r.last_update_timestamp)}</td>
        <td>${ESC(r.last_updated_by)}</td>
        <td>${ESC(r.status)}</td>
      `);
    }

    // Distributed view
    if (document.getElementById("distributedTable")) {
      const rows = JSON.parse(sessionStorage.getItem("distributedUnits") || "[]");
      appendRows("distributedTable", rows, (r) => `
        <td>${ESC(r.distribution_unit_id)}</td>
        <td>${ESC(r.distributed_blood_unit)}</td>
        <td>${ESC(r.patient_id)}</td>
        <td>${ESC(r.patient_ward)}</td>
        <td>${ESC(r.blood_donor_id)}</td>
        <td>${ESC(r.last_update_timestamp)}</td>
        <td>${ESC(r.last_updated_by)}</td>
      `);
    }

    // Donor view
    if (document.getElementById("donorTable")) {
      const rows = JSON.parse(sessionStorage.getItem("donorInfo") || "[]");
      appendRows("donorTable", rows, (r) => `
        <td>${ESC(r.donor_id)}</td>
        <td>${ESC(r.donor_name)}</td>
        <td>${ESC(r.blood_type)}</td>
        <td>${ESC(r.collected_blood_unit)}</td>
        <td>${ESC(r.birthdate)}</td>
        <td>${ESC(r.donation_date)}</td>
        <td>${ESC(r.contact_number)}</td>
        <td>${ESC(r.address)}</td>
        <td>${ESC(r.last_update_timestamp)}</td>
        <td>${ESC(r.last_updated_by)}</td>
      `);
    }

    // ✅ Reservation view (reservationView.html - #reservationTable)
    if (document.getElementById("reservationTable")) {
      const rows = JSON.parse(sessionStorage.getItem("reservations") || "[]");
      appendRows("reservationTable", rows, (r) => `
        <td>${ESC(r.reservation_id)}</td>
        <td>${ESC(r.patient_id)}</td>
        <td>${ESC(r.reserve_blood_unit)}</td>
        <td>${ESC(r.blood_unit_reservation_quantity)}</td>
        <td>${ESC(r.blood_unit_reservation_status)}</td>
        <td>${ESC(r.last_update_timestamp)}</td>
        <td>${ESC(r.last_updated_by)}</td>
      `);
    }

    // ✅ Transcription view (transcriptionView.html - #transcriptionTable)
    // ✅ Transcription view (transcriptionView.html - #transcriptionTable)
    if (document.getElementById("transcriptionTable")) {
      const rows = JSON.parse(sessionStorage.getItem("transcriptions") || "[]");

      // Helpful debug so you can see what keys were saved
      console.log("[view-loader] transcriptions rows:", rows.length, rows[0] && Object.keys(rows[0]));

      appendRows("transcriptionTable", rows, (r) => `
        <td>${ESC(r.transcription_id ?? r.transcriptionID ?? r.id ?? "")}</td>
        <td>${ESC(r.patient_id ?? r.patientID ?? r.patient ?? "")}</td>
        <td>${ESC(r.blood_donor_id ?? r.donor_id ?? r.bloodDonorId ?? "")}</td>
        <td>${ESC(r.collected_blood_unit ?? r.collected_unit ?? r.collectedBloodUnit ?? "")}</td>
        <td>${ESC(r.collection_date ?? r.collectionDate ?? r.date_collected ?? "")}</td>
        <td>${ESC(r.status ?? r.blood_unit_status ?? r.bloodUnitStatus ?? "")}</td>
        <td>${ESC(r.last_update_timestamp ?? r.lastUpdatedAt ?? r.updated_at ?? "")}</td>
        <td>${ESC(r.last_updated_by ?? r.lastUpdatedBy ?? r.updated_by ?? "")}</td>
      `);
    }


    // ✅ Patient view (patientView.html - #patientTable)
    if (document.getElementById("patientTable")) {
      const rows = JSON.parse(sessionStorage.getItem("patients") || "[]");

      // Helpful debug so you can see what keys were saved
      console.log("[view-loader] patients rows:", rows.length, rows[0] && Object.keys(rows[0]));

      appendRows("patientTable", rows, (r) => `
        <td>${ESC(r.patient_id ?? r.patientID ?? r.id ?? "")}</td>
        <td>${ESC(r.patient_name ?? r.name ?? r.full_name ?? "")}</td>
        <td>${ESC(r.patient_ward ?? r.ward ?? "")}</td>
        <td>${ESC(r.patient_birthdate ?? r.birthdate ?? r.dob ?? "")}</td>
        <td>${ESC(r.patient_contact ?? r.patient_contact_number ?? r.contact ?? r.phone ?? "")}</td>
        <td>${ESC(r.last_update_timestamp ?? r.lastUpdatedAt ?? r.updated_at ?? "")}</td>
        <td>${ESC(r.last_updated_by ?? r.lastUpdatedBy ?? r.updated_by ?? "")}</td>
      `);
    }
  } // ← closes run()

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run(); // ✅ run immediately when injected late
  }
})();
