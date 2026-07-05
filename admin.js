/* ============================================================
   LUMENX — admin.js
   Login demo + dashboard che legge gli iscritti salvati
   dal sito (localStorage del browser).

   ⚠️ ATTENZIONE — SOLO DEMO:
   Le credenziali qui sotto sono visibili a chiunque apra
   questo file. In un sito reale il login DEVE avvenire su
   un server (es. Supabase, Firebase, backend Node/PHP).
   ============================================================ */

// ---------- CREDENZIALI DEMO ----------
const ADMIN_EMAIL = "admin@lumenx.it";
const ADMIN_PASSWORD = "LmX!2026-Solar#91";

// ---------- ELEMENTI ----------
const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");
const emailField = document.getElementById("adminEmail");
const passField = document.getElementById("adminPass");

// Prezzi mensili per stimare le entrate
const PREZZI = { Start: 9, Pro: 19, Elite: 39 };

// ---------- LOGIN ----------
function mostraDashboard() {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  caricaIscritti();
}

loginBtn.addEventListener("click", () => {
  const email = emailField.value.trim().toLowerCase();
  const pass = passField.value;

  if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
    // Sessione valida solo finché la scheda resta aperta
    sessionStorage.setItem("lumenx_admin", "ok");
    loginError.textContent = "";
    mostraDashboard();
  } else {
    loginError.textContent = "Email o password errate.";
    passField.value = "";
  }
});

// Login anche con Invio
passField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

// Se la sessione è già attiva, salta il login
if (sessionStorage.getItem("lumenx_admin") === "ok") {
  mostraDashboard();
}

// ---------- LOGOUT ----------
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("lumenx_admin");
  dashboard.hidden = true;
  loginScreen.hidden = false;
  emailField.value = "";
  passField.value = "";
});

// ---------- CARICAMENTO ISCRITTI ----------
function leggiIscritti() {
  return JSON.parse(localStorage.getItem("lumenx_iscritti") || "[]");
}

function caricaIscritti() {
  const iscritti = leggiIscritti();
  const tbody = document.getElementById("tabellaIscritti");
  const emptyMsg = document.getElementById("emptyMsg");

  // Statistiche
  document.getElementById("totIscritti").textContent = iscritti.length;
  document.getElementById("totPro").textContent =
    iscritti.filter((i) => i.piano === "Pro").length;
  document.getElementById("totElite").textContent =
    iscritti.filter((i) => i.piano === "Elite").length;

  const entrate = iscritti.reduce(
    (somma, i) => somma + (PREZZI[i.piano] || 0),
    0
  );
  document.getElementById("entrateMese").textContent = "€" + entrate;

  // Tabella
  tbody.innerHTML = "";
  emptyMsg.hidden = iscritti.length > 0;

  iscritti.forEach((iscritto, indice) => {
    const tr = document.createElement("tr");

    const dataLeggibile = new Date(iscritto.data).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    tr.innerHTML = `
      <td>${iscritto.email}</td>
      <td><span class="badge badge-piano">${iscritto.piano}</span></td>
      <td>${dataLeggibile}</td>
      <td><span class="badge badge-attivo">${iscritto.stato}</span></td>
      <td><button class="del-btn" data-indice="${indice}" title="Elimina iscritto">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Bottoni elimina
  tbody.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const iscritti = leggiIscritti();
      iscritti.splice(parseInt(btn.dataset.indice, 10), 1);
      localStorage.setItem("lumenx_iscritti", JSON.stringify(iscritti));
      caricaIscritti();
    });
  });
}

// ---------- SVUOTA DATI DEMO ----------
document.getElementById("svuotaBtn").addEventListener("click", () => {
  if (confirm("Vuoi davvero cancellare tutti gli iscritti demo?")) {
    localStorage.removeItem("lumenx_iscritti");
    caricaIscritti();
  }
});
