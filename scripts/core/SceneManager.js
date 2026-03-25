// scripts/core/SceneManager.js
class SceneManager {
  constructor() {
    this.scene = null;
  }
  
  init() {
    this.scene = new THREE.Scene();
    return this.scene;
  }
  
  getScene() {
    return this.scene;
  }
  
  add(object) {
    this.scene.add(object);
  }
  
  remove(object) {
    this.scene.remove(object);
  }
}