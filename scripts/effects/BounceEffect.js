// scripts/effects/BounceEffect.js

class BounceEffect {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.particles = [];
    this.active = true;
    
    // Настройки по умолчанию
    this.options = {
      particleCount: 8,              // Количество частиц
      particleSize: 0.15,            // Размер частиц
      color: 0xffaa44,               // Цвет (HEX)
      speed: 0.2,                     // Начальная скорость
      gravity: -2.0,                  // Гравитация (отрицательная = вниз)
      spread: 1.0,                    // Разброс частиц
      fadeSpeed: 2.0,                 // Скорость исчезновения
      lifetime: 1.0,                   // Время жизни частиц (сек)
      blending: THREE.AdditiveBlending, // Режим смешивания
      ...options
    };
  }
  
  /**
   * Создает эффект частиц в заданной позиции
   * @param {THREE.Vector3} position - позиция центра эффекта
   * @param {Object} overrideOptions - параметры для этого конкретного эффекта
   */
  createBounceEffect(position, overrideOptions = {}) {
    // Объединяем настройки
    const options = {
      ...this.options,
      ...overrideOptions
    };
    
    const count = options.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    // Создаем массив частиц для этого эффекта
    const effectParticles = [];
    
    for (let i = 0; i < count; i++) {
      // Случайное направление в конусе
      const angle = Math.random() * Math.PI * 2;
      const heightAngle = (Math.random() - 0.5) * Math.PI * 0.5; // -45..45 градусов
      
      // Базовое направление
      const dirX = Math.cos(angle) * Math.cos(heightAngle);
      const dirY = Math.sin(heightAngle) + 0.3; // Добавляем вертикальную составляющую вверх
      const dirZ = Math.sin(angle) * Math.cos(heightAngle);
      
      // Нормализуем и применяем скорость и разброс
      const dir = new THREE.Vector3(dirX, dirY, dirZ).normalize();
      
      // Вариация скорости
      const speedVariation = 0.5 + Math.random() * 1.5;
      const velocity = dir.multiplyScalar(options.speed * speedVariation * options.spread);
      
      // Начальная позиция с небольшим случайным смещением
      const pos = position.clone();
      pos.x += (Math.random() - 0.5) * 0.2;
      pos.y += (Math.random() - 0.5) * 0.2;
      pos.z += (Math.random() - 0.5) * 0.2;
      
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      
      // Вариация цвета
      let color;
      if (Array.isArray(options.color)) {
        // Если передан массив цветов, выбираем случайный
        const colorIndex = Math.floor(Math.random() * options.color.length);
        color = new THREE.Color(options.color[colorIndex]);
      } else {
        color = new THREE.Color(options.color);
      }
      
      // Добавляем небольшую вариацию цвета
      color.offsetHSL(
        (Math.random() - 0.5) * 0.1,  // оттенок
        (Math.random() - 0.5) * 0.2,  // насыщенность
        (Math.random() - 0.5) * 0.2   // яркость
      );
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Вариация размера
      sizes[i] = options.particleSize * (0.7 + Math.random() * 0.6);
      
      effectParticles.push({
        velocity: velocity,
        life: 1.0,
        maxLife: options.lifetime,
        size: sizes[i],
        color: color.clone(),
        initialY: pos.y
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Создаем текстуру частицы (мягкий круг)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, 32, 32);
    
    // Рисуем градиентный круг
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();
    
    const particleTexture = new THREE.CanvasTexture(canvas);
    
    // Материал с поддержкой разных размеров
    const material = new THREE.PointsMaterial({
      size: 1, // Будет масштабироваться через шейдер
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      blending: options.blending,
      depthWrite: false,
      sizeAttenuation: true
    });
    
    const points = new THREE.Points(geometry, material);
    points.userData = {
      particles: effectParticles,
      material: material,
      geometry: geometry,
      options: options,
      createdAt: performance.now() / 1000
    };
    
    // Добавляем кастомный шейдер для индивидуальных размеров (опционально)
    this.setupCustomSizeShader(points);
    
    this.scene.add(points);
    
    // Возвращаем для возможного дальнейшего использования
    return points;
  }
  
  /**
   * Настраивает шейдер для поддержки индивидуальных размеров частиц
   */
  setupCustomSizeShader(points) {
    if (!points.material) return;
    
    // Сохраняем оригинальный материал
    const originalMaterial = points.material;
    
    // Создаем шейдерный материал
    points.material = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: originalMaterial.map },
        sizeAttenuation: { value: true }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * ${points.userData.options.particleSize * 10};
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          vec4 texColor = texture2D(pointTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor, texColor.a);
        }
      `,
      transparent: true,
      blending: points.userData.options.blending,
      depthWrite: false
    });
    
    // Копируем атрибуты
    points.material.map = originalMaterial.map;
  }
  
  /**
   * Обновляет все активные эффекты
   * @param {number} deltaTime - время между кадрами
   */
  update(deltaTime) {
    const now = performance.now() / 1000;
    
    // Проходим по всем дочерним объектам сцены
    const toRemove = [];
    
    this.scene.children.forEach(child => {
      if (child.isPoints && child.userData && child.userData.particles) {
        const positions = child.geometry.attributes.position.array;
        const colors = child.geometry.attributes.color?.array;
        const sizes = child.geometry.attributes.size?.array;
        const particles = child.userData.particles;
        const options = child.userData.options;
        
        let allDead = true;
        let anyAlive = false;
        
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          
          // Уменьшаем время жизни
          p.life -= deltaTime * options.fadeSpeed;
          
          if (p.life > 0) {
            allDead = false;
            anyAlive = true;
            
            // Обновляем позицию с учетом гравитации
            positions[i * 3] += p.velocity.x * deltaTime * 20;
            positions[i * 3 + 1] += p.velocity.y * deltaTime * 20;
            positions[i * 3 + 2] += p.velocity.z * deltaTime * 20;
            
            // Применяем гравитацию к вертикальной скорости
            p.velocity.y += options.gravity * deltaTime;
            
            // Замедляем горизонтальное движение (сопротивление воздуха)
            p.velocity.x *= 0.99;
            p.velocity.z *= 0.99;
            
            // Масштабируем цвет на основе оставшегося времени жизни
            if (colors) {
              const alpha = p.life;
              // Здесь можно добавить изменение цвета со временем
            }
          } else {
            // Перемещаем мертвые частицы далеко за пределы видимости
            positions[i * 3 + 1] = -1000;
          }
        }
        
        // Обновляем прозрачность материала на основе максимального времени жизни
        if (anyAlive && child.material) {
          // Находим максимальное время жизни среди частиц
          const maxLife = Math.max(...particles.map(p => p.life));
          child.material.opacity = maxLife;
        }
        
        // Помечаем атрибуты для обновления
        child.geometry.attributes.position.needsUpdate = true;
        
        // Если все частицы мертвы или прошло слишком много времени, помечаем на удаление
        const age = now - (child.userData.createdAt || now);
        if (allDead || age > 5) { // Максимум 5 секунд жизни эффекта
          toRemove.push(child);
        }
      }
    });
    
    // Удаляем мертвые эффекты
    toRemove.forEach(child => {
      this.scene.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
  
  /**
   * Очищает все эффекты
   */
  clear() {
    const toRemove = [];
    
    this.scene.children.forEach(child => {
      if (child.isPoints && child.userData && child.userData.particles) {
        toRemove.push(child);
      }
    });
    
    toRemove.forEach(child => {
      this.scene.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
  
  /**
   * Изменяет глобальные настройки
   */
  setOptions(options) {
    this.options = {
      ...this.options,
      ...options
    };
  }
}