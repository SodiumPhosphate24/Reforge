var inventorySlot = 1;
var healthPoints = 100;
var speedBuff = false;
function drawUI() {
  inventory();
  health();
  buffs();
}

function drawItems(){
  updateDroppedItems();
}

function inventory() {
  // draws inventory
  image(InventoryImg, 289, 650, 636, 92);
  image(FrameImg, 329 + ((inventorySlot - 1) * 69.71), 649, 79.54, 79.54);
  noStroke();
  for(let i = 0; i < inventoryList.length; i++) {
    image(inventoryList[i].image, 344 + (i * 69.71), 664, 50, 50);
  }
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

class Item {
  constructor(type, name){
    if (type == "gun"){
      this.type = "gun";
      this.name = name;
      this.image = GunImgs[0];
      this.damage = 1;
      this.ammo = 100;
      this.ammoType = "common";
    }
  }
}

class DroppedItem {
  constructor(item, x, y){
    this.item = item;
    this.x = x;
    this.y = y;
  }
  
  draw(){
      image(this.item.image, this.x, this.y, 50, 50);
      if (this.checkPickup()){
      stroke(255, 0, 0);
      strokeWeight(5);
      noFill();
      rect(this.x, this.y, 50, 50);
      fill(255, 255, 255);
    }
  }

  checkPickup(){
    let d = distance(pX + 600, pY + 340, this.x, this.y);
    if (d < 50){
      return true;
    }
    else {
      return false;
    }
  }

  
}

function updateDroppedItems() {
  for (let i = 0; i < droppedItems.length; i++) {
    var count = 0;
    droppedItems[count].draw();
    if (droppedItems[count].checkPickup() && keyIsDown(67) && inventoryList.length < 8){
      inventoryList.push(droppedItems[count].item);
      droppedItems.splice(count, 1);
      count--;
    }
    count++;
  }
}