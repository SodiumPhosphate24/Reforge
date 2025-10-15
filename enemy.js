
class Enemy {
  constructor(type) {
    this.x = 100 + pX;
    this.y = 100 + pY;
    this.aggro = false;
    this.vx = 0; // velocity x
    this.vy = 0; // velocity y
    this.aggroRange = 500;
    this.deaggroRange = 700; // de-aggro at longer distance
    
    if (type == "zombie") {
      this.type = "zombie";
      this.health = 3;
      this.speed = 2;
      this.acceleration = 0.15; // how quickly it changes direction
    }
  }

  update() {
    const distToPlayer = distance(this.x, this.y, pX + 600, pY + 340);
    
    // Aggro/De-aggro logic
    if (!this.aggro && distToPlayer < this.aggroRange) {
      this.aggro = true;
    } else if (this.aggro && distToPlayer > this.deaggroRange) {
      this.aggro = false;
      // Gradually slow down when de-aggroing
      this.vx *= 0.9;
      this.vy *= 0.9;
    }
    
    if (this.aggro) {
      // Calculate desired direction
      this.angle = atan2(pY + 340 - this.y, pX + 600 - this.x);
      
      // Target velocity based on desired direction
      const targetVx = this.speed * cos(this.angle);
      const targetVy = this.speed * sin(this.angle);
      
      // Smoothly interpolate current velocity toward target (creates smooth turning)
      this.vx = lerp(this.vx, targetVx, this.acceleration);
      this.vy = lerp(this.vy, targetVy, this.acceleration);
      
      // Store previous position for collision resolution
      const prevX = this.x;
      const prevY = this.y;
      
      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;
      
      // Check for wall collisions and resolve
      if (this.checkWallCollision()) {
        // Try just reverting X
        this.x = prevX;
        if (this.checkWallCollision()) {
          // Still colliding, revert Y too
          this.x += this.vx;
          this.y = prevY;
          if (this.checkWallCollision()) {
            // Still colliding, revert both
            this.x = prevX;
            this.y = prevY;
            // Reduce velocity when hitting walls
            this.vx *= 0.5;
            this.vy *= 0.5;
          } else {
            this.vx = 0; // X caused collision
          }
        } else {
          this.vy = 0; // Y caused collision
        }
      }
    } else {
      // Apply friction when not aggroed
      this.vx *= 0.95;
      this.vy *= 0.95;
      
      // Move with remaining velocity
      if (Math.abs(this.vx) > 0.01 || Math.abs(this.vy) > 0.01) {
        const prevX = this.x;
        const prevY = this.y;
        
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.checkWallCollision()) {
          this.x = prevX;
          this.y = prevY;
          this.vx = 0;
          this.vy = 0;
        }
      }
    }
  }

  checkWallCollision() {
    const w = 20, h = 20; // enemy size
    const left = this.x;
    const top = this.y;
    const right = left + w;
    const bottom = top + h;

    const leftTile = Math.floor(left / 50);
    const rightTile = Math.floor(right / 50);
    const topTile = Math.floor(top / 50);
    const bottomTile = Math.floor(bottom / 50);

    for (let row = topTile; row <= bottomTile; row++) {
      for (let col = leftTile; col <= rightTile; col++) {
        if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row].length) continue;

        const cell = gameWorld[row][col];

        if (cell && 'layers' in cell) {
          for (let L = 0; L < 3; L++) {
            const t = cell.layers[L];
            if (!t) continue;
            if (tileWalls[t.type] == 1) {
              const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
              if (left < tR && right > tL && top < tB && bottom > tT) return true;
            }
          }
        } else if (cell) { // legacy
          if (tileWalls[cell.type] == 1) {
            const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
            if (left < tR && right > tL && top < tB && bottom > tT) return true;
          }
        }
      }
    }
    return false;
  }

  takeDamage(dmg) {
    this.health -= dmg;
  }

  isDead() {
    return this.health <= 0;
  }

  hitsPlayer() {
    return checkCollision(this.x, this.y, pX + 600, pY + 340, 20, 20, 35, 25);
  }
}

function drawEnemies() {
  let count = 0;
  for (let i = 0; i < enemies.length; i++) {
    enemies[count].update();
    
    // Visual indicator for aggro state
    if (enemies[count].aggro) {
      fill(255, 0, 0);
    } else {
      fill(150, 0, 0);
    }
    
    rect(enemies[count].x, enemies[count].y, 20, 20);
    
    if (enemies[count].hitsPlayer()) {
      if (enemies[count].type == "zombie") {
        players[activePlayer].health -= 2;
        healthPoints = players[activePlayer].health;
      }
    }
    if (enemies[count].isDead()) {
      enemies.splice(count, 1);
      count--;
    }
    count++;
  }
}
