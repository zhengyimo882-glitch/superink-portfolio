(() => {
  // Reading order: personal profile first, followed by the SuperInk project.
  const main = document.querySelector("main");
  const hero = document.querySelector("#hero");
  const gameplay = document.querySelector("#proof");
  const intent = document.querySelector("#intent");
  const experience = document.querySelector("#experience");
  const coreLoop = document.querySelector("#loop");
  const conceptStory = document.querySelector("#combat-story");
  const projectSurface = document.querySelector(".continuous-project-surface");
  const recognition = document.querySelector("#recognition");
  const legacy = document.querySelector("#about");

  if (projectSurface && coreLoop && conceptStory) {
    projectSurface.prepend(coreLoop);
    coreLoop.after(conceptStory);
  }

  const readingOrder = [
    legacy,
    hero,
    gameplay,
    intent,
    experience,
    projectSurface,
    recognition
  ].filter(Boolean);

  if (main) {
    readingOrder.forEach((section) => main.append(section));
  }

  if (legacy) {
    legacy.classList.add("section-live");
    legacy.querySelectorAll(".scroll-reveal").forEach((element) => {
      element.classList.add("in-view");
    });
  }

  const storyStack = document.querySelector(".story-stack");
  const storyCards = [...document.querySelectorAll("[data-story-card]")];
  const storyCounter = document.querySelector(".story-status strong b");
  const storyDots = [...document.querySelectorAll(".story-status > i")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frameRequested = false;

  const storyClamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function updateStoryStack() {
    frameRequested = false;
    if (!storyStack || !storyCards.length) return;

    const stackBounds = storyStack.getBoundingClientRect();
    const travel = Math.max(storyStack.offsetHeight - innerHeight, 1);
    const storyProgress = storyClamp(-stackBounds.top / travel, 0, 1);
    const storyPosition = storyProgress * (storyCards.length - 1);
    const activeIndex = Math.min(
      storyCards.length - 1,
      Math.floor(storyPosition + .46)
    );

    if (reducedMotion.matches) {
      storyCards.forEach((card, index) => {
        card.removeAttribute("style");
        card.classList.toggle("story-active", index === activeIndex);
      });
      if (storyCounter) {
        storyCounter.textContent = String(activeIndex + 1).padStart(2, "0");
      }
      storyDots.forEach((dot, index) => {
        dot.classList.toggle("active", index <= activeIndex);
      });
      return;
    }

    storyCards.forEach((card, index) => {
      const distance = storyPosition - index;
      let yVh;
      let xVw = 0;
      let depthZ;
      let scale;
      let rotateX;
      let rotateY;
      let rotateZ;
      let opacity;
      let arrival = 1;

      if (distance < 0 || (index === 0 && stackBounds.top > 0)) {
        arrival = index === 0
          ? storyClamp(1 - stackBounds.top / (innerHeight * .9), 0, 1)
          : storyClamp(distance + 1, 0, 1);
        const ease = arrival * arrival * (3 - 2 * arrival);
        const remaining = 1 - ease;
        // Each image travels a distinct route through the same 3D space.
        const routes = [
          { x: 0, y: 12, z: -1500, rx: -12, ry: 0, rz: 0 },
          { x: -48, y: 8, z: -850, rx: -7, ry: 42, rz: -6 },
          { x: 12, y: 65, z: -1150, rx: 55, ry: -15, rz: -12 },
          { x: 50, y: -14, z: -1250, rx: 10, ry: -44, rz: 8 }
        ];
        const route = routes[index % routes.length];
        const compact = innerWidth < 650 ? .6 : 1;
        xVw = route.x * remaining * compact;
        yVh = route.y * remaining * compact;
        depthZ = route.z * remaining;
        scale = .8 + ease * .2;
        rotateX = route.rx * remaining;
        rotateY = route.ry * remaining;
        rotateZ = route.rz * remaining;
        opacity = storyClamp((arrival - .06) / .28, 0, 1);
      } else {
        const depth = Math.min(distance, 3);
        yVh = -2.1 * depth;
        depthZ = -76 * depth;
        scale = 1 - .036 * depth;
        rotateX = -1.2 * depth;
        rotateY = (index % 2 ? 1 : -1) * .5 * depth;
        rotateZ = (index % 2 ? 1 : -1) * .32 * depth;
        opacity = Math.max(.46, 1 - .17 * depth);
      }

      const flash = distance >= -.12 && distance <= .22
        ? 1 - Math.abs(distance - .05) / .17
        : 0;

      card.style.zIndex = index <= activeIndex
        ? String(20 + index)
        : String(10 - index);
      card.style.opacity = String(opacity);
      card.style.transform = `translate3d(${xVw.toFixed(2)}vw,${yVh.toFixed(2)}vh,${depthZ.toFixed(1)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      const opening = storyClamp(arrival * 1.15, 0, 1);
      const closed = (1 - opening) * 100;
      const apertures = [
        `inset(${(closed / 2).toFixed(2)}% 0%)`,
        `inset(0% ${closed.toFixed(2)}% 0% 0%)`,
        `circle(${(opening * 75).toFixed(2)}% at 50% 50%)`,
        `inset(${closed.toFixed(2)}% 0% 0% 0%)`
      ];
      card.style.setProperty('--story-image-clip', opening >= .999 ? 'none' : apertures[index % 4]);
      card.style.setProperty('--story-image-blur', `${((1 - opening) * 5).toFixed(2)}px`);
      card.style.setProperty("--story-flash", String(storyClamp(flash, 0, 1)));
      card.style.setProperty("--story-scan", `${(arrival * 470).toFixed(1)}%`);
      card.style.setProperty("--story-image-scale", String((1.065 - arrival * .03).toFixed(4)));
      card.style.setProperty("--story-pan", `${((index % 2 ? -1 : 1) * (1 - arrival) * 2.8).toFixed(2)}%`);
      card.style.setProperty("--story-copy-y", `${((1 - arrival) * 34).toFixed(1)}px`);
      card.style.setProperty("--story-copy-tilt", `${((1 - arrival) * 20).toFixed(1)}deg`);
      card.style.setProperty("--story-copy-opacity", String(storyClamp((arrival - .18) / .42, 0, 1)));
      card.classList.toggle("story-active", index === activeIndex);
    });

    if (storyCounter) {
      storyCounter.textContent = String(activeIndex + 1).padStart(2, "0");
    }
    storyDots.forEach((dot, index) => {
      dot.classList.toggle("active", index <= activeIndex);
    });
  }

  function queueStoryUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(updateStoryStack);
  }

  function resetForMotionPreference() {
    storyCards.forEach((card) => card.removeAttribute("style"));
    queueStoryUpdate();
  }

  conceptStory?.classList.add("story-ready");
  window.addEventListener("scroll", queueStoryUpdate, { passive: true });
  window.addEventListener("resize", queueStoryUpdate);
  window.addEventListener("load", queueStoryUpdate);
  window.addEventListener("pageshow", queueStoryUpdate);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) queueStoryUpdate();
  });
  storyCards.forEach((card) => {
    const image = card.querySelector("img");
    if (image && !image.complete) image.addEventListener("load", queueStoryUpdate, { once: true });
  });
  if ("ResizeObserver" in window && storyStack) {
    new ResizeObserver(queueStoryUpdate).observe(storyStack);
  }
  if (document.fonts?.ready) document.fonts.ready.then(queueStoryUpdate);
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", resetForMotionPreference);
  } else {
    reducedMotion.addListener(resetForMotionPreference);
  }
  updateStoryStack();
  requestAnimationFrame(queueStoryUpdate);
})();
