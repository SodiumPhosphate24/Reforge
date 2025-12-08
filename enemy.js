
class Enemy {
  constructor(type, x, y) {
    this.x = x;
    this.y = y;
    this.aggro = false;
    this.vx = 0; // velocity x
    this.vy = 0; // velocity y
    this.aggroRange = 500;
    this.deaggroRange = 700; // de-aggro at longer distance
    
    if (type == "zombie") {
      this.type = "zombie";
      this.health = 3;
      this.maxHealth = 3;
      this.speed = 2;
      this.acceleration = 0.15; // how quickly it changes direction
      this.image = BadGuy;
      this.width = 48;
      this.height = 56;
      this.lootPool = [["consumable", "common cartridge", 1], ["material", "common wheel", 1]];
    }
    if (type == "greg") {
      this.type = "greg";
      this.health = 100;
      this.maxHealth = 100;
      this.speed = 1;
      this.acceleration = 0.15; // how quickly it changes direction
      this.image = Greg;
      this.width = 28;
      this.height = 54;
      this.lootPool = [["consumable", "common cartridge", 1], ["material", "common wheel", 1]];
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
      // Simple direct movement toward player using atan2
      const targetX = pX + 600;
      const targetY = pY + 340;
      
      // Calculate angle to player
      this.angle = atan2(targetY - (this.y + 10), targetX - (this.x + 10));
      
      // Target velocity based on desired direction
      const targetVx = this.speed * cos(this.angle);
      const targetVy = this.speed * sin(this.angle);
      
      // Smoothly interpolate current velocity toward target
      this.vx = lerp(this.vx, targetVx, this.acceleration);
      this.vy = lerp(this.vy, targetVy, this.acceleration);
      
      // Store previous position for collision resolution
      const prevX = this.x;
      const prevY = this.y;
      
      // Try to move both axes first
      this.x += this.vx;
      this.y += this.vy;
      
      // Check for wall collisions and resolve with sliding
      if (this.checkWallCollision()) {
        // Revert to previous position
        this.x = prevX;
        this.y = prevY;
        
        // Try moving only along X axis (slide horizontally)
        this.x += this.vx;
        const canMoveX = !this.checkWallCollision();
        
        // Revert X and try moving only along Y axis (slide vertically)
        this.x = prevX;
        this.y += this.vy;
        const canMoveY = !this.checkWallCollision();
        
        // Apply whichever direction(s) work
        if (canMoveX && canMoveY) {
          // Both axes work independently, use both
          this.x += this.vx;
        } else if (canMoveX) {
          // Only X works, slide along wall horizontally
          this.x += this.vx;
          this.vy *= 0.7; // Dampen blocked axis
        } else if (canMoveY) {
          // Only Y works, slide along wall vertically
          this.vx *= 0.7; // Dampen blocked axis
        } else {
          // Neither works, we're stuck in a corner
          this.x = prevX;
          this.y = prevY;
          this.vx *= 0.3;
          this.vy *= 0.3;
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
    return checkCollision(this.x, this.y, pX + 600, pY + 340, this.width, this.height, pWidth, pHeight);
  }
}

function drawEnemies() {
  let count = 0;
  
  // Calculate viewport bounds for culling
  const viewLeft = -camX - 100;
  const viewRight = -camX + width + 100;
  const viewTop = -camY - 100;
  const viewBottom = -camY + height + 100;
  
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[count];
    
    // Always update logic
    enemy.update();
    
    // Check if enemy is within viewport for rendering
    const inView = enemy.x >= viewLeft && enemy.x <= viewRight &&
                   enemy.y >= viewTop && enemy.y <= viewBottom;
    
    if (inView) {
      // Visual indicator for aggro state
      if (enemy.aggro) {
        fill(255, 0, 0);
      } else {
        fill(150, 0, 0);
      }
      
      image(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
      if(enemy.health < enemy.maxHealth){
        fill(255, 0, 0);
        rect(enemy.x, enemy.y - 10, enemy.width, 5);
        fill(0, 255, 0);
        rect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / enemy.maxHealth), 5);
      }
    }
    
    if (enemy.hitsPlayer()) {
      if (enemy.type == "zombie") {
        players[activePlayer].health -= 2;
        healthPoints = players[activePlayer].health;
        healthPoints = constrain(healthPoints, 0, players[activePlayer].maxHealth);
      }
    }
    if (enemy.isDead()) {
      let r = Math.floor(Math.random() * (enemy.lootPool.length + 2));
      if (r < enemy.lootPool.length) {
        droppedItems.push(new DroppedItem(new Item(enemy.lootPool[r][0], enemy.lootPool[r][1], enemy.lootPool[r][2]), enemy.x, enemy.y));
      }
      enemies.splice(count, 1);
      count--;
    }
    count++;
  }
}
