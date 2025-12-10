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
    this.wallAvoidanceMode = false; // Track if we're in wall avoidance mode
    this.wallAvoidanceVx = 0; // Locked velocity while avoiding wall
    this.wallAvoidanceVy = 0;
    this.wallAvoidanceDistance = 0; // How far we've traveled in avoidance mode
    this.wallAvoidanceMaxDistance = 0; // Maximum distance to travel before checking

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
      bullets.push(new Bullet("enemy", 1, angle, this.x+(this.width/2), this.y+(this.height/2)));
      this.shootCooldown = 50;
    }
  }

  update() {
    // Find distance to closest breadcrumb (or player if no breadcrumbs)
    let closestDist = Infinity;
    
    if (breadcrumbs.length > 0) {
      // Check distance to all breadcrumbs and find the closest
      for (let i = 0; i < breadcrumbs.length; i++) {
        const dist = distance(this.x, this.y, breadcrumbs[i].x, breadcrumbs[i].y);
        if (dist < closestDist) {
          closestDist = dist;
        }
      }
    } else {
      // No breadcrumbs, fall back to player distance
      closestDist = distance(this.x, this.y, pX + 600, pY + 340);
    }

    // Aggro/De-aggro logic based on distance to closest breadcrumb
    if (!this.aggro && closestDist < this.aggroRange) {
      this.aggro = true;
    } else if (this.aggro && closestDist > this.deaggroRange) {
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
      let targetVx = this.speed * cos(this.angle);
      let targetVy = this.speed * sin(this.angle);

      // Smoothly interpolate current velocity toward target
      this.vx = lerp(this.vx, targetVx, this.acceleration);
      this.vy = lerp(this.vy, targetVy, this.acceleration);

      // Store previous position for collision resolution
      const prevX = this.x;
      const prevY = this.y;

      // Try to move both axes first
      this.x += this.vx;
      this.y += this.vy;

      // Check for wall collisions and resolve with intelligent navigation
      if (this.checkWallCollision()) {
        // Revert to previous position
        this.x = prevX;
        this.y = prevY;

        // If not already in wall avoidance mode, determine the avoidance direction
        if (!this.wallAvoidanceMode) {
          // Detect which direction the target is relative to enemy
          const targetDirX = targetX - (this.x + 10);
          const targetDirY = targetY - (this.y + 10);
          
          // Normalize direction to just sign (-1, 0, or 1)
          const targetSignX = targetDirX > 0 ? 1 : (targetDirX < 0 ? -1 : 0);
          const targetSignY = targetDirY > 0 ? 1 : (targetDirY < 0 ? -1 : 0);

          // Test which cardinal directions are blocked
          const testDist = 3; // pixels to test in each direction
          
          this.x = prevX + testDist;
          const rightBlocked = this.checkWallCollision();
          this.x = prevX - testDist;
          const leftBlocked = this.checkWallCollision();
          this.x = prevX;
          
          this.y = prevY + testDist;
          const downBlocked = this.checkWallCollision();
          this.y = prevY - testDist;
          const upBlocked = this.checkWallCollision();
          this.y = prevY;

          // Determine correction direction based on collision and target location
          let correctionVx = 0;
          let correctionVy = 0;

          // If hitting a wall on the side we want to go, move perpendicular instead
          if (rightBlocked && targetSignX > 0) {
            // Want to go right but blocked - move vertically
            correctionVx = 0;
            correctionVy = targetSignY !== 0 ? targetSignY * this.speed : (upBlocked ? this.speed : -this.speed);
            this.wallAvoidanceMaxDistance = this.height; // Travel height of enemy
          } else if (leftBlocked && targetSignX < 0) {
            // Want to go left but blocked - move vertically
            correctionVx = 0;
            correctionVy = targetSignY !== 0 ? targetSignY * this.speed : (upBlocked ? this.speed : -this.speed);
            this.wallAvoidanceMaxDistance = this.height;
          } else if (downBlocked && targetSignY > 0) {
            // Want to go down but blocked - move horizontally
            correctionVx = targetSignX !== 0 ? targetSignX * this.speed : (leftBlocked ? this.speed : -this.speed);
            correctionVy = 0;
            this.wallAvoidanceMaxDistance = this.width; // Travel width of enemy
          } else if (upBlocked && targetSignY < 0) {
            // Want to go up but blocked - move horizontally
            correctionVx = targetSignX !== 0 ? targetSignX * this.speed : (leftBlocked ? this.speed : -this.speed);
            correctionVy = 0;
            this.wallAvoidanceMaxDistance = this.width;
          } else {
            // General sliding - try each axis independently
            this.x = prevX + this.vx;
            const canMoveX = !this.checkWallCollision();
            this.x = prevX;
            
            this.y = prevY + this.vy;
            const canMoveY = !this.checkWallCollision();
            this.y = prevY;

            if (canMoveX) correctionVx = this.vx;
            if (canMoveY) correctionVy = this.vy;
          }

          // Enter wall avoidance mode and lock the direction
          if (correctionVx !== 0 || correctionVy !== 0) {
            this.wallAvoidanceMode = true;
            this.wallAvoidanceVx = correctionVx;
            this.wallAvoidanceVy = correctionVy;
            this.wallAvoidanceDistance = 0;
          }
        }

        // Apply the locked wall avoidance movement
        if (this.wallAvoidanceMode) {
          // Check if we've traveled far enough or can now move toward breadcrumb
          if (this.wallAvoidanceDistance >= this.wallAvoidanceMaxDistance) {
            // Try moving toward breadcrumb
            const testAngle = atan2(targetY - (this.y + 10), targetX - (this.x + 10));
            const testVx = this.speed * cos(testAngle);
            const testVy = this.speed * sin(testAngle);
            
            this.x = prevX + testVx;
            this.y = prevY + testVy;
            
            if (!this.checkWallCollision()) {
              // Success! Can move toward breadcrumb now, step slightly away from wall first
              this.x = prevX;
              this.y = prevY;
              
              // Take small step away from wall (opposite of avoidance direction)
              const stepAwayDist = 0.5;
              this.x -= this.wallAvoidanceVx * stepAwayDist / this.speed;
              this.y -= this.wallAvoidanceVy * stepAwayDist / this.speed;
              
              // Exit avoidance mode
              this.wallAvoidanceMode = false;
              this.wallAvoidanceDistance = 0;
              
              // Apply breadcrumb-following velocity
              this.vx = testVx;
              this.vy = testVy;
            } else {
              // Still blocked, continue wall avoidance
              this.x = prevX + this.wallAvoidanceVx;
              this.y = prevY + this.wallAvoidanceVy;
              
              if (this.checkWallCollision()) {
                // Stuck
                this.x = prevX;
                this.y = prevY;
                this.vx *= -0.5;
                this.vy *= -0.5;
                this.wallAvoidanceMode = false;
                this.wallAvoidanceDistance = 0;
              } else {
                // Track distance traveled
                this.wallAvoidanceDistance += Math.sqrt(this.wallAvoidanceVx * this.wallAvoidanceVx + this.wallAvoidanceVy * this.wallAvoidanceVy);
                this.vx = this.wallAvoidanceVx;
                this.vy = this.wallAvoidanceVy;
              }
            }
          } else {
            // Continue wall avoidance
            this.x = prevX + this.wallAvoidanceVx;
            this.y = prevY + this.wallAvoidanceVy;
            
            if (this.checkWallCollision()) {
              // Stuck
              this.x = prevX;
              this.y = prevY;
              this.vx *= -0.5;
              this.vy *= -0.5;
              this.wallAvoidanceMode = false;
              this.wallAvoidanceDistance = 0;
            } else {
              // Track distance traveled
              this.wallAvoidanceDistance += Math.sqrt(this.wallAvoidanceVx * this.wallAvoidanceVx + this.wallAvoidanceVy * this.wallAvoidanceVy);
              this.vx = this.wallAvoidanceVx;
              this.vy = this.wallAvoidanceVy;
            }
          }
        } else {
          // Completely stuck and no avoidance direction found
          this.vx *= -0.5;
          this.vy *= -0.5;
        }
      } else {
        // No collision - exit wall avoidance mode
        this.wallAvoidanceMode = false;
        this.wallAvoidanceDistance = 0;
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
    // Apply hitbox cushion: reduce top by 10px, sides by 4px each
    const hitboxCushionX = 4;
    const hitboxCushionTop = 10;
    
    const w = this.width - (hitboxCushionX * 2);
    const h = this.height - hitboxCushionTop;
    const left = this.x + hitboxCushionX;
    const top = this.y + hitboxCushionTop;
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
    // Apply same hitbox cushion as wall collision
    const hitboxCushionX = 4;
    const hitboxCushionTop = 10;
    
    return checkCollision(
      this.x + hitboxCushionX, 
      this.y + hitboxCushionTop, 
      pX + 600, 
      pY + 340, 
      this.width - (hitboxCushionX * 2), 
      this.height - hitboxCushionTop, 
      pWidth, 
      pHeight
    );
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