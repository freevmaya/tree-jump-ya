
class SparkEffect {
  constructor(options = {}) {
    // Настройки по умолчанию
    this.container = options.container || document.body;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.radius = options.radius || 100;
    this.count = options.count || 50;
    this.gravity = options.gravity || 0.1;
    this.lifetime = options.lifetime || 2000; // мс
    this.colors = options.colors || ['#ffaa00', '#ff6600', '#ff3300', '#ffff00', '#ff9900'];
    this.sizes = options.sizes || [1, 3];
    this.speeds = options.speeds || [2, 8];
    this.baseRadius = options.baseRadius || 0;
    
    this.sparks = [];
    this.animationId = null;
    this.startTime = Date.now();
    
    this.init();
  }
  
  init() {
    // Создаем искры
    for (let i = 0; i < this.count; i++) {
      this.createSpark();
    }
    
    // Запускаем анимацию
    this.animate();
  }
  
  createSpark() {
    // Случайный угол
    const angle = Math.random() * Math.PI * 2;
    
    // Случайная скорость (от 2 до 8)
    const speed = this.speeds[0] + Math.random() * (this.speeds[1] - this.speeds[0]);
    
    // Начальная позиция - в центре
    let offset = MathUtils.getOffset(this.baseRadius, angle);
    const startX = this.x + offset.x;
    const startY = this.y + offset.y;
    
    // Направление
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 2; // Немного вверх

    const size = this.sizes[0] + Math.random() * (this.sizes[1] - this.sizes[0]);
    
    // Продолжительность жизни (индивидуальная)
    const sparkLifetime = this.lifetime * (0.5 + Math.random() * 0.8);
    
    // Цвет
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    // Создаем DOM элемент
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.backgroundColor = color;
    element.style.borderRadius = '50%';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '9999';
    element.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    element.style.left = `${startX}px`;
    element.style.top = `${startY}px`;
    
    this.container.appendChild(element);
    
    // Сохраняем данные искры
    this.sparks.push({
      element,
      x: startX,
      y: startY,
      vx,
      vy,
      size,
      lifetime: sparkLifetime,
      birthTime: Date.now(),
      color
    });
  }
  
  animate() {
    const currentTime = Date.now();
    const elapsed = currentTime - this.startTime;
    
    // Обновляем позиции всех искр
    this.sparks.forEach(spark => {
      const sparkAge = currentTime - spark.birthTime;
      
      // Если искра прожила больше своей жизни - удаляем
      if (sparkAge > spark.lifetime) {
        if (spark.element.parentNode) {
          spark.element.remove();
        }
        return;
      }
      
      // Прогресс жизни (0-1)
      const lifeProgress = sparkAge / spark.lifetime;
      
      // Гравитация
      spark.vy += this.gravity;
      
      // Обновляем позицию
      spark.x += spark.vx;
      spark.y += spark.vy;
      
      // Затухание (становится прозрачнее)
      const opacity = Math.max(0, 1 - lifeProgress * 1.2);
      
      // Применяем стили
      spark.element.style.left = `${spark.x}px`;
      spark.element.style.top = `${spark.y}px`;
      spark.element.style.opacity = opacity;
      spark.element.style.transform = `scale(${1 - lifeProgress * 0.5})`;
    });
    
    // Удаляем мертвые искры из массива
    this.sparks = this.sparks.filter(spark => {
      const sparkAge = currentTime - spark.birthTime;
      return sparkAge <= spark.lifetime;
    });
    
    // Продолжаем анимацию, пока есть искры
    if (this.sparks.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }
  
  // Метод для остановки эффекта
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Удаляем все элементы
    this.sparks.forEach(spark => {
      if (spark.element.parentNode) {
        spark.element.remove();
      }
    });
    
    this.sparks = [];
  }
}