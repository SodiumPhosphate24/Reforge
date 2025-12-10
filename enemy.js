
class Enemy {
  constructor(type, x, y) {
    this.x = x;
    this.y = y;
    this.aggro = false;
    this.vx = 0; // velocity x
    this.vy = 0; // velocity y
    this.aggroRange = 500;
    this.deaggroRange = 700; // de-aggro at longer distance
    this.currentBreadcrumbIndex = 0; // Which breadcrumb we're following
    this.raycastTarget = null; // For visualization in editor
    
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
      this.shootRange = 300;
      this.shootCooldown = 25;
    }
  }

  // Raycast from enemy to target position to check for walls
  canReachPoint(targetX, targetY) {
    const startX = this.x + 10;
    const startY = this.y + 10;
    
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Number of steps to check along the ray
    const steps = Math.ceil(distance / 10);
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const checkX = startX + dx * t;
      const checkY = startY + dy * t;
      
      // Check if this point hits a wall
      const col = Math.floor(checkX / 50);
      const row = Math.floor(checkY / 50);
      
      if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row].length) continue;
      
      const cell = gameWorld[row][col];
      if (cell && 'layers' in cell) {
        for (let L = 0; L < 3; L++) {
          const t = cell.layers[L];
          if (!t) continue;
          if (tileWalls[t.type] == 1) {
            return false; // Wall blocking path
          }
        }
      } else if (cell) {
        if (tileWalls[cell.type] == 1) {
          return false; // Wall blocking path
        }
      }
    }
    
    return true; // Clear path
  }

  shoot(){
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
      return;
    }
    const distToPlayer = distance(this.x, this.y, pX + 600, pY + 340);
    if (distToPlayer < this.shootRange) {
      const angle = atan2(pY + 340 - this.y, pX + 600 - this.x);
      bullets.push(new Bullet("enemy", 1, angle));
      this.shootCooldown = 25;
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
      // Breadcrumb AI: Follow the player's trail
      let targetX, targetY;
      if (this.type == "greg"){
        this.shoot();
      }
      
      if (breadcrumbs.length === 0) {
        // No breadcrumbs yet, move toward player directly
        targetX = pX + 600;
        targetY = pY + 340;
      } else {
        // Make sure our index is valid
        if (this.currentBreadcrumbIndex >= breadcrumbs.length) {
          this.currentBreadcrumbIndex = breadcrumbs.length - 1;
        }
        
        let foundReachable = false;
        let targetIndex = -1;
        
        // Search backwards from the most recent breadcrumb to find the farthest reachable one
        for (let searchIndex = breadcrumbs.length - 1; searchIndex >= this.currentBreadcrumbIndex; searchIndex--) {
          const testBreadcrumb = breadcrumbs[searchIndex];
          
          // Check if we can reach this breadcrumb with raycast (no walls blocking)
          if (this.canReachPoint(testBreadcrumb.x, testBreadcrumb.y)) {
            targetX = testBreadcrumb.x;
            targetY = testBreadcrumb.y;
            targetIndex = searchIndex;
            foundReachable = true;
            this.raycastTarget = { x: targetX, y: targetY, blocked: false }; // For editor visualization
            break; // Found the farthest reachable breadcrumb
          }
        }
        
        // If no breadcrumbs from current to end are reachable, search backwards from current
        if (!foundReachable && this.currentBreadcrumbIndex > 0) {
          for (let searchIndex = this.currentBreadcrumbIndex - 1; searchIndex >= 0; searchIndex--) {
            const testBreadcrumb = breadcrumbs[searchIndex];
            
            if (this.canReachPoint(testBreadcrumb.x, testBreadcrumb.y)) {
              targetX = testBreadcrumb.x;
              targetY = testBreadcrumb.y;
              targetIndex = searchIndex;
              foundReachable = true;
              this.raycastTarget = { x: targetX, y: targetY, blocked: false };
              break;
            }
          }
        }
        
        // If still no breadcrumbs are reachable, move toward player directly
        if (!foundReachable) {
          targetX = pX + 600;
          targetY = pY + 340;
          this.raycastTarget = { x: targetX, y: targetY, blocked: false };
        } else {
          this.currentBreadcrumbIndex = targetIndex;
        }
        
        // Check if we're close enough to move to next breadcrumb
        const distToBreadcrumb = distance(this.x + 10, this.y + 10, targetX, targetY);
        if (distToBreadcrumb < 30 && foundReachable) {
          // Move to next breadcrumb
          this.currentBreadcrumbIndex++;
          if (this.currentBreadcrumbIndex >= breadcrumbs.length) {
            this.currentBreadcrumbIndex = breadcrumbs.length - 1; // Stay at last one
          }
        }
      }
      
      // Calculate angle to target
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
        this.y = prevY + this.vy;
        const canMoveY = !this.checkWallCollision();
        
        // Apply whichever direction(s) work
        if (canMoveX && canMoveY) {
          // Both axes work independently, use both
          this.x = prevX + this.vx;
          this.y = prevY + this.vy;
        } else if (canMoveX) {
          // Only X works, slide along wall horizontally
          this.x = prevX + this.vx;
          this.y = prevY;
          this.vy = 0; // Zero out blocked axis for smooth sliding
        } else if (canMoveY) {
          // Only Y works, slide along wall vertically
          this.x = prevX;
          this.y = prevY + this.vy;
          this.vx = 0; // Zero out blocked axis for smooth sliding
        } else {
          // Neither works, we're stuck in a corner - try to escape
          this.x = prevX;
          this.y = prevY;
          // Try to push away from corner
          this.vx *= -0.5;
          this.vy *= -0.5;
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
// Draw breadcrumbs for editor mode
function drawBreadcrumbs() {
  if (!breadcrumbs || breadcrumbs.length === 0) return;
  
  push();
  // Draw lines connecting breadcrumbs
  stroke(255, 255, 0, 150);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < breadcrumbs.length; i++) {
    vertex(breadcrumbs[i].x, breadcrumbs[i].y);
  }
  endShape();
  
  // Draw breadcrumb markers
  for (let i = 0; i < breadcrumbs.length; i++) {
    const b = breadcrumbs[i];
    
    // Outer circle
    fill(255, 255, 0, 100);
    stroke(255, 255, 0, 200);
    strokeWeight(2);
    ellipse(b.x, b.y, 15, 15);
    
    // Index number
    noStroke();
    fill(255, 255, 0);
    textSize(10);
    textAlign(CENTER, CENTER);
    text(i, b.x, b.y);
  }
  pop();
}

// Draw enemy raycasts for editor mode
function drawEnemyRaycasts() {
  if (!enemies || enemies.length === 0) return;
  
  push();
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    
    if (enemy.raycastTarget && enemy.aggro) {
      const startX = enemy.x + 10;
      const startY = enemy.y + 10;
      const endX = enemy.raycastTarget.x;
      const endY = enemy.raycastTarget.y;
      
      // Draw raycast line
      if (enemy.raycastTarget.blocked) {
        stroke(255, 0, 0, 150); // Red if blocked
      } else {
        stroke(0, 255, 0, 150); // Green if clear
      }
      strokeWeight(2);
      line(startX, startY, endX, endY);
      
      // Draw endpoint marker
      noStroke();
      if (enemy.raycastTarget.blocked) {
        fill(255, 0, 0, 150);
      } else {
        fill(0, 255, 0, 150);
      }
      ellipse(endX, endY, 8, 8);
    }
  }
  pop();
}
