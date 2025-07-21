// Space Shooter with Mobile Controls — Yadav Subba

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');

// Mobile buttons
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

// Game state
let gameStarted = false;
const W = canvas.width, H = canvas.height;

function fitCanvas() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.transform = `scale(${s})`;
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

class Player {
  constructor() {
    this.w = 40;
    this.h = 20;
    this.x = W / 2 - this.w / 2;
    this.y = H - 60;
    this.speed = 5;
  }
  draw() {
    const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.w, this.y + this.h);
    grad.addColorStop(0, '#0f0');
    grad.addColorStop(1, '#0ff');
    ctx.fillStyle = grad;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#0a0';
    ctx.fillRect(this.x + 8, this.y - 10, this.w - 16, 10);
  }
  move(dir) {
    this.x += dir * this.speed;
    this.x = Math.max(0, Math.min(W - this.w, this.x));
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 4;
    this.h = 10;
    this.speed = 7;
  }
  update() {
    this.y -= this.speed;
  }
  draw() {
    ctx.fillStyle = '#ff0';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Enemy {
  constructor(x, y, s) {
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 20;
    this.speed = s;
    this.dir = 1;
  }
  update() {
    this.x += this.speed * this.dir;
    if (this.x <= 0 || this.x + this.w >= W) {
      this.dir *= -1;
      this.y += 30;
    }
  }
  draw() {
    ctx.fillStyle = '#f00';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#900';
    ctx.fillRect(this.x + 6, this.y + 4, this.w - 12, this.h - 8);
  }
}

let player = new Player();
let bullets = [], enemies = [], keys = {}, score = 0, level = 1, coins = 0,
    shootCD = 0, paused = false, gameOver = false;

function spawnEnemies() {
  enemies = [];
  const rows = 3 + level, cols = 6;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push(new Enemy(40 + c * 60, 40 + r * 40, 1 + level * 0.2));
    }
  }
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 2000);
}

document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyP') paused = !paused;
});
document.addEventListener('keyup', e => keys[e.code] = false);

startBtn.addEventListener('click', () => {
  gameStarted = true;
  startScreen.style.display = 'none';
  spawnEnemies();
  canvas.focus();
  loop();
});

// Touch controls
leftBtn.addEventListener('touchstart', () => keys['ArrowLeft'] = true);
leftBtn.addEventListener('touchend', () => keys['ArrowLeft'] = false);

rightBtn.addEventListener('touchstart', () => keys['ArrowRight'] = true);
rightBtn.addEventListener('touchend', () => keys['ArrowRight'] = false);

shootBtn.addEventListener('touchstart', () => keys['Space'] = true);
shootBtn.addEventListener('touchend', () => keys['Space'] = false);

function update() {
  if (!gameStarted || gameOver || paused) return;

  if (keys['ArrowLeft'] || keys['KeyA']) player.move(-1);
  if (keys['ArrowRight'] || keys['KeyD']) player.move(1);

  if (keys['Space'] && shootCD <= 0) {
    bullets.push(new Bullet(player.x + player.w / 2 - 2, player.y));
    shootCD = 15;
  }
  shootCD = Math.max(0, shootCD - 1);

  bullets.forEach(b => b.update());
  bullets = bullets.filter(b => b.y + b.h > 0);

  enemies.forEach(e => e.update());

  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x < b.w + e.x && b.x + b.w > e.x && b.y < b.h + e.y && b.y + b.h > e.y) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 100;
      }
    });
  });

  enemies.forEach(e => {
    if (e.y + e.h >= player.y && e.x < player.x + player.w && e.x + e.w > player.x) {
      gameOver = true;
    }
  });

  if (enemies.length === 0) {
    level++;
    coins += 100;
    toast(`Level ${level - 1} complete! +100 coins`);
    spawnEnemies();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  if (!gameStarted) return;

  player.draw();
  bullets.forEach(b => b.draw());
  enemies.forEach(e => e.draw());

  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Level: ${level}`, 10, 40);
  ctx.fillText(`Coins: ${coins}`, 10, 60);

  if (paused) {
    ctx.font = '24px Arial';
    ctx.fillText('PAUSED', W / 2 - 40, H / 2);
  }

  if (gameOver) {
    ctx.font = '24px Arial';
    ctx.fillText('GAME OVER', W / 2 - 60, H / 2);
    ctx.font = '16px Arial';
    ctx.fillText(`Final Score: ${score}`, W / 2 - 60, H / 2 + 30);
  }
}

function loop() {
  update();
  draw();
  if (gameStarted) requestAnimationFrame(loop);
    }
