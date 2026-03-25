// scripts/models/RotatePlatform.js

class KillerPlatform extends RotatePlatform {

  createMesh() {
    // Выбираем цвет в зависимости от типа платформы
    const platformColor = PLATFORM_KILLER_COLOR;
    
    this.material = new THREE.MeshStandardMaterial({
      color: platformColor,
      metalness: 0.3,
      roughness: 0.4,
      emissive: new THREE.Color(0x330000)
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
    this.addSpikes();
    
    this.tree.mesh.add(this.group);
  }

  texturePath() {
    return this.tree.options.KILLER_PLATFORM_TEXTURE_PATH;
  }
  
  addSpikes() {
    const spikeCount = 6; // Количество шипов
    const spikeRadius = this.radius * 0.5; // Радиус размещения шипов
    this.spikeHeight = 0.2; // Высота шипа
    
    // Создаем материал для шипов (более яркий красный)
    const spikeMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF5555,
      emissive: 0x220000,
      metalness: 0.1,
      roughness: 0.3
    });

    this.spikeGroup = new THREE.Group();

    for (let i = 0; i < spikeCount; i++) {
      // Угол для размещения шипа по кругу
      const angle = (i / spikeCount) * Math.PI * 2;
      
      // Создаем конус (пирамидку) для шипа
      const spikeGeometry = new THREE.ConeGeometry(this.radius * 0.1, this.spikeHeight, 4);
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      
      // Позиционируем шип на краю платформы
      spike.position.set(
        Math.cos(angle) * spikeRadius,
        PLATFORM_HEIGHT / 2 + this.spikeHeight / 2,
        Math.sin(angle) * spikeRadius
      );
      
      spike.castShadow = true;
      spike.receiveShadow = true;
      
      this.spikeGroup.add(spike);
    }

    this.group.add(this.spikeGroup);

    this.srikesIdx = 0;
    this.srikeSpeed = this.tree.options.KILLER_SPEED + (Math.random() - 0.5) * 0.4;
    this.srikeState = 0;
    this.bladeState = false;
  }

  ballNearest() {
    let distance = window.game.ball.getPosition().distanceTo(this.getPosition());
    return distance < 2;
  }

  checkDamage() {
    return this.srikeState > -0.3;
  }

  update(dt) {
    super.update(dt);
    this.srikesIdx -= Math.PI * this.srikeSpeed * dt;
    this.srikeState = (sawToSine(this.srikesIdx, 0.1) - 1);
    this.spikeGroup.position.set(0, Math.max(this.srikeState, -1) * this.spikeHeight, 0);

    if (this.ballNearest() && this.checkDamage()) {
      if (!this.bladeState) {
        this.bladeState = true;
        eventBus.emit('blade');
      }
    } else this.bladeState = false;
  }
}