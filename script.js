// Points at the model.json/weights.bin/metadata.json committed in
// this repo's /model folder.
const MODEL_URL = "./model/";

const CONFIDENCE_THRESHOLD = 0.75;   // don't announce low-confidence guesses
const STABLE_FRAMES_NEEDED = 5;      // require a few consistent frames before speaking
const REPEAT_COOLDOWN_MS = 2500;     // don't re-announce the same class too often

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const startError = document.getElementById("start-error");
const restartBtn = document.getElementById("restart-btn");
const repeatBtn = document.getElementById("repeat-btn");
const guessEl = document.getElementById("guess");
const confidenceEl = document.getElementById("confidence");
const statusText = document.getElementById("status-text");
const dot = document.getElementById("dot");
const webcam = document.getElementById("webcam");
const srAnnounce = document.getElementById("sr-announce");

const settingsToggle = document.getElementById("settings-toggle");
const settingsBody = document.getElementById("settings-body");
const contrastToggle = document.getElementById("contrast-toggle");
const textSizeButtons = document.querySelectorAll("[data-textsize]");
const rateButtons = document.querySelectorAll("[data-rate]");

let model, running = false, currentStream = null;
let candidateClass = null, candidateStreak = 0;
let lastSpokenClass = null, lastSpokenAt = 0;

// ---- Settings state (in-memory only, session lifetime, no localStorage) ----
const settings = {
  textSize: "normal",       // "normal" | "large" | "xl"
  highContrast: false,
  speechRate: "normal",     // "slow" | "normal" | "fast"
};

const TEXT_SCALE = { normal: 1, large: 1.25, xl: 1.55 };
const SPEECH_RATE = { slow: 0.75, normal: 1, fast: 1.25 };

function applyTextSize() {
  document.documentElement.style.setProperty("--scale", TEXT_SCALE[settings.textSize]);
}

function applyContrast() {
  document.body.classList.toggle("high-contrast", settings.highContrast);
}

settingsToggle.addEventListener("click", () => {
  const expanded = settingsToggle.getAttribute("aria-expanded") === "true";
  settingsToggle.setAttribute("aria-expanded", String(!expanded));
  settingsBody.hidden = expanded;
});

textSizeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    settings.textSize = btn.dataset.textsize;
    textSizeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    applyTextSize();
  });
});

rateButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    settings.speechRate = btn.dataset.rate;
    rateButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  });
});

contrastToggle.addEventListener("change", () => {
  settings.highContrast = contrastToggle.checked;
  applyContrast();
});

// ---- Shared detection / speech logic (reused from big-screen) ----

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = SPEECH_RATE[settings.speechRate]; // read live, not baked in
  window.speechSynthesis.speak(utter);
  srAnnounce.textContent = text;
}

function describeError(err) {
  if (err && err.name === "NotAllowedError") {
    return "Camera access was blocked. Allow camera access in your browser settings, then try again.";
  }
  if (err && err.name === "NotFoundError") {
    return "No camera was found on this device.";
  }
  if (err && err.name === "NotReadableError") {
    return "The camera is being used by another app. Close it, then try again.";
  }
  return "Something went wrong starting the camera. Try again.";
}

function stopCamera() {
  running = false;
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop());
    currentStream = null;
  }
}

async function init() {
  startBtn.disabled = true;
  startBtn.textContent = "Starting…";
  startError.textContent = "";
  statusText.textContent = "Loading model…";

  try {
    if (!model) {
      model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
    }

    // "ideal" (not "exact") so this still works on a laptop with only
    // one camera — it just falls back gracefully there.
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    });
    webcam.srcObject = currentStream;
    await webcam.play();

    try {
      if ("wakeLock" in navigator) await navigator.wakeLock.request("screen");
    } catch (e) { /* not critical if unsupported — screen may just dim on long use */ }

    running = true;
    dot.classList.add("live");
    statusText.textContent = "Listening…";
    repeatBtn.hidden = false;
    restartBtn.hidden = false;
    startScreen.hidden = true;

    requestAnimationFrame(loop);
  } catch (err) {
    dot.classList.remove("live");
    statusText.textContent = "Point your camera at an object";
    startBtn.disabled = false;
    startBtn.textContent = "Start listening";
    startError.textContent = describeError(err);
  }
}

async function loop() {
  if (!running) return;
  const predictions = await model.predict(webcam);
  predictions.sort((a, b) => b.probability - a.probability);
  const top = predictions[0];

  guessEl.textContent = top.probability >= CONFIDENCE_THRESHOLD ? top.className : "…";
  confidenceEl.textContent =
    top.probability >= CONFIDENCE_THRESHOLD
      ? Math.round(top.probability * 100) + "% sure"
      : "Not sure yet — hold it steadier or closer";

  if (top.probability >= CONFIDENCE_THRESHOLD) {
    if (top.className === candidateClass) {
      candidateStreak++;
    } else {
      candidateClass = top.className;
      candidateStreak = 1;
    }

    const now = Date.now();
    const stableEnough = candidateStreak >= STABLE_FRAMES_NEEDED;
    const changedOrCooldownPassed =
      candidateClass !== lastSpokenClass || now - lastSpokenAt > REPEAT_COOLDOWN_MS * 4;

    if (stableEnough && changedOrCooldownPassed) {
      speak(candidateClass);
      lastSpokenClass = candidateClass;
      lastSpokenAt = now;
      candidateStreak = 0;
    }
  } else {
    candidateClass = null;
    candidateStreak = 0;
  }

  requestAnimationFrame(loop);
}

startBtn.addEventListener("click", init);

restartBtn.addEventListener("click", () => {
  stopCamera();
  dot.classList.remove("live");
  guessEl.textContent = "—";
  confidenceEl.textContent = "";
  init();
});

repeatBtn.addEventListener("click", () => {
  if (lastSpokenClass) speak(lastSpokenClass);
  else if (guessEl.textContent !== "—" && guessEl.textContent !== "…") speak(guessEl.textContent);
});

window.addEventListener("DOMContentLoaded", () => {
  applyTextSize();
  applyContrast();
  startBtn.focus();
});
