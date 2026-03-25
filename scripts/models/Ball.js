// scripts/models/Ball.js

class Ball {
  constructor(scene, tree) {

    this.tree = tree;
    this.scene = scene;
    this.mesh = null;
    this.velocity = new THREE.Vector3(0, BOUNCE_SPEED, 0);
    this.lastBounceY = -this.tree.half_height;
    this.bounceCount = 0;
    this.k_distance = 1.3;

    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: BALL_COLOR,
      metalness: 0.3,
      roughness: 0.4,
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, BALL_RADIUS - this.tree.half_height, this.tree.maxRadius * this.k_distance);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    this.scene.add(this.mesh);
  }
  
  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }
  
  getPosition() {
    return this.mesh.position.clone();
  }
  
  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.mesh.getWorldPosition(pos);
    return pos;
  }
  
  setVelocity(y) {
    this.velocity.y = y;
  }
  
  getVelocity() {
    return this.velocity.clone();
  }
  
  applyGravity(dt, gravity) {
    this.velocity.y += gravity * dt;
  }
  
  limitVelocity(maxVelocity) {
    this.velocity.y = Math.max(-maxVelocity, Math.min(maxVelocity, this.velocity.y));
  }
  
  bounce(bounceY, bounceSpeed) {
    this.mesh.position.y = bounceY + BALL_RADIUS * Math.sign(bounceSpeed);
    this.velocity.y = bounceSpeed;
    if (bounceSpeed > 0)
      this.lastBounceY = bounceY;

    this.bounceCount++;
    eventBus.emit('bounce');
    return this.bounceCount;
  }
  
  getLastBounceY() {
    return this.lastBounceY;
  }
  
  getBounceCount() {
    return this.bounceCount;
  }
  
  resetBounceCount() {
    this.bounceCount = 0;
  }

  dispose() {
    this.scene.remove(this.mesh);
  }
}