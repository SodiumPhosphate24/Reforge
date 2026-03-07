class Enemy {
  constructor(type, x, y) {
    this.x = x;
    this.y = y;
    this.aggro = false;
    this.vx = 0;
    this.vy = 0;
    this.aggroRange = 325;
    this.deaggroRange = 700;
    this.currentBreadcrumbIndex = 0;
    this.raycastTarget = null;
    this.wallAvoidanceMode = false;
    this.wallAvoidanceVx = 0;
    this.wallAvoidanceVy = 0;
    this.wallAvoidanceDistance = 0;
    this.wallAvoidanceMaxDistance = 0;

    if (type == "harpy") {//Basic Melee Damage, Medium Speed, Low Health
      this.type = "harpy";
      this.health = 2;
      this.maxHealth = 2;
      this.speed = 2;
      this.acceleration = 0.15;
      this.image = Harpy;
      this.width = 48;
      this.height = 56;
      this.lootPool = [["consumable", "common cartridge", 1], ["material", "common wheel", 1]];
    }
    if (type == "cyclops") {//High Melee Damage, Low Speed, High Health
      this.type = "cyclops";
      this.health = 6;
      this.maxHealth = 6;
      this.speed = 1;
      this.acceleration = 0.15;
      this.image = BadGuy;
      this.width = 48;
      this.height = 56;
      this.lootPool = [["consumable", "common cartridge", 1]];
    }
    if (type == "greg") { //Shoots
      this.type = "greg";
      this.health = 3;
      this.maxHealth = 3;
      this.speed = 2;
      this.acceleration = 0.15;
      this.image = Greg;
      this.width = 28;
      this.height = 54;
      this.lootPool = [["consumable", "common cartridge", 1], ["material", "common wheel", 1]];
      this.shootRange = 300;
      this.attackCooldown = 50;
      this.attackRate = 50;
    }
    if (type == "hydra") { // Medium Damage, Duplicates
      this.type = "hydra";
      this.health = 4;
      this.maxHealth = 4;
      this.speed = 2;
      this.acceleration = 0.15;
      this.image = OGBuschy;
      this.width = 48;
      this.height = 56;
      this.lootPool = [["consumable", "common cartridge", 1], ["material", "common wheel", 1]];
      this.attackCooldown = 250;
      this.attackRate = 250;
    }
    if (type == "boss") {
      this.type = "boss";
      this.name = "Khronos";
      this.health = 175;
      this.maxHealth = 175;
      this.speed = 1.5;
      this.acceleration = 0.08;
      this.image = KhronosImage;
      this.width = 124;
      this.height = 104;
      this.lootPool = [["material", "legendary wheel", 2], ["consumable", "legendary cartridge", 5]];
      this.aggroRange = 600;
      this.deaggroRange = 1200;

      // Boss-specific properties
      this.isBoss = true;
      this.phase = 1;
      this.phaseTransitioning = false;
      this.phaseTransitionTimer = 0;
      this.phaseTransitionDuration = 120;
      this.phase2Threshold = 0.66;
      this.phase3Threshold = 0.33;

      this.attackCooldown = 0;
      this.attackPattern = 0;
      this.chargeSpeed = 0;
      this.isCharging = false;
      this.chargeTargetX = 0;
      this.chargeTargetY = 0;
      this.shootCooldown = 0;
      this.shootRange = 400;
      this.burstCount = 0;
      this.burstCooldown = 0;

      this.minionSpawnCooldown = 0;
      this.minionsSpawned = 0;

      this.flashTimer = 0;
      this.shakeIntensity = 0;
      this.auraRadius = 0;
      this.auraAngle = 0;

      activeBoss = this;
    }
  }

  // Raycast from enemy to target position to check for walls
  canReachPoint(targetX, targetY) {
    const startX = this.x + 10;
    const startY = this.y + 10;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Steps to check along the ray
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

  // Enemy-specific methods
  shoot() {
    const distToPlayer = distance(this.x, this.y, pX + 600, pY + 340);
    if (distToPlayer < this.shootRange) {
      const angle = atan2(pY + 340 - this.y, pX + 600 - this.x);
      bullets.push(new Bullet("enemy", 1, angle, this.x + (this.width / 2), this.y + (this.height / 2)));
      return;
    }
  }

  // Enemy attack method
  attack() {
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    if (this.attackCooldown <= 0) {
      if (this.type == "greg") {
        this.shoot();
      }
      if (this.type == "hydra") {
        this.spawnMinions(1, "hydra");
      }
      this.attackCooldown = this.attackRate;
    }
  }

  // Boss-specific methods
  bossUpdate() {
    if (!this.isBoss) return;

    if (!this.aggro) return;

    this.auraAngle += 0.02;
    this.auraRadius = 60 + sin(this.auraAngle * 3) * 10;
    if (this.flashTimer > 0) this.flashTimer--;
    if (this.shakeIntensity > 0) this.shakeIntensity *= 0.95;

    const healthPercent = this.health / this.maxHealth;

    if (!this.phaseTransitioning) {
      if (this.phase === 1 && healthPercent <= this.phase2Threshold) {
        this.startPhaseTransition(2);
      } else if (this.phase === 2 && healthPercent <= this.phase3Threshold) {
        this.startPhaseTransition(3);
      }
    }

    // Handle phase transition
    if (this.phaseTransitioning) {
      this.phaseTransitionTimer++;
      this.shakeIntensity = 5;

      if (this.phaseTransitionTimer >= this.phaseTransitionDuration) {
        this.phaseTransitioning = false;
        this.phaseTransitionTimer = 0;
        this.onPhaseComplete();
      }
      return;
    }

    this.executePhaseAttacks();
  }

  startPhaseTransition(newPhase) {
    this.phase = newPhase;
    this.phaseTransitioning = true;
    this.phaseTransitionTimer = 0;
    this.flashTimer = 60;
    this.shakeIntensity = 8;

    this.speed += 0.5;
    this.acceleration += 0.02;
  }

  onPhaseComplete() {
    if (this.phase === 2) {
      this.spawnMinions(2, "harpy");
    } else if (this.phase === 3) {
      this.spawnMinions(3, "harpy");
      this.spawnMinions(2, "greg");
    }
  }

  spawnMinions(count, type) {
    for (let i = 0; i < count; i++) {
      const angle = (TWO_PI / count) * i;
      const spawnX = this.x + cos(angle) * 120;
      const spawnY = this.y + sin(angle) * 120;
      enemies.push(new Enemy(type, spawnX, spawnY));
    }
  }

  executePhaseAttacks() {
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }

    const distToPlayer = distance(this.x + this.width / 2, this.y + this.height / 2, pX + 600, pY + 340);

    // Charge attack
    if (this.isCharging) {
      const dx = this.chargeTargetX - this.x;
      const dy = this.chargeTargetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 30 || this.checkWallCollision()) {
        this.isCharging = false;
        this.shakeIntensity = 3;
        this.attackCooldown = 60;
      } else {
        this.x += (dx / dist) * this.chargeSpeed;
        this.y += (dy / dist) * this.chargeSpeed;
      }
      return;
    }

    if (this.attackCooldown <= 0 && distToPlayer < this.shootRange * 1.5) {
      const attackRoll = Math.random();

      if (this.phase === 1) {
        // Phase 1: Single shots, charge
        if (attackRoll < 0.7) {
          this.bossShoot(1);
          this.attackCooldown = 40;
        } else {
          this.startCharge();
        }
      } else if (this.phase === 2) {
        // Phase 2: Burst fire, faster charges
        if (attackRoll < 0.5) {
          this.bossShoot(3);
          this.attackCooldown = 50;
        } else if (attackRoll < 0.8) {
          this.startCharge();
        } else {
          this.sprayAttack();
        }
      } else if (this.phase === 3) {
        // Phase 3: Rapid fire, charges, minion spawns
        if (attackRoll < 0.4) {
          this.bossShoot(5);
          this.attackCooldown = 40;
        } else if (attackRoll < 0.6) {
          this.startCharge();
        } else if (attackRoll < 0.8) {
          this.sprayAttack();
        } else {
          if (this.minionsSpawned < 6) {
            this.spawnMinions(1, "harpy");
            this.minionsSpawned++;
          }
          this.attackCooldown = 90;
        }
      }
    }

    // Burst Shot
    if (this.burstCount > 0) {
      if (this.burstCooldown <= 0) {
        const angle = atan2(pY + 340 - (this.y + this.height / 2), pX + 600 - (this.x + this.width / 2));
        bullets.push(new Bullet("enemy", 2, angle, this.x + this.width / 2, this.y + this.height / 2));
        this.burstCount--;
        this.burstCooldown = 8;
      } else {
        this.burstCooldown--;
      }
    }
  }

  bossShoot(burstSize) {
    this.burstCount = burstSize;
    this.burstCooldown = 0;
  }

  startCharge() {
    this.isCharging = true;
    this.chargeTargetX = pX + 600;
    this.chargeTargetY = pY + 340;
    this.chargeSpeed = 6 + this.phase * 2;
    this.attackCooldown = 90;
  }

  sprayAttack() {
    const centerAngle = atan2(pY + 340 - (this.y + this.height / 2), pX + 600 - (this.x + this.width / 2));
    const spreadCount = 3 + this.phase * 2;
    const spreadAngle = PI / 6;

    for (let i = 0; i < spreadCount; i++) {
      const angle = centerAngle - spreadAngle / 2 + (spreadAngle / (spreadCount - 1)) * i;
      bullets.push(new Bullet("enemy", 2, angle, this.x + this.width / 2, this.y + this.height / 2));
    }
    this.attackCooldown = 80;
  }

  update() {
    // Boss-specific update
    if (this.isBoss) {
      this.bossUpdate();
    }

    // Find distance to closest breadcrumb
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

    // Aggro/De-aggro logic
    if ((!this.aggro && closestDist < this.aggroRange) || this.health < this.maxHealth) {
      this.aggro = true;
    } else if (this.aggro && closestDist > this.deaggroRange && this.health == this.maxHealth) {
      this.aggro = false;
      // Slow down when de-aggroing
      this.vx *= 0.9;
      this.vy *= 0.9;
    }

    if (this.aggro) {
      // Breadcrumb AI
      let targetX, targetY;
      if (this.type != "boss") {
        this.attack();
      }


      if (breadcrumbs.length === 0) {
        // No breadcrumbs, stop moving
        this.vx *= 0.9;
        this.vy *= 0.9;
        return;
      } else {
        if (this.currentBreadcrumbIndex >= breadcrumbs.length) {
          this.currentBreadcrumbIndex = breadcrumbs.length - 1;
        }

        let foundReachable = false;
        let targetIndex = -1;

        // Search backwards from the most recent breadcrumb to find the farthest reachable one
        for (let searchIndex = breadcrumbs.length - 1; searchIndex >= this.currentBreadcrumbIndex; searchIndex--) {
          const testBreadcrumb = breadcrumbs[searchIndex];

          // Raycast to check if we can reach this breadcrumb
          if (this.canReachPoint(testBreadcrumb.x, testBreadcrumb.y)) {
            targetX = testBreadcrumb.x;
            targetY = testBreadcrumb.y;
            targetIndex = searchIndex;
            foundReachable = true;
            this.raycastTarget = { x: targetX, y: targetY, blocked: false };
            break;
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

        // If no breadcrumbs are reachable, stop moving
        if (!foundReachable) {
          this.vx *= 0.9;
          this.vy *= 0.9;
          return;
        } else {
          this.currentBreadcrumbIndex = targetIndex;
        }

        // Check if close enough to move to next breadcrumb
        const distToBreadcrumb = distance(this.x + 10, this.y + 10, targetX, targetY);
        if (distToBreadcrumb < 30 && foundReachable) {
          this.currentBreadcrumbIndex++;
          if (this.currentBreadcrumbIndex >= breadcrumbs.length) {
            this.currentBreadcrumbIndex = breadcrumbs.length - 1;
          }
        }
      }

      // Calculate angle to target
      this.angle = atan2(targetY - (this.y + 10), targetX - (this.x + 10));

      // Direction velocity toward target
      let targetVx = this.speed * cos(this.angle);
      let targetVy = this.speed * sin(this.angle);

      this.vx = lerp(this.vx, targetVx, this.acceleration);
      this.vy = lerp(this.vy, targetVy, this.acceleration);

      // Previous position for collision resolution
      const prevX = this.x;
      const prevY = this.y;

      // Collision detection
      this.x += this.vx;
      this.y += this.vy;

      // Check for wall collisions
      if (this.checkWallCollision()) {
        // Revert to previous position
        this.x = prevX;
        this.y = prevY;

        // Determine the avoidance direction
        if (!this.wallAvoidanceMode) {
          const targetDirX = targetX - (this.x + 10);
          const targetDirY = targetY - (this.y + 10);

          // Normalize direction to sign (-1, 0, or 1)
          const targetSignX = targetDirX > 0 ? 1 : (targetDirX < 0 ? -1 : 0);
          const targetSignY = targetDirY > 0 ? 1 : (targetDirY < 0 ? -1 : 0);

          // Test which directions are blocked
          const testDist = 3;

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

          // Determine correction direction
          let correctionVx = 0;
          let correctionVy = 0;

          // If hitting wall, move perpendicular
          if (rightBlocked && targetSignX > 0) {
            correctionVx = 0;
            correctionVy = targetSignY !== 0 ? targetSignY * this.speed : (upBlocked ? this.speed : -this.speed);
            this.wallAvoidanceMaxDistance = this.height;
          } else if (leftBlocked && targetSignX < 0) {
            correctionVx = 0;
            correctionVy = targetSignY !== 0 ? targetSignY * this.speed : (upBlocked ? this.speed : -this.speed);
            this.wallAvoidanceMaxDistance = this.height;
          } else if (downBlocked && targetSignY > 0) {
            correctionVx = targetSignX !== 0 ? targetSignX * this.speed : (leftBlocked ? this.speed : -this.speed);
            correctionVy = 0;
            this.wallAvoidanceMaxDistance = this.width;
          } else if (upBlocked && targetSignY < 0) {
            correctionVx = targetSignX !== 0 ? targetSignX * this.speed : (leftBlocked ? this.speed : -this.speed);
            correctionVy = 0;
            this.wallAvoidanceMaxDistance = this.width;
          } else {
            // General sliding, try each axis independently
            this.x = prevX + this.vx;
            const canMoveX = !this.checkWallCollision();
            this.x = prevX;

            this.y = prevY + this.vy;
            const canMoveY = !this.checkWallCollision();
            this.y = prevY;

            if (canMoveX) correctionVx = this.vx;
            if (canMoveY) correctionVy = this.vy;
          }

          // Trigger wall avoidance mode, lock the direction
          if (correctionVx !== 0 || correctionVy !== 0) {
            this.wallAvoidanceMode = true;
            this.wallAvoidanceVx = correctionVx;
            this.wallAvoidanceVy = correctionVy;
            this.wallAvoidanceDistance = 0;
          }
        }

        // Apply locked wall avoidance movement
        if (this.wallAvoidanceMode) {
          if (this.wallAvoidanceDistance >= this.wallAvoidanceMaxDistance) {
            // Try moving toward breadcrumb
            const testAngle = atan2(targetY - (this.y + 10), targetX - (this.x + 10));
            const testVx = this.speed * cos(testAngle);
            const testVy = this.speed * sin(testAngle);

            this.x = prevX + testVx;
            this.y = prevY + testVy;

            if (!this.checkWallCollision()) {
              this.x = prevX;
              this.y = prevY;

              // Move away from wall
              const stepAwayDist = 0.5;
              this.x -= this.wallAvoidanceVx * stepAwayDist / this.speed;
              this.y -= this.wallAvoidanceVy * stepAwayDist / this.speed;

              // Exit avoidance mode
              this.wallAvoidanceMode = false;
              this.wallAvoidanceDistance = 0;

              this.vx = testVx;
              this.vy = testVy;
            } else { // Continue wall avoidance
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
              this.wallAvoidanceDistance += Math.sqrt(this.wallAvoidanceVx * this.wallAvoidanceVx + this.wallAvoidanceVy * this.wallAvoidanceVy);
              this.vx = this.wallAvoidanceVx;
              this.vy = this.wallAvoidanceVy;
            }
          }
        } else {
          this.vx *= -0.5;
          this.vy *= -0.5;
        }
      } else {
        this.wallAvoidanceMode = false;
        this.wallAvoidanceDistance = 0;
      }
    } else {
      this.vx *= 0.95;
      this.vy *= 0.95;

      // Move with velocity
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

    // Check all tiles in enemy's area
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
        } else if (cell) { // failsafe
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
      pHeight + 35
    );
  }
}

function drawEnemies() {
  let count = 0;

  // Calculate visual bounds for enemies
  const viewLeft = -camX - 100;
  const viewRight = -camX + width + 100;
  const viewTop = -camY - 100;
  const viewBottom = -camY + height + 100;

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[count];

    enemy.update();

    // Check if enemy is within view to draw
    const inView = enemy.x >= viewLeft && enemy.x <= viewRight &&
      enemy.y >= viewTop && enemy.y <= viewBottom;

    if (inView) {
      if (enemy.isBoss) {
        push();

        // Shake effect
        let drawX = enemy.x;
        let drawY = enemy.y;
        if (enemy.shakeIntensity > 0.1) {
          drawX += random(-enemy.shakeIntensity, enemy.shakeIntensity);
          drawY += random(-enemy.shakeIntensity, enemy.shakeIntensity);
        }

        // Aura effect
        noStroke();
        let auraColor;
        if (enemy.phase === 1) {
          auraColor = color(255, 100, 0, 50);
        } else if (enemy.phase === 2) {
          auraColor = color(255, 50, 50, 70);
        } else {
          auraColor = color(150, 0, 255, 90);
        }

        // Aura Pulse
        for (let r = enemy.auraRadius; r > 0; r -= 15) {
          fill(red(auraColor), green(auraColor), blue(auraColor), alpha(auraColor) * (r / enemy.auraRadius));
          ellipse(drawX + enemy.width / 2, drawY + enemy.height / 2, r * 2, r * 2);
        }

        // Flash effecct
        if (enemy.flashTimer > 0) {
          tint(255, 255, 255, 150 + sin(enemy.flashTimer * 0.5) * 100);
        } else if (enemy.phaseTransitioning) {
          tint(255, 100 + sin(frameCount * 0.3) * 100, 100 + sin(frameCount * 0.3) * 100);
        }

        image(enemy.image, drawX, drawY, enemy.width, enemy.height);

        noTint();
        pop();

      } else {
        if (enemy.aggro) {
          fill(255, 0, 0);
        } else {
          fill(150, 0, 0);
        }

        image(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
        if (enemy.health < enemy.maxHealth) {
          fill(255, 0, 0);
          rect(enemy.x, enemy.y - 10, enemy.width, 5);
          fill(0, 255, 0);
          rect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / enemy.maxHealth), 5);
        }
      }
    }

    // Deal damage to player if colliding
    if (enemy.hitsPlayer()) {
      if (pIFrames <= 0) {
        if (enemy.type == "harpy" || enemy.type == "hydra") {
          players[activePlayer].health -= 5;
          healthPoints = players[activePlayer].health;
          healthPoints = constrain(healthPoints, 0, players[activePlayer].maxHealth);
        } else if (enemy.type == "boss") {
          players[activePlayer].health -= 10;
          healthPoints = players[activePlayer].health;
          healthPoints = constrain(healthPoints, 0, players[activePlayer].maxHealth);
        }
        pIFrames = 15;
      }
      else {
        pIFrames--;
      }
    }
    if (enemy.isDead()) {
      if (enemy.isBoss) {
        activeBoss = null;
        messages.push(new Message("quest", "Lvl 4 Completed"));
        
        // Start ending sequence
        if (typeof startEndingSequence === 'function') {
          startEndingSequence();
        }
      }

      // Drop loot
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

// Boss health bar
function drawBossBar() {
  if (!activeBoss || activeBoss.isDead() || !activeBoss.aggro) return;

  push();

  const barWidth = 500;
  const barHeight = 30;
  const barX = (width - barWidth) / 2;
  const barY = 80;

  // Background
  fill(30, 30, 30, 220);
  stroke(60, 60, 60);
  strokeWeight(3);
  rect(barX - 10, barY - 15, barWidth + 20, barHeight + 50, 8);

  // Boss name
  noStroke();
  textFont(Silkscreen);
  textSize(16);
  textAlign(CENTER, CENTER);

  // Phase indicator colors
  let nameColor;
  if (activeBoss.phase === 1) {
    nameColor = color(255, 200, 100);
  } else if (activeBoss.phase === 2) {
    nameColor = color(255, 100, 100);
  } else {
    nameColor = color(200, 100, 255);
  }

  fill(nameColor);
  text(activeBoss.name || "BOSS", width / 2, barY - 2);

  // Health bar background
  fill(80, 0, 0);
  noStroke();
  rect(barX, barY + 15, barWidth, barHeight, 4);

  // Health bar fill
  const healthPercent = activeBoss.health / activeBoss.maxHealth;
  let healthColor;

  if (activeBoss.phase === 1) {
    healthColor = lerpColor(color(255, 150, 0), color(255, 200, 50), sin(frameCount * 0.05) * 0.5 + 0.5);
  } else if (activeBoss.phase === 2) {
    healthColor = lerpColor(color(255, 50, 50), color(255, 100, 100), sin(frameCount * 0.08) * 0.5 + 0.5);
  } else {
    healthColor = lerpColor(color(150, 50, 255), color(200, 100, 255), sin(frameCount * 0.1) * 0.5 + 0.5);
  }

  fill(healthColor);
  rect(barX, barY + 15, barWidth * healthPercent, barHeight, 4);

  // Health bar shine 
  for (let i = 0; i < 3; i++) {
    fill(255, 255, 255, 30 - i * 10);
    rect(barX, barY + 15 + i * 2, barWidth * healthPercent, 4, 2);
  }

  if (activeBoss.phaseTransitioning) {
    const progress = activeBoss.phaseTransitionTimer / activeBoss.phaseTransitionDuration;
    fill(255, 255, 255, 150 * (1 - progress));
    rect(barX, barY + 15, barWidth, barHeight, 4);

    // Phase text
    fill(255, 255, 255, 255 * sin(progress * PI));
    textSize(24);
    text("PHASE " + activeBoss.phase, width / 2, barY + 30);
  }

  pop();
}
// Draw breadcrumbs in editor mode
function drawBreadcrumbs() {
  if (!breadcrumbs || breadcrumbs.length === 0) return;

  push();
  // Lines connecting breadcrumbs
  stroke(255, 255, 0, 150);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < breadcrumbs.length; i++) {
    vertex(breadcrumbs[i].x, breadcrumbs[i].y);
  }
  endShape();

  // Breadcrumb markers
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

// Draw enemy raycasts in editor mode
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

      // Raycast line
      if (enemy.raycastTarget.blocked) {
        stroke(255, 0, 0, 150);
      } else {
        stroke(0, 255, 0, 150);
      }
      strokeWeight(2);
      line(startX, startY, endX, endY);

      // Endpoint marker
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

// Blood moon functionality, respawns enemies
function bloodMoon() {
  if (bloodMoonCooldown > 0) {
    bloodMoonCooldown--;
  }
  else {
    let aggroed = false;
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].aggro) {
        aggroed = true;
      }
    }
    if (!aggroed) {
      bloodMoonCooldown = 18000;
      enemies = [];
      spawnEnemies();
      if (typeof startBloodMoonEffect === 'function') {
        startBloodMoonEffect();
      }
      console.log("Blood Mooned");
    }
  }
}