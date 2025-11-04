// Game constants
const PIPE_GAP = 350; // Even more increased for better spacing
let PIPE_WIDTH;
const PIPE_SPEED = 2.5;
const GRAVITY = 0.3; // Adjusted for better physics
const LIFT = -6; // Stronger lift
const AIR_RESISTANCE = 0.98; // Slight air resistance

// DOM elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");
const scoreBox = document.getElementById("scoreBox");

// Get canvas dimensions dynamically
let CANVAS_WIDTH = canvas.width;
let CANVAS_HEIGHT = canvas.height;

// Game state
let frames = 0;
let gameOver = false;
let score = 0;
let pipes = [];
let bgOffset = 0;

// Images
const birdImg = new Image();
birdImg.src = 'modi.jpeg';

const pipeImgs = [new Image(), new Image(), new Image()];
pipeImgs[0].src = 'ak.jpeg';
pipeImgs[1].src = 'mb.jpeg';
pipeImgs[2].src = 'raga.jpeg';

const winnerImg = new Image();
winnerImg.src = 'memo.jpeg';

// Bird class
class Bird {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = 0;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.velocity / 10);
    // Resize bird image to fit without cropping
    const aspectRatio = birdImg.width / birdImg.height;
    const drawWidth = this.width;
    const drawHeight = drawWidth / aspectRatio;
    ctx.drawImage(birdImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  update() {
    this.velocity += GRAVITY;
    this.velocity *= AIR_RESISTANCE; // Apply air resistance
    this.y += this.velocity;

    // Ground collision
    if (this.y + this.height / 2 >= CANVAS_HEIGHT) {
      this.y = CANVAS_HEIGHT - this.height / 2;
      gameOver = true;
    }

    // Ceiling collision
    if (this.y - this.height / 2 <= 0) {
      this.y = this.height / 2;
      this.velocity = 0;
    }
  }

  flap() {
    this.velocity = LIFT;
  }
}

// Initialize bird
const bird = new Bird(50, 150, 34, 24);

// Pipe functions
function createPipe() {
  const topHeight = Math.floor(Math.random() * (CANVAS_HEIGHT / 2)) + 50;
  pipes.push({
    x: CANVAS_WIDTH,
    top: topHeight,
    bottom: topHeight + PIPE_GAP,
    imgIndex: Math.floor(Math.random() * pipeImgs.length),
    scored: false
  });
}

function drawPipes() {
  pipes.forEach(pipe => {
    const img = pipeImgs[pipe.imgIndex];

    // Top pipe - stretch to fill from top to gap without cropping
    ctx.drawImage(img, pipe.x, 0, PIPE_WIDTH, pipe.top);

    // Bottom pipe - stretch to fill from gap to bottom without cropping
    const bottomHeight = CANVAS_HEIGHT - pipe.bottom;
    ctx.drawImage(img, pipe.x, pipe.bottom, PIPE_WIDTH, bottomHeight);
  });
}

function updatePipes() {
  pipes.forEach(pipe => pipe.x -= PIPE_SPEED);
  if (frames % 100 === 0) createPipe();
  pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

  pipes.forEach(pipe => {
    // Collision detection
    if (
      bird.x + bird.width / 2 > pipe.x &&
      bird.x - bird.width / 2 < pipe.x + PIPE_WIDTH &&
      (bird.y - bird.height / 2 < pipe.top || bird.y + bird.height / 2 > pipe.bottom)
    ) {
      gameOver = true;
    }

    // Score increment - only once per pipe
    if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
      score++;
      scoreBox.textContent = `Score: ${score}`;
      pipe.scored = true;
    }
  });
}

// Background drawing
function drawBackground() {
  bgOffset -= 0.5;
  if (bgOffset <= -CANVAS_WIDTH) bgOffset = 0;
  ctx.fillStyle = "#4ec0ca";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#3aa";
  for (let i = 0; i < 2; i++) {
    ctx.fillRect(i * CANVAS_WIDTH + bgOffset, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);
  }
}

// Game loop
function loop() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawBackground();

  if (!gameOver) {
    bird.update();
    updatePipes();
    drawPipes();
    bird.draw();
    frames++;
    requestAnimationFrame(loop);
  } else {

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const bannerAspect = winnerImg.width / winnerImg.height;
    const bannerWidth = 300;
    const bannerHeight = bannerWidth / bannerAspect;
    ctx.drawImage(winnerImg, CANVAS_WIDTH / 2 - bannerWidth / 2, CANVAS_HEIGHT / 2 - bannerHeight / 2 - 100, bannerWidth, bannerHeight);
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + bannerHeight / 2 + 20);
    ctx.textAlign = "left";
    restartBtn.style.display = "block";
    restartBtn.style.top = `${CANVAS_HEIGHT / 2 + bannerHeight / 2 + 50}px`; // Position below banner
  }
}
window.addEventListener("keydown", e => {
  if (e.code === "Space" && !gameOver) bird.flap();
});

window.addEventListener("click", () => {
  if (!gameOver) bird.flap();
});

restartBtn.addEventListener("click", () => {
  pipes = [];
  score = 0;
  bird.y = 150;
  bird.velocity = 0;
  frames = 0;
  gameOver = false;
  restartBtn.style.display = "none";
  scoreBox.textContent = `Score: 0`;
  loop();
});
function updateCanvasSize() {
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  PIPE_WIDTH = CANVAS_WIDTH * 0.15;
}
window.addEventListener('resize', updateCanvasSize);
updateCanvasSize();
loop();