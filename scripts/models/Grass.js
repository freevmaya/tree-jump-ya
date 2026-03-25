// scripts/models/Grass.js

class Grass {
  constructor(scene, tree) {
    this.scene = scene;
    this.tree = tree;
    this.grassBlades = [];
    this.group = null;
    this.texture = null;
    
    // Параметры травы
    this.Count = window.game.testResult < 25 ? 50 : 10; // Количество плоскостей травы
    this.Radius = MAIN_RADIUS * 1.2; // Радиус размещения травы
    this.Height = 1.2; // Высота травы
    this.Width = 1.2; // Ширина травы
    this.Density = 3;
  }
  
  init(texturePath = GRASS_IMAGE_PATH) {
    this.group = new THREE.Group();
    
    // Позиция у подножия дерева (чуть выше основания)
    const baseY = 0.1 - this.tree.half_height;
    this.group.position.y = baseY;
    
    // Загружаем текстуру травы
    this.loadTexture(texturePath);
    
    // Создаем плоскости травы по кругу
    this.createGrassCircle();
    
    // Добавляем несколько дополнительных травинок для объема
    this.createExtraGrass();
    
    this.scene.add(this.group);
    
    return this.group;
  }
  
  loadTexture(texturePath) {
    textureLoader.loadTexture(
      texturePath,
      (texture) => {
        this.texture = texture;


        // Обновляем текстуру у всех созданных травинок
        this.updateGrassTextures();
      },
      (error) => {
        console.warn('Не удалось загрузить текстуру травы:', error);
        this.createFallbackTexture();
      },
      {
        repeat: { x: 1, y: 1 },
        anisotropy: 8,
        colorSpace: THREE.SRGBColorSpace
      }
    );
  }
  
  createFallbackTexture() {
    // Создаем простую текстуру-заглушку для травы
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Прозрачный фон
    ctx.clearRect(0, 0, 64, 64);
    
    // Рисуем травинку
    ctx.fillStyle = '#3a7734';
    ctx.beginPath();
    ctx.moveTo(32, 64);
    ctx.lineTo(20, 20);
    ctx.lineTo(44, 20);
    ctx.closePath();
    ctx.fill();
    
    // Добавляем детали
    ctx.fillStyle = '#2d5a27';
    ctx.beginPath();
    ctx.moveTo(32, 50);
    ctx.lineTo(26, 30);
    ctx.lineTo(38, 30);
    ctx.closePath();
    ctx.fill();
    
    // Стебель
    ctx.fillStyle = '#5d8c4b';
    ctx.fillRect(30, 50, 4, 14);
    
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    fallbackTexture.colorSpace = THREE.SRGBColorSpace;
    
    this.texture = fallbackTexture;
    this.updateGrassTextures();
  }
  
  updateGrassTextures() {
    if (!this.texture) return;
    
    this.grassBlades.forEach(blade => {
      if (blade.material) {
        blade.material.map = this.texture;
        blade.material.needsUpdate = true;
      }
    });
  }
  
  createGrassCircle() {
    const bladeCount = this.Count;
    
    for (let i = 0; i < bladeCount; i++) {
      // Равномерное распределение по кругу
      const angle = (i / bladeCount) * Math.PI * 2;
      
      // Добавляем небольшую случайность в угол
      const randomAngleOffset = (Math.random() - 0.5) * 0.3;
      const finalAngle = angle + randomAngleOffset;
      
      // Радиус с небольшими вариациями
      const radius = this.Radius + Math.random() * this.Density;
      
      // Позиция на круге
      const x = Math.cos(finalAngle) * radius;
      const z = Math.sin(finalAngle) * radius;
      
      // Получаем точку на изогнутом стволе для коррекции позиции
      const trunkPoint = this.tree.getPointOnTrunk(0.2 - this.tree.half_height, 0, 0);
      
      // Создаем группу травинок в этой точке (может быть несколько плоскостей)
      const bladesInCluster = 2 + Math.floor(Math.random() * 3); // 2-4 травинки в кластере
      
      for (let j = 0; j < bladesInCluster; j++) {
        // Разные углы поворота для каждой травинки
        const rotY = 0;//finalAngle + (Math.random() - 0.5) * 0.8;
        const rotX = 0;//(Math.random() - 0.5) * 0.2;
        const rotZ = 0;//(Math.random() - 0.5) * 0.2;
        
        // Случайный масштаб
        const scale = 0.7 + Math.random() * 0.6;
        
        // Небольшое смещение внутри кластера
        const offsetX = (Math.random() - 0.5) * 0.3;
        const offsetZ = (Math.random() - 0.5) * 0.3;
        
        this.createBlade(
          x + trunkPoint.x + offsetX,
          z + trunkPoint.z + offsetZ,
          rotY,
          rotX,
          rotZ,
          scale
        );
      }
    }
  }
  
  createExtraGrass() {
    // Добавляем несколько травинок случайно для большей естественности
    const extraCount = 12;
    
    for (let i = 0; i < extraCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = this.Radius * (0.6 + Math.random() * 0.6);
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const trunkPoint = this.tree.getPointOnTrunk(0.2 - this.tree.half_height, 0, 0);
      
      const rotY = angle + (Math.random() - 0.5) * 0.5;
      const rotX = (Math.random() - 0.5) * 0.3;
      const rotZ = (Math.random() - 0.5) * 0.3;
      const scale = 0.5 + Math.random() * 0.8;
      
      this.createBlade(
        x + trunkPoint.x,
        z + trunkPoint.z,
        rotY,
        rotX,
        rotZ,
        scale
      );
    }
  }
  
  createBlade(x, z, rotY, rotX, rotZ, scale) {
    // Создаем геометрию плоскости
    const geometry = new THREE.PlaneGeometry(this.Width, this.Height);
    
    // Создаем материал
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: true,
      emissive: 0x000000,
      roughness: 0.8,
      metalness: 0.0
    });
    
    const blade = new THREE.Mesh(geometry, material);
    
    // Позиция
    blade.position.set(x, 0, z);
    
    // Поворот - сначала вокруг Y (чтобы смотреть наружу от центра),
    // затем небольшие случайные повороты
    blade.rotation.y = rotY;
    blade.rotation.x = rotX;
    blade.rotation.z = rotZ;
    
    // Масштаб
    blade.scale.set(scale, scale, scale);
    
    // Отключаем тени для травы (чтобы не нагружать рендеринг)
    blade.castShadow = false;
    blade.receiveShadow = false;
    
    this.group.add(blade);
    this.grassBlades.push(blade);
    
    return blade;
  }
  
  setOpacity(opacity) {
    this.grassBlades.forEach(blade => {
      if (blade.material) {
        blade.material.opacity = opacity;
        blade.material.transparent = opacity < 1.0;
      }
    });
  }
  
  update(deltaTime) {
    this.grassBlades.forEach((blade, index) => {
      const time = performance.now() / 800;
      blade.rotation.z += Math.sin(time * 2 + (blade.position.x + Math.random()) * 0.3) * 0.003;
    });
  }
  
  dispose() {
    if (this.group) {
      this.group.removeFromParent();
      
      this.grassBlades.forEach(blade => {
        if (blade.geometry) blade.geometry.dispose();
        if (blade.material) {
          if (Array.isArray(blade.material)) {
            blade.material.forEach(m => m.dispose());
          } else {
            blade.material.dispose();
          }
        }
      });
      
      this.grassBlades = [];
    }
    
    if (this.texture) {
      this.texture.dispose();
    }
  }
}