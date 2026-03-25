// scripts/audio/GSoundManager.js

class GSoundManager extends SoundManager {
  constructor(gameState) {

    super();
    this.masterVolume = 0.4;
    this.gameState = gameState;
    this.userMuted = false;

    this.setupActivation();
    
    console.log('SoundManager: Инициализирован (ожидает активации)');
  }

  init() {
    super.init();
    this.loadAllSounds();

    window.addEventListener('blur', () => {
      this.setMuted(true);
    });

    window.addEventListener('focus', () => {
      this.setMuted(this.userMuted);
    });
  }

  ToggleUserMuted() {
    this.SetUserMuted(!this.userMuted);
  }

  SetUserMuted(value) {
    this.userMuted = value;
    this.setMuted(this.userMuted);
  }
  
  /**
   * Настройка активации по первому клику
   */
  setupActivation() {
    const activate = () => {
      if (!this.isActivated()) {
        console.log('SoundManager: Активирован пользователем');

        this.init();
        
        // Удаляем обработчики после активации
        $(document).off('click', activate);
        $(document).off('touchstart', activate);
        $(document).off('keydown', activate);
      }
    };
    
    $(document).on('click', activate);
    $(document).on('touchstart', activate);
    $(document).on('keydown', activate);
    
    // Подписываемся на события звуков
    this.setupEventListeners();
  }
  
  /**
   * Подписка на события из eventBus
   */
  setupEventListeners() {

    this.gameState.on(GAME_STATE.GAME_OVER, () => {
      this.loadSound('fail-music', 'sounds/fail-music.mp3')
        .then(()=>{
            this.play('fail-music')
        });
    });

    this.gameState.on(GAME_STATE.VICTORY, () => {
      this.loadSound('win-music', 'sounds/win-music.mp3')
        .then(()=>{
            this.play('win-music')
        });
    });
    
    eventBus.on('blade', (data) => {
      this.play('blade', { 
        volume: this.masterVolume,
        playbackRate: 0.9 + Math.random() * 0.2
      });
    });
    
    eventBus.on('dirt', (data) => {
      this.play('dirt', { 
        volume: this.masterVolume,
        playbackRate: 0.9 + Math.random() * 0.2
      });
    });
    
    eventBus.on('bounce', (data) => {
      this.play('bounce', { 
        volume: this.masterVolume,
        playbackRate: 0.9 + Math.random() * 0.2
      });
    });

    // Слушаем все события, которые начинаются с 'sound:'
    eventBus.on('sound:play', (data) => {
      this.play(data.id, data);
    });
  }

  loadAllSounds() {
    const sounds = [
        { id: 'bounce', url: 'sounds/bounce.mp3' },
        { id: 'dirt', url: 'sounds/dirt.mp3' },
        { id: 'blade', url: 'sounds/blade.mp3' }
    ];
    
    // Создаем массив промисов
    const promises = sounds.map(sound => this.loadSound(sound.id, sound.url));
    
    // Возвращаем Promise.allSettled
    return Promise.allSettled(promises);
  }
}