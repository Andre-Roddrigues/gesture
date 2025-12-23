const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fingerCountEl = document.getElementById('fingerCount');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// MediaPipe Hands
const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.75,
  minTrackingConfidence: 0.75
});

hands.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.multiHandLandmarks) {
    fingerCountEl.textContent = 0;
    return;
  }

  const landmarks = results.multiHandLandmarks[0];

  const fingersUp = countFingers(landmarks);
  fingerCountEl.textContent = fingersUp;

  // Posição do dedo indicador
  const x = (1 - landmarks[8].x) * canvas.width;
  const y = landmarks[8].y * canvas.height;

  ctx.strokeStyle = '#00eaff';
  ctx.lineWidth = 4;

  if (fingersUp === 1) {
    drawLine(x, y);
  }

  if (fingersUp === 2) {
    drawCircle(x, y);
  }

  if (fingersUp === 3) {
    drawSquare(x, y);
  }
});

// Funções de desenho
function drawLine(x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 50, y);
  ctx.lineTo(x + 50, y);
  ctx.stroke();
}

function drawCircle(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 45, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSquare(x, y) {
  ctx.strokeRect(x - 45, y - 45, 90, 90);
}

// Contagem correta de dedos
function countFingers(landmarks) {
  let count = 0;

  const tips = [8, 12, 16, 20];
  const bases = [6, 10, 14, 18];

  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[bases[i]].y) {
      count++;
    }
  }

  // Polegar (comparação horizontal)
  if (landmarks[4].x < landmarks[3].x) {
    count++;
  }

  return count;
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
