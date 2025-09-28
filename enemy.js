class Enemy{
  constructor(type){
    this.x = 0;
    this.y = 0;
    if(type = "zombie"){
      this.type = "zombie";
      this.health = 3;
      this.speed = 2;
    }
  }

  update(playerX, playerY) {
      // direction vector from enemy -> player
      let dx = playerX - this.x;
      let dy = playerY - this.y;
      let distToPlayer = sqrt(dx * dx + dy * dy);

      // normalize to unit vector, then scale by speed
      this.x += (dx / distToPlayer) * this.speed;
      this.y += (dy / distToPlayer) * this.speed;
    }

    takeDamage(dmg) {
      this.health -= dmg;
    }

    isDead() {
      return this.health <= 0;
    }
  }
}

function drawEnemies(){
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update(pX, pY);
    fill(255, 0, 0);
    rect(enemies[i].x, enemies[i].y, 20, 20);
  }
}

