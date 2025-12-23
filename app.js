const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fingersEl = document.getElementById("fingers");
const letterEl = document.getElementById("letter");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let path = [];

const hands = new Hands({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.8
});

hands.onResults(results => {
  if (!results.multiHandLandmarks) return;

  const lm = results.multiHandLandmarks[0];
  const fingers = countFingers(lm);
  fingersEl.textContent = fingers;

  const x = (1 - lm[8].x) * canvas.width;
  const y = lm[8].y * canvas.height;

  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  if (fingers === 1) {
    drawing = true;
    path.push({ x, y });

    ctx.beginPath();
    if (path.length > 1) {
      ctx.moveTo(path[path.length - 2].x, path[path.length - 2].y);
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  if (fingers === 0 && drawing) {
    drawing = false;
    recognizeLetter(path);
    path = [];
  }
});

// Contagem correta de dedos
function countFingers(lm) {
  let count = 0;

  if (lm[4].x < lm[3].x) count++; // polegar

  const tips = [8, 12, 16, 20];
  const bases = [6, 10, 14, 18];

  for (let i = 0; i < tips.length; i++) {
    if (lm[tips[i]].y < lm[bases[i]].y) count++;
  }

  return count;
}

// Reconhecimento simples de letras (heurístico)
function recognizeLetter(points) {
  if (points.length < 10) return;

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const width = maxX - minX;
  const height = maxY - minY;

  let letter = "?";

  if (height > width * 1.5) letter = "I";
  else if (width > height * 1.5) letter = "-";
  else letter = "O";

  letterEl.textContent = letter;
}

// Camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});

camera.start();
