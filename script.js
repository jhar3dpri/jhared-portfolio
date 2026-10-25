const contact = {
  email: "pjharedprince@gmail.com",
  github: "https://github.com/JHARED-TECH",
  others: []
};

const projects = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const escapeHTML = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[c]));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");
$("#year").textContent = new Date().getFullYear();

const burger = $("#burger");
const menu = $("#menu");

function setMenu(open) {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  burger.textContent = open ? "✕" : "☰";
}

burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

const navLinks = $$(".links a");

const sectionWatcher = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

$$("main section").forEach((section) => sectionWatcher.observe(section));

const revealWatcher = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      revealWatcher.unobserve(entry.target);
    });
  },
  { threshold: 0.1 }
);

$$(".reveal").forEach((el) => revealWatcher.observe(el));

$("#toTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

const copyStatus = $("#copyStatus");

async function copyPrompt(button) {
  const text = $("#" + button.dataset.copy).textContent;

  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "Prompt copied.";
  } catch {
    copyStatus.textContent = "Couldn’t copy automatically. Select the text and copy it by hand.";
  }

  setTimeout(() => (copyStatus.textContent = ""), 2500);
}

$$("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyPrompt(button));
});

function projectCard(p) {
  const tags = (p.tech || [])
    .map((t) => '<span class="tag">' + escapeHTML(t) + "</span>")
    .join(" ");

  const demo = p.demo
    ? '<a class="btn small" href="' + escapeHTML(p.demo) + '" target="_blank" rel="noopener">Live Demo</a>'
    : "";

  const code = p.code
    ? '<a class="btn small" href="' + escapeHTML(p.code) + '" target="_blank" rel="noopener">View Code</a>'
    : "";

  return (
    '<article class="card">' +
    "<h3>" + escapeHTML(p.title) + "</h3>" +
    "<p>" + escapeHTML(p.desc) + "</p>" +
    "<p>" + tags + "</p>" +
    '<div class="btns">' + demo + code + "</div>" +
    "</article>"
  );
}



if (projects.length) {
  $("#emptyProjects").hidden = true;
  $("#projectsGrid").innerHTML = projects.map(projectCard).join("");
}

function getContactLinks() {
  const list = [];

  if (contact.email) list.push({ label: "Email", url: "mailto:" + contact.email, primary: true });
  if (contact.github) list.push({ label: "GitHub", url: contact.github });

  (contact.others || []).forEach((o) => {
    if (o.url) list.push({ label: o.label || "Profile", url: o.url });
  });

  return list;
}

function contactButton(link) {
  const isEmail = link.url.startsWith("mailto:");
  const newTab = isEmail ? "" : ' target="_blank" rel="noopener"';
  const style = link.primary ? "btn primary" : "btn";

  return (
    '<a class="' + style + '" href="' + escapeHTML(link.url) + '"' + newTab + ">" +
    escapeHTML(link.label) +
    "</a>"
  );
}


function footerLink(link) {
  return '<li><a href="' + escapeHTML(link.url) + '" target="_blank" rel="noopener">' + escapeHTML(link.label) + "</a></li>";
}

const contactLinks = getContactLinks();

if (contactLinks.length) {
  $("#contactLinks").innerHTML = contactLinks.map(contactButton).join("");
  $("#footSocials").innerHTML = contactLinks
    .filter((link) => !link.url.startsWith("mailto:"))
    .map(footerLink)
    .join("");
} else {
  $("#contactEmpty").hidden = false;
}

const canvas = $("#cloud");
const ctx = canvas.getContext("2d");
const colors = ["#3d7bff", "#8b5cf6", "#a78bfa", "#ffffff", "#60a5fa"];

let width = 0;
let height = 0;
let particles = [];
let running = true;
let lastFrame = 0;

function createParticles() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = rect.width;
  height = rect.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = width < 700 ? 70 : 170;

  particles = Array.from({ length: count }, () => ({
    angle: Math.random() * Math.PI * 2,
    distance: Math.pow(Math.random(), 0.7),
    speed: (Math.random() * 0.25 + 0.1) / 10,
    size: Math.random() * 1.8 + 0.4,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
}

function drawGlow(cx, cy, radius) {
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  glow.addColorStop(0, "rgba(99,102,241,.28)");
  glow.addColorStop(1, "rgba(3,3,6,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function drawParticle(p, cx, cy, rx, ry, time) {
  p.angle += p.speed * 0.02;

  const x = cx + Math.cos(p.angle) * p.distance * rx;
  const y = cy + Math.sin(p.angle) * p.distance * ry + Math.sin(time / 1500 + p.angle * 3) * 6;

  ctx.globalAlpha = 0.25 + (1 - p.distance) * 0.7;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(x, y, p.size, 0, Math.PI * 2);
  ctx.fill();
}

function draw(time) {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const rx = width * 0.5;
  const ry = height * 0.42;

  ctx.clearRect(0, 0, width, height);
  drawGlow(cx, cy, rx * 0.6);

  ctx.globalCompositeOperation = "lighter";
  particles.forEach((p) => drawParticle(p, cx, cy, rx, ry, time));

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function loop(time) {
  if (!running) return;

  if (time - lastFrame > 33) {
    draw(time);
    lastFrame = time;
  }

  requestAnimationFrame(loop);
}

function startLoop() {
  if (running) return;
  running = true;
  requestAnimationFrame(loop);
}

createParticles();
draw(0);

if (!reduceMotion) {
  requestAnimationFrame(loop);

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !document.hidden) startLoop();
    else running = false;
  }).observe($("#home"));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
    else startLoop();
  });
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    createParticles();
    draw(0);
  }, 200);
});
