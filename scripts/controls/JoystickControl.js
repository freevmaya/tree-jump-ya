// scripts/controls/JoystickControl.js

class JoystickControl {
  constructor(tree, joystickPad, joystickThumb) {
    this.tree = tree;
    this.joystickPad = joystickPad;
    this.joystickThumb = joystickThumb;
    
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.normalizedDirect = 0;
    this.rotationSpeed = ROTATION_SPEED * 200; // Увеличим скорость для джойстика
    this.inertia = INERTIA;
    
    // Границы движения джойстика
    this.padRect = null;
    this.thumbWidth = 40; // Должно соответствовать CSS
    this.maxOffset = 0;
    
    // Привязываем методы
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    
    this.init();
  }
  
  init() {
    // Получаем размеры площадки джойстика
    this.updateDimensions();
    
    // События мыши
    this.joystickPad.on('mousedown', this.onMouseDown);
    $(window).on('mousemove', this.onMouseMove);
    $(window).on('mouseup', this.onMouseUp);
    
    // События тачскрина
    this.joystickPad.on('touchstart', this.onTouchStart, { passive: false });
    $(window).on('touchmove', this.onTouchMove, { passive: false });
    $(window).on('touchend', this.onTouchEnd);
    $(window).on('touchcancel', this.onTouchEnd);
    
    // Обновляем размеры при изменении окна
    $(window).on('resize', () => this.updateDimensions());
  }
  
  destroy() {
    this.joystickPad.off('mousedown', this.onMouseDown);
    $(window).off('mousemove', this.onMouseMove);
    $(window).off('mouseup', this.onMouseUp);
    
    this.joystickPad.off('touchstart', this.onTouchStart);
    $(window).off('touchmove', this.onTouchMove);
    $(window).off('touchend', this.onTouchEnd);
    $(window).off('touchcancel', this.onTouchEnd);
    
    $(window).off('resize', this.updateDimensions);
  }
  
  updateDimensions() {
    this.padRect = this.joystickPad[0].getBoundingClientRect();
    this.maxOffset = (this.padRect.width - this.thumbWidth) / 2;
  }
  
  onMouseDown(e) {
    e.preventDefault();
    this.startDrag(e.clientX);
  }
  
  onMouseMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.drag(e.clientX);
  }
  
  onMouseUp() {
    this.stopDrag();
  }
  
  onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.startDrag(e.touches[0].clientX);
    }
  }
  
  onTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    this.drag(e.touches[0].clientX);
  }
  
  onTouchEnd(e) {
    e.preventDefault();
    this.stopDrag();
  }
  
  startDrag(clientX) {
    this.isDragging = true;
    this.updateDimensions();
    this.startX = clientX;
    this.currentX = clientX;
    
    // Анимация нажатия
    this.joystickThumb.style.transform = 'translate(-50%, -50%) scale(0.9)';
    this.joystickThumb.style.background = 'rgba(255, 255, 255, 1)';
  }
  
  drag(currentX) {
    if (!this.padRect) return;
    
    this.deltaDirect = currentX - this.currentX;
    this.currentX = currentX;
    
    // Вычисляем смещение относительно центра площадки
    const padCenterX = this.padRect.left + this.padRect.width / 2;
    let offsetX = currentX - padCenterX;
    
    // Ограничиваем смещение
    offsetX = Math.max(-this.maxOffset, Math.min(this.maxOffset, offsetX));
    
    // Обновляем положение ползунка
    this.joystickThumb.style.left = `calc(50% + ${offsetX}px)`;
    
    // Вычисляем скорость вращения на основе смещения
    this.normalizedDirect = (this.deltaDirect / this.maxOffset) * this.rotationSpeed; // от -1 до 1
  }
  
  stopDrag() {
    this.isDragging = false;
    
    // Возвращаем ползунок в центр с анимацией
    this.joystickThumb.style.transition = 'left 0.3s ease-out, transform 0.2s, background 0.2s';
    this.joystickThumb.style.left = '50%';
    this.joystickThumb.style.transform = 'translate(-50%, -50%)';
    this.joystickThumb.style.background = 'rgba(255, 255, 255, 0.9)';
    
    // Убираем transition после анимации
    setTimeout(() => {
      if (!this.isDragging) {
        this.joystickThumb.style.transition = '';
      }
    }, 300);

    this.normalizedDirect = 0;
  }
  
  reset() {
    this.stopDrag();
    this.normalizedDirect = 0;
    this.isDragging = false;
  }
  
  update() {
    // Здесь можно добавить инерцию, если нужно
    // Пока просто применяем текущую скорость
    this.normalizedDirect *= this.inertia;

    this.tree.rotate(this.normalizedDirect);
  }
}