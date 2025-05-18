let eatSound = new Audio('audio_snake/eat.mp3');
let gameOverSound = new Audio('audio_snake/gameover.wav');
let menuMusic = new Audio('audio_snake/menu.mp3');
let gameMusic = new Audio('audio_snake/game.mp3');
let gameOverMusic = new Audio('audio_snake/gameover-music.mp3');
let startSound = new Audio('audio_snake/start.mp3');

menuMusic.loop = true;
gameMusic.loop = true;
gameOverMusic.loop = true;

let musicVolume = 1;
let effectsVolume = 1;

menuMusic.volume = musicVolume;
gameMusic.volume = musicVolume;
gameOverMusic.volume = musicVolume;
eatSound.volume = effectsVolume;
gameOverSound.volume = effectsVolume;
startSound.volume = effectsVolume;

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
export function playStartSound() {
    startSound.currentTime = 0;
    startSound.play();
}
export function setMusicVolume(vol) {
    musicVolume = vol;
    menuMusic.volume = vol;
    gameMusic.volume = vol;
    gameOverMusic.volume = vol;
}
export function setEffectsVolume(vol) {
    effectsVolume = vol;
    eatSound.volume = vol;
    gameOverSound.volume = vol;
    startSound.volume = vol;
}
function stopAllMusic() {
    menuMusic.pause();
    gameMusic.pause();
    gameOverMusic.pause();
}

window.setMusicVolume = setMusicVolume;
window.setEffectsVolume = setEffectsVolume;
