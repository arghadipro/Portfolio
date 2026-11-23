// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------- Theme toggle (remembers choice) ----------
const themeToggle = $("#themeToggle");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- Mobile menu ----------
const menuBtn = $("#menuBtn");
const navLinks = $("#navLinks");
menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
$$("#navLinks a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

// ---------- Navbar shadow, back-to-top, active link ----------
const navbar = $("#navbar");
const toTop = $("#toTop");
const sections = $$("main section[id]");
const links = $$("#navLinks a");

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle("scrolled", y > 10);
  toTop.classList.toggle("show", y > 500);

  let current = "";
  sections.forEach(sec => {
    if (y >= sec.offsetTop - 120) current = sec.id;
  });
  links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- Typing effect ----------
const roles = ["Web Developer", "UI Designer", "Problem Solver", "Lifelong Learner"];
const typedEl = $("#typed");
let roleIdx = 0, charIdx = 0, deleting = false;

function type() {
  const word = roles[roleIdx];
  typedEl.textContent = word.slice(0, charIdx);

  if (!deleting && charIdx < word.length) {
    charIdx++;
    setTimeout(type, 90);
  } else if (!deleting) {
    deleting = true;
    setTimeout(type, 1400);
  } else if (charIdx > 0) {
    charIdx--;
    setTimeout(type, 45);
  } else {
    deleting = false;
    roleIdx = (roleIdx + 1) % roles.length;
    setTimeout(type, 300);
  }
}
type();

// ---------- Scroll reveal + skill bars + counters ----------
function animateCount(el) {
  const target = +el.dataset.count;
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * p);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target + "+";
  }
  requestAnimationFrame(tick);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("visible");

    $$(".fill", el).forEach(f => (f.style.width = f.dataset.level + "%"));
    $$("[data-count]", el).forEach(animateCount);

    observer.unobserve(el);
  });
}, { threshold: 0.15 });

$$(".reveal").forEach(el => observer.observe(el));

// ---------- Project filters ----------
const filterBtns = $$(".filter");
const cards = $$(".card");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    cards.forEach(card => {
      card.classList.toggle("hide", f !== "all" && card.dataset.category !== f);
    });
  });
});

// ---------- Contact form validation ----------
const form = $("#contactForm");
const statusEl = $("#formStatus");

function setError(input, msg) {
  const field = input.closest(".field");
  field.classList.toggle("invalid", !!msg);
  $(".error", field).textContent = msg;
}

function validate() {
  let ok = true;
  const name = form.name, email = form.email, message = form.message;

  if (name.value.trim().length < 2) { setError(name, "Please enter your name."); ok = false; }
  else setError(name, "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, "Please enter a valid email."); ok = false; }
  else setError(email, "");

  if (message.value.trim().length < 10) { setError(message, "Message should be at least 10 characters."); ok = false; }
  else setError(message, "");

  return ok;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  if (!validate()) return;

  // Opens the visitor's email app with the message filled in.
  // Replace with your email, or swap for a service like Formspree.
  const to = "you@example.com";
  const subject = encodeURIComponent("Portfolio message from " + form.name.value.trim());
  const body = encodeURIComponent(
    form.message.value.trim() + "\n\n— " + form.name.value.trim() + " (" + form.email.value.trim() + ")"
  );
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  statusEl.textContent = "Thanks! Your email app should open to send the message.";
  form.reset();
});

// ---------- Footer year ----------
$("#year").textContent = new Date().getFullYear();
