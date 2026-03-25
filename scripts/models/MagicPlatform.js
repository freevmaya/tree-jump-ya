// scripts/models/RotatePlatform.js

class MagicPlatform extends RotatePlatform {

  createGeometry() {
    this.size = 0.5;
    this.platformGeometry = new THREE.PlaneGeometry(this.size, this.size);
    //textureLoader.rotateUV(this.platformGeometry, Math.PI * 0.5);
  }

  texturePath() {
    return 'textures/spot.png';
  }

  createMesh() {
    
    this.material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      transparent: true, 
      alphaTest: 0.1,
      emissive: 0xFFFFFF,
    });

    let distance = 0.9;
    this.group = new THREE.Group();
    this.group.position.set(distance * Math.cos(this.theta), this.y, distance * Math.sin(this.theta));
    this.group.rotation.y = -this.theta;

    this.mesh = new THREE.Mesh(this.platformGeometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);
    
    // Загружаем текстуру для платформы
    this.loadTexture();
    
    this.tree.mesh.add(this.group);
  }
  
  loadTexture() {
    
    textureLoader.loadTexture(
      this.texturePath(),
      (texture) => {
        // Настраиваем текстуру для платформы
        texture.repeat.set(1, 1);
        this.material.map = texture;
        this.material.color.setHex(0xffffff);
        this.material.needsUpdate = true;
        this.texture = texture;
      },
      (error) => {
        console.warn(`Не удалось загрузить текстуру для платформы: ${this.texturePath()}`);
      },
      {
        repeat: { x: 1, y: 1 },
        anisotropy: 8
      }
    );
  }

  update(dt) {
    super.update(dt);
    this.mesh.rotation.y = -(this.group.rotation.y + this.tree.getRotationY());
  }
}