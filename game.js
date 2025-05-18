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
const WALL_PREVIEW_STEPS = 15;
const WALL_PREVIEW_DURATION = 1000;
let wallAppearInterval = 10;
const WALL_APPEAR_INTERVAL_MIN = 3;

// --- Cantidad dinámica de paredes ---
let wallsPerWave = 1;
const WALLS_PER_WAVE_MAX = 4;

// --- Velocidad dinámica ---
let gameSpeed = 15; // FPS inicial
const GAME_SPEED_MAX = 25;
const GAME_SPEED_MIN = 8;
const GAME_SPEED_STEP = (GAME_SPEED_MAX - GAME_SPEED_MIN) / 30;
let gameLoopDelay = 1000 / gameSpeed;

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
    gameSpeed = GAME_SPEED_MIN;
    wallAppearInterval = 10;
    gameLoopDelay = 1000 / gameSpeed;
    gameInterval = setTimeout(gameLoop, gameLoopDelay);
    timerInterval = setInterval(updateTimer, 1000);
}

function showGameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    finalScoreSpan.textContent = score;
    gameOverScreen.style.display = 'flex';
    gameUI.style.display = 'none';
    // Reset formulario
    scoreForm.style.display = "flex";
    scoreSavedMsg.style.display = "none";
    playerNameInput.value = "";
    playerNameInput.focus();
    lastScoreSaved = false;
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
    gameSpeed = GAME_SPEED_MIN;
    wallAppearInterval = 10;
    gameLoopDelay = 1000 / gameSpeed;
    wallsPerWave = 1;
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
    wallTimer++;
    if (wallTimer === wallAppearInterval - 2) {
        // Genera varias previews según wallsPerWave
        wallPreview = [];
        let attempts = 0;
        while (wallPreview.length < wallsPerWave && attempts < 20) {
            let candidate = generateWallPositions();
            // Evita superposición con otras previews
            if (candidate.length > 0 && !candidate.some(c => wallPreview.some(w => w.x === c.x && w.y === c.y))) {
                wallPreview = wallPreview.concat(candidate);
            }
            attempts++;
        }
        wallPreviewActive = true;
        wallPreviewStep = 0;
        previewWallAnimation();
    }
    if (!wallPreviewActive && wallTimer >= wallAppearInterval) {
        // Genera varias paredes reales según wallsPerWave
        let newWalls = [];
        let attempts = 0;
        while (newWalls.length < wallsPerWave && attempts < 20) {
            let candidate = generateWallPositions();
            if (candidate.length > 0 && !candidate.some(c => newWalls.some(w => w.x === c.x && w.y === c.y))) {
                newWalls = newWalls.concat(candidate);
            }
            attempts++;
        }
        walls = newWalls;
        wallTimer = 0;
    }
}

function previewWallAnimation() {
    if (!wallPreviewActive) return;
    wallPreviewStep++;
    if (wallPreviewStep >= WALL_PREVIEW_STEPS) {
        walls = wallPreview;
        wallPreview = [];
        wallPreviewActive = false;
        wallPreviewStep = 0;
        wallTimer = 0;
        return;
    }
    setTimeout(previewWallAnimation, WALL_PREVIEW_DURATION / WALL_PREVIEW_STEPS);
}

// Genera paredes de diferentes formas (L, T, I, etc.)
function generateWallPositions() {
    let valid = false;
    let wall = [];
    let maxAttempts = 50;
    while (!valid && maxAttempts-- > 0) {
        wall = [];
        const shapeType = Math.floor(Math.random() * 4); // 0: I, 1: L, 2: T, 3: Z
        let x, y, length;
        switch (shapeType) {
            case 0: // I (horizontal o vertical)
                if (Math.random() < 0.5) {
                    // Horizontal
                    length = 2 + Math.floor(Math.random() * 5); // 2-6
                    y = 1 + Math.floor(Math.random() * (tileCountY - 2));
                    x = 1 + Math.floor(Math.random() * (tileCountX - length - 1));
                    for (let i = 0; i < length; i++) wall.push({ x: x + i, y });
                } else {
                    // Vertical
                    length = 2 + Math.floor(Math.random() * 5);
                    x = 1 + Math.floor(Math.random() * (tileCountX - 2));
                    y = 1 + Math.floor(Math.random() * (tileCountY - length - 1));
                    for (let i = 0; i < length; i++) wall.push({ x, y: y + i });
                }
                break;
            case 1: // L
                length = 2 + Math.floor(Math.random() * 3); // 2-4
                x = 1 + Math.floor(Math.random() * (tileCountX - length - 2));
                y = 1 + Math.floor(Math.random() * (tileCountY - length - 2));
                for (let i = 0; i < length; i++) wall.push({ x: x + i, y });
                for (let i = 1; i < length; i++) wall.push({ x, y: y + i });
                break;
            case 2: // T
                length = 2 + Math.floor(Math.random() * 3); // 2-4
                x = 2 + Math.floor(Math.random() * (tileCountX - length - 3));
                y = 2 + Math.floor(Math.random() * (tileCountY - 3));
                for (let i = 0; i < length; i++) wall.push({ x: x + i, y });
                wall.push({ x: x + Math.floor(length / 2), y: y + 1 });
                wall.push({ x: x + Math.floor(length / 2), y: y + 2 });
                break;
            case 3: // Z
                length = 2 + Math.floor(Math.random() * 3); // 2-4
                x = 1 + Math.floor(Math.random() * (tileCountX - length - 2));
                y = 1 + Math.floor(Math.random() * (tileCountY - length - 2));
                for (let i = 0; i < length; i++) wall.push({ x: x + i, y });
                for (let i = 0; i < length; i++) wall.push({ x: x + 1 + i, y: y + 1 });
                break;
        }
        valid = wall.every(cell =>
            cell.x > 0 && cell.x < tileCountX - 1 &&
            cell.y > 0 && cell.y < tileCountY - 1 &&
            !snake.some(seg => seg.x === cell.x && seg.y === cell.y) &&
            !(food.x === cell.x && food.y === cell.y)
        );
        if (valid) {
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

    updateWalls();

    direction = { ...nextDirection };

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (
        head.x < 0 || head.x >= tileCountX ||
        head.y < 0 || head.y >= tileCountY ||
        walls.some(cell => cell.x === head.x && cell.y === head.y)
    ) {
        showGameOver();
        return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        showGameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreSpan.textContent = score;
        placeFood();
        flashBg = true;
        if (flashTimeout) clearTimeout(flashTimeout);
        flashTimeout = setTimeout(() => {
            flashBg = false;
        }, 80);
    } else {
        snake.pop();
    }

    drawGame();

    // --- Control de velocidad dinámica ---
    let t = Math.min(seconds, 30);
    let newSpeed = GAME_SPEED_MIN + GAME_SPEED_STEP * t;
    newSpeed = Math.max(GAME_SPEED_MIN, Math.min(newSpeed, GAME_SPEED_MAX));
    if (Math.abs(newSpeed - gameSpeed) > 0.01) {
        gameSpeed = newSpeed;
        gameLoopDelay = 1000 / gameSpeed;
    }

    // --- Control de cantidad de paredes dinámica ---
    // En 30 segundos se llega al máximo de paredes por oleada
    let newWallsPerWave = Math.floor(1 + (WALLS_PER_WAVE_MAX - 1) * (t / 30));
    if (newWallsPerWave !== wallsPerWave) {
        wallsPerWave = newWallsPerWave;
    }

    if (gameRunning) {
        gameInterval = setTimeout(gameLoop, gameLoopDelay);
    }
}

function drawGame() {
    ctx.fillStyle = flashBg ? "#fff" : "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibuja preview de paredes (parpadeo, azul claro)
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

    // Dibuja paredes reales (azul opaco)
    if (walls.length > 0) {
        let wallAlpha = 0.7 + 0.3 * Math.min(wallTimer / 2, 1);
        walls.forEach(cell => {
            ctx.save();
            ctx.globalAlpha = wallAlpha;
            ctx.fillStyle = "#2196f3";
            ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize);
            ctx.restore();
        });
    }

    ctx.fillStyle = "#e53935";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

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
startBtn.addEventListener('click', () => {
    playStartSound();
    startGame();
});
restartBtn && restartBtn.addEventListener('click', startGame);
menuBtn && menuBtn.addEventListener('click', showMenu);

// Firebase imports y config
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { playStartSound } from "./sound.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQ6uoBFY6gcx9EUnf3Nil2fNidBevUgIE",
    authDomain: "snake-web-b8c54.firebaseapp.com",
    projectId: "snake-web-b8c54",
    storageBucket: "snake-web-b8c54.firebasestorage.app",
    messagingSenderId: "95897994781",
    appId: "1:95897994781:web:af6232fee9ab4efd60a8f4"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- DOM para ranking y formulario ---
const rankingBtn = document.getElementById('ranking-btn');
const rankingModal = document.getElementById('ranking-modal');
const rankingList = document.getElementById('ranking-list');
const closeRankingBtn = document.getElementById('close-ranking-btn');
const scoreForm = document.getElementById('score-form');
const playerNameInput = document.getElementById('player-name');
const scoreSavedMsg = document.getElementById('score-saved-msg');

let lastScoreSaved = false;

// --- Guardar puntuación en Firestore ---
async function saveScore(name, score, time) {
    try {
        await addDoc(collection(db, "scores"), {
            name: name.trim().substring(0, 16),
            score: score,
            time: time,
            date: new Date().toISOString()
        });
        scoreSavedMsg.style.display = "block";
        lastScoreSaved = true;
    } catch (e) {
        alert("Error al guardar puntuación");
    }
}

// --- Mostrar ranking (Top 20) ---
function showRankingModal() {
    rankingModal.style.display = 'flex';
}
function hideRankingModal() {
    rankingModal.style.display = 'none';
}

// --- Actualización automática del ranking ---
// Cambia el orden del query: primero por score descendente, luego por time ASC, pero Firestore requiere un índice compuesto.
// Si ves el error "The query requires an index", entra al enlace que te da el error en consola y créalo.
// Mientras tanto, puedes mostrar el ranking solo por score descendente (sin time) para que funcione sin índice:

function listenRanking() {
    // Usa solo orderBy("score", "desc") para evitar el error de índice compuesto
    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(20));
    onSnapshot(q, (snapshot) => {
        rankingList.innerHTML = "";
        snapshot.forEach(doc => {
            const d = doc.data();
            const mins = Math.floor(d.time / 60);
            const secs = d.time % 60;
            const tstr = `${mins}:${secs.toString().padStart(2, '0')}`;
            rankingList.innerHTML += `<li><b>${d.name}</b> — ${d.score} pts — ${tstr}</li>`;
        });
    });
}
listenRanking();

// --- Eventos de ranking ---
rankingBtn.addEventListener('click', showRankingModal);
closeRankingBtn.addEventListener('click', hideRankingModal);

// --- Guardar puntuación al enviar el formulario ---
scoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (lastScoreSaved) return;
    const name = playerNameInput.value.trim();
    if (!name) return;
    await saveScore(name, score, seconds);
    scoreForm.style.display = "none";
    scoreSavedMsg.style.display = "block";
});