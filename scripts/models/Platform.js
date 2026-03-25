// scripts/models/Platform.js

class Platform {
  constructor(tree, theta, y) {
    this.tree = tree;
    this.theta = theta;
    this.y = y;
    this.group = null;
    this.mesh = null;
    this.texture = null;

    this.radius = this.tree.options.PLATFORM_RADIUS.MIN + Math.random() * (this.tree.options.PLATFORM_RADIUS.MAX - this.tree.options.PLATFORM_RADIUS.MIN);

    this.createGeometry();
    this.createMesh();
  }

  createGeometry() {
    this.platformGeometry = new THREE.CylinderGeometry(this.radius, this.radius * 0.8, PLATFORM_HEIGHT, 8);
    textureLoader.rotateUV(this.platformGeometry, Math.PI * 0.5);
  }

  createMesh() {
    // Выбираем цвет в зависимости от типа платформы
    const platformColor = PLATFORM_NORMAL_COLOR;
    
    this.material = new THREE.MeshStandardMaterial({
      color: platformColor,
      metalness: 0.0,
      roughness: 0.9,
      emissive: new THREE.Color(0x000000),
    });

    let distance = 0.9;
    this.group = new THREE.Group();
    this.group.position.set(distance * Math.cos(this.theta), this.y, distance * Math.sin(this.theta));
    this.group.rotation.y = -this.theta;
    
    // Создание площадки
    this.mesh = new THREE.Mesh(this.platformGeometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);
    
    // Загружаем текстуру для платформы
    this.loadTexture();
    
    this.tree.mesh.add(this.group);
  }

  texturePath() {
    return this.tree.options.PLATFORM_TEXTURE_PATH;
  }
  
  loadTexture() {
    
    textureLoader.loadTexture(
      this.texturePath(),
      (texture) => {
        // Настраиваем текстуру для платформы
        texture.repeat.set(2, 1); // Повторяем текстуру 2 раза по X
        
        // Применяем текстуру к материалу
        this.material.map = texture;
        this.material.color.setHex(0xffffff); // Сбрасываем цвет на белый для корректного отображения текстуры
        this.material.needsUpdate = true;
        this.texture = texture;
      },
      (error) => {
        console.warn(`Не удалось загрузить текстуру для платформы: ${this.texturePath()}`);
      },
      {
        repeat: { x: 2, y: 1 },
        anisotropy: 8
      }
    );
  }

  getPosition() {
    const worldPosition = new THREE.Vector3();
    this.group.getWorldPosition(worldPosition);
    return worldPosition;
  }
  
  updateTexture(texture) {

    this.material.map = texture;
    this.material.color.setHex(0xffffff);
    this.material.needsUpdate = true;

  }
  
  /**
   * Обновляет параметры текстуры платформы
   * @param {Object} options - параметры текстуры
   */
  updateTextureOptions(options = {}) {
    if (this.texture) {
      if (options.repeat) {
        this.texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
      }
      if (options.offset) {
        this.texture.offset.set(options.offset.x || 0, options.offset.y || 0);
      }
      this.texture.needsUpdate = true;
    }
  }
  
  /**
   * Удаляет платформу и освобождает ресурсы
   */
  dispose() {
    if (this.group) {
      this.group.removeFromParent();
    }
    // Материалы и геометрии удаляются автоматически сборщиком мусора
  }

  update(dt) {

  }

  checkDamage() {
    return false;
  }
}