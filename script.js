/* ============================================================
   LUMENX — script.js
   1. Navbar che cambia allo scroll
   2. Menu mobile (hamburger)
   3. Contatori animati delle statistiche
   4. Animazioni "reveal" allo scroll
   5. Toggle prezzi mensile / annuale
   6. Form email con validazione
   ============================================================ */

// ---------- 1. NAVBAR ALLO SCROLL ----------
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

// ---------- 2. MENU MOBILE ----------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
});

// Chiude il menu quando si clicca un link
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// ---------- 3. CONTATORI ANIMATI ----------
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800; // millisecondi
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Easing: parte veloce e rallenta alla fine
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString("it-IT");
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target); // anima una sola volta
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".stat-number").forEach((el) => {
  statObserver.observe(el);
});

// ---------- 4. REVEAL ALLO SCROLL ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

// ---------- 5. TOGGLE PREZZI MENSILE / ANNUALE ----------
const billingSwitch = document.getElementById("billingSwitch");
const amounts = document.querySelectorAll(".amount");

billingSwitch.addEventListener("click", () => {
  const yearly = billingSwitch.classList.toggle("on");
  billingSwitch.setAttribute("aria-checked", yearly);

  amounts.forEach((el) => {
    el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly;
  });
});

// ---------- 6. SCELTA PIANO (demo checkout) ----------
// Quando l'utente clicca "Scegli...", memorizziamo il piano
// e lo portiamo al form per completare l'iscrizione.
let pianoScelto = "Prova gratuita";

document.querySelectorAll(".price-card").forEach((card) => {
  const nomePiano = card.querySelector("h3").textContent;
  card.querySelector(".btn").addEventListener("click", () => {
    pianoScelto = nomePiano;
    document.getElementById("formMsg").textContent =
      "Hai scelto il piano " + nomePiano + ". Inserisci la tua email per completare.";
  });
});

// ---------- 7. FORM EMAIL + SALVATAGGIO ISCRITTI ----------
const ctaBtn = document.getElementById("ctaBtn");
const emailInput = document.getElementById("emailInput");
const formMsg = document.getElementById("formMsg");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// "Database" demo: gli iscritti vengono salvati nel browser (localStorage).
// In un sito reale questi dati andrebbero su un server.
function salvaIscritto(email, piano) {
  const iscritti = JSON.parse(localStorage.getItem("lumenx_iscritti") || "[]");

  // Evita doppioni sulla stessa email
  const esistente = iscritti.find((i) => i.email === email);
  if (esistente) {
    esistente.piano = piano;
    esistente.data = new Date().toISOString();
  } else {
    iscritti.push({
      email: email,
      piano: piano,
      data: new Date().toISOString(),
      stato: "attivo",
    });
  }
  localStorage.setItem("lumenx_iscritti", JSON.stringify(iscritti));
}

// ---------- CONFIGURAZIONE EMAILJS ----------
const EMAILJS_PUBLIC_KEY = "wl7rUKJp9zbNGexoJ";
const EMAILJS_SERVICE_ID = "service_wvklycs";
const EMAILJS_TEMPLATE_ID = "template_iwvx9h2";

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

ctaBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    formMsg.textContent = "Inserisci un indirizzo email valido.";
    return;
  }

  // Salva l'iscritto (pagamento ancora simulato)
  salvaIscritto(email, pianoScelto);

  // Invia l'email di benvenuto vera tramite EmailJS
  formMsg.textContent = "Invio email di benvenuto in corso...";
  ctaBtn.disabled = true;

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: email,
      piano: pianoScelto,
    })
    .then(() => {
      formMsg.textContent =
        "✓ Iscrizione completata al piano " + pianoScelto + "! Controlla la tua casella email.";
      emailInput.value = "";
    })
    .catch((errore) => {
      console.error("Errore EmailJS:", errore);
      formMsg.textContent =
        "Iscrizione salvata, ma l'email non è partita. Riprova tra poco.";
    })
    .finally(() => {
      ctaBtn.disabled = false;
    });
});

// Invio anche con il tasto Invio
emailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") ctaBtn.click();
});
