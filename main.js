import { initGame, startGame, stopGame, onGameOver, getScore, getTime } from './game-core.js';
import { saveScore, listenRanking } from './firebase.js';
import { showMenu, showGameUI, showGameOverScreen, setupUI, showRankingModal, hideRankingModal, setFinalScore, setScoreSavedMsg, setScoreForm, getPlayerName, showSettings, hideSettings } from './ui.js';
import { playEatSound, playGameOverSound, playMenuMusic, playGameMusic, playGameOverMusic } from './sound.js';

// Inicialización de UI y eventos
setupUI({
    onStart: () => {
        showGameUI();
        playGameMusic();
        startGame();
    },
    onMenu: () => {
        stopGame();
        showMenu();
        playMenuMusic();
    },
    onRanking: showRankingModal,
    onRankingClose: hideRankingModal,
    onRestart: () => {
        showGameUI();
        playGameMusic();
        startGame();
    },
    onScoreSubmit: async () => {
        const name = getPlayerName();
        if (!name) return;
        await saveScore(name, getScore(), getTime());
        setScoreSavedMsg(true);
        setScoreForm(false);
    },
    onSettings: showSettings,
    onSettingsClose: hideSettings,
});

// Game Over callback
onGameOver(() => {
    playGameOverSound();
    playGameOverMusic();
    setFinalScore(getScore());
    showGameOverScreen();
    setScoreSavedMsg(false);
    setScoreForm(true);
});

// Al cargar, muestra menú y música
showMenu();
playMenuMusic();
