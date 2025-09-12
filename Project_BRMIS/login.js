// Panel Switching
const adminButton = document.getElementById('admin');
const headtechButton = document.getElementById('headtech');
const container = document.getElementById('container');

adminButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
  clearInputs();
});

headtechButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
  clearInputs();
});

function clearInputs() {
  setTimeout(() => {
    const inputs = ['admin-user', 'admin-pass', 'login-user', 'login-pass'];
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.value = '';
        if (input.type === 'password') input.type = 'password';
      }
    });

    const eyeIcon = document.getElementById('eye-icon'); 
    const eyeIcon1 = document.getElementById('eye-icon1');
    if (eyeIcon) {
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    }
    if (eyeIcon1) {
      eyeIcon1.classList.remove('fa-eye');
      eyeIcon1.classList.add('fa-eye-slash');
    }
  }, 600);
}

// Toggle Password Visibility
function togglePassword() {
  const passwordInputs = [
    { input: document.getElementById('login-pass'), icon: document.getElementById('eye-icon') },
    { input: document.getElementById('admin-pass'), icon: document.getElementById('eye-icon1') }
  ];

  passwordInputs.forEach(({ input, icon }) => {
    if (input && icon) {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      icon.classList.toggle('fa-eye', !isHidden);
      icon.classList.toggle('fa-eye-slash', isHidden);
    }
  });
}

// Blood Cell Animation
const canvas = document.getElementById('bloodCellsCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let bloodCells = [];
const bloodCellCount = 50;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class BloodCell {
  constructor() {
    this.reset();
  }

  reset() {
    const edge = Math.floor(randomRange(0, 4));
    switch (edge) {
      case 0:
        this.x = randomRange(0, width);
        this.y = -randomRange(20, 100);
        this.vx = randomRange(-0.5, 0.5);
        this.vy = randomRange(0.5, 1.5);
        break;
      case 1:
        this.x = width + randomRange(20, 100);
        this.y = randomRange(0, height);
        this.vx = -randomRange(0.5, 1.5);
        this.vy = randomRange(-0.5, 0.5);
        break;
      case 2:
        this.x = randomRange(0, width);
        this.y = height + randomRange(20, 100);
        this.vx = randomRange(-0.5, 0.5);
        this.vy = -randomRange(0.5, 1.5);
        break;
      case 3:
        this.x = -randomRange(20, 100);
        this.y = randomRange(0, height);
        this.vx = randomRange(0.5, 1.5);
        this.vy = randomRange(-0.5, 0.5);
        break;
    }
    this.size = randomRange(10, 30);
    this.angle = randomRange(0, Math.PI * 2);
    this.angularVelocity = randomRange(-0.02, 0.02);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.angularVelocity;

    if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const gradient = ctx.createRadialGradient(0, 0, this.size * 0.1, 0, 0, this.size);
    gradient.addColorStop(0, 'rgba(128, 0, 128, 0.9)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 182, 193, 0.9)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 1.2, this.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.8, this.size * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

function resizeCanvas() {
  width = container.clientWidth;
  height = container.clientHeight;
  canvas.width = width;
  canvas.height = height;
}

function animateBloodCells() {
  ctx.clearRect(0, 0, width, height);
  for (const cell of bloodCells) {
    cell.update();
    cell.draw(ctx);
  }
  requestAnimationFrame(animateBloodCells);
}

function initBloodCells() {
  resizeCanvas();
  bloodCells = [];
  for (let i = 0; i < bloodCellCount; i++) {
    bloodCells.push(new BloodCell());
  } 
  animateBloodCells();
}

window.addEventListener('resize', resizeCanvas);
initBloodCells();