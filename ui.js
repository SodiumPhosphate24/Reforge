var inventorySlot = 1;
var healthPoints = 100;
var speedBuff = false;
function drawUI() {
  inventory();
  health();
  buffs();
}

function inventory() {
  // draws inventory
  image(InventoryImg, 289, 650, 636, 92);
  image(FrameImg, 329 + ((inventorySlot - 1) * 69.71), 649, 79.54, 79.54);
  noStroke();
}

function health() {
  // draws health
  if (healthPoints > 0) {
    noStroke();
    fill(255, 0, 0, 200);
    rect(100, 100, 200, 25);
    fill(0, 255, 0, 150);
    rect(100, 100, healthPoints * 2, 25);
  }
  strokeWeight(5);
  stroke(0, 150, 0);
  fill(0, 0, 0, 0);
  for (i = 1; i <= 4; i++) {
    rect(100, 100, i * 50, 25);
  }
  noStroke();
}

function buffs(){
  if (speedBuff){
    pSpeed = 3;
  }
  else {
    pSpeed = 1.3;
  }
}
