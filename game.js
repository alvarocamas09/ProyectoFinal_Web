// Referencias a elementos del DOM
const mainMenu = document.getElementById('main-menu');
const startBtn = document.getElementById('start-btn');
const gameUI = document.getElementById('game-ui');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const scoreSpan = document.getElementById('score');
const timerSpan = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');
const finalScoreSpan = document.getElementById('final-score');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Variables de estado
let gameInterval = null;
let timerInterval = null;
let score = 0;
let seconds = 0;
let gameRunning = false;

// --- Snake Game Variables ---
const gridSize = 20; // Tamaño de cada celda
const tileCountX = canvas.width / gridSize;
const tileCountY = canvas.height / gridSize;

let snake = [];
let direction = { x: 1, y: 0 }; // Derecha
let nextDirection = { x: 1, y: 0 };
let food = { x: 10, y: 10 };

let flashBg = false;
let flashTimeout = null;

// --- Paredes dinámicas ---
let walls = [];
let wallPreview = [];
let wallPreviewActive = false;
let wallTimer = 0;
let wallPreviewStep = 0;
const WALL_PREVIEW_STEPS = 15; // Más pasos para que el parpadeo sea más lento y visible
const WALL_PREVIEW_DURATION = 1000; // Duración total del preview en ms
const WALL_APPEAR_INTERVAL = 10; // segundos

// --- Funciones de UI ---
function showMenu() {
    mainMenu.style.display = 'flex';
    gameUI.style.display = 'none';
    gameOverScreen.style.display = 'none';
    stopGame();
}

function startGame() {
    mainMenu.style.display = 'none';
    gameUI.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    resetGame();
    gameRunning = true;
    gameInterval = setInterval(gameLoop, 1000 / 15); // 15 FPS
    timerInterval = setInterval(updateTimer, 1000);
}

function showGameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    finalScoreSpan.textContent = score;
    gameOverScreen.style.display = 'flex';
    gameUI.style.display = 'none';
}

function stopGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
}

// --- Funciones de juego ---
function resetGame() {
    score = 0;
    seconds = 0;
    scoreSpan.textContent = score;
    timerSpan.textContent = "00:00";
    progressBar.style.width = "0%";
    // Inicializa la serpiente en el centro
    snake = [
        { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    placeFood();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Paredes dinámicas ---
    walls = [];
    wallPreview = [];
    wallPreviewActive = false;
    wallTimer = 0;
    wallPreviewStep = 0;
}

function placeFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * tileCountX);
        food.y = Math.floor(Math.random() * tileCountY);
        valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

// --- Lógica de paredes ---
function updateWalls() {
    // Cada segundo, wallTimer++
    wallTimer++;
    if (wallTimer === WALL_APPEAR_INTERVAL - 2) {
        // 2 segundos antes, genera previsualización
        wallPreview = generateWallPositions();
        wallPreviewActive = true;
        wallPreviewStep = 0;
        // Inicia animación de preview más lenta
        previewWallAnimation();
    }
    if (!wallPreviewActive && wallTimer >= WALL_APPEAR_INTERVAL) {
        // Seguridad: si no hubo preview, genera y aparece
        walls = generateWallPositions();
        wallTimer = 0;
    }
}

function previewWallAnimation() {
    if (!wallPreviewActive) return;
    wallPreviewStep++;
    if (wallPreviewStep >= WALL_PREVIEW_STEPS) {
        // Aparecen las paredes
        walls = wallPreview;
        wallPreview = [];
        wallPreviewActive = false;
        wallPreviewStep = 0;
        wallTimer = 0;
        return;
    }
    setTimeout(previewWallAnimation, WALL_PREVIEW_DURATION / WALL_PREVIEW_STEPS);
}

function generateWallPositions() {
    // Genera una pared de mínimo 2 celdas, nunca en bordes, nunca encierra completamente, nunca sobre la serpiente o comida
    // Solo horizontal o vertical, aleatorio
    let valid = false;
    let wall = [];
    let maxAttempts = 50;
    while (!valid && maxAttempts-- > 0) {
        wall = [];
        const orientation = Math.random() < 0.5 ? 'H' : 'V';
        const length = 2 + Math.floor(Math.random() * 3); // 2 a 4 celdas
        let x, y;
        if (orientation === 'H') {
            y = 1 + Math.floor(Math.random() * (tileCountY - 2));
            x = 1 + Math.floor(Math.random() * (tileCountX - length - 1));
            for (let i = 0; i < length; i++) wall.push({ x: x + i, y });
        } else {
            x = 1 + Math.floor(Math.random() * (tileCountX - 2));
            y = 1 + Math.floor(Math.random() * (tileCountY - length - 1));
            for (let i = 0; i < length; i++) wall.push({ x, y: y + i });
        }
        // No sobreponer con serpiente, comida, ni tocar bordes
        valid = wall.every(cell =>
            cell.x > 0 && cell.x < tileCountX - 1 &&
            cell.y > 0 && cell.y < tileCountY - 1 &&
            !snake.some(seg => seg.x === cell.x && seg.y === cell.y) &&
            !(food.x === cell.x && food.y === cell.y)
        );
        // No encerrar completamente: debe haber al menos un camino horizontal o vertical libre
        if (valid) {
            // Simple check: hay al menos una fila y columna sin pared
            let rowFree = false, colFree = false;
            for (let i = 1; i < tileCountY - 1; i++) {
                if (!wall.some(cell => cell.y === i)) rowFree = true;
            }
            for (let i = 1; i < tileCountX - 1; i++) {
                if (!wall.some(cell => cell.x === i)) colFree = true;
            }
            valid = rowFree && colFree;
        }
    }
    return wall;
}

// --- Bucle del juego ---
function gameLoop() {
    if (!gameRunning) return;

    // --- Paredes dinámicas ---
    updateWalls();

    // Actualiza dirección
    direction = { ...nextDirection };

    // Calcula nueva cabeza
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Colisión con paredes
    if (
        head.x < 0 || head.x >= tileCountX ||
        head.y < 0 || head.y >= tileCountY ||
        walls.some(cell => cell.x === head.x && cell.y === head.y)
    ) {
        showGameOver();
        return;
    }

    // Colisión con sí mismo
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        showGameOver();
        return;
    }

    // Añade nueva cabeza
    snake.unshift(head);

    // Comer comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreSpan.textContent = score;
        placeFood();
        // Efecto de flash blanco
        flashBg = true;
        if (flashTimeout) clearTimeout(flashTimeout);
        flashTimeout = setTimeout(() => {
            flashBg = false;
        }, 80);
        // Aquí puedes agregar efecto de partículas o sonido
    } else {
        // Quita la cola
        snake.pop();
    }

    // Dibuja todo
    drawGame();
}

function drawGame() {
    // Fondo: blanco si flashBg, si no negro
    ctx.fillStyle = flashBg ? "#fff" : "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibuja preview de paredes (parpadeo)
    if (wallPreviewActive && wallPreview.length > 0) {
        let alpha = wallPreviewStep / WALL_PREVIEW_STEPS;
        wallPreview.forEach(cell => {
            ctx.save();
            ctx.globalAlpha = 0.2 + 0.8 * alpha * (wallPreviewStep % 2 ? 1 : 0.5);
            ctx.fillStyle = "#00bcd4";
            ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize);
            ctx.restore();
        });
    }

    // Dibuja paredes reales
    if (walls.length > 0) {
        walls.forEach(cell => {
            ctx.fillStyle = "#607d8b";
            ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize);
        });
    }

    // Dibuja comida
    ctx.fillStyle = "#e53935";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    // Dibuja serpiente (cabeza diferente)
    snake.forEach((segment, idx) => {
        ctx.fillStyle = idx === 0 ? "#ffd600" : "#4caf50";
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function updateTimer() {
    seconds++;
    wallTimer++; // Para sincronizar con el temporizador
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    timerSpan.textContent = `${min}:${sec}`;
    // Actualiza la barra de progreso (ejemplo: llena en 2 minutos)
    let percent = Math.min((seconds / 120) * 100, 100);
    progressBar.style.width = percent + "%";
}

// --- Control de teclado ---
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }
});

// --- Eventos de botones ---
startBtn.addEventListener('click', startGame);
restartBtn && restartBtn.addEventListener('click', startGame);
menuBtn && menuBtn.addEventListener('click', showMenu);

// Mostrar menú al cargar
showMenu();