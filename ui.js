let onStart, onMenu, onRanking, onRankingClose, onRestart, onScoreSubmit;

export function setupUI(callbacks) {
    onStart = callbacks.onStart;
    onMenu = callbacks.onMenu;
    onRanking = callbacks.onRanking;
    onRankingClose = callbacks.onRankingClose;
    onRestart = callbacks.onRestart;
    onScoreSubmit = callbacks.onScoreSubmit;

    document.getElementById('start-btn').onclick = onStart;
    document.getElementById('menu-btn').onclick = onMenu;
    document.getElementById('ranking-btn').onclick = onRanking;
    document.getElementById('close-ranking-btn').onclick = onRankingClose;
    document.getElementById('restart-btn').onclick = onRestart;

    document.getElementById('score-form').onsubmit = (e) => {
        e.preventDefault();
        onScoreSubmit();
    };
}

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
