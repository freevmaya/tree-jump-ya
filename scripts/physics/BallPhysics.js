// scripts/physics/BallPhysics.js

class BallPhysics {
  constructor(ball, tree, gameState) {
    this.ball = ball;
    this.tree = tree;
    this.gameState = gameState;
    this.gravity = GRAVITY;
    this.bounceSpeed = BOUNCE_SPEED;
    this.maxVelocity = MAX_VELOCITY;
    this.baseBounceY = - this.tree.half_height;
    this.victoryY = this.tree.half_height;
    this.dirt = false;
  }
  
  nextBallPosition(dt) {
    let angle = this.tree.mesh.rotation.y;
    let a_v = this.ball.getPosition().add(this.ball.velocity.clone().multiplyScalar(dt));
    let v = this.tree.getPointOnTrunk(a_v.y, this.ball.k_distance, angle + Math.PI / 2);

    v.applyMatrix4(new THREE.Matrix4().makeRotationY(angle));
    return new THREE.Vector3(a_v.x, v.y, v.z);
  }
  
  update(dt) {
    
    if (!this.dirt) {
      // Применение гравитации
      this.ball.applyGravity(dt, this.gravity);
      this.ball.limitVelocity(this.maxVelocity);
      let np = this.nextBallPosition(dt);
      
      // Проверка достижения вершины дерева (победа)
      if (!this.checkVictory()) {
      
        // Проверка столкновения с базовой платформой
        if (this.checkBasePlatformCollision(np))
          this.ball.setPosition(np.x, np.y, np.z);
        
        // Проверка столкновения с платформами на дереве
        if (!this.checkTreePlatformsCollision(np)) 
          this.ball.setPosition(np.x, np.y, np.z);
      }

    } else {
      let pos = this.dirt.object.getPosition().add(this.dirt.offset);
      this.ball.setPosition(pos.x, pos.y, pos.z);
    }
  }
  
  checkVictory() {
    const ballPos = this.ball.getPosition();
    
    // Если шарик достиг высоты вершины дерева (с учетом радиуса)
    if (ballPos.y + BALL_RADIUS >= this.victoryY) {
      console.log("ПОБЕДА! Шарик достиг вершины дерева!");
      this.gameState.victory();
      return true;
    }
    return false;
  }
  
  checkBasePlatformCollision(newBallPos) {
    const ballPos = this.ball.getPosition();
    const direct  = newBallPos.y - ballPos.y;
    if (ballPos.y - BALL_RADIUS + direct <= this.baseBounceY) {
      this.ball.bounce(this.baseBounceY, this.bounceSpeed);
      return true;
    }
    return false;
  }
  
  checkTreePlatformsCollision(newBallPos) {

    const ballPos   = this.ball.getPosition();
    const platforms = this.tree.getPlatforms();
    const direct    = newBallPos.y - ballPos.y;
    
    // Обновление мировой матрицы дерева
    this.tree.mesh.updateMatrixWorld(true);
    
    for (const platformData of platforms) {
      const worldPos = new THREE.Vector3();
      platformData.mesh.getWorldPosition(worldPos);
      const platformWorldY  = worldPos.y;
      const platformTop     = platformWorldY + PLATFORM_HEIGHT / 2;
      const platformBottom  = platformWorldY - PLATFORM_HEIGHT / 2;
      
      const dx = ballPos.x - worldPos.x;
      const dz = ballPos.z - worldPos.z;
      const distance2D = Math.sqrt(dx * dx + dz * dz);
      const ballTop = ballPos.y + BALL_RADIUS;
      const ballBtm = ballPos.y - BALL_RADIUS;
      
      // Проверка горизонтального расстояния
      if (distance2D < platformData.radius + BALL_RADIUS) {
        
        // Проверка столкновения с ВЕРХНЕЙ поверхностью платформы
        if (ballBtm + direct <= platformTop &&
            ballBtm > platformTop &&
            direct < 0) {
          
          // Если это платформа-убийца - заканчиваем игру (ТОЛЬКО ПРИ УДАРЕ СВЕРХУ)
          if (platformData.checkDamage()) {
            console.log("Платформа-убийца! Игра окончена (удар сверху).");
            eventBus.emit('dirt');
            this.dirt = {
              object: platformData,
              offset: ballPos.sub(platformData.getPosition())
            };
            setTimeout(()=>{
              this.gameState.gameOver();
            }, 1000);
            return true;
          }
          
          // Обычный отскок от верхней поверхности (летим вверх)
          this.ball.bounce(platformTop, this.bounceSpeed);
          return true;
        }
        
        // Проверка столкновения с НИЖНЕЙ поверхностью платформы
        if (ballTop + direct >= platformBottom && 
            ballTop < platformBottom &&
            direct > 0) {
          
          // Обычный отскок от нижней поверхности - летим ВНИЗ (отрицательная скорость)
          this.ball.bounce(platformBottom, -this.bounceSpeed);
          return true;
        }
      }
    }
    return false;
  }
  
  setGravity(gravity) {
    this.gravity = gravity;
  }
  
  setBounceSpeed(speed) {
    this.bounceSpeed = speed;
  }
}