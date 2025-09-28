class Enemy {
  constructor(type) {
    this.x = 100;
    this.y = 100;
    this.angle = atan2(0 - (this.y + camY), 0 - (this.x + camX))
    if (type = "zombie") {
      this.type = "zombie";
      this.health = 3;
      this.speed = 2;
    }
  }

  update() {
    // direction vector from enemy -> player
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
  }

  takeDamage(dmg) {
    this.health -= dmg;
  }

  isDead() {
    return this.health <= 0;
  }
}

function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    fill(255, 0, 0);
    rect(enemies[i].x, enemies[i].y, 20, 20);
  }
}

