class Enemy {
  constructor(type) {
    this.x = 100 + pX;
    this.y = 100 + pY;
    this.aggro = false;
    if (type == "zombie") {
      this.type = "zombie";
      this.health = 3;
      this.speed = 2;
    }
  }

  update() {
    // direction vector from enemy -> player
    if(distance(this.x, this.y, pX + 600, pY + 340) < 500){
      this.aggro = true;
    }
    
    if(this.aggro){
      this.angle = atan2(pY + 340 - (this.y), pX + 600 - (this.x));
      this.x += this.speed * cos(this.angle);
      this.y += this.speed * sin(this.angle);
    }
  }

  takeDamage(dmg) {
    this.health -= dmg;
  }

  isDead() {
    return this.health <= 0;
  }

  hitsPlayer(){
    return checkCollision(this.x, this.y, pX + 600, pY + 340, 20, 20, 35, 25);
  }
}

function drawEnemies() {
  let count = 0;
  for (let i = 0; i < enemies.length; i++) {
    enemies[count].update();
    fill(255, 0, 0);
    rect(enemies[count].x, enemies[count].y, 20, 20);
    if (enemies[count].hitsPlayer()){
      if (enemies[count].type == "zombie"){
        healthPoints -= 2;
      }
    }
    if (enemies[count].isDead()) {
      enemies.splice(count, 1);
      count--;
    }
    count++;
  }
}
