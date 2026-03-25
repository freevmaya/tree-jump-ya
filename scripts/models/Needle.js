// scripts/models/Needle.js

class Needle {
  constructor(parentGroup, position, rotation, scale = 1.0) {
    this.parentGroup = parentGroup;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.mesh = null;
    this.texture = null;
    
    // Случайный оттенок зеленого
    this.colorVariation = 0.8 + Math.random() * NEEDLE_COLOR_VARIATION;
  }
  
  create(texturePath) {
    // Создаем геометрию плоскости
    const geometry = new THREE.PlaneGeometry(NEEDLE_SIZE, NEEDLE_SIZE);
    
    // Создаем материал с поддержкой прозрачности
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, this.colorVariation, 0), // Зеленый с вариацией
      emissive: 0x000000,
      roughness: 0.6,
      metalness: 0.0,
      side: THREE.DoubleSide, // Двустороннее отображение для лучшего вида
      transparent: true,
      alphaTest: 0.1 // Отсекаем пиксели с альфа < 0.1
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Устанавливаем позицию
    this.mesh.position.copy(this.position);
    
    // Применяем поворот
    this.mesh.rotation.x = this.rotation.x || 0;
    this.mesh.rotation.y = this.rotation.y || 0;
    this.mesh.rotation.z = this.rotation.z || 0;
    
    // Применяем масштаб
    this.mesh.scale.set(this.scale, this.scale, this.scale);
    
    // Отключаем тени для хвои (чтобы не нагружать рендеринг)
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    
    // Загружаем текстуру с альфа-каналом
    this.loadTexture(texturePath, material);
    
    // Добавляем в группу
    this.parentGroup.add(this.mesh);
    
    return this.mesh;
  }
  
  loadTexture(path, material) {
    if (!path) return;
    
    textureLoader.loadTexture(
      path,
      (texture) => {
        material.map = texture;
        material.needsUpdate = true;
        this.texture = texture;
      },
      (error) => {
        console.warn('Не удалось загрузить текстуру хвои:', error);
        // Создаем заглушку в виде зеленого кружка
        this.createFallbackTexture(material);
      },
      {
        repeat: { x: 1, y: 1 },
        anisotropy: 8,
        colorSpace: THREE.SRGBColorSpace
      }
    );
  }
  
  createFallbackTexture(material) {
    // Создаем простую текстуру-заглушку в виде кружка
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Рисуем зеленый круг с прозрачным фоном
    ctx.clearRect(0, 0, 64, 64);
    
    // Основной круг
    ctx.fillStyle = `rgba(40, ${Math.floor(150 * this.colorVariation)}, 40, 0.9)`;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // Добавляем текстуру "иголок"
    ctx.strokeStyle = `rgba(20, 80, 20, 0.8)`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x1 = 32 + Math.cos(angle) * 15;
      const y1 = 32 + Math.sin(angle) * 15;
      const x2 = 32 + Math.cos(angle) * 28;
      const y2 = 32 + Math.sin(angle) * 28;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    fallbackTexture.colorSpace = THREE.SRGBColorSpace;
    
    material.map = fallbackTexture;
    material.needsUpdate = true;
    this.texture = fallbackTexture;
  }
  
  setOpacity(opacity) {
    if (this.mesh && this.mesh.material) {
      this.mesh.material.opacity = opacity;
      this.mesh.material.transparent = opacity < 1.0;
    }
  }
  
  dispose() {
    if (this.mesh) {
      this.parentGroup.remove(this.mesh);
      
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