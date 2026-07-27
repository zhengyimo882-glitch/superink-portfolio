(() => {
  // Reading order: gameplay proof first, then the six-part design narrative.
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
    gameplay,
    intent,
    experience,
    projectSurface,
    recognition,
    legacy
  ].filter(Boolean);

  let previousSection = hero;
  readingOrder.forEach((section) => {
    if (previousSection && previousSection.nextElementSibling !== section) {
      previousSection.after(section);
    }
    previousSection = section;
  });

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
      let depthZ;
      let scale;
      let rotateX;
      let rotateY;
      let rotateZ;
      let opacity;
      let arrival = 1;

      if (distance < 0) {
        arrival = storyClamp(distance + 1, 0, 1);
        yVh = (1 - arrival) * 92;
        depthZ = -180 + arrival * 180;
        scale = .88 + arrival * .12;
        rotateX = (1 - arrival) * 19;
        rotateY = (index % 2 ? -1 : 1) * (1 - arrival) * 9;
        rotateZ = (index % 2 ? 1 : -1) * (1 - arrival) * 1.8;
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
      card.style.transform = `translate3d(0,${yVh.toFixed(2)}vh,${depthZ.toFixed(1)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      card.style.setProperty("--story-flash", String(storyClamp(flash, 0, 1)));
      card.style.setProperty("--story-scan", `${(arrival * 470).toFixed(1)}%`);
      card.style.setProperty("--story-image-scale", String((1.065 - arrival * .03).toFixed(4)));
      card.style.setProperty("--story-pan", `${((index % 2 ? -1 : 1) * (1 - arrival) * 2.8).toFixed(2)}%`);
      card.style.setProperty("--story-copy-y", `${((1 - arrival) * 34).toFixed(1)}px`);
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
