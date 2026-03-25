// scripts/models/Skybox.js

class Skybox {
  constructor(scene) {
    this.scene = scene;
    this.skybox = null;
  }

  init() {
    // Загружаем 6 текстур для каждой стороны куба
    // Предполагается, что текстуры находятся в папке textures/skybox/
    const textures = [
      'textures/skybox/right.jpg',   // право
      'textures/skybox/left.jpg',    // лево
      'textures/skybox/top.jpg',     // верх
      'textures/skybox/bottom.jpg',  // низ
      'textures/skybox/front.jpg',   // перед
      'textures/skybox/back.jpg'     // зад
    ];

    // Используем CubeTextureLoader для загрузки всех текстур
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    
    cubeTextureLoader.load(
      textures,
      (cubeTexture) => {
        console.log('Skybox текстуры успешно загружены');
        cubeTexture.colorSpace = THREE.SRGBColorSpace;
        this.scene.background = cubeTexture;
      },
      undefined,
      (error) => {
        console.error('Ошибка загрузки skybox текстур:', error);
        // Если текстуры не загрузились, создаем запасной вариант
        this.createFallbackSkybox();
      }
    );
    
    return this.scene.background;
  }
  
  // Создаем запасной вариант skybox на случай отсутствия текстур
  createFallbackSkybox() {
    console.log('Создание запасного skybox с градиентом');
    
    // Создаем градиентный фон с помощью Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Рисуем градиент
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a237e');   // Темно-синий сверху
    gradient.addColorStop(0.5, '#3949ab'); // Синий
    gradient.addColorStop(1, '#5c6bc0');   // Светло-синий снизу
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Добавляем звезды
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.globalAlpha = Math.random() * 0.8 + 0.2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Создаем 6 материалов с одинаковой текстурой для всех сторон
    const materials = [];
    for (let i = 0; i < 6; i++) {
      materials.push(new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.BackSide,
        emissive: 0x112233,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0
      }));
    }

    // Создаем куб для skybox
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    this.skybox = new THREE.Mesh(geometry, materials);
    this.skybox.position.set(0, 0, 0);
    
    // Отключаем тени для skybox
    this.skybox.castShadow = false;
    this.skybox.receiveShadow = false;
    
    this.scene.add(this.skybox);
  }
  
  // Альтернативный метод - создание skybox через отдельные плоскости
  // (используется если background не работает должным образом)
  createMeshSkybox() {
    // Загружаем текстуры для каждой стороны
    const loader = new THREE.TextureLoader();
    
    const textures = [
      loader.load('textures/skybox/right.jpg'),
      loader.load('textures/skybox/left.jpg'),
      loader.load('textures/skybox/top.jpg'),
      loader.load('textures/skybox/bottom.jpg'),
      loader.load('textures/skybox/front.jpg'),
      loader.load('textures/skybox/back.jpg')
    ];

    // Создаем материалы для каждой стороны
    const materials = textures.map(texture => {
      return new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.BackSide,
        emissive: 0x333333,
        emissiveIntensity: 0.2
      });
    });

    // Создаем куб
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    this.skybox = new THREE.Mesh(geometry, materials);
    this.skybox.position.set(0, 0, 0);
    
    this.scene.add(this.skybox);
  }
  
  // Метод для обновления (если нужно)
  update(deltaTime) {
    // Можно добавить вращение skybox для эффекта
    // if (this.skybox) {
    //   this.skybox.rotation.y += 0.0001 * deltaTime;
    // }
  }
  
  // Метод для смены времени суток (изменение цвета фона)
  setTimeOfDay(time) { // time от 0 до 1 (0 - день, 1 - ночь)
    if (this.scene.background && this.scene.background.isColor) {
      // Интерполяция между дневным и ночным небом
      const dayColor = new THREE.Color(0x87CEEB);
      const nightColor = new THREE.Color(0x0a0a2a);
      const mixedColor = dayColor.clone().lerp(nightColor, time);
      this.scene.background = mixedColor;
    }
  }
}