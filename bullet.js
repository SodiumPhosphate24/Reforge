class Bullet {
  constructor(type, damage) {
    // Spawn from gun barrel position, but check for walls first
    recoil = 0;
    const barrelPos = getGunBarrelPosition();

    // Raycast from player to barrel to check for walls
    const spawnPos = raycastToBarrel(barrelPos);
    this.x = spawnPos.x;
    this.y = spawnPos.y;
    this.damage = damage;

    this.lifespan = 25; // frames
    this.angle = calculateAim(); // use same angle as gun
    if (type == "common") {
      this.type = "common";
      this.image = BulletImgs[0];
      this.speed = 35;

    }
  }

  update() {
    // direction vector from enemy -> player
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    this.lifespan--;
  }

  hitsEnemy() {
    for (let i = 0; i < enemies.length; i++) {
      if (checkCollision(this.x, this.y, enemies[i].x, enemies[i].y, 18, 5, enemies[i].width, enemies[i].height)) {
        enemies[i].takeDamage(this.damage);
        enemies[i]
        return true;
      }
    }
    return false;
  }

  hitsWall() {
    // Bullets are already in world coordinates, so we need a direct tile check
    const w = 18, h = 5;
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
              if (left < tR && right > tL && top < tB && bottom > tT) {
                // If it's a crate (type 5), destroy it
                if (t.type === 5) {
                  // Drop configured items if they exist
                  if (t.crateContents && t.crateContents.length > 0) {
                    for (let crateItem of t.crateContents) {
                      droppedItems.push(new DroppedItem(
                        new Item(crateItem.type, crateItem.name, crateItem.quantity),
                        col * 50 + 25,
                        row * 50 + 25
                      ));
                    }
                  } else {
                    // Fallback to random item if no contents configured
                    let r = Math.floor(Math.random() * itemConstructors.length);
                    droppedItems.push(new DroppedItem(new Item(itemConstructors[r][0], itemConstructors[r][1], itemConstructors[r][2]), col * 50 + 25, row * 50 + 25));
                  }
                  clearTile(row, col, L);
                  particle(col * 50 + 25, row * 50 + 25, [139, 69, 19], 30, 5);
                }
                return true;
              }
            }
          }
        } else if (cell) { // legacy
          if (tileWalls[cell.type] == 1) {
            const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
            if (left < tR && right > tL && top < tB && bottom > tT) {
              // If it's a crate (type 5), destroy it
              if (cell.type === 5) {
                clearTile(row, col, 0);
              }
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}
function drawBullets() {
  let count = 0;
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[count];
    b.update();

    push();
    // move to bullet’s world position
    translate(b.x, b.y);
    // rotate around its center
    rotate(b.angle);

    // draw the bullet image (or fallback rect) centered
    if (b.image) {
      image(b.image, -10, -10, 18, 5); // -10,-10 centers it
    } else {
      fill(255, 0, 0);
      rect(-10, -10, 18, 5);
    }
    pop();

    if (b.hitsEnemy() || b.hitsWall() || b.lifespan <= 0) {
      bullets.splice(count, 1);
      count--;
    }
    count++;
  }
}



function calculateAim() {
  // player center in SCREEN space
  const pxs = pX + camX + pWidth / 2 + 600;
  const pys = pY + camY + pHeight / 2 + 370;

  return atan2(mouseY - pys, mouseX - pxs);
}

// Raycast from player center to barrel position to check for walls
function raycastToBarrel(barrelPos) {
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;

  // Direction from player to barrel
  const dx = barrelPos.x - playerCenterX;
  const dy = barrelPos.y - playerCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Step along the ray in small increments
  const steps = Math.ceil(distance / 2); // Check every 2 pixels
  const stepX = dx / steps;
  const stepY = dy / steps;

  // Walk from player to barrel
  for (let i = 1; i <= steps; i++) {
    const checkX = playerCenterX + stepX * i;
    const checkY = playerCenterY + stepY * i;

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
          // Hit a wall - spawn bullet at previous safe position
          const safeI = Math.max(0, i - 1);
          return {
            x: playerCenterX + stepX * safeI,
            y: playerCenterY + stepY * safeI
          };
        }
      }
    } else if (cell) { // legacy
      if (tileWalls[cell.type] == 1) {
        const safeI = Math.max(0, i - 1);
        return {
          x: playerCenterX + stepX * safeI,
          y: playerCenterY + stepY * safeI
        };
      }
    }
  }

  // No wall hit - use barrel position
  return barrelPos;
}