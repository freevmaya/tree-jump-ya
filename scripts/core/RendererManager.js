// scripts/core/RendererManager.js

class RendererManager {
  constructor(container) {
    this.container = container;
    this.renderer = null;
    this.width = container.width();
    this.height = container.height();
  }
  
  init() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.append(this.renderer.domElement);
    return this.renderer;
  }
  
  resize() {
    let game_container = $('#game-container');
    this.width = game_container.width();
    this.height = game_container.height();
    this.renderer.setSize(this.width, this.height);
  }
  
  render(scene, camera) {
    this.renderer.render(scene, camera);
  }
  
  getRenderer() {
    return this.renderer;
  }
  
  getAspectRatio() {
    return this.width / this.height;
  }
}