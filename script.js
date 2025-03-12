const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const menu = document.getElementById('menu');
const timerDisplay = document.getElementById('timer');

const COLORS = ['rgb(0, 0, 255)', 'rgb(139, 69, 19)', 'rgb(0, 128, 0)'];
const HOLE_RADIUS = 50;
const MOUSE_RADIUS = 40;
const TARGET_SCORES = [10, 15, 20, 25, 30];
const LEVEL_CONFIG = [
    { holes: 9, spawnInterval: 1500, hideInterval: 1000 },
    { holes: 9, spawnInterval: 1200, hideInterval: 900 },
    { holes: 9, spawnInterval: 1000, hideInterval: 800 },
    { holes: 9, spawnInterval: 800, hideInterval: 700 },
    { holes: 9, spawnInterval: 600, hideInterval: 600 }
];

let score = 0;
const scoreElement = document.getElementById('scoreValue');
const scoreDisplay = document.getElementById('score');
let level = 1;
let gameRunning = false;
let holes = [];
let mice = [];
let spawnTimer;
let timeLeft = 60;
let timerInterval;

function initHoles() {
    holes = [];
    const gridSize = 3; // Fixed 3x3 grid
    const spacing = canvas.width / (gridSize + 1);
    
    for (let row = 1; row <= gridSize; row++) {
        for (let col = 1; col <= gridSize; col++) {
            const x = col * spacing;
            const y = row * spacing;
            holes.push({ x, y });
        }
    }
}

function spawnMouse() {
    const hole = holes[Math.floor(Math.random() * holes.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const mouse = {
        x: hole.x,
        y: hole.y,
        color,
        spawnedAt: Date.now(),
        scale: 0,
    };
    mice.push(mouse);
}

function drawMouse(mouse) {
    const scale = Math.min(1, (Date.now() - mouse.spawnedAt) / 200);
    const size = MOUSE_RADIUS * scale;

    // Draw mouse body
    ctx.fillStyle = mouse.color;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    if (scale > 0.5) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(mouse.x - 10 * scale, mouse.y - 10 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.arc(mouse.x + 10 * scale, mouse.y - 10 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw holes
    ctx.fillStyle = 'rgb(50, 50, 50)';
    holes.forEach(hole => {
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, HOLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw mice
    const now = Date.now();
    mice = mice.filter(mouse => now - mouse.spawnedAt < LEVEL_CONFIG[level - 1].hideInterval);
    mice.forEach(drawMouse);

    // Draw UI
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}  Level: ${level}  Target: ${TARGET_SCORES[level - 1]}`, 10, 30);

    if (gameRunning) requestAnimationFrame(draw);
}

function startGame() {
    score = 0;
    scoreElement.textContent = score;
    scoreDisplay.classList.remove('hidden');
    startButton.disabled = true;
    startButton.classList.add('hidden');
    restartButton.classList.remove('hidden');
    timerDisplay.classList.remove('hidden');
    score = 0;
    level = 1;
    gameRunning = true;
    mice = [];
    timeLeft = 60;
    initHoles();
    spawnTimer = setInterval(spawnMouse, LEVEL_CONFIG[0].spawnInterval);
    timerInterval = setInterval(updateTimer, 1000);
    draw();
}

function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
        gameOver();
    }
}

function resetGame() {
    clearInterval(spawnTimer);
    clearInterval(timerInterval);
    gameRunning = false;
    mice = [];
    timeLeft = 60;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    startButton.classList.remove('hidden');
    startButton.disabled = false;
    restartButton.classList.add('hidden');
    timerDisplay.classList.add('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameOver() {
    score = 0;
    scoreElement.textContent = score;
    gameRunning = false;
    clearInterval(spawnTimer);
    clearInterval(timerInterval);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
    startButton.classList.remove('hidden');
    startButton.disabled = false;
}

function showWinScreen() {
    gameRunning = false;
    clearInterval(spawnTimer);
    clearInterval(timerInterval);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'gold';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Click Restart to play again', canvas.width / 2, canvas.height / 2 + 50);
    menu.classList.remove('hidden');
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    mice = mice.filter(mouse => {
        const dist = Math.sqrt((clickX - mouse.x) ** 2 + (clickY - mouse.y) ** 2);
        if (dist < MOUSE_RADIUS) {
            score++;
            scoreElement.textContent = score;
            if (score >= TARGET_SCORES[level - 1]) {
                if (level < 5) {
                    level++;
                    clearInterval(spawnTimer);
                    initHoles();
                    spawnTimer = setInterval(spawnMouse, LEVEL_CONFIG[level - 1].spawnInterval);
                } else {
                    showWinScreen();
                }
            }
            return false;
        }
        return true;
    });
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);
