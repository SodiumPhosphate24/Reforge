class Bullet {
  constructor(type, damage, angle = 0, x = 0, y = 0) {
    const barrelPos = getGunBarrelPosition();
    
    this.damage = damage;
    this.hit = null;

    this.lifespan = 25; // 25 frames
    if (type == "common") {
      recoil = 0;
      this.type = "common";
      this.image = BulletImgs[0];
      this.speed = 35;
      if(angle == 0){
        this.angle = calculateAim() + .04; //.04 for adjustment
      }
      else{
        this.angle = angle;
      }
      const spawnPos = raycastToBarrel(barrelPos);
      this.x = spawnPos.x;
      this.y = spawnPos.y;
    }

    if (type == "enemy") {
      this.type = "enemy";
      this.image = BulletImgs[4];
      this.speed = 15;
      this.angle = angle;
      this.x = x + (30*cos(this.angle));
      this.y = y + (30*sin(this.angle));
    }
  }

  update() {
    // direction vector from angle
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    this.lifespan--;
  }

  hitsEnemy() {
    for (let i = 0; i < enemies.length; i++) {
      if (checkCollision(this.x, this.y, enemies[i].x, enemies[i].y, 18, 5, enemies[i].width, enemies[i].height) && this.type != "enemy") {
        enemies[i].health -= this.damage;
        return true;
      }
    }
    return false;
  }

  hitsPlayer(){
    for(let i = 0; i < players.length; i++){
      if (checkCollision(this.x, this.y, players[i].x+600, players[i].y+340, 18, 5, players[i].width, players[i].height+35)){
        if (this.type == "enemy"){
          players[i].health -= this.damage * 5;
        }
        return true;
      }
    }
    return false;
  }

  hitsWall() {
    // Checks bullet coordinates with tiles
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
                // Destroys crates (type 5)
                if (t.type === 5) {
                  // Drops stored items
                  const crateKey = row + "," + col;
                  const storedItems = crateInventories.get(crateKey);

                  if (storedItems && storedItems.length > 0) {
                    for (const itemConstructor of storedItems) {
                      droppedItems.push(new DroppedItem(
                        new Item(itemConstructor[0], itemConstructor[1], itemConstructor[2]),
                        col * 50 + 25,
                        row * 50 + 25
                      ));
                    }
                    crateInventories.delete(crateKey);
                  } else {
                    // Drops a random item if no item stored
                    let r = Math.floor(Math.random() * itemConstructors.length);
                    droppedItems.push(new DroppedItem(
                      new Item(itemConstructors[r][0], itemConstructors[r][1], itemConstructors[r][2]),
                      col * 50 + 25,
                      row * 50 + 25
                    ));
                  }

                  clearTile(row, col, L);
                  if (typeof playCrateDestroyedSfx === "function") playCrateDestroyedSfx();
                  particle(col * 50 + 25, row * 50 + 25, [139, 69, 19], 30, 5);
                }
                return true;
              }
            }
          }
        } else if (cell) { //crate failsafe
          if (tileWalls[cell.type] == 1) {
            const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
            if (left < tR && right > tL && top < tB && bottom > tT) {
              if (cell.type === 5) {
                clearTile(row, col, 0);
                if (typeof playCrateDestroyedSfx === "function") playCrateDestroyedSfx();
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

  // Calculate visual bounds for destroying bullets off screen
  const viewLeft = -camX - 50;
  const viewRight = -camX + width + 50;
  const viewTop = -camY - 50;
  const viewBottom = -camY + height + 50;

  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[count];
    b.update();

    // Only draw bullets within view
    if (b.x >= viewLeft && b.x <= viewRight &&
        b.y >= viewTop && b.y <= viewBottom) {
      push();
      // move to bullet's world position
      translate(b.x, b.y);
      // rotate around its center
      rotate(b.angle);

      // draw the bullet image
      if (b.image) {
        image(b.image, -10, -10, 18, 5); // -10,-10 centers it
      } else {
        fill(255, 0, 0);
        rect(-10, -10, 18, 5);
      }
      pop();
    }
    //Destroys the bullet if it hits an enemy, wall, or player
    if (b.hitsEnemy() || b.hitsWall() || b.hitsPlayer() || b.lifespan <= 0) {
      bullets.splice(count, 1);
      count--;
    }
    count++;
  }
}



function calculateAim() {
  // player center on screen
  const pxs = pX + camX + pWidth / 2 + 600;
  const pys = pY + camY + pHeight / 2 + 370;

  return atan2(mouseY - pys, mouseX - pxs);
}

//Cheesy Goodness
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
    } else if (cell) { // failsafe
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