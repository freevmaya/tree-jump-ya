// scripts/models/Crystal.js

class Crystal {
  constructor(scene, tree) {
    this.scene = scene;
    this.tree = tree;
    this.group = null;
    this.crystalParts = [];
    this.sparkles = [];
    this.time = 0;
    
    // Цвета для кристалла
    this.colors = {
      primary: 0x44aaff, // Голубой
      secondary: 0xaa44ff, // Фиолетовый
      core: 0xffffff, // Белый
      glow: 0x88ccff // Свечение
    };
  }
  
  init() {
    this.group = new THREE.Group();
    
    // Получаем позицию на самом верху дерева
    const treeTopY = this.tree.options.TREE_HEIGHT / 2; // Верхняя точка дерева (так как дерево центрировано по Y=0)
    
    // Устанавливаем позицию кристалла на вершине дерева
    this.group.position.set(0, treeTopY + 0.8, 0); // Немного выше вершины для лучшей видимости
    
    // Создаем основной кристалл (октаэдр - два конуса вместе)
    this.createMainCrystal();
    
    // Создаем маленькие парящие кристаллы вокруг
    this.createFloatingCrystals();
    
    // Создаем свечение
    this.createGlow();
    
    // Создаем партиклы (искорки)
    this.createSparkles();
    
    // Добавляем светящийся столб света под кристаллом
    this.createLightBeam();
    
    this.scene.add(this.group);
    
    return this.group;
  }
  
  createMainCrystal() {
    // Создаем верхнюю часть кристалла (конус) - увеличенный размер
    const topGeometry = new THREE.ConeGeometry(0.4, 0.7, 8);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.primary,
      emissive: 0x224466,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.35;
    top.castShadow = true;
    top.receiveShadow = true;
    this.group.add(top);
    this.crystalParts.push(top);
    
    // Создаем нижнюю часть кристалла (перевернутый конус)
    const bottomGeometry = new THREE.ConeGeometry(0.4, 0.7, 8);
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.secondary,
      emissive: 0x442266,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9
    });
    const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottom.position.y = -0.35;
    bottom.rotation.x = Math.PI;
    bottom.castShadow = true;
    bottom.receiveShadow = true;
    this.group.add(bottom);
    this.crystalParts.push(bottom);
    
    // Создаем центральное ядро (сфера) - увеличенное
    const coreGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.core,
      emissive: 0x88aaff,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.3
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.y = 0;
    core.castShadow = true;
    core.receiveShadow = true;
    this.group.add(core);
    this.crystalParts.push(core);
    
    // Добавляем грани (для эффекта огранки)
    this.addFacets();
  }
  
  addFacets() {
    // Создаем тонкие пластины для имитации граней
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      
      const facetGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.5);
      const facetMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaddff,
        emissive: 0x335577,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      
      const facet = new THREE.Mesh(facetGeometry, facetMaterial);
      facet.position.set(Math.sin(angle) * 0.3, 0, Math.cos(angle) * 0.3);
      facet.rotation.y = angle;
      facet.castShadow = true;
      facet.receiveShadow = true;
      
      this.group.add(facet);
      this.crystalParts.push(facet);
    }
  }
  
  createFloatingCrystals() {
    const count = 8;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.8;
      const heightOffset = Math.sin(angle * 3) * 0.3;
      
      // Создаем маленький кристаллик
      const crystalGeom = new THREE.OctahedronGeometry(0.15, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? this.colors.primary : this.colors.secondary,
        emissive: 0x224466,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8
      });
      
      const crystal = new THREE.Mesh(crystalGeom, crystalMat);
      crystal.position.set(
        Math.cos(angle) * radius,
        heightOffset,
        Math.sin(angle) * radius
      );
      crystal.castShadow = true;
      crystal.receiveShadow = true;
      
      this.group.add(crystal);
      this.crystalParts.push(crystal);
    }
  }
  
  createGlow() {
    // Создаем светящийся ореол вокруг кристалла
    const glowGeom = new THREE.SphereGeometry(0.7, 16, 16);
    const glowMat = new THREE.MeshStandardMaterial({
      color: this.colors.glow,
      emissive: 0x224466,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.y = 0;
    glow.castShadow = false;
    glow.receiveShadow = false;
    
    this.group.add(glow);
    
    // Добавляем лучи света (тонкие цилиндры)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const beamGeom = new THREE.CylinderGeometry(0.03, 0.12, 1.2, 6);
      const beamMat = new THREE.MeshStandardMaterial({
        color: 0xaaddff,
        emissive: 0x4488cc,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.2
      });
      
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.set(Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6);
      beam.rotation.z = Math.PI / 2;
      beam.rotation.y = angle;
      beam.castShadow = false;
      beam.receiveShadow = false;
      
      this.group.add(beam);
    }
  }
  
  createSparkles() {
    // Создаем партиклы (искорки) вокруг кристалла
    const sparkleCount = 30;
    const sparkleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkleCount * 3);
    const colors = new Float32Array(sparkleCount * 3);
    
    for (let i = 0; i < sparkleCount; i++) {
      // Случайная позиция в сфере вокруг кристалла
      const radius = 1.0 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      
      positions[i * 3] = Math.sin(theta) * Math.cos(phi) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * radius * 0.5 + 0.3; // Смещение вверх
      positions[i * 3 + 2] = Math.cos(theta) * radius;
      
      // Случайный цвет (от голубого до фиолетового)
      const color = new THREE.Color().setHSL(
        0.6 + Math.random() * 0.2, // оттенок
        0.9, // насыщенность
        0.6 + Math.random() * 0.4 // яркость
      );
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sparkleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const sparkleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    this.group.add(sparkles);
    this.sparkles.push(sparkles);
  }
  
  createLightBeam() {
    // Создаем световой столб под кристаллом
    const beamGroup = new THREE.Group();
    
    // Основной луч (полупрозрачный цилиндр)
    const beamGeom = new THREE.CylinderGeometry(0.2, 0.5, 2.0, 8);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x88aaff,
      emissive: 0x224466,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.y = -1.5;
    beam.castShadow = false;
    beam.receiveShadow = false;
    beamGroup.add(beam);
    
    // Добавляем маленькие частицы в луче
    const particleCount = 10;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      particlePositions[i * 3] = (Math.random() - 0.5) * 0.4;
      particlePositions[i * 3 + 1] = -0.5 - t * 1.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMat = new THREE.PointsMaterial({
      color: 0xaaddff,
      size: 0.1,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeom, particleMat);
    beamGroup.add(particles);
    
    this.group.add(beamGroup);
    this.crystalParts.push(beamGroup);
  }
  
  update(deltaTime) {
    this.time += deltaTime;
    
    // Вращаем кристалл
    this.group.rotation.y += deltaTime * 0.3;
    
    // Анимируем парящие кристаллы
    this.crystalParts.forEach((part, index) => {
      if (part.isMesh && index > 2 && index < 10) { // Только маленькие кристаллы вокруг
        part.position.y += Math.sin(this.time * 2 + index) * 0.01;
      }
    });
    
    // Пульсирующее свечение
    this.crystalParts.forEach(part => {
      if (part.material && part.material.emissive) {
        if (part === this.crystalParts[2]) { // Центральное ядро
          part.material.emissiveIntensity = 0.8 + Math.sin(this.time * 5) * 0.3;
        } else if (part.material.emissiveIntensity) {
          part.material.emissiveIntensity = 0.3 + Math.sin(this.time * 3) * 0.15;
        }
      }
    });
    
    // Анимация искорок
    this.sparkles.forEach(sparkles => {
      sparkles.rotation.y += deltaTime * 0.05;
      sparkles.rotation.x += deltaTime * 0.02;
    });
  }
  
  dispose() {
    if (this.group) {
      this.group.removeFromParent();
      
      // Очищаем ресурсы
      this.crystalParts.forEach(part => {
        if (part.geometry) part.geometry.dispose();
        if (part.material) {
          if (Array.isArray(part.material)) {
            part.material.forEach(m => m.dispose());
          } else {
            part.material.dispose();
          }
        }
      });
      
      this.sparkles.forEach(sparkles => {
        if (sparkles.geometry) sparkles.geometry.dispose();
        if (sparkles.material) sparkles.material.dispose();
      });
    }
  }
}