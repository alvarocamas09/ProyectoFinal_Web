// Puedes reemplazar los URLs por tus propios archivos de sonido/música
let eatSound = new Audio('eat.mp3');
let gameOverSound = new Audio('gameover.mp3');
let menuMusic = new Audio('menu.mp3');
let gameMusic = new Audio('game.mp3');
let gameOverMusic = new Audio('gameover-music.mp3');

menuMusic.loop = true;
gameMusic.loop = true;
gameOverMusic.loop = true;

export function playEatSound() {
    eatSound.currentTime = 0;
    eatSound.play();
}
export function playGameOverSound() {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
}
export function playMenuMusic() {
    stopAllMusic();
    menuMusic.currentTime = 0;
    menuMusic.play();
}
export function playGameMusic() {
    stopAllMusic();
    gameMusic.currentTime = 0;
    gameMusic.play();
}
export function playGameOverMusic() {
    stopAllMusic();
    gameOverMusic.currentTime = 0;
    gameOverMusic.play();
}
function stopAllMusic() {
    menuMusic.pause();
    gameMusic.pause();
    gameOverMusic.pause();
}
