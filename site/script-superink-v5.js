const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const cursor = document.querySelector(".cursor");
const scrollProgress = document.querySelector(".scroll-progress span");
const hero = document.querySelector(".hero");
const canvas = document.querySelector("#brush-canvas");
const ctx = canvas.getContext("2d");
const reserveFill = document.querySelector("#reserve-fill");
const inkPercent = document.querySelector("#ink-percent");
const titleFill = document.querySelector("#title-fill");
const creationOutput = document.querySelector("#creation-output");
const creationStep = document.querySelector("#creation-step");
const creationDot = document.querySelector("#creation-dot");
const resetButton = document.querySelector("#reset-ink");

let lastPoint = null;
let lastTime = 0;
let movement = 0;
let reveal = 0;
let active = true;
let dpr = 1;
let completionEffectDone = false;

function sizeCanvas() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function localPoint(event) {
  const rect = hero.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function paintBrush(from, to, speed) {
  const width = clamp(21 - speed * .42, 3.5, 19);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const nx = Math.cos(angle + Math.PI / 2);
  const ny = Math.sin(angle + Math.PI / 2);

  const drawCurve = (offsetX = 0, offsetY = 0) => {
    ctx.beginPath();
    ctx.moveTo(from.x + offsetX, from.y + offsetY);
    ctx.quadraticCurveTo(
      from.x + (to.x - from.x) * .45 + offsetX,
      from.y + (to.y - from.y) * .45 + offsetY,
      to.x + offsetX,
      to.y + offsetY
    );
  };

  ctx.save();
  ctx.globalCompositeOperation = "multiply";

  // Soft dark edge gives the wet stroke depth against the paper.
  drawCurve(1.2, 1.7);
  ctx.strokeStyle = "rgba(4, 73, 69, .22)";
  ctx.lineWidth = width + 3;
  ctx.stroke();

  // Dense turquoise body with a directional ink gradient.
  const inkGradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  inkGradient.addColorStop(0, "rgba(5, 116, 109, .88)");
  inkGradient.addColorStop(.42, "rgba(8, 157, 147, .92)");
  inkGradient.addColorStop(1, "rgba(4, 126, 119, .90)");
  drawCurve();
  ctx.strokeStyle = inkGradient;
  ctx.lineWidth = width;
  ctx.stroke();

  // A narrow translucent ridge reads as light catching wet ink.
  ctx.globalCompositeOperation = "screen";
  drawCurve(-nx * width * .18, -ny * width * .18);
  ctx.strokeStyle = "rgba(130, 226, 213, .25)";
  ctx.lineWidth = Math.max(.8, width * .14);
  ctx.stroke();

  ctx.globalCompositeOperation = "multiply";

  // Fine broken bristles create dry-brush texture at the edges.
  const bristles = 11;
  for (let i = 0; i < bristles; i += 1) {
    if (Math.random() < .12) continue;
    const normalized = i / (bristles - 1) - .5;
    const offset = normalized * width;
    const startJitter = Math.random() * .12;
    const endJitter = .78 + Math.random() * .22;
    const sx = from.x + (to.x - from.x) * startJitter + nx * offset;
    const sy = from.y + (to.y - from.y) * startJitter + ny * offset;
    const ex = from.x + (to.x - from.x) * endJitter + nx * offset * .74;
    const ey = from.y + (to.y - from.y) * endJitter + ny * offset * .74;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(3, 83, 78, ${.07 + Math.random() * .18})`;
    ctx.lineWidth = Math.random() * .9 + .2;
    ctx.stroke();
  }

  // Slow movement leaves a small pool, like a brush pressing into paper.
  if (speed < 7) {
    const pool = ctx.createRadialGradient(to.x - width * .15, to.y - width * .18, 0, to.x, to.y, width * .55);
    pool.addColorStop(0, "rgba(30, 180, 167, .34)");
    pool.addColorStop(.52, "rgba(5, 129, 121, .22)");
    pool.addColorStop(1, "rgba(3, 75, 71, 0)");
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.arc(to.x, to.y, width * .55, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Fine splatter sits above the stroke rather than merging into its body.
  if (speed > 10 && Math.random() > .34) {
    const drops = Math.min(5, Math.ceil(speed / 11));
    for (let i = 0; i < drops; i += 1) {
      const radius = Math.random() * 1.6 + .25;
      ctx.beginPath();
      ctx.arc(
        to.x + (Math.random() - .5) * width * 2.7,
        to.y + (Math.random() - .5) * width * 2.7,
        radius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(5, 119, 112, ${.18 + Math.random() * .44})`;
      ctx.fill();
    }
  }
}

function playCompletionEffect() {
  hero.classList.remove("weapon-locked");
  void hero.offsetWidth;
  hero.classList.add("weapon-locked");
}

function updateCreation() {
  const rawReveal = clamp(movement / Math.max(innerWidth * 2.2, 2100) * 100, 0, 100);
  reveal = rawReveal >= 96 ? 100 : rawReveal;
  const remaining = Math.round(100 - reveal);
  reserveFill.style.width = `${remaining}%`;
  inkPercent.textContent = `${String(remaining).padStart(2, "0")}%`;
  titleFill.style.setProperty("--reveal", `${reveal}%`);
  titleFill.classList.toggle("forming", reveal > 0 && reveal < 100);
  titleFill.classList.toggle("complete", reveal === 100);
  creationOutput.textContent = String(Math.round(reveal)).padStart(3, "0");

  if (reveal >= 100) {
    creationStep.textContent = "03 / CREATION COMPLETE";
    creationDot.style.background = "var(--yellow)";
    if (!completionEffectDone) {
      completionEffectDone = true;
      playCompletionEffect();
    }
  } else if (reveal >= 55) {
    creationStep.textContent = "02 / FORMING SUPERINK";
    creationDot.style.background = "var(--orange)";
  } else {
    creationStep.textContent = "01 / MOVE YOUR MOUSE";
    creationDot.style.background = "var(--turquoise)";
  }
}

function handlePointerMove(event) {
  cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  if (!active) return;

  const rect = hero.getBoundingClientRect();
  if (event.clientY < rect.top || event.clientY > rect.bottom) return;
  const point = localPoint(event);
  const now = performance.now();

  if (!lastPoint || now - lastTime > 140) {
    lastPoint = point;
    lastTime = now;
    return;
  }

  const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
  if (distance < 2) return;
  const elapsed = Math.max(8, now - lastTime);
  const speed = distance / elapsed * 16;
  paintBrush(lastPoint, point, speed);
  movement += distance;
  lastPoint = point;
  lastTime = now;
  updateCreation();
}

window.addEventListener("pointermove", handlePointerMove);
window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  scrollProgress.style.width = `${scrollable ? scrollY / scrollable * 100 : 0}%`;
}, { passive: true });

document.querySelectorAll("a, button, input, iframe").forEach((element) => {
  element.addEventListener("pointerenter", () => cursor.classList.add("hover"));
  element.addEventListener("pointerleave", () => cursor.classList.remove("hover"));
});

resetButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  lastPoint = null;
  movement = 0;
  reveal = 0;
  completionEffectDone = false;
  hero.classList.remove("weapon-locked");
  updateCreation();
});

const observer = new IntersectionObserver(([entry]) => {
  active = entry.isIntersecting;
  if (!active) lastPoint = null;
}, { threshold: .08 });
observer.observe(hero);

// Recognition quality demonstration.
const qualityRange = document.querySelector("#quality-range");
const qualityOutput = document.querySelector('output[for="quality-range"]');
const qualityResult = document.querySelector(".quality-result");

function updateQuality(value) {
  const result = value >= 90
    ? ["A", "REFINED WEAPON", "Maximum reliability · efficient formation", "var(--yellow)"]
    : value >= 80
      ? ["B", "STABLE WEAPON", "Standard ammunition · reliable output", "#55cfc0"]
      : value >= 55
        ? ["C", "UNSTABLE WEAPON", "Limited ammunition · possible jam", "var(--orange)"]
        : ["D", "INK COLLAPSE", "No useful object · partial ink return", "#9da49b"];

  qualityOutput.textContent = `${value}%`;
  qualityResult.querySelector("strong").textContent = result[0];
  qualityResult.querySelector("span").textContent = result[1];
  qualityResult.querySelector("p").textContent = result[2];
  qualityResult.style.borderColor = result[3];
  qualityResult.querySelector("strong").style.background = result[3];
}

qualityRange.addEventListener("input", (event) => updateQuality(Number(event.target.value)));

// YouTube rejects embeds opened directly from file:// because there is no HTTP
// referrer. Keep local previews error-free, while preserving inline playback
// when the site is served by GitHub Pages or any web server.
const videoPlayer = document.querySelector("#video-player");
const videoPlay = document.querySelector("#video-play");
const videoPlayNote = document.querySelector("#video-play-note");
const youtubeWatchUrl = "https://youtu.be/B_fIuysQRdc?si=4al3YbaCWoCVnl79";
const youtubeEmbedUrl = "https://www.youtube.com/embed/B_fIuysQRdc?autoplay=1&rel=0";

if (location.protocol === "file:") {
  videoPlayNote.textContent = "Opens YouTube in local preview";
}

videoPlay.addEventListener("click", () => {
  if (location.protocol === "file:") {
    window.open(youtubeWatchUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = youtubeEmbedUrl;
  iframe.title = "SuperInk gameplay demo";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;
  videoPlayer.replaceChildren(iframe);
});

// Fast handwritten text and perspective UI entrances replace slow fades.
const structuralRevealTargets = document.querySelectorAll(
  ".intent-heading, .intent-body > *, .experience-heading, .principle-grid article, " +
  ".video-column, .proof-copy, .loop-section > div, .loop-section li, .loop-section > p, " +
  ".legacy-content > .section-label, .legacy-content h2, .legacy-meta, .resume-highlights article"
);

const inkTextTargets = document.querySelectorAll(
  ".intent-heading h2, .intent-body blockquote span, .experience-heading h2, " +
  ".principle-grid h3, .proof-copy h2, .loop-section h2, .loop-section > p, " +
  ".legacy-content h2, .resume-highlights h3"
);

function prepareInkWriting(element) {
  if (element.dataset.inkPrepared) return;
  element.dataset.inkPrepared = "true";
  element.classList.add("ink-write");
  let wordOrder = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((textNode) => {
    if (!textNode.nodeValue.trim()) return;
    const fragment = document.createDocumentFragment();
    textNode.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement("span");
      word.className = "ink-word";
      word.style.setProperty("--word-order", wordOrder);
      word.textContent = part;
      fragment.appendChild(word);
      wordOrder += 1;
    });
    textNode.replaceWith(fragment);
  });
}

inkTextTargets.forEach(prepareInkWriting);

const revealTargets = [...new Set([...structuralRevealTargets, ...inkTextTargets])];
revealTargets.forEach((element) => element.classList.add("scroll-reveal"));

document.querySelectorAll(".principle-grid article, .loop-section li, .resume-highlights article")
  .forEach((element) => element.classList.add("fx-card"));
document.querySelectorAll(".video-column, .legacy-meta")
  .forEach((element) => element.classList.add("fx-image"));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .14, rootMargin: "0px 0px -8% 0px" });

revealTargets.forEach((element) => revealObserver.observe(element));

window.addEventListener("resize", sizeCanvas);
sizeCanvas();
updateCreation();
updateQuality(Number(qualityRange.value));
