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
		case 0: // top
			this.x = randomRange(0, width);
			this.y = -randomRange(20, 100);
			this.vx = randomRange(-0.2, 0.2);
			this.vy = randomRange(0.2, 0.6);
			break;
		case 1: // right
			this.x = width + randomRange(20, 100);
			this.y = randomRange(0, height);
			this.vx = -randomRange(0.2, 0.6);
			this.vy = randomRange(-0.2, 0.2);
			break;
		case 2: // bottom
			this.x = randomRange(0, width);
			this.y = height + randomRange(20, 100);
			this.vx = randomRange(-0.2, 0.2);
			this.vy = -randomRange(0.2, 0.6);
			break;
		case 3: // left
			this.x = -randomRange(20, 100);
			this.y = randomRange(0, height);
			this.vx = randomRange(0.2, 0.6);
			this.vy = randomRange(-0.2, 0.2);
			break;
	}
	this.size = randomRange(10, 15); // smaller cells
	this.angle = randomRange(0, Math.PI * 2);
	this.angularVelocity = randomRange(-0.01, 0.01); // slower rotation
}



	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.angle += this.angularVelocity;

		// Reset if out of bounds
		if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
			this.reset();
		}
	}

	draw(ctx) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);

		// Draw blood cell shape - ellipse with gradient fill for realism
		const gradient = ctx.createRadialGradient(0, 0, this.size * 0.1, 0, 0, this.size);
		gradient.addColorStop(0, 'rgba(128, 0, 128, 0.9)');
		gradient.addColorStop(0.5, 'rgba(0, 0, 255, 0.9)');
		gradient.addColorStop(1, 'rgba(255, 182, 193, 0.9)');

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.ellipse(0, 0, this.size * 1.2, this.size * 0.7, 0, 0, Math.PI * 2);
		ctx.fill();

		// Add some highlight
		ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.ellipse(0, 0, this.size * 0.8, this.size * 0.5, 0, 0, Math.PI * 2);
		ctx.stroke();

		ctx.restore();
	}
}

function init() {
	resize();
	bloodCells = [];
	for (let i = 0; i < bloodCellCount; i++) {
		bloodCells.push(new BloodCell());
	}
	animate();
}

function resize() {
	width = container.clientWidth;
	height = container.clientHeight;
	canvas.width = width;
	canvas.height = height;
}

function animate() {
	ctx.clearRect(0, 0, width, height);
	for (const cell of bloodCells) {
		cell.update();
		cell.draw(ctx);
	}
	requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
	resize();
});

init();
