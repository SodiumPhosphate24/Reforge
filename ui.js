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
    if (inventoryList[i] != null){
      imageMode(CENTER);
      image(inventoryList[i].image, 369 + (i * 69.71), 689, 40, 40 * inventoryList[i].HtoW);
      if (inventoryList[i].stackable){
        textSize(20);
        textFont(Silkscreen);
        fill(0, 0, 0, 200);
        text(inventoryList[i].amount, 369 + (i * 69.71), 700);
      }
    }
    imageMode(CORNER);
  }
}

function health() {
  // draws health
  if (healthPoints > 0) {
    noStroke();
    fill(255, 0, 0, 200);
    rect(100, 100, players[activePlayer].maxHealth * 2, 25);
    fill(0, 255, 0, 150);
    rect(100, 100, healthPoints * 2, 25);
    strokeWeight(5);
    stroke(0, 150, 0);
    fill(0, 0, 0, 0);
    for (i = 1; i <= players[activePlayer].maxHealth/25; i++) {
      rect(100, 100, i * 50, 25);
    }
    noStroke();
  }
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
  constructor(type, name, amount) {
    this.amount = amount;
    if (type == "gun") {
      this.type = "gun";
      this.stackable = false;
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
      this.type = "bullet";
      this.stackable = true;
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
      this.type = "consumable";
      this.stackable = true;
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

    if (type == "projectile") {
      this.type = "projectile";
      this.stackable = true;
      if (name == "grenade") {
        this.name = name;
        this.image = projImgs[0];
        this.HtoW = 1;
      }
      if (name == "rock") {
        this.name = name;
        this.image = projImgs[1];
        this.HtoW = .75;
      }
    }
  }
}

class DroppedItem {
  constructor(item, x, y) {
    this.item = item;
    this.x = x;
    this.y = y;
    
    // Drop animation properties
    this.dropVelocity = -8; // Start moving upward
    this.gravity = 0.4;
    this.yOffset = 0; // Vertical offset for drop animation
    this.isDropping = true;
    
    // Floating animation properties
    this.floatTime = random(0, TWO_PI); // Random start phase for variety
    this.floatSpeed = 0.05;
    this.floatAmplitude = 5; // How high it floats
    
    // Size properties
    this.baseSize = 35; // Base size for items
  }

  update() {
    // Drop animation
    if (this.isDropping) {
      this.yOffset += this.dropVelocity;
      this.dropVelocity += this.gravity;
      
      // Stop dropping when it reaches the ground
      if (this.yOffset >= 0) {
        this.yOffset = 0;
        this.dropVelocity = 0;
        this.isDropping = false;
      }
    }
    
    // Floating animation (only when not dropping)
    if (!this.isDropping) {
      this.floatTime += this.floatSpeed;
    }
  }

  draw() {
    this.update();
    
    // Calculate float offset
    const floatOffset = this.isDropping ? 0 : sin(this.floatTime) * this.floatAmplitude;
    
    // Calculate shadow size based on float height
    const shadowScale = this.isDropping ? 1 : map(floatOffset, -this.floatAmplitude, this.floatAmplitude, 1.2, 0.8);
    const shadowAlpha = this.isDropping ? 80 : map(floatOffset, -this.floatAmplitude, this.floatAmplitude, 100, 60);
    
    // Draw shadow
    push();
    fill(0, 0, 0, shadowAlpha);
    noStroke();
    ellipse(
      this.x + this.baseSize / 2, 
      this.y + this.baseSize * this.item.HtoW + this.yOffset, 
      this.baseSize * shadowScale * 0.8, 
      this.baseSize * shadowScale * 0.3
    );
    pop();
    
    // Draw item with proper sizing
    image(
      this.item.image, 
      this.x, 
      this.y + this.yOffset + floatOffset, 
      this.baseSize, 
      this.baseSize * this.item.HtoW
    );
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
      rect(item.x, item.y, item.baseSize, item.item.HtoW * item.baseSize);
      fill(255, 255, 255);
    }
    count++;
  }
}