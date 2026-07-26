const algorithmStages = [
  {
    id: "01",
    name: "Capture",
    title: "Preserve the player’s motion.",
    body: "The drawing canvas records ordered stroke points instead of flattening the input into a screenshot. Stroke boundaries, path order, and motion remain available to the recognizer.",
    detail: "DrawingCanvasInput · DrawingPattern",
  },
  {
    id: "02",
    name: "Normalize",
    title: "Compare shape—not screen position.",
    body: "The drawing is translated and scaled into a common space so a small rifle in the corner can still be compared fairly with the stored reference pattern.",
    detail: "Bounds normalization · Scale invariance",
  },
  {
    id: "03",
    name: "Resample",
    title: "Make fast and slow strokes comparable.",
    body: "Path points are reduced to a consistent sample set. This limits mouse polling noise and prevents drawing speed from dominating the result.",
    detail: "Arc-length sampling · Point reduction",
  },
  {
    id: "04",
    name: "Extract",
    title: "Read how the shape was constructed.",
    body: "The system evaluates direction changes, stroke count, total path length, and template similarity. Multiple signals make the score harder to fool with one matching outline.",
    detail: "Direction sequence · Turns · Length · Stroke count",
  },
  {
    id: "05",
    name: "Tier",
    title: "Turn one score into a playable consequence.",
    body: "The continuous score becomes a stable, unstable, refined, or failed creation. Gun quality changes reliability, ammo, durability, and failure behavior—not raw damage.",
    detail: "GunDrawTier · GunFactory · GeneratedGunAdapter",
  },
];

const tabs = [...document.querySelectorAll(".algorithm-tabs button")];
const panel = document.querySelector("#algorithm-panel");

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    const stage = algorithmStages[index];
    tabs.forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });

    panel.querySelector(".panel-index").innerHTML =
      `ALG.${stage.id}<span>${stage.name}</span>`;
    panel.querySelector(".panel-copy h3").textContent = stage.title;
    panel.querySelector(".panel-copy > p:last-child").textContent = stage.body;
    panel.querySelector(".panel-build span").textContent = stage.detail;
  });
});

const similarityRange = document.querySelector("#similarity-range");
const similarityOutput = document.querySelector('output[for="similarity-range"]');
const qualityResult = document.querySelector(".quality-result");

function updateQuality(value) {
  const quality =
    value >= 90
      ? ["A", "Refined", "Complete build · maximum reliability"]
      : value >= 80
        ? ["B", "Stable", "Standard build · reliable combat output"]
        : value >= 55
          ? ["C", "Unstable", "Partial build · limited ammo or possible jam"]
          : ["D", "Failed", "Ink burst · no useful object generated"];

  similarityOutput.textContent = `${value}%`;
  qualityResult.className = `quality-result grade-${quality[0].toLowerCase()}`;
  qualityResult.querySelector("strong").textContent = quality[0];
  qualityResult.querySelector("p").textContent = quality[1];
  qualityResult.querySelector("span").textContent = quality[2];
}

similarityRange.addEventListener("input", (event) => {
  updateQuality(Number(event.target.value));
});
