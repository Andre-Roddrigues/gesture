const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// MediaPipe Hands
const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.multiHandLandmarks) return;

  const landmarks = results.multiHandLandmarks[0];

  // Conta dedos levantados
  const fingersUp = countFingers(landmarks);

  const x = landmarks[8].x * canvas.width;
  const y = landmarks[8].y * canvas.height;

  ctx.strokeStyle = 'cyan';
  ctx.lineWidth = 4;

  if (fingersUp === 1) {
    ctx.beginPath();
    ctx.moveTo(x - 40, y);
    ctx.lineTo(x + 40, y);
    ctx.stroke();
  }

  if (fingersUp === 2) {
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (fingersUp === 3) {
    ctx.strokeRect(x - 40, y - 40, 80, 80);
  }
});

// Contar dedos levantados
function countFingers(landmarks) {
  let count = 0;

  const tips = [8, 12, 16, 20];
  const base = [6, 10, 14, 18];

  for (let i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[base[i]].y) {
      count++;
    }
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
