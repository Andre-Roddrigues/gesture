const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fingersEl = document.getElementById("fingers");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let lastPoint = null;

// ================= MEDIA PIPE =================
const hands = new Hands({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  if (!results.multiHandLandmarks || !results.multiHandedness) {
    fingersEl.textContent = 0;
    drawing = false;
    lastPoint = null;
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const handedness = results.multiHandedness[0];

  const fingers = countFingers(landmarks, handedness);
  fingersEl.textContent = fingers;

  const x = landmarks[8].x * canvas.width;
  const y = landmarks[8].y * canvas.height;

  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  if (fingers === 1) {
    drawing = true;

    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    lastPoint = { x, y };
  } else {
    drawing = false;
    lastPoint = null;
  }
});

// ================= CONTAGEM CORRETA =================
function countFingers(lm, handedness) {
  let count = 0;
  const isRightHand = handedness.label === "Right";

  // Polegar (X)
  if (isRightHand) {
    if (lm[4].x > lm[3].x) count++;
  } else {
    if (lm[4].x < lm[3].x) count++;
  }

  // Outros dedos (Y)
  const tips = [8, 12, 16, 20];
  const bases = [6, 10, 14, 18];

  for (let i = 0; i < tips.length; i++) {
    if (lm[tips[i]].y < lm[bases[i]].y) count++;
  }

  return count;
}

// ================= CÂMERA (SEM BUG NO MOBILE) =================
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "user" }
}).then(stream => {
  video.srcObject = stream;
  video.play();
});

async function processFrame() {
  if (video.readyState === 4) {
    await hands.send({ image: video });
  }
  requestAnimationFrame(processFrame);
}

processFrame();
// ================= AJUSTE DE TAMANHO =================
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});