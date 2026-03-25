// scripts/models/Ground.js

class Ground {
  constructor(scene, tree) {
    this.scene = scene;
    this.tree = tree;
    this.mesh = null;
    this.texture = null;
    
    // Параметры плоскости грунта
    this.size = BASE_PLATFORM_SIZE; // Размер плоскости
    this.segments = 8; // Сегментация для лучшего отображения текстуры
    this.position_y = -this.tree.half_height;
  }
  
  init(texturePath = GROUND_IMAGE_PATH) {
    // Создаем геометрию плоскости
    const geometry = new THREE.CircleGeometry(this.size, this.segments);
    
    // Создаем материал
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 0.1
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Позиционируем плоскость на уровне начала ствола
    // Получаем точку на стволе у основания
    const basePoint = this.tree.getPointOnTrunk(this.position_y, 0, 0);
    this.mesh.position.set(basePoint.x, this.position_y, basePoint.z);
    
    // Поворачиваем плоскость горизонтально (по умолчанию CircleGeometry смотрит вверх по Y)
    // THREE.CircleGeometry уже ориентирован правильно (нормаль по +Y)
    this.mesh.rotation.x = Math.PI * 0.5;
    this.mesh.rotation.z = 0;
    
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    
    // Загружаем текстуру
    this.loadTexture(texturePath);
    
    this.scene.add(this.mesh);
    
    console.log('Грунт создан на уровне:', this.position_y);
    
    return this.mesh;
  }
  
  loadTexture(texturePath) {
    textureLoader.loadTexture(
      texturePath,
      (texture) => {
        // Настраиваем повторение текстуры для большей площади
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8); // Повторяем текстуру 8x8 раз
        
        this.mesh.material.map = texture;
        this.mesh.material.needsUpdate = true;
        this.texture = texture;
        
        console.log('Текстура грунта загружена');
      },
      (error) => {
        console.warn('Не удалось загрузить текстуру грунта:', error);
        // Создаем запасную текстуру
        this.createFallbackTexture();
      },
      {
        repeat: { x: 8, y: 8 },
        anisotropy: 16
      }
    );
  }
  
  createFallbackTexture() {
    // Создаем простую текстуру-заглушку для грунта
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Базовый цвет грунта
    ctx.fillStyle = '#5d8c6b';
    ctx.fillRect(0, 0, 256, 256);
    
    // Добавляем текстуру - точки и линии
    ctx.fillStyle = '#3a6b47';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = Math.random() * 3 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Добавляем линии-травинки
    ctx.strokeStyle = '#2d5a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 256;
      const yStart = Math.random() * 256;
      const yEnd = yStart + Math.random() * 20;
      
      ctx.beginPath();
      ctx.moveTo(x, yStart);
      ctx.lineTo(x + (Math.random() - 0.5) * 10, yEnd);
      ctx.stroke();
    }
    
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    fallbackTexture.wrapS = THREE.RepeatWrapping;
    fallbackTexture.wrapT = THREE.RepeatWrapping;
    fallbackTexture.repeat.set(8, 8);
    
    this.mesh.material.map = fallbackTexture;
    this.mesh.material.needsUpdate = true;
    this.texture = fallbackTexture;
  }
  
  setOpacity(opacity) {
    if (this.mesh && this.mesh.material) {
      this.mesh.material.opacity = opacity;
      this.mesh.material.transparent = opacity < 1.0;
    }
  }
  
  setSize(size) {
    this.size = size;
    if (this.mesh) {
      this.scene.remove(this.mesh);
      const geometry = new THREE.CircleGeometry(size, this.segments);
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
      this.scene.add(this.mesh);
    }
  }
  
  update(deltaTime) {
    // Можно добавить анимацию текстурных координат для эффекта движения
    // if (this.texture) {
    //   this.texture.offset.x += deltaTime * 0.01;
    //   this.texture.offset.y += deltaTime * 0.01;
    // }
  }
  
  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      
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