var inventorySlot = 1;
var healthPoints = 100;
var speedBuff = false;
function drawUI() {
  inventory();
  health();
  buffs();
}

function drawItems() {
  updateDroppedItems();
}

function inventory() {
  // draws inventory
  image(InventoryImg, 289, 650, 636, 92);
  image(FrameImg, 329 + ((inventorySlot - 1) * 69.71), 649, 79.54, 79.54);
  noStroke();
  for (let i = 0; i < inventoryList.length; i++) {
    imageMode(CENTER);
    image(inventoryList[i].image, 369 + (i * 69.71), 689, 40, 40 * inventoryList[i].HtoW);
    imageMode(CORNER);
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

function buffs() {
  if (speedBuff) {
    pSpeed = 3;
  }
  else {
    pSpeed = 1.3;
  }
}

class Item {
  constructor(type, name) {
    if (type == "gun") {
      this.type = "gun";
      if (name == "glock") {
        this.name = name;
        this.image = GunImgs[0];
        this.damage = 1;
        this.ammo = 100;
        this.ammoType = "common";
        this.HtoW = 0.65;
      }
      if (name == "western") {
        this.name = name;
        this.image = GunImgs[1];
        this.damage = 2;
        this.ammo = 100;
        this.HtoW = 0.55;
      }
      if (name == "rare pistol") {
        this.name = name;
        this.image = GunImgs[2];
        this.damage = 3;
        this.Htow = .46;
      }
    }

    if (type == "bullet"){
      if (name == "common"){
        this.name = name;
        this.image = BulletImgs[0];
        this.damage = 1;
        this.HtoW = 3.5;
      }
      if (name == "uncommon"){
        this.name = name;
        this.image = BulletImgs[1];
        this.damage = 2;
        this.HtoW = 3.5;
      }
      if (name == "rare"){
        this.name = name;
        this.image = BulletImgs[2];
        this.damage = 3;
        this.HtoW = 3.5;
      }
      if (name == "legendary"){
        this.name = name;
        this.image = BulletImgs[3];
        this.damage = 4;
        this.HtoW = 3.5;
      }
    }

    if (type == "consumable"){
      if (name == "cheese") {
        this.name = name;
        this.image = itemImgs[0];
        this.HtoW = .8;
      }
      if (name == "soda") {
        this.name = name;
        this.image = itemImgs[1];
        this.HtoW = 1.64;
      }
    }
  }
}

class DroppedItem {
  constructor(item, x, y) {
    this.item = item;
    this.x = x;
    this.y = y;
  }

  draw() {
    image(this.item.image, this.x, this.y, 50, 50*this.item.HtoW);
  }

  checkPickup() {
    let d = distance(pX + 600, pY + 340, this.x, this.y);
    if (d < 50) {
      return true;
    }
    else {
      return false;
    }
  }


}

function updateDroppedItems() {
  let count = 0;
  for (let i = 0; i < droppedItems.length; i++) {
    let item = droppedItems[count];
    item.draw();
    if (item.checkPickup()) {
      stroke(255, 0, 0, 100);
      strokeWeight(5);
      noFill();
      rect(item.x, item.y, 50, item.item.HtoW * 50);
      fill(255, 255, 255);
    }
    count++;
  }
}