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
  PlayerImage = players[activePlayer].picture;
  
  // Immediately center camera on new player
  camX = -pX;
  camY = -pY;
}
function drawPlayers(){
  // Draw active player at centered position with 35px visual buffer above hitbox
  // The image is drawn 35px higher than the hitbox position
  image(PlayerImage, pX + 600, pY + 375 - 35, pWidth, pHeight + 35);
  
  // Draw other players at their world positions with same visual buffer
  for (let i = 0; i < players.length; i++){
    if (i !== activePlayer) {
      image(players[i].picture, players[i].x + 600, players[i].y + 375 - 35, players[i].w, players[i].h + 35);
    }
  }
}