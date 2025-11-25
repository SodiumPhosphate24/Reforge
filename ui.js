var inventorySlot = 1;
var healthPoints = 100;
var speedBuff = false;
var itemLabelAlpha = 0;
var lastInventorySlot = 1;
function drawUI() {
  inventory();
  health();
  buffs();
}

function drawItems() {
  updateDroppedItems();
}

function inventory() {
  // Check if inventory slot changed
  if (lastInventorySlot !== inventorySlot) {
    itemLabelAlpha = 1.5; // Set to 1.5 for slight delay
    lastInventorySlot = inventorySlot;
  }

  // Slowly decrease alpha
  if (itemLabelAlpha > 0) {
    itemLabelAlpha -= 0.02;
    if (itemLabelAlpha < 0) itemLabelAlpha = 0;
  }

  // draws inventory
  image(InventoryImg, 289, 650, 636, 92);
  image(FrameImg, 329 + ((inventorySlot - 1) * 69.71), 649, 79.54, 79.54);
  noStroke();
  for (let i = 0; i < inventoryList.length; i++) {
    if (inventoryList[i] != null) {
      imageMode(CENTER);

      // Calculate proper sizing to fit within inventory slot (max 50x50)
      const maxSize = 50;
      let itemWidth, itemHeight;

      if (inventoryList[i].HtoW > 1) {
        // Height is larger
        itemHeight = maxSize;
        itemWidth = maxSize / inventoryList[i].HtoW;
      } else {
        // Width is larger or equal
        itemWidth = maxSize;
        itemHeight = maxSize * inventoryList[i].HtoW;
      }

      image(inventoryList[i].image, 369 + (i * 69.71), 689, itemWidth, itemHeight);
      if (inventoryList[i].stackable) {
        textSize(20);
        textFont(Silkscreen);
        fill(0, 0, 0, 200);
        strokeWeight(2);
        stroke(255, 255, 255, 200);
        text(inventoryList[i].amount, 369 + (i * 69.71), 700);
      }
    }
    if (inventoryList[inventorySlot - 1] != null && itemLabelAlpha > 0) {
      let displayAlpha = constrain(itemLabelAlpha, 0, 1);
      textSize(20);
      textFont(Silkscreen);
      fill(0, 0, 0, 200 * displayAlpha);
      strokeWeight(2);
      stroke(255, 255, 255, 200 * displayAlpha);
      text(inventoryList[inventorySlot - 1].name, 600, 500, 20, 255, 255, 255, 255, Silkscreen, CENTER, CENTER);
    }
    imageMode(CORNER);
  }
}

function health() {
  // draws health
  players[activePlayer].health = constrain(players[activePlayer].health, 0, players[activePlayer].maxHealth);
  healthPoints = players[activePlayer].health;
  noStroke();
  fill(100, 100, 100, 200);
  rect(100 + players[activePlayer].maxHealth * 1.2, 100, 0 - players[activePlayer].maxHealth * 1.2, 45);
  fill(255 - (healthPoints / players[activePlayer].maxHealth) * 255, 0 + (healthPoints / players[activePlayer].maxHealth) * 255, 0, 150);
  rect(100, 100, healthPoints * 1.2, 45);
  strokeWeight(5);
  stroke(75, 75, 75);
  fill(0, 0, 0, 0);
  for (i = 1; i <= players[activePlayer].maxHealth / 25; i++) {
    rect(100, 100, i * 30, 45);
  }
  rect(100 + players[activePlayer].maxHealth * 1.2, 110, 5, 25)
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
        this.fireRate = .33;
        this.HtoW = 0.68;

      }
      if (name == "western") {
        this.name = name;
        this.image = GunImgs[1];
        this.damage = 2;
        this.ammo = 100;
        this.fireRate = .5;
        this.HtoW = 0.55;
      }
      if (name == "rare pistol") {
        this.name = name;
        this.image = GunImgs[2];
        this.damage = 3;
        this.fireRate = .67;
        this.HtoW = .46;
      }
    }

    if (type == "consumable") {
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
      if (name == "common cartridge") {
        this.name = name;
        this.image = itemImgs[2];
        this.HtoW = 1;
      }
      if (name == "rare cartridge") {
        this.name = name;
        this.image = itemImgs[3];
        this.HtoW = 1;
      }
      if (name == "legendary cartridge") {
        this.name = name;
        this.image = itemImgs[4];
        this.HtoW = 1;
      }
    }

    if (type == "material") {
      this.type = "material";
      this.stackable = true;
      if (name == "common wheel") {
        this.name = name;
        this.image = matImgs[0];
        this.HtoW = 1;
      }
      if (name == "rare wheel") {
        this.name = name;
        this.image = matImgs[1];
        this.HtoW = 1;
      }
      if (name == "legendary wheel") {
        this.name = name;
        this.image = matImgs[2];
        this.HtoW = 1;
      }
      if (name == "cog") {
        this.name = name;
        this.image = matImgs[3];
        this.HtoW = 1;
      }
      if (name == "pipe") {
        this.name = name;
        this.image = matImgs[4];
        this.HtoW = 1;
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

    // Slide animation properties
    this.slideDistance = random(15, 30); // How far it slides
    this.slideAngle = random(0, TWO_PI); // Random direction
    this.slideProgress = 0; // 0 to 1
    this.slideSpeed = 0.08; // How fast the slide animation completes
    this.isSliding = true;

    // Floating animation properties
    this.floatTime = random(0, TWO_PI); // Random start phase for variety
    this.floatSpeed = 0.05;
    this.floatAmplitude = 8; // How high it floats
    this.floatHeight = 15; // Base height above ground

    // Size properties - categorize by item type
    this.calculateItemSize();
  }

  calculateItemSize() {
    // Determine base size based on item type
    let baseSize = 35; // Default

    if (this.item.type === "gun") {
      baseSize = 40; // Guns are moderately sized
    } else if (this.item.type === "consumable" || this.item.type == "material") {
      baseSize = 30; // Consumables are medium
    } else if (this.item.type === "projectile") {
      baseSize = 28; // Projectiles are medium-small
    }

    // Calculate width and height based on aspect ratio
    // Use the MAX dimension and scale the other
    if (this.item.HtoW > 1) {
      // Height is larger, so height = baseSize
      this.itemHeight = baseSize;
      this.itemWidth = baseSize / this.item.HtoW;
    } else {
      // Width is larger or equal, so width = baseSize
      this.itemWidth = baseSize;
      this.itemHeight = baseSize * this.item.HtoW;
    }
  }

  update() {
    // Slide animation
    if (this.isSliding) {
      this.slideProgress += this.slideSpeed;
      if (this.slideProgress >= 1) {
        this.slideProgress = 1;
        this.isSliding = false;
      }
    }

    // Floating animation (always running)
    this.floatTime += this.floatSpeed;
  }

  draw() {
    this.update();

    // Calculate slide offset with easing
    const slideEase = this.isSliding ? (1 - pow(1 - this.slideProgress, 3)) : 1;
    const slideX = cos(this.slideAngle) * this.slideDistance * slideEase;
    const slideY = sin(this.slideAngle) * this.slideDistance * slideEase;

    // Calculate float offset (always active)
    const floatOffset = sin(this.floatTime) * this.floatAmplitude;
    const totalHeight = this.floatHeight + floatOffset;

    // Calculate shadow size based on height (INVERTED - bigger when lower/closer to ground)
    // When totalHeight is low (near ground), shadow is bigger
    const shadowScale = map(totalHeight, this.floatHeight - this.floatAmplitude, this.floatHeight + this.floatAmplitude, 1.3, 0.7);
    const shadowAlpha = map(totalHeight, this.floatHeight - this.floatAmplitude, this.floatHeight + this.floatAmplitude, 100, 50);

    // Set minimum shadow size (prevent tiny shadows)
    const minShadowSize = 12;
    const shadowWidth = max(this.itemWidth * shadowScale * 0.9, minShadowSize);
    const shadowHeight = max(this.itemWidth * shadowScale * 0.35, minShadowSize * 0.35);

    // Draw shadow
    push();
    fill(0, 0, 0, shadowAlpha);
    noStroke();
    ellipse(
      this.x + slideX + this.itemWidth / 2,
      this.y + slideY + this.itemHeight,
      shadowWidth,
      shadowHeight
    );
    pop();

    // Check if player is near for glow effect
    const playerCenterX = pX + 600 + pWidth / 2;
    const playerCenterY = pY + 375 + pHeight / 2;
    const distToPlayer = distance(playerCenterX, playerCenterY, this.x + slideX + this.itemWidth / 2, this.y + slideY + this.itemHeight / 2);
    const isNear = distToPlayer < 50;

    // Draw item with proximity glow
    push();
    if (isNear) {
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'rgba(255, 255, 255, 0.9)';
    }
    image(
      this.item.image,
      this.x + slideX,
      this.y + slideY - totalHeight,
      this.itemWidth,
      this.itemHeight
    );
    drawingContext.shadowBlur = 0;
    pop();
  }

  checkPickup() {
    const playerCenterX = pX + 600 + pWidth / 2;
    const playerCenterY = pY + 375 + pHeight / 2;
    let d = distance(playerCenterX, playerCenterY, this.x + this.itemWidth / 2, this.y + this.itemHeight / 2);
    if (d < 50) {
      return true;
    }
    else {
      return false;
    }
  }


}

let nearestPickupItem = null; // Store for screen-fixed rendering
let pickupPromptAlpha = 0; // Fade animation
let pickupPromptScale = 0; // Scale animation
let pickupPromptGrowScale = 0.5; // Growing scale animation

function updateDroppedItems() {
  let count = 0;
  nearestPickupItem = null;
  let nearestDistance = Infinity;

  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  
  // Calculate viewport bounds for culling
  const viewLeft = -camX - 100;
  const viewRight = -camX + width + 100;
  const viewTop = -camY - 100;
  const viewBottom = -camY + height + 100;

  for (let i = 0; i < droppedItems.length; i++) {
    let item = droppedItems[count];
    
    // Only update and draw items within extended viewport
    const itemX = item.x + item.itemWidth / 2;
    const itemY = item.y + item.itemHeight / 2;
    
    if (itemX >= viewLeft && itemX <= viewRight &&
        itemY >= viewTop && itemY <= viewBottom) {
      item.draw();

      // Check if this is the nearest pickup-able item
      if (item.checkPickup()) {
        const d = distance(playerCenterX, playerCenterY, itemX, itemY);
        if (d < nearestDistance) {
          nearestDistance = d;
          nearestPickupItem = item;
        }
      }
    }

    count++;
  }
}

function drawPickupPromptIfNeeded() {
  // Fade in/out and scale based on whether item is near
  if (nearestPickupItem) {
    pickupPromptAlpha = lerp(pickupPromptAlpha, 255, 0.2);
    pickupPromptScale = lerp(pickupPromptScale, 1, 0.2);
    pickupPromptGrowScale = lerp(pickupPromptGrowScale, 1, 0.15);
  } else {
    pickupPromptAlpha = lerp(pickupPromptAlpha, 0, 0.15);
    pickupPromptScale = lerp(pickupPromptScale, 0, 0.15);
    pickupPromptGrowScale = lerp(pickupPromptGrowScale, 0, 0.15);
  }

  if (pickupPromptAlpha > 5) {
    drawPickupPrompt(nearestPickupItem);
  }
}

function drawPickupPrompt(item) {
  if (!item) return;

  push();
  translate(600, 47);
  scale(pickupPromptScale * pickupPromptGrowScale);
  translate(-600, -47);

  fill(100, 255, 255, pickupPromptAlpha * 0.78);
  textSize(20);
  textFont(Silkscreen);
  textAlign(CENTER, CENTER);

  // Display at top of screen
  const promptText = "Press E to Pick Up " + item.item.name;

  // Background for text
  const promptWidth = textWidth(promptText);
  fill(0, 0, 0, pickupPromptAlpha * 0.6);
  rect(600 - promptWidth / 2 - 10, 30, promptWidth + 20, 35, 5);

  // Text
  fill(100, 255, 255, pickupPromptAlpha);
  text(promptText, 600, 47);

  pop();
}