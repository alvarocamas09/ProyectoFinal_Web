import { setScore, setTimer, setProgressBar, drawGame, setFinalScore } from './ui.js';
import { playEatSound } from './sound.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCountX = canvas.width / gridSize;
const tileCountY = canvas.height / gridSize;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 10, y: 10 };
let walls = [];
let wallPreview = [];
let wallPreviewActive = false;
let wallTimer = 0;
let wallPreviewStep = 0;
const WALL_PREVIEW_STEPS = 15;
const WALL_PREVIEW_DURATION = 1000;
let wallAppearInterval = 10;
const WALL_APPEAR_INTERVAL_MIN = 3;
let wallsPerWave = 1;
const WALLS_PER_WAVE_MAX = 4;

let score = 0;
let seconds = 0;
let gameRunning = false;
let gameInterval = null;
let timerInterval = null;
let gameSpeed = 15;
const GAME_SPEED_MAX = 25;
const GAME_SPEED_MIN = 8;
const GAME_SPEED_STEP = (GAME_SPEED_MAX - GAME_SPEED_MIN) / 30;
let gameLoopDelay = 1000 / gameSpeed;

let flashBg = false;
let flashTimeout = null;
let shakeFrames = 0;
let shakeIntensity = 0;

let gameOverCallback = null;

export function initGame() {
    // No-op, placeholder for future expansion
}

export function startGame() {
    resetGame();
    gameRunning = true;
    gameSpeed = GAME_SPEED_MIN;
    wallAppearInterval = 10;
    gameLoopDelay = 1000 / gameSpeed;
    gameInterval = setTimeout(gameLoop, gameLoopDelay);
    timerInterval = setInterval(updateTimer, 1000);
}

export function stopGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
}

function resetGame() {
    score = 0;
    seconds = 0;
    setScore(score);
    setTimer("00:00");
    setProgressBar(0);
    snake = [
        { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    placeFood();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

function updateWalls() {
    wallTimer++;
    if (wallTimer === wallAppearInterval - 2) {
        wallPreview = [];
        let attempts = 0;
        while (wallPreview.length < wallsPerWave && attempts < 20) {
            let candidate = generateWallPositions();
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

function generateWallPositions() {
    let valid = false;
    let wall = [];
    let maxAttempts = 50;
    while (!valid && maxAttempts-- > 0) {
        wall = [];
        const shapeType = Math.floor(Math.random() * 4);
        let x, y, length;
        switch (shapeType) {
            case 0:
                if (Math.random() < 0.5) {
                    length = 2 + Math.floor(Math.random() * 5);
                    y = 1 + Math.floor(Math.random() * (tileCountY - 2));
                    x = 1 + Math.floor(Math.random() * (tileCountX - length - 1));
                    for (let i = 0; i < length; i++) wall.push({ x: x + i, y });
                } else {
                    length = 2 + Math.floor(Math.random() * 5);
                    x = 1 + Math.floor(Math.random() * (tileCountX - 2));
                    y = 1 + Math.floor(Math.random() * (tileCountY - length - 1));
                    for (let i = 0; i < length; i++) wall.push({ x, y: y + i });
                }
                break;
            case 1:
                length = 2 + Math.floor(Math.random() * 3);
                x = 1 + Math.floor(Math.random() * (tileCountX - length - 2));
                y = 1 + Math.floor(Math.random() * (tileCountY - length - 2));
                for (let i = 0; i < length; i++) wall.push({ x: x + i, y });
                for (let i = 1; i < length; i++) wall.push({ x, y: y + i });
                break;
            case 2:
                length = 2 + Math.floor(Math.random() * 3);
                x = 2 + Math.floor(Math.random() * (tileCountX - length - 3));
                y = 2 + Math.floor(Math.random() * (tileCountY - 3));
                for (let i = 0; i < length; i++) wall.push({ x: x + i, y });
                wall.push({ x: x + Math.floor(length / 2), y: y + 1 });
                wall.push({ x: x + Math.floor(length / 2), y: y + 2 });
                break;
            case 3:
                length = 2 + Math.floor(Math.random() * 3);
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
        if (gameOverCallback) gameOverCallback();
        return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        if (gameOverCallback) gameOverCallback();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        setScore(score);
        placeFood();
        flashBg = true;
        if (flashTimeout) clearTimeout(flashTimeout);
        flashTimeout = setTimeout(() => {
            flashBg = false;
        }, 80);
        playEatSound && playEatSound();
        shakeFrames = 8;
        shakeIntensity = 6;
    } else {
        snake.pop();
    }

    drawGame({
        ctx,
        canvas,
        flashBg,
        shakeFrames,
        shakeIntensity,
        wallPreviewActive,
        wallPreview,
        wallPreviewStep,
        WALL_PREVIEW_STEPS,
        walls,
        wallTimer,
        food,
        snake,
        gridSize
    });

    if (shakeFrames > 0) shakeFrames--;

    // --- Control de velocidad dinámica ---
    let t = Math.min(seconds, 30);
    let newSpeed = GAME_SPEED_MIN + GAME_SPEED_STEP * t;
    newSpeed = Math.max(GAME_SPEED_MIN, Math.min(newSpeed, GAME_SPEED_MAX));
    if (Math.abs(newSpeed - gameSpeed) > 0.01) {
        gameSpeed = newSpeed;
        gameLoopDelay = 1000 / gameSpeed;
    }

    // --- Control de cantidad de paredes dinámica ---
    let newWallsPerWave = Math.floor(1 + (WALLS_PER_WAVE_MAX - 1) * (t / 30));
    if (newWallsPerWave !== wallsPerWave) {
        wallsPerWave = newWallsPerWave;
    }

    if (gameRunning) {
        gameInterval = setTimeout(gameLoop, gameLoopDelay);
    }
}

function updateTimer() {
    seconds++;
    wallTimer++;
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    setTimer(`${min}:${sec}`);
    setProgressBar(Math.min((seconds / 120) * 100, 100));
}

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

export function onGameOver(cb) {
    gameOverCallback = cb;
}

export function getScore() {
    return score;
}

export function getTime() {
    return seconds;
}
