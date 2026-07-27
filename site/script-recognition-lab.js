(() => {
  const lab = document.querySelector("#ink-recognition-lab");
  const canvas = document.querySelector("#recognition-canvas");
  if (!lab || !canvas) return;

  const context = canvas.getContext("2d");
  const status = document.querySelector("#lab-status");
  const clearButton = document.querySelector("#lab-clear");
  const analyzeButton = document.querySelector("#lab-analyze");
  const referenceButton = document.querySelector("#lab-reference");
  const result = document.querySelector("#lab-result");
  const gradeOutput = document.querySelector("#lab-grade");
  const scoreOutput = document.querySelector("#lab-score");
  const resultName = document.querySelector("#lab-result-name");
  const resultDescription = document.querySelector("#lab-result-description");
  const pipelineStages = [...document.querySelectorAll("[data-lab-stage]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const SAMPLE_COUNT = 64;
  const MIN_PATH_LENGTH = .055;
  const MIN_BOUNDING_SIZE = .018;
  const strokes = [];
  let activeStroke = null;
  let activePointerId = null;
  let showReference = true;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let renderRequested = false;
  let analysisToken = 0;
  let analyzing = false;

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

  function appendLine(target, start, end, count) {
    for (let index = 0; index < count; index += 1) {
      const progress = index / count;
      target.push({
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress
      });
    }
  }

  function appendQuadratic(target, start, control, end, count) {
    for (let index = 0; index < count; index += 1) {
      const progress = index / count;
      const inverse = 1 - progress;
      target.push({
        x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
        y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y
      });
    }
  }

  function createReferenceStroke() {
    const points = [];
    const map = (x, y) => ({ x: x / 360, y: y / 210 });
    const a = map(48, 66);
    const b = map(264, 66);
    const c = map(310, 88);
    const d = map(257, 115);
    const e = map(214, 115);
    const f = map(198, 170);
    const g = map(137, 170);
    const h = map(153, 114);
    const i = map(48, 114);

    appendLine(points, a, b, 18);
    appendQuadratic(points, b, map(294, 66), c, 8);
    appendQuadratic(points, c, map(292, 111), d, 8);
    appendLine(points, d, e, 5);
    appendLine(points, e, f, 7);
    appendLine(points, f, g, 7);
    appendLine(points, g, h, 7);
    appendLine(points, h, i, 10);
    appendLine(points, i, a, 7);
    points.push(a);
    return points;
  }

  const referenceStroke = createReferenceStroke();

  function sanitizeStrokes(sourceStrokes) {
    return sourceStrokes
      .map((stroke) => {
        const clean = [];
        stroke.forEach((point) => {
          const normalizedPoint = { x: Number(point.x), y: Number(point.y) };
          const previous = clean.at(-1);
          if (
            Number.isFinite(normalizedPoint.x) &&
            Number.isFinite(normalizedPoint.y) &&
            (!previous || distance(previous, normalizedPoint) > .0007)
          ) {
            clean.push(normalizedPoint);
          }
        });
        return clean;
      })
      .filter((stroke) => stroke.length > 1);
  }

  function getBounds(sourceStrokes) {
    const points = sourceStrokes.flat();
    if (!points.length) return null;
    const xValues = points.map((point) => point.x);
    const yValues = points.map((point) => point.y);
    const minimumX = Math.min(...xValues);
    const maximumX = Math.max(...xValues);
    const minimumY = Math.min(...yValues);
    const maximumY = Math.max(...yValues);
    return {
      minimumX,
      minimumY,
      width: maximumX - minimumX,
      height: maximumY - minimumY
    };
  }

  function normalizeStrokes(sourceStrokes) {
    const bounds = getBounds(sourceStrokes);
    if (!bounds) return null;
    const scale = Math.max(bounds.width, bounds.height);
    if (
      scale < MIN_BOUNDING_SIZE ||
      bounds.width < MIN_BOUNDING_SIZE ||
      bounds.height < MIN_BOUNDING_SIZE
    ) {
      return null;
    }

    const offsetX = (1 - bounds.width / scale) / 2;
    const offsetY = (1 - bounds.height / scale) / 2;
    return sourceStrokes.map((stroke) => stroke.map((point) => ({
      x: (point.x - bounds.minimumX) / scale + offsetX,
      y: (point.y - bounds.minimumY) / scale + offsetY
    })));
  }

  function getPathLength(sourceStrokes) {
    return sourceStrokes.reduce((total, stroke) => {
      let strokeLength = 0;
      for (let index = 1; index < stroke.length; index += 1) {
        strokeLength += distance(stroke[index - 1], stroke[index]);
      }
      return total + strokeLength;
    }, 0);
  }

  function resampleStrokes(sourceStrokes, sampleCount) {
    const segments = [];
    let totalLength = 0;

    sourceStrokes.forEach((stroke) => {
      for (let index = 1; index < stroke.length; index += 1) {
        const start = stroke[index - 1];
        const end = stroke[index];
        const segmentLength = distance(start, end);
        if (segmentLength <= .00001) continue;
        segments.push({ start, end, length: segmentLength, offset: totalLength });
        totalLength += segmentLength;
      }
    });

    if (!segments.length || totalLength <= .00001) return [];

    const samples = [];
    let segmentIndex = 0;
    for (let index = 0; index < sampleCount; index += 1) {
      const target = totalLength * (index / (sampleCount - 1));
      while (
        segmentIndex < segments.length - 1 &&
        segments[segmentIndex].offset + segments[segmentIndex].length < target
      ) {
        segmentIndex += 1;
      }
      const segment = segments[segmentIndex];
      const progress = clamp((target - segment.offset) / segment.length, 0, 1);
      samples.push({
        x: segment.start.x + (segment.end.x - segment.start.x) * progress,
        y: segment.start.y + (segment.end.y - segment.start.y) * progress
      });
    }
    return samples;
  }

  const normalizedReferenceStrokes = normalizeStrokes([referenceStroke]);
  const referenceSamples = resampleStrokes(normalizedReferenceStrokes, SAMPLE_COUNT);
  const referenceLength = getPathLength(normalizedReferenceStrokes);

  function averagePointDistance(points, comparison) {
    return points.reduce((total, point, index) => total + distance(point, comparison[index]), 0) / points.length;
  }

  function directionSimilarity(points, comparison) {
    let similarity = 0;
    let comparisons = 0;
    for (let index = 1; index < points.length; index += 1) {
      const firstX = points[index].x - points[index - 1].x;
      const firstY = points[index].y - points[index - 1].y;
      const secondX = comparison[index].x - comparison[index - 1].x;
      const secondY = comparison[index].y - comparison[index - 1].y;
      const firstLength = Math.hypot(firstX, firstY);
      const secondLength = Math.hypot(secondX, secondY);
      if (firstLength <= .00001 || secondLength <= .00001) continue;
      const cosine = (firstX * secondX + firstY * secondY) / (firstLength * secondLength);
      similarity += clamp((cosine + 1) / 2, 0, 1);
      comparisons += 1;
    }
    return comparisons ? similarity / comparisons : 0;
  }

  function scoreDrawing(sourceStrokes) {
    const cleanStrokes = sanitizeStrokes(sourceStrokes);
    const rawLength = getPathLength(cleanStrokes);
    if (!cleanStrokes.length || rawLength < MIN_PATH_LENGTH) {
      return { valid: false, score: 0 };
    }

    const normalized = normalizeStrokes(cleanStrokes);
    if (!normalized) return { valid: false, score: 0 };

    const samples = resampleStrokes(normalized, SAMPLE_COUNT);
    if (samples.length !== SAMPLE_COUNT) return { valid: false, score: 0 };

    const reversedReference = [...referenceSamples].reverse();
    const directDistance = averagePointDistance(samples, referenceSamples);
    const reversedDistance = averagePointDistance(samples, reversedReference);
    const comparison = reversedDistance < directDistance ? reversedReference : referenceSamples;
    const pointDistance = Math.min(directDistance, reversedDistance);
    const pointSimilarity = clamp(1 - pointDistance / .38, 0, 1);
    const directionScore = directionSimilarity(samples, comparison);
    const strokeCountScore = clamp(1 - Math.abs(cleanStrokes.length - 1) * .28, 0, 1);
    const normalizedLength = getPathLength(normalized);
    const pathLengthScore = Math.min(normalizedLength, referenceLength) / Math.max(normalizedLength, referenceLength);

    return {
      valid: true,
      score: Math.round(clamp(
        pointSimilarity * 55 +
        directionScore * 25 +
        strokeCountScore * 10 +
        pathLengthScore * 10,
        0,
        100
      )),
      metrics: {
        pointSimilarity,
        directionScore,
        strokeCountScore,
        pathLengthScore
      }
    };
  }

  function requestRender() {
    if (renderRequested) return;
    renderRequested = true;
    requestAnimationFrame(renderCanvas);
  }

  function drawReference() {
    if (!showReference || !canvasWidth || !canvasHeight) return;
    context.save();
    context.beginPath();
    referenceStroke.forEach((point, index) => {
      const x = point.x * canvasWidth;
      const y = point.y * canvasHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.setLineDash([7, 7]);
    context.lineWidth = Math.max(1.2, Math.min(canvasWidth, canvasHeight) * .0045);
    context.strokeStyle = "rgba(137,231,222,.22)";
    context.shadowColor = "rgba(0,200,184,.18)";
    context.shadowBlur = 7;
    context.stroke();
    context.restore();
  }

  function drawInkStroke(stroke) {
    if (stroke.length < 2) return;
    const baseWidth = clamp(Math.min(canvasWidth, canvasHeight) * .013, 3.2, 7.2);
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "rgba(21,223,204,.9)";
    context.shadowColor = "rgba(38,174,255,.5)";
    context.shadowBlur = 10;

    for (let index = 1; index < stroke.length; index += 1) {
      const previous = stroke[index - 1];
      const point = stroke[index];
      const elapsed = Math.max(4, point.time - previous.time);
      const velocity = distance(previous, point) / elapsed;
      const pressure = Number.isFinite(point.pressure) && point.pressure > 0 ? point.pressure : .55;
      const velocityFactor = 1.12 - Math.min(velocity * 42, .48);
      context.lineWidth = baseWidth * velocityFactor * (.78 + pressure * .34);
      context.beginPath();
      context.moveTo(previous.x * canvasWidth, previous.y * canvasHeight);
      context.lineTo(point.x * canvasWidth, point.y * canvasHeight);
      context.stroke();
    }

    const endpoint = stroke.at(-1);
    const dropletRadius = baseWidth * .52;
    context.beginPath();
    context.fillStyle = "rgba(79,232,218,.94)";
    context.arc(endpoint.x * canvasWidth, endpoint.y * canvasHeight, dropletRadius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function renderCanvas() {
    renderRequested = false;
    if (!canvasWidth || !canvasHeight) return;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    drawReference();
    strokes.forEach(drawInkStroke);
  }

  function sizeRecognitionCanvas() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const pixelRatio = clamp(window.devicePixelRatio || 1, 1, 3);
    canvasWidth = bounds.width;
    canvasHeight = bounds.height;
    canvas.width = Math.round(bounds.width * pixelRatio);
    canvas.height = Math.round(bounds.height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    requestRender();
  }

  function pointFromEvent(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
      y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
      time: event.timeStamp,
      pressure: event.pressure
    };
  }

  function hasValidDrawing() {
    const clean = sanitizeStrokes(strokes);
    return clean.length > 0 && getPathLength(clean) >= MIN_PATH_LENGTH && Boolean(normalizeStrokes(clean));
  }

  function resetPipeline() {
    pipelineStages.forEach((stage) => stage.classList.remove("is-active", "is-complete"));
  }

  function resetResult() {
    result.classList.remove("is-resolved");
    result.dataset.tier = "idle";
    gradeOutput.textContent = "—";
    scoreOutput.textContent = "--";
    resultName.textContent = "NO CREATION";
    resultDescription.textContent = "Draw the reference signal, then analyze the captured geometry.";
  }

  function updateControlState() {
    const valid = hasValidDrawing();
    clearButton.disabled = strokes.length === 0;
    analyzeButton.disabled = !valid || analyzing;
    referenceButton.disabled = analyzing;
  }

  function prepareForNewInput() {
    if (result.dataset.tier !== "idle") resetResult();
    resetPipeline();
    status.textContent = "AWAITING STROKE";
  }

  function onPointerDown(event) {
    if (analyzing || activePointerId !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    prepareForNewInput();
    activePointerId = event.pointerId;
    activeStroke = [pointFromEvent(event)];
    strokes.push(activeStroke);
    canvas.classList.add("is-drawing");
    canvas.setPointerCapture?.(event.pointerId);
    if (event.cancelable) event.preventDefault();
    updateControlState();
    requestRender();
  }

  function onPointerMove(event) {
    if (event.pointerId !== activePointerId || !activeStroke) return;
    const events = typeof event.getCoalescedEvents === "function"
      ? event.getCoalescedEvents()
      : [event];
    events.forEach((pointerEvent) => {
      const point = pointFromEvent(pointerEvent);
      const previous = activeStroke.at(-1);
      if (!previous || distance(previous, point) > .0007) activeStroke.push(point);
    });
    if (event.cancelable) event.preventDefault();
    updateControlState();
    requestRender();
  }

  function finishPointer(event) {
    if (event.pointerId !== activePointerId) return;
    const point = pointFromEvent(event);
    const previous = activeStroke?.at(-1);
    if (activeStroke && (!previous || distance(previous, point) > .0007)) activeStroke.push(point);
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.classList.remove("is-drawing");
    activePointerId = null;
    activeStroke = null;
    updateControlState();
    requestRender();
  }

  function clearLab() {
    analysisToken += 1;
    analyzing = false;
    if (activePointerId !== null && canvas.hasPointerCapture?.(activePointerId)) {
      canvas.releasePointerCapture(activePointerId);
    }
    activePointerId = null;
    activeStroke = null;
    strokes.length = 0;
    canvas.classList.remove("is-drawing");
    lab.classList.remove("is-analyzing");
    status.textContent = "AWAITING STROKE";
    resetPipeline();
    resetResult();
    updateControlState();
    requestRender();
  }

  function getTier(score) {
    if (score >= 90) {
      return {
        id: "a",
        grade: "A",
        name: "REFINED WEAPON",
        description: "Maximum reliability · efficient formation"
      };
    }
    if (score >= 80) {
      return {
        id: "b",
        grade: "B",
        name: "STABLE WEAPON",
        description: "Reliable combat output · standard formation"
      };
    }
    if (score >= 55) {
      return {
        id: "c",
        grade: "C",
        name: "UNSTABLE WEAPON",
        description: "Limited ammo · possible jam · early collapse"
      };
    }
    return {
      id: "d",
      grade: "D",
      name: "FAILED CREATION",
      description: "Ink burst · no usable object formed"
    };
  }

  function wait(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  async function analyzeDrawing() {
    if (analyzing) return;
    const analysis = scoreDrawing(strokes);
    if (!analysis.valid) {
      updateControlState();
      return;
    }

    analyzing = true;
    analysisToken += 1;
    const token = analysisToken;
    const stageDuration = reducedMotion.matches ? 55 : 220;
    lab.classList.add("is-analyzing");
    status.textContent = "ANALYZING GEOMETRY";
    resetPipeline();
    resetResult();
    updateControlState();

    for (let index = 0; index < pipelineStages.length; index += 1) {
      if (token !== analysisToken) return;
      pipelineStages.forEach((stage, stageIndex) => {
        stage.classList.toggle("is-active", stageIndex === index);
        stage.classList.toggle("is-complete", stageIndex < index);
      });
      await wait(stageDuration);
    }

    if (token !== analysisToken) return;
    pipelineStages.forEach((stage) => {
      stage.classList.remove("is-active");
      stage.classList.add("is-complete");
    });

    const tier = getTier(analysis.score);
    result.classList.remove("is-resolved");
    result.dataset.tier = tier.id;
    gradeOutput.textContent = tier.grade;
    scoreOutput.textContent = String(analysis.score);
    resultName.textContent = tier.name;
    resultDescription.textContent = tier.description;
    void result.offsetWidth;
    result.classList.add("is-resolved");
    status.textContent = "CREATION RESOLVED";
    lab.classList.remove("is-analyzing");
    analyzing = false;
    updateControlState();
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", finishPointer);
  canvas.addEventListener("pointercancel", finishPointer);
  clearButton.addEventListener("click", clearLab);
  analyzeButton.addEventListener("click", analyzeDrawing);
  referenceButton.addEventListener("click", () => {
    showReference = !showReference;
    referenceButton.setAttribute("aria-pressed", String(showReference));
    requestRender();
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(sizeRecognitionCanvas).observe(canvas);
  } else {
    window.addEventListener("resize", sizeRecognitionCanvas);
  }

  window.addEventListener("pageshow", sizeRecognitionCanvas);
  sizeRecognitionCanvas();
  updateControlState();
})();
