// scripts/models/Tree.js

class Tree {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.trunkMesh = null; // Основной меш ствола
    this.platforms = [];
    this.branches = []; // Массив для хранения веток
    this.barkTexture = null;
    this.targetRotation = 0;
    this.minRadius = MAIN_RADIUS * 0.5;
    this.maxRadius = MAIN_RADIUS;
    this.points = [];
    this.options = {};
    
    // Параметры изгиба ствола
    this.curveStrength = TRUNK_CURVE_STRENGTH * (0.7 + Math.random() * 0.6); // Случайная сила изгиба
    this.curveDirection = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      0,
      (Math.random() - 0.5) * 2
    ).normalize(); // Направление изгиба
    this.segments = TRUNK_SEGMENTS;
  }
  
  init(options) {
    this.options = options;

    this.half_height = this.options.TREE_HEIGHT / 2;
    this.platform_count = Math.floor(this.options.TREE_HEIGHT / this.options.PLATFORM_STEP);

    // Создаем группу для ствола, если нужно
    this.mesh = new THREE.Group();
    
    // Создаем изогнутый ствол
    this.createCurvedTrunk();
    
    // Создание платформ
    this.createPlatforms();
    
    // Создание веток под платформами
    this.createBranchesUnderPlatforms();
    
    this.scene.add(this.mesh);
    return this.mesh;
  }
  
  createCurvedTrunk() {
    // Создаем контрольные точки для изогнутого ствола
    this.points = [];
    const segments = this.segments;
    
    // Вычисляем вертикальное смещение для каждой точки
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // Параметр от 0 до 1
      
      // Вертикальная координата (от низа до верха)
      const y = -this.half_height + t * this.options.TREE_HEIGHT;
      
      // Прогрессия изгиба (сильнее всего в середине, меньше у концов)
      const curveProgress = Math.sin(t * Math.PI * 2); // Плавное нарастание и затухание
      
      // Применяем изгиб в заданном направлении
      const curveOffset = this.curveStrength * curveProgress;
      const xy_influnce = Math.random();
      
      const x = this.curveDirection.x * curveOffset * xy_influnce;
      const z = this.curveDirection.z * curveOffset * (1 - xy_influnce);
      
      this.points.push(new THREE.Vector3(x, y, z));
    }
    
    // Создаем кривую по точкам
    const curve = new THREE.CatmullRomCurve3(this.points);
    
    // Функция для изменения радиуса вдоль ствола (плавное увеличение к низу)
    const radiusFunction = (t) => {
      // t от 0 до 1, где 0 - низ, 1 - верх
      // Утолщение к низу (обратная зависимость)
      return this.maxRadius * (1 - t) + this.minRadius * t;
    };
    
    // Создаем геометрию трубки с переменным радиусом
    const trunkGeometry = this.createVariableRadiusTube(
      curve, 
      radiusFunction, 
      Math.floor(this.options.TREE_HEIGHT * 6), // Вертикальных сегментов
      window.game.testResult < 25 ? 8 : 16  // Радиальных сегментов
    );
    
    // Создаем материал
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: TREE_COLOR,
      metalness: 0.0,
      roughness: 0.9,
      envMapIntensity: 0,
    });
    
    this.trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    this.trunkMesh.castShadow = true;
    this.trunkMesh.receiveShadow = true;
    
    // Загрузка текстуры
    this.loadTexture(trunkMaterial);
    
    this.mesh.add(this.trunkMesh);
  }
  
  createVariableRadiusTube(curve, radiusFunction, tubularSegments = 64, radialSegments = 8) {
    // Создаем геометрию трубки с переменным радиусом
    const frames = curve.computeFrenetFrames(tubularSegments, false);
    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    
    const generateSegment = (i) => {
      const t = i / tubularSegments;
      const radius = radiusFunction(t);
      
      const point = curve.getPoint(t);
      const tangent = frames.tangents[i];
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];
      
      for (let j = 0; j <= radialSegments; j++) {
        const u = (j / radialSegments) * Math.PI * 2;
        const cosU = Math.cos(u);
        const sinU = Math.sin(u);
        
        const radialVector = normal.clone().multiplyScalar(cosU).add(binormal.clone().multiplyScalar(sinU));
        const vertex = point.clone().add(radialVector.multiplyScalar(radius));
        
        vertices.push(vertex.x, vertex.y, vertex.z);
        
        // Нормаль
        normals.push(radialVector.x, radialVector.y, radialVector.z);
        
        // UV координаты
        uvs.push(i / tubularSegments, j / radialSegments);
      }
    };
    
    // Генерируем вершины для всех сегментов
    for (let i = 0; i <= tubularSegments; i++) {
      generateSegment(i);
    }
    
    // Генерируем индексы для треугольников
    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = i * (radialSegments + 1) + j + 1;
        const c = (i + 1) * (radialSegments + 1) + j;
        const d = (i + 1) * (radialSegments + 1) + j + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    textureLoader.rotateUV(geometry, Math.PI * 0.5);
    
    return geometry;
  }
  
  loadTexture(material) {
    // Используем утилиту для загрузки текстуры
    textureLoader.loadTexture(
      this.options.BARK_TEXTURE_PATH,
      (texture) => {
        // Настройки текстуры для дерева
        texture.repeat.set(this.options.BARK_TEXTURE_REPEAT.x, this.options.TREE_HEIGHT * this.options.BARK_TEXTURE_REPEAT.y);
        material.map = texture;

        material.color.setHex(0xffffff);

        textureLoader.loadTexture(
          this.options.BARK_NORMAL_PATH, // Карта нормалей (обычно сине-фиолетовая)
          (normalTexture) => {
            material.normalMap = normalTexture;
            material.normalScale = new THREE.Vector2(0.5, 0.5); // Интенсивность по X и Y
            material.needsUpdate = true;
          },
          (error) => {
            console.warn('Не удалось загрузить normal map');
          }
        );
        material.needsUpdate = true;
        this.barkTexture = texture;
      },
      (error) => {
        console.warn('Текстура не загружена: ' + this.options.BARK_TEXTURE_PATH);
        // Создаем текстуру-заглушку
        const fallbackTexture = textureLoader.createFallbackTexture(0xA67C52);
        material.map = fallbackTexture;
        material.needsUpdate = true;
      },
      {
        repeat: { x: 2, y: 6 },
        rotation: Math.PI,
        anisotropy: 16
      }
    );
  }

  calcDistance(y) {
    let k = (this.options.TREE_HEIGHT - (this.half_height + y)) / this.options.TREE_HEIGHT; 
    return this.minRadius * (1 - k) + this.maxRadius * k;
  }
  
  getPointOnTrunk(y, distance_k = 0, theta = 0) {
    // Возвращает мировые координаты точки на изогнутом стволе на заданной высоте
    if (!this.trunkMesh || !this.points || this.points.length === 0) {
      return new THREE.Vector3(0, y, 0);
    }
    
    // Находим параметр t (от 0 до 1) на основе высоты y
    const minY = -this.half_height;
    const maxY = this.half_height;
    
    // Нормализуем y в диапазон [0, 1] относительно высоты дерева
    let t = (y - minY) / (maxY - minY);
    t = Math.max(0, Math.min(1, t)); // Ограничиваем значениями от 0 до 1
    
    // Находим индекс в массиве точек
    const pointCount = this.points.length;
    const exactIndex = t * (pointCount - 1);
    const index1 = Math.floor(exactIndex);
    const index2 = Math.min(index1 + 1, pointCount - 1);
    const blend = exactIndex - index1;
    
    // Получаем две ближайшие точки
    const point1 = this.points[index1];
    const point2 = this.points[index2];
    
    // Интерполируем между точками для получения плавного перехода
    let resultX = point1.x * (1 - blend) + point2.x * blend;
    let resultY = y; // Используем исходную высоту y для вертикальной координаты
    let resultZ = point1.z * (1 - blend) + point2.z * blend;

    if (distance_k != 0) {
      let distance = this.calcDistance(y) * distance_k;
      resultX += distance * Math.cos(theta);
      resultZ += distance * Math.sin(theta);
    }
    
    return new THREE.Vector3(resultX, resultY, resultZ);
  }
  
  createPlatforms() {
    // Очищаем массив платформ перед созданием новых
    this.platforms = [];

    const rotatePlatform = randomArray(this.platform_count, this.options.PLATFORM_ROTATE_DENSITY);
    const killerPlatform = randomArray(this.platform_count - 2, this.options.KILLER_DENSITY);

    killerPlatform.unshift(false, false); // Самые две первых платформа не убийца
    
    let base_y = this.half_height / (this.platform_count + 1);
    let previousTheta = null;
    const MIN_ANGLE_DIFF = Math.PI / 3;
    let direct = Math.random() > 0.5 ? 1 : -1;
    let direct_steps = 0;

    for (let i = 0; i < this.platform_count; i++) {
      const y = base_y + (i / this.platform_count * 2 - 1) * (this.half_height - base_y);
      
      let theta;

      if (this.options.RADIAL_PLATFORM_STEP && (previousTheta != null) && 
         (direct_steps < this.options.RADIAL_PLATFORM_STEP[2]) &&
          (Math.random() <= this.options.RADIAL_PLATFORM_STEP[0])) {

        theta = previousTheta + (Math.PI * this.options.RADIAL_PLATFORM_STEP[1] * direct);   
        direct_steps++;
      } else {
        
        direct_steps = 0;
        direct = -direct;

        if (previousTheta == null) {
          do {
            theta = (Math.random() - 0.5) * Math.PI * 2;
          } while ((theta > 0.7) && (theta < 2.2));
          
        } else {
          let attempts = 0;
          const maxAttempts = 100;
          
          do {
            theta = (Math.random() - 0.5) * Math.PI * 2;
            attempts++;
            
            if (attempts > maxAttempts) {

              theta = previousTheta + (Math.random() > 0.5 ? 1 : -1) * MIN_ANGLE_DIFF;

              while (theta > Math.PI) theta -= Math.PI * 2;
              while (theta < -Math.PI) theta += Math.PI * 2;
              break;
            }
          } while (Math.abs(theta - previousTheta) < MIN_ANGLE_DIFF);
        }
      }


      let platform;

      if (killerPlatform[i])
        platform = new KillerPlatform(this, theta, y, false, this.options.PLATFORM_SPEED * (Math.random() > 0.5 ? 1 : -1));
      else if (rotatePlatform[i])
        platform = new RotatePlatform(this, theta, y, false, this.options.PLATFORM_SPEED * (Math.random() > 0.5 ? 1 : -1));
      else {
        /*
        if (Math.random() > 0.5)
          platform = new MagicPlatform(this, theta, y, false, 0);
        else*/
          platform = new Platform(this, theta, y, false);
      }
      platform.group.position.copy(this.getPointOnTrunk(y, PLATFORM_DISTANCE, theta));
      
      this.platforms.push(platform);
      
      previousTheta = theta;
    }
  }
  
  createBranchesUnderPlatforms() {
    // Очищаем массив веток
    this.branches = [];
    
    if (this.platforms.length === 0) return;
    
    // Рассчитываем количество веток на основе плотности
    const targetBranchCount = Math.floor(this.platform_count * this.options.BRANCH_DENSITY);
    console.log(`Создание веток под платформами: ${targetBranchCount} шт. (плотность ${this.options.BRANCH_DENSITY})`);
    
    // Сортируем платформы по высоте
    const sortedPlatforms = [...this.platforms].sort((a, b) => a.y - b.y);
    
    // Выбираем случайные платформы для размещения веток под ними
    const selectedPlatformIndices = new Set();
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (selectedPlatformIndices.size < targetBranchCount && attempts < maxAttempts) {
      attempts++;
      
      // Выбираем случайную платформу
      const platformIndex = Math.floor(Math.random() * sortedPlatforms.length);
      
      // Проверяем, не выбрана ли уже эта платформа
      if (!selectedPlatformIndices.has(platformIndex)) {
        const platform = sortedPlatforms[platformIndex];
        
        // Проверяем, что под платформой достаточно места для ветки
        const platformY = platform.y;
        
        // Проверяем расстояние до других веток
        let tooClose = false;
        for (const branch of this.branches) {
          if (Math.abs(branch.y - platformY) < 0.8) {
            tooClose = true;
            break;
          }
        }
        /*
        // Также проверяем расстояние до других платформ (чтобы ветка не мешала)
        for (const otherPlatform of sortedPlatforms) {
          if (otherPlatform !== platform && Math.abs(otherPlatform.y - platformY) < 0.6) {
            tooClose = true;
            break;
          }
        }*/
        
        if (!tooClose) {
          // Добавляем платформу в выбранные
          selectedPlatformIndices.add(platformIndex);
        }
      }
    }
    
    // Создаем ветки под выбранными платформами
    selectedPlatformIndices.forEach(platformIndex => {
      const platform = sortedPlatforms[platformIndex];
      
      // Высота ветки - чуть ниже платформы
      const branchY = platform.y - PLATFORM_HEIGHT / 2 - 0.5;   
      
      // Определяем масштаб ветки (чем выше, тем меньше)
      const heightFactor = (this.half_height - branchY) / this.options.TREE_HEIGHT;
      const scaleFactor = 0.6 + heightFactor * 0.8; // Ветки внизу крупнее
      
      // Создаем ветку
      const branch = new Branch(this.options, this.mesh, platform.theta + Math.PI * 0.1, branchY, scaleFactor);
      branch.create(0);
      
      // Корректируем позицию ветки с учетом изгиба ствола
      if (branch.group)
        branch.group.position.copy(this.getPointOnTrunk(branchY, 0.7, platform.theta));
      
      // Сохраняем данные ветки
      this.branches.push(branch);
    });
    
    console.log(`Создано веток под платформами: ${this.branches.length} из ${targetBranchCount} запланированных`);
  }
  
  getPlatforms() {
    return this.platforms;
  }
  
  getBranches() {
    return this.branches;
  }
  
  rotate(yDelta) {
    if (this.mesh) {
      this.targetRotation += yDelta;
    }
  }
  
  setRotation(y) {
    if (this.mesh) {
      this.mesh.rotation.y = y;
    }
  }
  
  getRotationY() {
    return this.mesh ? this.mesh.rotation.y : 0;
  }

  getDelta() {
    return this.targetRotation - this.mesh.rotation.y;
  }

  update(dt) {
    this.setRotation(this.mesh.rotation.y + this.getDelta() * ROTATION_SMOOTH);
    this.branches.forEach(branch => branch.update(dt));
    this.platforms.forEach(platform => platform.update(dt));
  }
}