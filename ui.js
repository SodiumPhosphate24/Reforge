var inventorySlot = 1;
var healthPoints = 100;
function drawUI() {
  inventory();
  health();
}

function inventory() {
  // draws inventory
  image(InventoryImg, 454, 66);
  image(FrameImg, 300 + ((inventorySlot - 1) * 75), 625, 75, 75);
  noStroke();
}

function health() {
  // draws health
  fill(255, 0, 0, 100);
  strokeWeight(5);
  stroke(0, 120, 0);
  rect(75, 75, 200, 25);
  fill(0, 255, 0, 100);
  rect(75, 75, healthPoints * 2, 25);
  noStroke();
}

function drawEnemies(){
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update(pX, pY);
    fill(255, 0, 0);
    rect(enemies[i].x, enemies[i].y, 20, 20);
  }
}