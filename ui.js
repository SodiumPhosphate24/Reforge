var inventorySlot = 1;
var healthPoints = 100;
var speedBuff = false;
var itemLabelAlpha = 0;
var lastInventorySlot = 1;
function drawUI() {
  buffs();

  if (gameState === "playing" || gameState === "paused" || (gameState === "ending" && (typeof endingPhase === 'undefined' || endingPhase < 2))) {
    drawMinimapOverlay();
  }

  // current Objective indicator
  if (typeof currentObjective !== 'undefined' && gameState == "playing") {
    push();
    textAlign(CENTER, TOP);
    textSize(18);
    textFont(Silkscreen);

    // small box with objective written inside.
    const objText = "Objective: " + currentObjective;
    const objWidth = textWidth(objText);
    fill(0, 0, 0, 150);
    rect(width / 2 - objWidth / 2 - 15, 15, objWidth + 30, 35, 5);

    // draw text with pulse effect
    const pulse = sin(frameCount * 0.05) * 30;
    fill(255, 255, 255, 225 + pulse);
    text(objText, width / 2, 22);
    pop();
  }

  // press escape to pause indicator
  push();
  textSize(14);
  textFont(Silkscreen);
  fill(255, 255, 255, 150);

  if (gameState == "playing") {
    textAlign(LEFT, TOP);
    text("ESC to view controls", 20, 20);
    textAlign(RIGHT, TOP);
    text("ESC to Pause", width - 20, 20);
  }
  pop();

  drawCartridgeTutorial();
}

function drawMinimapOverlay() {
  if (typeof minimapCache === 'undefined' || !minimapCache) return;

  const minimapSize = 150;
  const x = width - minimapSize - 20;
  const y = 50; // Positioned below the ESC hint

  let alphaValue = 80; // Faint by default
  if (mouseX > x && mouseX < x + minimapSize && mouseY > y && mouseY < y + minimapSize) {
    alphaValue = 200; // Increase opacity on hover
  }

  push();
  resetMatrix(); // Ensure it's screen-space
  tint(255, alphaValue);
  image(minimapCache, x, y, minimapSize, minimapSize);

  // Draw player dot on overlay
  if (typeof gameWorld !== 'undefined' && gameWorld.length > 0) {
    const rows = gameWorld.length;
    const cols = gameWorld[0].length;
    const tileSize = minimapSize / Math.max(rows, cols);
    const mapWidth = cols * tileSize;
    const mapHeight = rows * tileSize;
    const offsetX = x + (minimapSize - mapWidth) / 2;
    const offsetY = y + (minimapSize - mapHeight) / 2;

    const playerGridX = (pX + 600) / 50;
    const playerGridY = (pY + 375) / 50;
    
    noStroke();
    // Use the exact same coordinate mapping as the render cache
    const dotX = offsetX + (playerGridX * tileSize);
    const dotY = offsetY + (playerGridY * tileSize);
    
    fill(255, 0, 0, alphaValue);
    ellipse(dotX, dotY, 3, 3);

    // Draw waypoint dot
    if (typeof waypointCoordinates !== 'undefined' && typeof currentWaypointIndex !== 'undefined' && waypointCoordinates[currentWaypointIndex]) {
      const wp = waypointCoordinates[currentWaypointIndex];
      const wpGridX = wp[0] / 50;
      const wpGridY = wp[1] / 50;
      fill(0, 255, 255, alphaValue);
      ellipse(offsetX + wpGridX * tileSize, offsetY + wpGridY * tileSize, 3, 3);
    }
  }
  pop();
}

var hasUsedCartridge = false;
function drawUILabels() {
  // Disabled labels
  return;
  push();
  resetMatrix();
  textFont(Silkscreen);
  
  // Objectives Label
  fill(255, 150, 0, 200);
  textSize(18);
  textAlign(LEFT, TOP);
  text("OBJECTIVES", 20, 20);
  
  // Controls Label
  textAlign(RIGHT, TOP);
  text("CONTROLS", width - 20, 20);
  
  // Control details
  textSize(12);
  fill(255, 255, 255, 150);
  let controlsLabels = [
    "WASD - Move",
    "Mouse - Aim/Shoot",
    "E - Interact",
    "Q (Hold) - Switch Robot",
    "1-8 - Hotbar",
    "X - Drop Item",
    "R (Hold) - Transfer",
    "ESC - Pause"
  ];
  for(let i = 0; i < controlsLabels.length; i++) {
    text(controlsLabels[i], width - 20, 45 + (i * 18));
  }
  pop();
}

function drawCartridgeTutorial() {
  //if the player hasn't yet used a cartridge, and they are low on health, this message will guide them to use a cartridge to replenish their energy
  if (hasUsedCartridge || activePlayer === 0) return;

  const lowEnergy = healthPoints < players[activePlayer].maxHealth * 0.3;
  if (lowEnergy) {
    let hasCartridge = false;
    for (let item of inventoryList) {
      if (item && item.name.includes("cartridge")) {
        hasCartridge = true;
        break;
      }
    }

    if (hasCartridge) {
      push();
      textAlign(CENTER, CENTER);
      textSize(18);
      textFont(Silkscreen);
      fill(255, 200, 0, 200 + sin(frameCount * 0.1) * 55);
      text("Click with a cartridge in hand to restore energy.", width / 2, height - 150);
      pop();
    }
  }
}

function drawItems() {
  updateDroppedItems();
}

function drawInventory() {
  // If inventory slot changed, flash the name of the new item.
  if (lastInventorySlot !== inventorySlot) {
    itemLabelAlpha = 1.5; // Set to 1.5 for slight delay, so it stays a while before fading out
    lastInventorySlot = inventorySlot;
  }

  // Slowly decrease transparency
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

      // resize images to fit within the bounds of an inventory slot. 
      const maxSize = 50 * (inventoryList[i].scaleFactor || 1.0);
      let itemWidth, itemHeight;
      // does ratio based on which is larger dimension
      if (inventoryList[i].HtoW > 1) {
        itemHeight = maxSize;
        itemWidth = maxSize / inventoryList[i].HtoW;
      } else {

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
  noStroke();
}

function drawHealth() {
  // Hide health bar for the human character
  if (activePlayer === 0) {
    return;
  }

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
  constructor(type, name, amount, scaleFactor = 1.0) {
    this.amount = amount;
    this.scaleFactor = scaleFactor;

    if (type == "sprayer") {
      this.type = "sprayer";
      this.stackable = false;
      if (name == "steam sprayer") {
        this.name = name;
        this.image = SprayerImgs[0];
        this.damage = 1;
        this.ammo = 100;
        this.ammoType = "common";
        this.fireRate = .33;
        this.HtoW = 0.16;

      }
      if (name == "steam spreader") {
        this.name = name;
        this.image = SprayerImgs[1];
        this.damage = 1;
        this.fireRate = .167;
        this.HtoW = 0.16;
      }
      if (name == "steam pulser") {
        this.name = name;
        this.image = SprayerImgs[2];
        this.damage = 1;
        this.fireRate = .3;
        this.HtoW = .16;
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
      if (name == "boiler cartridge") {
        this.name = name;
        this.image = matImgs[5];
        this.HtoW = 1;
      }
      if (name == "train blueprint") {
        this.name = name;
        this.image = matImgs[6];
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
      if (name == "old wrench") {
        this.name = name;
        this.stackable = false;
        this.image = projImgs[2];
        this.HtoW = 2.18;
      }
      if (name == "crowbar") {
        this.name = name;
        this.stackable = false;
        this.image = itemImgs[5];
        this.HtoW = .8;
      }
    }
  }
}

class DroppedItem {
  constructor(item, x, y) {
    this.item = item;
    this.x = x;
    this.y = y;

    // Slide animation properties when items are dropped and they shoot in a random direction for a short distance
    this.slideDistance = random(15, 30); // total dist
    this.slideAngle = random(0, TWO_PI); // random direction in radians
    this.slideProgress = 0; // 0 to 1
    this.slideSpeed = 0.08; // how long it takes
    this.isSliding = true;

    // Floating animation properties (sin wave)
    this.floatTime = random(0, TWO_PI); //random to make sure every item doesn't float in sync
    this.floatSpeed = 0.05;
    this.floatAmplitude = 8; // How high it floats
    this.floatHeight = 15; // Base height above ground

    // Size properties categorize by item type
    this.calculateItemSize();
  }

  calculateItemSize() {
    // Determine base size based on item type
    let baseSize = 35; // Default

    if (this.item.type == "sprayer") {
      baseSize = 52;
    } else if (this.item.type === "consumable" || this.item.type == "material") {
      baseSize = 30; // Consumables are medium
    } else if (this.item.type === "projectile") {
      baseSize = 28; // Projectiles are medium-small
    }

    // Apply scale factor to base size
    baseSize *= (this.item.scaleFactor || 1.0);

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

let nearestPickupItem = null;
let pickupPromptAlpha = 0;
let pickupPromptScale = 0;
let pickupPromptGrowScale = 0.5;

function updateDroppedItems() {
  let count = 0;
  nearestPickupItem = null;
  let nearestDistance = Infinity;

  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;

  //calculate the right position to draw, using the edges of the screen as a ref
  const viewLeft = -camX - 100;
  const viewRight = -camX + width + 100;
  const viewTop = -camY - 100;
  const viewBottom = -camY + height + 100;

  for (let i = 0; i < droppedItems.length; i++) {
    let item = droppedItems[count];

    // only draw items within screen view
    const itemX = item.x + item.itemWidth / 2;
    const itemY = item.y + item.itemHeight / 2;

    if (itemX >= viewLeft && itemX <= viewRight &&
      itemY >= viewTop && itemY <= viewBottom) {
      item.draw();

      // check if this is the nearest pickup able item
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
  translate(width / 2, 80);
  scale(pickupPromptScale * pickupPromptGrowScale);
  translate(-(width / 2), -80);

  fill(255, 150, 0, pickupPromptAlpha * 0.78);
  textSize(20);
  textFont(Silkscreen);
  textAlign(CENTER, CENTER);

  // disp at top of screen
  const promptText = "Press E to Pick Up " + item.item.name;

  // background for text
  const promptWidth = textWidth(promptText);
  fill(0, 0, 0, pickupPromptAlpha * 0.6);
  rect(width / 2 - promptWidth / 2 - 10, 63, promptWidth + 20, 35, 5);

  fill(255, 150, 0, pickupPromptAlpha);
  text(promptText, width / 2, 80);

  pop();
}