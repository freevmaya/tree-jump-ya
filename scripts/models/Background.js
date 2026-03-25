// scripts/models/Background.js
class Background {
  constructor(game) {
    this.game = game;
    this.mesh = null;
    this.texture = null;
  }

  /**
   * Инициализация фонового изображения
   * @param {string} imagePath - путь к изображению
   * @param {Object} options - дополнительные параметры
   */
  init(imagePath = 'textures/background.jpg') {

    // Загружаем текстуру
    textureLoader.loadTexture(
      imagePath,
      (texture) => {
        this.texture = texture;
        this.createBackground();
      },
      (error) => {
        console.warn('Не удалось загрузить фоновое изображение:', error);
      },
      {
        repeat: { x: 1, y: 1 },
        anisotropy: 8
      }
    );

    return this;
  }

  /**
   * Создает фоновую плоскость с текстурой
   */
  createBackground() {

    this.size = 70 + this.game.tree.half_height;

    // Создаем геометрию плоскости
    const geometry = new THREE.PlaneGeometry(this.size, this.size);
    
    // Создаем материал с текстурой
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      color: BACKGROUND_COLOR,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      depthTest: true,
      fog: false
    });

    // Создаем меш
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Отключаем тени для фона
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    this.game.scene.add(this.mesh);

    this.updatePosition();
    
    console.log('Фоновое изображение создано');
  }

  updatePosition() {

    let distance = 20;
    let dir = this.game.cameraController.getLookDirection();
    let angle = Math.atan2(dir.x, dir.z);
    
    // Позиционируем фон позади сцены
    this.mesh.position.set(dir.x * distance, this.game.tree.options.TREE_HEIGHT, dir.z * distance);
    
    // Поворачиваем чтобы смотрела на камеру
    this.mesh.rotation.y = angle;

  }

  /**
   * Обновление фона (если нужно)
   * @param {number} deltaTime - время между кадрами
   */
  update(deltaTime) {
    // Можно добавить эффекты, например легкое вращение или параллакс
    /*
    if (this.mesh) {
       this.mesh.rotation.y += 0.1 * deltaTime;
    }
    */
  }

  /**
   * Изменение прозрачности фона
   * @param {number} opacity - новое значение прозрачности (0-1)
   */
  setOpacity(opacity) {
    if (this.mesh && this.mesh.material) {
      this.mesh.material.opacity = Math.max(0, Math.min(1, opacity));
    }
  }

  /**
   * Изменение позиции фона (для эффекта параллакса)
   * @param {number} x - смещение по X
   * @param {number} y - смещение по Y
   */
  setPosition(x, y) {
    if (this.mesh) {
      this.mesh.position.x = x;
      this.mesh.position.y = y;
    }
  }

  /**
   * Смена фонового изображения
   * @param {string} newImagePath - путь к новому изображению
   */
  changeImage(newImagePath) {
    textureLoader.loadTexture(
      newImagePath,
      (texture) => {
        this.texture = texture;
        if (this.mesh && this.mesh.material) {
          this.mesh.material.map = texture;
          this.mesh.material.needsUpdate = true;
        }
      },
      (error) => {
        console.warn('Не удалось загрузить новое фоновое изображение:', error);
      }
    );
  }

  /**
   * Освобождение ресурсов
   */
  dispose() {
    if (this.mesh) {
      this.game.scene.remove(this.mesh);
      
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(m => m.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
    }
    
    if (this.texture) {
      this.texture.dispose();
    }
  }
}