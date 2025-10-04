    class Bullet {
      constructor(type) {
        this.x = pX + 600;
        this.y = pY + 375;
        this.angle = atan2(mouseY - (this.y + camY), mouseX - (this.x + camX));
        if (type == "common") {
          this.type = "common";
          this.image = BulletImgs[0];
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
          if (checkCollision(this.x, this.y, enemies[i].x, enemies[i].y, 5, 18, 20, 20)) {
            enemies[i].takeDamage(this.damage);
            return true;
          }
        }
        return false;
      }

      hitsWall() {
        return checkTileCollisions(this.x, this.y, 5, 18);
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
            image(b.image, -10, -10, 5, 18); // -10,-10 centers it
          } else {
            fill(255, 0, 0);
            rect(-10, -10, 5, 18);
          }
        pop();

        if (b.hitsEnemy() || b.hitsWall()) {
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