//import * as THREE from 'three';

// Bootstrap доступен глобально через window.bootstrap
const bootstrap = window.bootstrap;

function collectPaths(obj) {
  const paths = [];
  
  function recursiveCollect(current) {
    if (current && typeof current === 'object') {
      Object.entries(current).forEach(([key, value]) => {
        // Проверяем, оканчивается ли ключ на _PATH (регистронезависимо)
        if (key.toUpperCase().endsWith('_PATH') && typeof value === 'string') {
          paths.push(value);
        }
        // Рекурсивно обходим вложенные объекты
        if (value && typeof value === 'object') {
          recursiveCollect(value);
        }
      });
    }
  }
  
  recursiveCollect(obj);
  return paths;
}

function getUserTitle(totalScore) {
  let accumulatedScore = 0;
  
  for (const [key, value] of Object.entries(USER_TITLES)) {
    if (totalScore < accumulatedScore + value.step)
      return key;
    accumulatedScore += value.step;
  }
  
  // Если достигнут максимум
  const lastKey = Object.keys(USER_TITLES).pop();
  return lastKey;
}

class Game {
  constructor() {
    this.game_container = $('#game-container');
    this.container      = $('#canvas-container');
    this.scene          = new THREE.Scene();
    this.cameraController = null;
    this.tree = null;
    this.ball = null;
    this.physics = null;
    this.mouseControl = null;
    this.scoreIndicatorElement = $('#score-indicator');
    this.currentScoreElement = $('#current-score');
    this.killerIndicatorElement = $('#killer-indicator');
    this.stateView = {
      score: $('#state-score'),
      vin: $('#state-vin'),
      title: $('#state-title')
    };
    this.lastTime = performance.now();
    this.frame_num = 0; 
    this.crystal = null;
    this.background = null;
    this.grass = null;
    this.ground = null;
    this.bounceEffect = null;
    this.currentScore = 0;
    this.gameStarted = false; // Флаг, что игра была запущена
    this.testResult = this.quickGPUTest();
    this.stateManager = new StateManager();
    this.gameHint = $('#game-hint');
    this.allow_playing = true;
    this.advProvider = () => {
      return new Promise((resolve, reject)=>{
        resolve(true);
      });
    }
    
    // Создаем gameState
    this.gameState = new GameState();
    this.lights = [];
    
    // Инициализация Bootstrap модальных окон
    this.initModals();
    
    // Загрузка звуков
    this.initAudio();

    if ((typeof DEV == 'undefined') || !DEV) {
      $(window).on('blur', () => {
        this.gameState.pause();
      });
    }

    this.stateManager.loadState()
      .then(()=>{
        this.setGameIndex(this.stateManager.get('paramsIndex', START_GAME))
          .then(()=>{
            this.init();
          });
      });
  }

  setState(name, value) {
    this.stateManager.set(name, value);
    this.updateStateView();
  }

  updateStateView() {
    let keys = Object.keys(this.stateView);
    keys.forEach((name)=>{
      let val;
      if (name == 'title') {
        let key = this.stateManager.get(name, Object.keys(USER_TITLES)[0]);
        val = lang.get('title_' + key);
      }
      else val = this.stateManager.get(name, '-');

      this.stateView[name].find('.value').text(val);
    });
  }

  quickGPUTest() {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    const startTime = performance.now();
    
    // Рисуем 10000 прямоугольников
    for (let i = 0; i < 10000; i++) {
      ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
      ctx.fillRect(
        Math.random() * 1000,
        Math.random() * 1000,
        50 + Math.random() * 50,
        50 + Math.random() * 50
      );
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Canvas 2D тест: ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  async initAudio() {
    this.soundManager = new GSoundManager(this.gameState);
  }

  doPlaying() {
    this.frame_num = 0;
    this.cameraController.begin();
    this.updateStateView();
    this.updateGameDisplay();
    this.enableControls();
    this.updateDeltaTime();
  }

  doAfterGameOver() {
    this.advProvider()
      .then((result)=>{
          this.gameOverModal.hide();
          this.resetGame();
      });
  }

  doNextLevel() {
    this.advProvider()
      .then((result)=>{
        this.nextGameIndex()
          .then(()=>{
            this.hideVictoryModal();
            this.resetGame();
          });
      });
  }

  doResume() {
    this.advProvider()
      .then((result)=>{
        this.gameState.resume();
      });
  }
  
  initModals() {
    this.initStartModal();
    this.initGameOverModal();
    this.initVictoryModal();
    this.initPauseModal();
    
    // Настройка обработчика нажатия клавиш
    $(window).on('keydown', (e) => {
      // Перезапуск по клавише R (в любом состоянии, кроме IDLE)
      if ((e.key === 'r' || e.key === 'R') && !this.gameState.isIdle()) {
        this.resetGame();
      }
      
      // Пауза по ESC (только если игра активна и не на паузе)
      if (e.key === 'Escape') {
        if (this.gameState.isPlaying()) {
          this.gameState.pause();
        } else if (this.gameState.isPaused()) {
          this.doResume();
        }
      }
      
      // Клавиша M для отключения звука
      if (e.key === 'm' || e.key === 'M') {
        this.soundManager.ToggleUserMuted();
        console.log(`Звук ${this.soundManager.userMuted ? 'выключен' : 'включен'}`);
      }
    });
    
    // Подписка на события состояния игры
    this.gameState.on(GAME_STATE.GAME_OVER, () => {
      console.log("Game Over callback вызван");
      this.hideScoreIndicator();
      this.hideKillerIndicator();
      this.showGameOverModal();
      this.disableControls();

      let gameOverCount = this.stateManager.get('game_over_count', 0) + 1;
      if (gameOverCount > 2) {
        gameOverCount = 0;
        this.prevGameIndex();
      }
      this.stateManager.set('game_over_count', gameOverCount);
    });
    
    this.gameState.on(GAME_STATE.VICTORY, () => {
      console.log("Victory callback вызван");
      this.Victory();
    });
    
    this.gameState.on(GAME_STATE.PLAYING, () => {
      console.log("PLAYING callback вызван");
      this.doPlaying();
    });
    
    this.gameState.on(GAME_STATE.PAUSED, () => {
      console.log("Pause callback вызван");
      this.showPauseModal();
      this.disableControls();
    });
    
    this.gameState.on(GAME_STATE.RESUME, () => {
      console.log("Resume callback вызван");
      console.log(`Ball position: ${this.ball.getPosition().y}`);
      this.hidePauseModal();
      this.gameState.set(GAME_STATE.PLAYING);
    });
    
    this.gameState.on(GAME_STATE.RESET, () => {
      console.log("Reset callback вызван");
      if (this.gameOverModal) {
        this.gameOverModal.hide();
      }
      if (this.victoryModal) {
        this.victoryModal.hide();
      }
      if (this.pauseModal) {
        this.pauseModal.hide();
      }
      this.hideScoreIndicator();
      this.updateGameDisplay();
      this.showKillerIndicator();
    });

    // Подписка на старт игры
    this.gameState.on(GAME_STATE.START, () => {
      console.log("Start callback вызван");
      this.game_container.removeClass('start-blocking');
      this.hideStartModal();
      this.updateGameDisplay();
      this.showKillerIndicator();
      this.gameStarted = true;
      this.gameState.set(GAME_STATE.PLAYING);
    });
  }

  NextLevel() {
      this.nextGameIndex()
          .then(()=>{
            this.resetGame();
          });
  }

  GoToLevel(levelKey) {
    this.setGameIndex(levelKey)
          .then(()=>{
            this.resetGame();
          });
  }

  setUserTitle(key) {
    this.setState('title', key);
    eventBus.emit('set_user_title', key);
  }

  updateUserTitle() {

    let current = this.stateManager.get('title', Object.keys(USER_TITLES)[0]);
    let totalScore = this.stateManager.get('score', this.currentScore);

    let titleKey = getUserTitle(totalScore);
    if (titleKey != current) {
      this.setUserTitle(titleKey);
      return titleKey;
    }

    return false;
  }

  clearUserData() {
    this.currentScore = 0;
    this.stateManager.delete('score');
    this.stateManager.delete('vin');
    this.stateManager.delete('title');
    this.stateManager.delete('paramsIndex');

    this.paramsIndex = Object.keys(GAME_PARAMS)[0];

    this.updateStateView();
  }

  Victory() {
    this.calculateScore();

    let lastTotalScore = this.stateManager.get('score', 0);
    let newTotalScore = lastTotalScore + this.currentScore;

    this.setState('score', newTotalScore);
    this.setState('vin', this.stateManager.get('vin', 0) + 1);
    eventBus.emit('new_score', newTotalScore);

    this.showVictoryModal(lastTotalScore, newTotalScore, this.updateUserTitle());
    this.disableControls();
  }

  nextGameIndex() {
    let keys = Object.keys(GAME_PARAMS);
    return this.setGameIndex(keys[(keys.indexOf(this.paramsIndex) + 1) % keys.length]);
  }

  prevGameIndex() {
    let keys = Object.keys(GAME_PARAMS);
    return this.setGameIndex(keys[Math.max(keys.indexOf(this.paramsIndex) - 1, 0)]);
  }

  setGameIndex(value) {
    let keys = Object.keys(GAME_PARAMS);
    this.paramsIndex = GAME_PARAMS[value] ? value : keys[0];
    this.stateManager.set('paramsIndex', this.paramsIndex);

    let index = keys.indexOf(this.paramsIndex);

    this.updateGameDisplay();
    
    if (this.stateManager.get('level', 0) < index) {
      this.stateManager.set('level', index);
      eventBus.emit('new_level', index);
    }
    return this.loadLevelTextures();
  }

  loadLevelTextures() {
    return new Promise((resolve, reject)=>{
      let textures = collectPaths(GAME_PARAMS[this.paramsIndex]);
      this.visibleLoader(true);
      textureLoader.loadTexturesParallel(textures, (result)=>{
        this.visibleLoader(false);
        if (result)
          resolve(result);
        else reject();
      });
    })
  }

  visibleLoader(visible = true) {
    $('body').toggleClass('page-loaded', !visible);
  }
  
  initStartModal() {
    // Получаем элемент модального окна Start
    this.startModalElement = $('#startModal');

    $('#testResult').text(Math.round(this.testResult));
    
    if (this.startModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.startModal = new bootstrap.Modal(this.startModalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Обработчик для кнопки старта
      btnOnClick('#startGameButton', this.gameState.start.bind(this.gameState));
    }
  }
  
  initGameOverModal() {
    // Получаем элемент модального окна Game Over
    this.gameOverModalElement = $('#gameOverModal');
    
    if (this.gameOverModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.gameOverModal = new bootstrap.Modal(this.gameOverModalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Обработчик для кнопки рестарта в Game Over
      btnOnClick('#restartButton', ()=>{
        this.doAfterGameOver();
      });
      
      // Обработчик для закрытия модального окна
      this.gameOverModalElement.on('hidden.bs.modal', () => {
        if (this.gameState.isGameOver()) {
          this.resetGame();
        }
      });
    }
  }
  
  initVictoryModal() {
    // Получаем элемент модального окна Victory
    this.victoryModalElement = $('#victoryModal');
    
    if (this.victoryModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.victoryModal = new bootstrap.Modal(this.victoryModalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Обработчик для кнопки рестарта в Victory
      btnOnClick('#victoryRestartButton', this.doNextLevel.bind(this));
      
      // Обработчик для закрытия модального окна
      this.victoryModalElement.on('hidden.bs.modal', () => {
        if (this.gameState.isVictory()) {
          this.resetGame();
        }
      });
    }
  }
  
  initPauseModal() {
    // Получаем элемент модального окна Pause
    this.pauseModalElement = $('#pauseModal');
    
    if (this.pauseModalElement && bootstrap) {
      // Создаем экземпляр Bootstrap модального окна
      this.pauseModal = new bootstrap.Modal(this.pauseModalElement, {
        backdrop: 'static',
        keyboard: false
      });
      
      // Обработчик для кнопки продолжения
      btnOnClick('#resumeButton', this.doResume.bind(this));
      
      // Обработчик для кнопки рестарта в паузе
      btnOnClick('#pauseRestartButton', () => {
        this.hidePauseModal();
        this.resetGame();
      });
    }
  }
  
  showStartModal() {
    if (this.startModal) {
      this.startModal.show();
    }
  }
  
  hideStartModal() {
    if (this.startModal) {
      this.startModal.hide();
    }
  }
  
  showGameOverModal() {
    // Обновляем статистику в модальном окне
    const finalBounceElement = $('#finalBounceCount');
    
    if (finalBounceElement && this.ball) {
      finalBounceElement.text(this.ball.getBounceCount());
    }
    
    // Показываем модальное окно

    let restartButton = $('#restartButton')[0];

    restartButton.disabled = true;
    setTimeout(()=>{
      restartButton.disabled = false;
    }, 3000);

    this.gameOverModal.show();
  }

  hideVictoryModal() {
    this.victoryModal.hide();
  }
  
  showVictoryModal(lastScore, newScore, newTitle) {
    // Обновляем статистику в модальном окне победы
    const victoryBounceElement = $('#victoryBounceCount');
    const victoryScoreElement = $('#victoryScore');
    
    if (victoryBounceElement && this.ball) {
      victoryBounceElement.text(this.ball.getBounceCount());
    }

    const victoryRestartBtn = $('#victoryRestartButton')[0];

    victoryRestartBtn.disabled = true;
    setTimeout(()=>{
      victoryRestartBtn.disabled = false;
    }, 4000);

    let newTitleElem = this.victoryModalElement.find('.new-title');
    if (newTitle) {
      let titleText = lang.get('new_rank') + ' ' + lang.get('title_' + newTitle) + '!';
      newTitleElem.html(titleText + '<div class="title-image ' + newTitle + '"></div>');
      newTitleElem.css('display', 'block');
    } else newTitleElem.css('display', 'none');
    
    // Показываем модальное окно
    this.victoryModal.show();

    victoryScoreElement.text(0);
    enumerateTo(lastScore, newScore, 2000, (score)=>{
      victoryScoreElement.text(Math.round(score));
    }, ()=>{

      let coord = $('#victoryState')[0].getBoundingClientRect();
      new SparkEffect({
        x: coord.x + coord.width / 2,
        y: coord.y + coord.height / 2,
        count: this.testResult > 30 ? 60 : 30,
        colors: ['#FFF', '#F8F', '#FF8', '#8FF'],
        sizes: [4, 8],
        speeds: [1, 3],
        gravity: 0.04,
        baseRadius: coord.width * 0.4
      });
    });
  }
  
  showPauseModal() {
    if (this.pauseModal) {
        let title = this.stateManager.get('title') || Object.keys(USER_TITLES)[0];
        this.pauseModalElement.find('.title-image').toggleClass(title, true);
        this.pauseModalElement.find('.title').text(lang.get('title_' + title));
        this.pauseModal.show();
    }
  }
  
  hidePauseModal() {
    this.pauseModal.hide();
  }
  
  showScoreIndicator() {
    this.scoreIndicatorElement.css('display', 'block');
  }
  
  hideScoreIndicator() {
    this.scoreIndicatorElement.css('display', 'none');
  }
  
  updateGameDisplay() {
    $('#game-title').text(lang.get(GAME_PARAMS[this.paramsIndex].NAME));
  }
  
  showKillerIndicator() {
    this.killerIndicatorElement.css('display', 'block');
  }
  
  hideKillerIndicator() {
    this.killerIndicatorElement.css('display', 'none');
  }
  
  disableControls() {
    if (this.mouseControl) {
      this.mouseControl.destroy();
      this.mouseControl = null;
    }
  }
  
  enableControls() {
    // Инициализация управления мышью (для верхнего блока)
    if (this.mouseControl)
      this.mouseControl.destroy();

    this.mouseControl = new MouseRotationControl(this, this.container);
    this.mouseControl.init();    

    this.gameHint.toggleClass('show', true);
    setTimeout(()=>{
        this.gameHint.toggleClass('show', false);
    }, 5000);

    this.visibleLoader(false);
  }
  
  updateScoreIndicator() {
    if (this.currentScoreElement) {
      this.currentScoreElement.text(this.currentScore);
    }
  }
  
  calculateScore() {
    if (!this.ball) return;
    
    const bounceCount = this.ball.getBounceCount();
    // Формула: чем меньше отскоков, тем больше очков
    // Максимум 1000 очков при 0 отскоков, минимум 100 при максимальном количестве
    const MAX_BOUNCES = 80; // Ожидаемое максимальное количество отскоков
    const MAX_SCORE = 500;
    const MIN_SCORE = 50;
    
    if (bounceCount >= MAX_BOUNCES) {
      this.currentScore = MIN_SCORE;
    } else {
      // Линейная интерполяция: больше отскоков = меньше очков
      this.currentScore = Math.floor(
        MAX_SCORE - (bounceCount / MAX_BOUNCES) * (MAX_SCORE - MIN_SCORE)
      );
    }
    
    this.updateScoreIndicator();
  }
  
  init() {
      
    this.rendererManager = new RendererManager(this.container);
    
    // Инициализация рендерера
    this.rendererManager.init();
    
    // Инициализация камеры
    this.cameraController = new CameraController(this);
    this.bounceEffect = new BounceEffect(this.scene, {
      spread: 1.0,
      gravity: -1.0
    });

    eventBus.on('bounce', (data) => {
      if (this.bounceEffect && this.ball) {

        let r = Math.abs(this.tree.getDelta()) * 50;
        if (r > 1) {
          this.bounceEffect.createBounceEffect(this.ball.getPosition(), {
            particleCount: Math.floor(Math.random() * r + 10)
          });
        }
      }
    });
    
    // Создание игровых объектов (но не активируем физику)
    this.createGameObjects();
    
    // Запуск анимации
    this.animate();
    
    // Скрываем подсказки до старта игры
    this.hideKillerIndicator();
    this.hideScoreIndicator();

    this.showStartModal();
    this.updateStateView();
    this.visibleLoader(false);

    btnOnClick('#pause-btn', ()=>{
      this.gameState.pause();
    });

    this.soundControl();
    
    $(window).on('resize', this.onResize.bind(this));
    $(window).trigger('game-ready');
  }

  soundControl() {

    this.volume = $('#volume');
    this.volume.toggleClass('on', this.stateManager.get('sound_on', true));
    this.updateSound();

    this.volume.click(()=>{
      this.volume.toggleClass('on');
      this.updateSound();
    });
  }

  updateSound() {
    let on = this.volume.hasClass('on');
    this.stateManager.set('sound_on', on);
    this.soundManager.SetUserMuted(!on);
  }
  
  createGameObjects() {
    
    // Создание освещения
    this.createLights();

    const scene = this.scene;
    let env = GAME_PARAMS[this.paramsIndex].ENV;
    
    // Создание дерева
    this.tree = new Tree(scene);
    this.tree.init(GAME_PARAMS[this.paramsIndex].TREE);
    
    // Создание кристалла на вершине дерева
    this.createCrystal();
    
    // Создание шарика
    this.ball = new Ball(scene, this.tree);

    this.background = new Background(this);
    this.background.init(env.BACKGROUND_IMAGE_PATH);

    this.grass = new Grass(scene, this.tree);
    this.grass.init(env.GRASS_IMAGE_PATH);

    this.ground = new Ground(scene, this.tree);
    this.ground.init(env.GROUND_IMAGE_PATH);
    
    // Инициализация физики с передачей gameState
    this.physics = new BallPhysics(this.ball, this.tree, this.gameState);
    
    // Сброс камеры
    this.cameraController.reset();
    
    // Сброс счета
    this.currentScore = 0;
    this.updateScoreIndicator();
  }

  clearGameObject() {
    // Удаляем все объекты окружения из сцены
    const scene = this.scene;

    if (this.background) {
      this.background.dispose();
      this.background = null;
    }
    
    // Удаляем старое дерево
    if (this.tree && this.tree.mesh) {
      scene.remove(this.tree.mesh);
      this.tree = null;
    }
    
    // Удаляем старый шарик
    if (this.ball) {
      this.ball.dispose();
      this.ball = null;
    }
    
    // Удаляем кристалл
    if (this.crystal) {
      this.crystal.dispose();
      this.crystal = null;
    }

    if (this.grass) {
      this.grass.dispose();
      this.grass = null;
    }

    if (this.ground) {
      this.ground.dispose();
      this.ground = null;
    }
  }
  
  resetGame() {
    console.log("Сброс игры...");

    this.hideScoreIndicator();
    this.clearGameObject();
    this.createGameObjects();

    this.newTitle = null;
    
    // Сброс счета
    this.currentScore = 0;
    this.updateScoreIndicator();
    
    // Сброс состояния игры (это вызовет onReset колбэки)
    this.gameState.reset();
  }

  clearLights() {
    // Очищаем старые источники света
    this.lights.forEach(light => {
      if (light.parent) {
        this.scene.remove(light);
      }
    });
    this.lights = [];
  }
  
  createLights() {

    this.clearLights();
    let env = GAME_PARAMS[this.paramsIndex].ENV;

    this.scene.background = new THREE.Color(env.BACKGROUND_COLOR);
    let distance = 11;
    this.scene.fog = new THREE.Fog(env.BACKGROUND_COLOR, distance, distance * 2);
    
    const ambient = new THREE.AmbientLight(env.AMBIENT_LIGHT_COLOR, env.AMBIENT_LIGHT_INTENSITY);
    this.scene.add(ambient);
    this.lights.push(ambient);
    
    const keyLight = new THREE.DirectionalLight(env.KEY_LIGHT_COLOR, env.KEY_LIGHT_INTENSITY);
    keyLight.position.set(20, 20, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 1000;
    keyLight.shadow.camera.left = -20;
    keyLight.shadow.camera.right = 20;
    keyLight.shadow.camera.top = 20;
    keyLight.shadow.camera.bottom = -20;
    keyLight.shadow.bias = 0;
    this.scene.add(keyLight);
    this.lights.push(keyLight);
    
    const fillLight = new THREE.DirectionalLight(env.FILL_LIGHT_COLOR, env.FILL_LIGHT_INTENSITY);
    fillLight.position.set(-3, 2, 3);
    this.scene.add(fillLight);
    this.lights.push(fillLight);
    
    const rimLight = new THREE.PointLight(env.RIM_LIGHT_COLOR, env.RIM_LIGHT_INTENSITY, RIM_LIGHT_DISTANCE);
    rimLight.position.set(-2, -1, 4);
    this.scene.add(rimLight);
    this.lights.push(rimLight);
  }
  
  onResize() {
    this.rendererManager.resize();
    this.cameraController.resize(this.rendererManager.getAspectRatio());
  }
  
  checkGameOver() {
    if (!this.gameState.isPlaying() || !this.ball) return;
    
    const ballPos = this.ball.getPosition();
    const cameraY = this.cameraController.getCamera().position.y;
    
    // Если шарик упал ниже камеры на заданное смещение
    if (ballPos.y < cameraY + GAME_OVER_Y_OFFSET) {
      console.log(`Game Over по падению ${ballPos.y} < ${cameraY} + ${GAME_OVER_Y_OFFSET}`);
      this.gameState.gameOver();
    }
  }

  updateDeltaTime() {
    const time = performance.now();
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    return Math.min(dt, 0.1);
  }

  _update() {
    const dt = this.updateDeltaTime();
    
    // Обновление физики только если игра активна (не на паузе, не закончена и не в IDLE)
    if (this.allow_playing && this.gameState.isPlaying() && this.ball && this.physics && (textureLoader.loading <= 0)) {

      this.frame_num++;
      this.tree.update(dt);
      this.physics.update(dt);
    
      // Обновление фона
      if (this.background) {
        this.background.update(dt);
      }

      // Обновление травы
      if (this.grass) {
        this.grass.update(dt);
      }
    
      // Обновление грунта (если нужно)
      if (this.ground) {
        this.ground.update(dt);
      }
      
      // Обновление вращения мыши
      if (this.mouseControl) {
        this.mouseControl.update();
      }
      
      // Проверка конца игры, только после 30 кадров игры
      if (this.frame_num > 30)
        this.checkGameOver();
      
      // Показываем индикатор очков при приближении к вершине
      if (this.ball && this.ball.getPosition().y > this.tree.half_height - 2) {
        this.showScoreIndicator();
        this.calculateScore();
      }
    
      // Обновление кристалла
      this.updateCrystal(dt);

      if (this.ball) {
        this.cameraController.update(dt, this.ball.getLastBounceY());
      }
      
      // Рендеринг (всегда, чтобы видеть сцену)
      if (this.scene && this.cameraController) {
        this.rendererManager.render(this.scene, this.cameraController.getCamera());
      }
  
      if (this.bounceEffect) {
        this.bounceEffect.update(dt);
      }

    }
  }
  
  animate() {
    //if (typeof DEV == 'undefined')
      requestAnimationFrame(this.animate.bind(this));
    //else delayAnimation(100, this.animate.bind(this));

    this._update();
  }

  createCrystal() {
    if (!this.tree) return;
    
    // Удаляем старый кристалл если есть
    if (this.crystal) {
      this.crystal.dispose();
      this.crystal = null;
    }
    
    // Создаем кристалл на вершине дерева
    this.crystal = new Crystal(
      this.scene,
      this.tree
    );
    this.crystal.init();
    
    console.log("Кристалл создан на вершине дерева");
  }

  updateCrystal(dt) {
    if (this.crystal && this.gameState.isPlaying()) {
      this.crystal.update(dt);
    }
  }
}

// Запуск игры
onAllImagesLoaded(() => {
  window.game = new Game();
});