// scripts/GameState.js

const GAME_STATE = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  START: 'start',
  RESUME: 'resume',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
  IDLE: 'idle'
};

class GameState {
  constructor() {
    this.state      = GAME_STATE.IDLE;
    this._listeners = {};
  }

  set(state) {
    if (this.state != state) {
      this.state = state;
      if (this._listeners[state]) {
        console.log(`Изменение состояния ${state}, колбэков:", ${this._listeners[state].length}`);
        this._listeners[state].forEach(callback => callback());
      }
    }
  }

  on(state, callback) {
    if (!this._listeners[state])
      this._listeners[state] = [];

    this._listeners[state].push(callback);
  }
  
  isPlaying() {
    return this.state === GAME_STATE.PLAYING;
  }
  
  isPaused() {
    return this.state === GAME_STATE.PAUSED;
  }
  
  isGameOver() {
    return this.state === GAME_STATE.GAME_OVER;
  }
  
  isVictory() {
    return this.state === GAME_STATE.VICTORY;
  }
  
  isIdle() {
    return this.state === GAME_STATE.IDLE;
  }

  start() {
    if (this.state === GAME_STATE.IDLE)
      this.set(GAME_STATE.START);
  }
  
  gameOver() {
    if (this.state !== GAME_STATE.GAME_OVER && this.state !== GAME_STATE.VICTORY)
      this.set(GAME_STATE.GAME_OVER);
  }
  
  victory() {
    if (this.state !== GAME_STATE.VICTORY && this.state !== GAME_STATE.GAME_OVER)
      this.set(GAME_STATE.VICTORY);
  }
  
  pause() {
    if (this.state === GAME_STATE.PLAYING)
      this.set(GAME_STATE.PAUSED);
  }
  
  resume() {
    if (this.state === GAME_STATE.PAUSED)
      this.set(GAME_STATE.RESUME);
  }
  
  reset() {
      this.set(GAME_STATE.PLAYING);
  }

  idle() {
      this.set(GAME_STATE.IDLE);
  }
}