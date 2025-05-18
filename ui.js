let onStart, onMenu, onRanking, onRankingClose, onRestart, onScoreSubmit;
let onSettings, onSettingsClose;
let controlBinds = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight'
};
let bindTarget = null;

// --- NUEVO: Setup UI con settings ---
export function setupUI(callbacks) {
    onStart = callbacks.onStart;
    onMenu = callbacks.onMenu;
    onRanking = callbacks.onRanking;
    onRankingClose = callbacks.onRankingClose;
    onRestart = callbacks.onRestart;
    onScoreSubmit = callbacks.onScoreSubmit;
    onSettings = callbacks.onSettings;
    onSettingsClose = callbacks.onSettingsClose;

    document.getElementById('start-btn').onclick = onStart;
    document.getElementById('menu-btn').onclick = onMenu;
    document.getElementById('ranking-btn').onclick = onRanking;
    document.getElementById('close-ranking-btn').onclick = onRankingClose;
    document.getElementById('restart-btn').onclick = onRestart;
    document.getElementById('settings-btn').onclick = onSettings;
    document.getElementById('close-settings-btn').onclick = onSettingsClose;

    document.getElementById('score-form').onsubmit = (e) => {
        e.preventDefault();
        onScoreSubmit();
    };

    // Volumen sliders
    const musicSlider = document.getElementById('music-volume');
    const effectsSlider = document.getElementById('effects-volume');
    const musicValue = document.getElementById('music-volume-value');
    const effectsValue = document.getElementById('effects-volume-value');
    musicSlider.oninput = () => {
        musicValue.textContent = Math.round(musicSlider.value * 100) + "%";
        window.setMusicVolume && window.setMusicVolume(Number(musicSlider.value));
    };
    effectsSlider.oninput = () => {
        effectsValue.textContent = Math.round(effectsSlider.value * 100) + "%";
        window.setEffectsVolume && window.setEffectsVolume(Number(effectsSlider.value));
    };

    // Bindings
    ['up', 'down', 'left', 'right'].forEach(dir => {
        const btn = document.getElementById('bind-' + dir);
        btn.textContent = getBindLabel(controlBinds[dir]);
        btn.onclick = () => {
            bindTarget = dir;
            btn.classList.add('active');
            window.addEventListener('keydown', bindKeyHandler);
        };
    });
    document.getElementById('reset-binds-btn').onclick = () => {
        controlBinds = {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        };
        updateBindButtons();
        if (window.onBindsChanged) window.onBindsChanged(controlBinds);
    };
}

function bindKeyHandler(e) {
    if (!bindTarget) return;
    controlBinds[bindTarget] = e.key;
    updateBindButtons();
    if (window.onBindsChanged) window.onBindsChanged(controlBinds);
    document.getElementById('bind-' + bindTarget).classList.remove('active');
    bindTarget = null;
    window.removeEventListener('keydown', bindKeyHandler);
    // Feedback sonoro/visual
    if (window.playStartSound) window.playStartSound();
}

function updateBindButtons() {
    ['up', 'down', 'left', 'right'].forEach(dir => {
        const btn = document.getElementById('bind-' + dir);
        btn.textContent = getBindLabel(controlBinds[dir]);
    });
}

function getBindLabel(key) {
    if (key.startsWith('Arrow')) return { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' }[key] || key;
    return key.length === 1 ? key.toUpperCase() : key;
}

// --- NUEVO: Mostrar/ocultar settings ---
export function showSettings() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('settings-screen').style.display = 'flex';
}
export function hideSettings() {
    document.getElementById('settings-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

// --- NUEVO: Obtener binds actuales ---
export function getControlBinds() {
    return { ...controlBinds };
}

// --- EXISTENTE: Mostrar/ocultar menú, juego y ranking ---
export function showMenu() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('ranking-modal').style.display = 'none';
}

export function showGameUI() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'flex';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('ranking-modal').style.display = 'none';
}

export function showGameOverScreen() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('game-over').style.display = 'flex';
}

export function showRankingModal() {
    document.getElementById('ranking-modal').style.display = 'flex';
}
export function hideRankingModal() {
    document.getElementById('ranking-modal').style.display = 'none';
}

// --- EXISTENTE: Configuración de puntajes y temporizador ---
export function setFinalScore(score) {
    document.getElementById('final-score').textContent = score;
}

export function setScoreSavedMsg(show) {
    document.getElementById('score-saved-msg').style.display = show ? "block" : "none";
}
export function setScoreForm(show) {
    document.getElementById('score-form').style.display = show ? "flex" : "none";
    if (show) {
        document.getElementById('player-name').value = "";
        document.getElementById('player-name').focus();
    }
}

export function setScore(score) {
    document.getElementById('score').textContent = score;
}
export function setTimer(str) {
    document.getElementById('timer').textContent = str;
}
export function setProgressBar(percent) {
    document.getElementById('progress-bar').style.width = percent + "%";
}

export function getPlayerName() {
    return document.getElementById('player-name').value.trim();
}

// Dibujo del juego (llamado desde game-core.js)
export function drawGame({ ctx, canvas, flashBg, shakeFrames, shakeIntensity, wallPreviewActive, wallPreview, wallPreviewStep, WALL_PREVIEW_STEPS, walls, wallTimer, food, snake, gridSize }) {
    let offsetX = 0, offsetY = 0;
    if (shakeFrames > 0) {
        offsetX = Math.round((Math.random() - 0.5) * shakeIntensity);
        offsetY = Math.round((Math.random() - 0.5) * shakeIntensity);
    }
    ctx.save();
    ctx.translate(offsetX, offsetY);

    ctx.fillStyle = flashBg ? "#fff" : "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    ctx.restore();
}

// Ranking en tiempo real
import { listenRanking as listenRankingDB } from './firebase.js';
listenRankingDB((ranking) => {
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = "";
    ranking.forEach(d => {
        const mins = Math.floor(d.time / 60);
        const secs = d.time % 60;
        const tstr = `${mins}:${secs.toString().padStart(2, '0')}`;
        rankingList.innerHTML += `<li><b>${d.name}</b> — ${d.score} pts — ${tstr}</li>`;
    });
});
