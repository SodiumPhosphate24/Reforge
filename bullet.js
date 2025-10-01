class Bullet {
  constructor(type) {
    this.x = pX + 600;
    this.y = pY + 375;
    this.angle = atan2(mouseY - (this.y + camY), mouseX - (this.x + camX));
    if (type = "common") {
      this.type = "common";
      this.image = 0;
      this.speed = 35;
      this.damage = 1;

    }
  }

  update() {
    // direction vector from enemy -> player
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
  }

  hitsEnemy() {
    for (let i = 0; i < enemies.length; i++) {
      if (checkCollision(this.x, this.y, enemies[i].x, enemies[i].y, 20, 20, 20, 20)) {
        enemies[i].takeDamage(this.damage);
        return true;
      }
    }
    return false;
  }

  hitsWall() {
    return checkTileCollisions(this.x, this.y, 20, 20);
  }
}

function drawBullets() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].update();
    fill(255, 0, 0);
    rotate(bullets[i].angle);
    image(BulletImgs[this.image], bullets[i].x, bullets[i].y, 20, 20)
    if (bullets[i].hitsEnemy() || bullets[i].hitsWall()) {
      bullets.splice(i, 1);
      i--;
    }
  }
}


function calculateAim() {
  // player center in SCREEN space
  const pxs = pX + camX + pWidth / 2 + 600;
  const pys = pY + camY + pHeight / 2+370;

  return atan2(mouseY - pys, mouseX - pxs);
}
