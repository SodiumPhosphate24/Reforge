var activePlayer = 0;
var players = [];
class Player {
  constructor(x, y, w, h, speed, health, damage, picture) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.health = health;
    this.damage = damage;
    this.picture = picture;
  }
  getImage(){
    return picture;
  }
}
function switchPlayer(newPlayer){
  activePlayer = newPlayer;
  pX = players[activePlayer].x;
  pY = players[activePlayer].y;
  pWidth = players[activePlayer].w;
  pHeight = players[activePlayer].h;
  pSpeed = players[activePlayer].speed;
  healthPoints = players[activePlayer].health;
  playerDamage = players[activePlayer].damage;
}