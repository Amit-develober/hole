const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const menu = document.getElementById('menu');
const timerDisplay = document.getElementById('timer');
const timeValue = document.getElementById('timeValue');

const decreaseTimeBtn = document.getElementById('decreaseTime');
const increaseTimeBtn = document.getElementById('increaseTime');
const selectedTimeSpan = document.getElementById('selectedTime');

const COLORS = ['#1E90FF', '#228B22', '#8B4513']; // Updated to vibrant blue, forest green, and saddle brown
let HOLE_RADIUS = 50;
let MOUSE_RADIUS = 40;
const MOBILE_HOLE_RADIUS = 30;
const MOBILE_MOUSE_RADIUS = 25;
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

let mouseSpeed = 2; // fixed speed
let initialGameTime = 60;

function initCanvas() {
    if (window.innerWidth < 768) {
        // For mobile, make canvas square and responsive
        const maxSize = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.6);
        canvas.width = maxSize;
        canvas.height = maxSize;
        HOLE_RADIUS = maxSize / 12; // Adjust hole size relative to canvas
        MOUSE_RADIUS = maxSize / 15; // Adjust mouse size relative to canvas
    } else {
        // For desktop, use fixed size
        canvas.width = 600;
        canvas.height = 600;
        HOLE_RADIUS = 50;
        MOUSE_RADIUS = 40;
    }
}

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

function updateSelectedTime(change) {
    initialGameTime = Math.max(30, Math.min(120, initialGameTime + change));
    selectedTimeSpan.textContent = initialGameTime;
    timeValue.textContent = initialGameTime;
    
    // Update button states
    decreaseTimeBtn.disabled = initialGameTime <= 30;
    increaseTimeBtn.disabled = initialGameTime >= 120;
}

decreaseTimeBtn.addEventListener('click', () => updateSelectedTime(-30));
increaseTimeBtn.addEventListener('click', () => updateSelectedTime(30));

function startGame() {
    initCanvas();
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
    timeLeft = initialGameTime;
    initHoles();
    spawnTimer = setInterval(spawnMouse, LEVEL_CONFIG[0].spawnInterval);
    timerInterval = setInterval(updateTimer, 1000);
    draw();
}

function updateTimer() {
    timeLeft--;
    timeValue.textContent = timeLeft;
    if (timeLeft <= 0) {
        gameOver();
    }
}

function resetGame() {
    clearInterval(spawnTimer);
    clearInterval(timerInterval);
    gameRunning = false;
    mice = [];
    timeLeft = initialGameTime;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    startButton.classList.remove('hidden');
    startButton.disabled = false;
    restartButton.classList.add('hidden');
    timerDisplay.classList.add('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameOver() {
    gameRunning = false;
    clearInterval(spawnTimer);
    clearInterval(timerInterval);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    
    // Adjust font sizes based on screen width
    const isMobile = window.innerWidth < 768;
    const titleSize = isMobile ? '32px' : '48px';
    const textSize = isMobile ? '18px' : '24px';
    const spacing = isMobile ? 30 : 40;
    
    ctx.font = `bold ${titleSize} Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    
    ctx.font = `bold ${textSize} Arial`;
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + spacing);
    ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + spacing * 2);
    
    startButton.classList.remove('hidden');
    startButton.disabled = false;
    restartButton.classList.remove('hidden');
    score = 0;
    scoreElement.textContent = score;
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

function updateScore() {
    scoreElement.textContent = score;
    scoreElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        scoreElement.style.transform = 'scale(1)';
    }, 200);
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
            updateScore();
            if (score >= TARGET_SCORES[level - 1]) {
                if (level < 5) {
                    level++;
                    score = 0; // Reset score when advancing to next level
                    updateScore(); // Update the score display
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

// Add touch event handling with better precision
function handleTouch(e) {
    e.preventDefault();
    if (!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    Array.from(e.changedTouches).forEach(touch => {
        const touchX = (touch.clientX - rect.left) * scaleX;
        const touchY = (touch.clientY - rect.top) * scaleY;

        mice = mice.filter(mouse => {
            const dist = Math.sqrt((touchX - mouse.x) ** 2 + (touchY - mouse.y) ** 2);
            if (dist < MOUSE_RADIUS * 1.5) { // Slightly larger hit area for touch
                score++;
                updateScore();
                checkLevelProgress();
                return false;
            }
            return true;
        });
    });
}

// Replace the existing touch event listener with the new one
canvas.addEventListener('touchstart', handleTouch, { passive: false });
// Add touch move to help with game playability on mobile
canvas.addEventListener('touchmove', handleTouch, { passive: false });

// Prevent unwanted scrolling/zooming on mobile
canvas.addEventListener('touchend', (e) => e.preventDefault());

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);

window.addEventListener('resize', () => {
    if (gameRunning) {
        initCanvas();
        initHoles();
    }
});

// Initialize the game time controls
updateSelectedTime(0); // This will set up initial button states
decreaseTimeBtn.addEventListener('click', () => updateSelectedTime(-30));
increaseTimeBtn.addEventListener('click', () => updateSelectedTime(30));
