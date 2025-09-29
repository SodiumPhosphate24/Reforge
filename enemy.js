class Enemy {
  constructor(type) {
    this.x = 100;
    this.y = 100;
    if (type = "zombie") {
      this.type = "zombie";
      this.health = 3;
      this.speed = 2;
    }
  }

  update() {
    // direction vector from enemy -> player
    this.angle = atan2(pY + 340 + camY - (this.y), pX + 600 + camX - (this.x));
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
  }

  takeDamage(dmg) {
    this.health -= dmg;
  }

  isDead() {
    return this.health <= 0;
  }

  hitsPlayer(){
    return checkCollision(this.x, this.y, pX + 600 + camX, pY + 340 + camY, 20, 20, 35, 25);
  }
}

function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    fill(255, 0, 0);
    rect(enemies[i].x, enemies[i].y, 20, 20);
    if (enemies[i].isDead()) {
      enemies.splice(i, 1);
      i--;
    }
    if (enemies[i].hitsPlayer()){
      if (enemies[i].type == "zombie"){
        healthPoints -= 2;
      }
    }
  }
}

