
// Crate menu state
var crateMenuOpen = false;
var currentCrateRow = -1;
var currentCrateCol = -1;
var crateMenuAlpha = 0;
var crateMenuScale = 0.8;
var crateScrollOffset = 0;
var selectedCrateSlot = -1; // -1 = none, >= 0 = crate slot index
var crateJustOpened = false; // Prevent immediate close on open frame
var eKeyWasDown = false; // Track if E key was pressed when opening

// Check if player is near a crate
function checkNearCrate() {
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  
  const gridCol = Math.floor(playerCenterX / 50);
  const gridRow = Math.floor(playerCenterY / 50);
  
  // Check surrounding tiles (3x3 area)
  for (let r = gridRow - 1; r <= gridRow + 1; r++) {
    for (let c = gridCol - 1; c <= gridCol + 1; c++) {
      if (r < 0 || c < 0 || r >= gameWorld.length || c >= gameWorld[r].length) continue;
      
      const cell = gameWorld[r][c];
      if (!cell) continue;
      
      // Check all layers for crates
      if ('layers' in cell) {
        for (let L = 0; L < 5; L++) {
          const tile = cell.layers[L];
          if (tile && tile.type === 5) { // 5 is crate type
            const crateCenterX = c * 50 + 25;
            const crateCenterY = r * 50 + 25;
            const dist = distance(playerCenterX, playerCenterY, crateCenterX, crateCenterY);
            
            if (dist < 60) {
              return { row: r, col: c };
            }
          }
        }
      }
    }
  }
  
  return null;
}

// Toggle crate menu
function toggleCrateMenu(row, col) {
  if (crateMenuOpen && currentCrateRow === row && currentCrateCol === col) {
    crateMenuOpen = false;
    currentCrateRow = -1;
    currentCrateCol = -1;
    selectedCrateSlot = -1;
    crateJustOpened = false;
  } else {
    crateMenuOpen = true;
    currentCrateRow = row;
    currentCrateCol = col;
    crateMenuAlpha = 0;
    crateMenuScale = 0.8;
    crateScrollOffset = 0;
    selectedCrateSlot = -1;
    crateJustOpened = true; // Set flag to prevent immediate close
    eKeyWasDown = keyIsDown(69); // Remember E key state when opening
  }
}

// Handle crate menu input
function handleCrateInput() {
  if (!crateMenuOpen) return;
  
  // Track E key state - only allow closing when E is pressed fresh (not held from opening)
  const eKeyCurrentlyDown = keyIsDown(69);
  
  if (eKeyWasDown && !eKeyCurrentlyDown) {
    // E key was released, now we can accept a new press
    eKeyWasDown = false;
  }
  
  // Reset the flag after first frame
  if (crateJustOpened) {
    crateJustOpened = false;
    return; // Don't process input on the frame it was opened
  }
  
  // Close with ESC
  if (keyCode === 27) { // ESC
    crateMenuOpen = false;
    currentCrateRow = -1;
    currentCrateCol = -1;
    selectedCrateSlot = -1;
    eKeyWasDown = false;
  }
  
  // Close with E - only if E wasn't held from opening
  if (keyCode === 69 && !eKeyWasDown) { // E
    crateMenuOpen = false;
    currentCrateRow = -1;
    currentCrateCol = -1;
    selectedCrateSlot = -1;
    eKeyWasDown = false;
  }
}

// Draw crate menu
function drawCrateMenu() {
  if (!crateMenuOpen) return;
  
  // Fade in
  crateMenuAlpha = lerp(crateMenuAlpha, 255, 0.15);
  crateMenuScale = lerp(crateMenuScale, 1, 0.15);
  
  push();
  
  // Dark overlay
  fill(0, 0, 0, crateMenuAlpha * 0.7);
  rect(0, 0, width, height);
  
  // Menu panel
  translate(width / 2, height / 2);
  scale(crateMenuScale);
  translate(-width / 2, -height / 2);
  
  const menuX = width / 2 - 300;
  const menuY = height / 2 - 250;
  const menuW = 600;
  const menuH = 500;
  
  // Background
  fill(40, 40, 45, crateMenuAlpha);
  stroke(100, 255, 255, crateMenuAlpha);
  strokeWeight(3);
  rect(menuX, menuY, menuW, menuH, 10);
  
  // Title
  fill(100, 255, 255, crateMenuAlpha);
  noStroke();
  textFont(Silkscreen);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("CRATE STORAGE", width / 2, menuY + 30);
  
  // Instructions
  textSize(14);
  text("Left-click crate item to take | Right-click inventory to store | E or ESC to close", width / 2, menuY + 60);
  
  // Get crate contents
  const crateKey = currentCrateRow + "," + currentCrateCol;
  const crateItems = crateInventories.get(crateKey) || [];
  
  // Draw crate contents section
  fill(30, 30, 35, crateMenuAlpha);
  rect(menuX + 20, menuY + 90, menuW - 40, 180, 5);
  
  fill(255, 255, 255, crateMenuAlpha);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Crate Contents:", menuX + 30, menuY + 100);
  
  // Draw crate items (grid layout)
  const itemSize = 50;
  const itemsPerRow = 10;
  const startX = menuX + 30;
  const startY = menuY + 130;
  
  for (let i = 0; i < crateItems.length; i++) {
    const itemConstructor = crateItems[i];
    const item = new Item(itemConstructor[0], itemConstructor[1], itemConstructor[2]);
    
    const row = Math.floor(i / itemsPerRow);
    const col = i % itemsPerRow;
    const itemX = startX + col * (itemSize + 5);
    const itemY = startY + row * (itemSize + 5);
    
    // Check if mouse is over this item
    const mouseOver = mouseX > itemX && mouseX < itemX + itemSize &&
                      mouseY > itemY && mouseY < itemY + itemSize;
    
    // Slot background
    if (mouseOver) {
      fill(80, 80, 85, crateMenuAlpha);
    } else {
      fill(50, 50, 55, crateMenuAlpha);
    }
    stroke(70, 70, 75, crateMenuAlpha);
    strokeWeight(2);
    rect(itemX, itemY, itemSize, itemSize, 3);
    
    // Item image
    if (item.image) {
      let imgW = itemSize * 0.8;
      let imgH = itemSize * 0.8;
      
      if (item.HtoW > 1) {
        imgH = itemSize * 0.8;
        imgW = imgH / item.HtoW;
      } else {
        imgW = itemSize * 0.8;
        imgH = imgW * item.HtoW;
      }
      
      tint(255, crateMenuAlpha);
      imageMode(CENTER);
      image(item.image, itemX + itemSize / 2, itemY + itemSize / 2, imgW, imgH);
      noTint();
      imageMode(CORNER);
    }
    
    // Amount text for stackable items
    if (item.stackable && item.amount > 1) {
      fill(255, 255, 255, crateMenuAlpha);
      noStroke();
      textSize(12);
      textAlign(RIGHT, BOTTOM);
      text(item.amount, itemX + itemSize - 5, itemY + itemSize - 5);
    }
    
    // Click to take item
    if (mouseOver && mouseIsPressed && mouseButton === LEFT && !get('crateTakeClickHandled')) {
      takeCrateItem(i);
      set('crateTakeClickHandled', true);
    }
  }
  
  // Draw player inventory section
  fill(30, 30, 35, crateMenuAlpha);
  rect(menuX + 20, menuY + 300, menuW - 40, 180, 5);
  
  fill(255, 255, 255, crateMenuAlpha);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Your Inventory:", menuX + 30, menuY + 310);
  
  // Draw inventory items
  const invStartY = menuY + 340;
  for (let i = 0; i < inventoryList.length; i++) {
    const itemX = startX + i * (itemSize + 5);
    const itemY = invStartY;
    
    const mouseOver = mouseX > itemX && mouseX < itemX + itemSize &&
                      mouseY > itemY && mouseY < itemY + itemSize;
    
    // Slot background
    if (mouseOver) {
      fill(80, 80, 85, crateMenuAlpha);
    } else {
      fill(50, 50, 55, crateMenuAlpha);
    }
    stroke(70, 70, 75, crateMenuAlpha);
    strokeWeight(2);
    rect(itemX, itemY, itemSize, itemSize, 3);
    
    // Slot number
    fill(150, 150, 150, crateMenuAlpha);
    noStroke();
    textSize(10);
    textAlign(LEFT, TOP);
    text(i + 1, itemX + 3, itemY + 3);
    
    // Item if present
    if (inventoryList[i] != null) {
      const item = inventoryList[i];
      
      if (item.image) {
        let imgW = itemSize * 0.8;
        let imgH = itemSize * 0.8;
        
        if (item.HtoW > 1) {
          imgH = itemSize * 0.8;
          imgW = imgH / item.HtoW;
        } else {
          imgW = itemSize * 0.8;
          imgH = imgW * item.HtoW;
        }
        
        tint(255, crateMenuAlpha);
        imageMode(CENTER);
        image(item.image, itemX + itemSize / 2, itemY + itemSize / 2, imgW, imgH);
        noTint();
        imageMode(CORNER);
      }
      
      // Amount
      if (item.stackable && item.amount > 1) {
        fill(255, 255, 255, crateMenuAlpha);
        noStroke();
        textSize(12);
        textAlign(RIGHT, BOTTOM);
        text(item.amount, itemX + itemSize - 5, itemY + itemSize - 5);
      }
      
      // Right-click to store in crate
      if (mouseOver && mouseIsPressed && mouseButton === RIGHT && !get('crateStoreClickHandled')) {
        storeItemInCrate(i);
        set('crateStoreClickHandled', true);
      }
    }
  }
  
  pop();
}

// Reset click handlers when mouse is released
function mouseReleased() {
  set('crateTakeClickHandled', false);
  set('crateStoreClickHandled', false);
}

// Take item from crate
function takeCrateItem(index) {
  const crateKey = currentCrateRow + "," + currentCrateCol;
  const crateItems = crateInventories.get(crateKey) || [];
  
  if (index < 0 || index >= crateItems.length) return;
  
  const itemConstructor = crateItems[index];
  const item = new Item(itemConstructor[0], itemConstructor[1], itemConstructor[2]);
  
  // Try to stack with existing items
  if (item.stackable) {
    for (let i = 0; i < inventoryList.length; i++) {
      if (inventoryList[i] != null && inventoryList[i].name === item.name) {
        inventoryList[i].amount += item.amount;
        crateItems.splice(index, 1);
        crateInventories.set(crateKey, crateItems);
        return;
      }
    }
  }
  
  // Find empty slot
  for (let i = 0; i < inventoryList.length; i++) {
    if (inventoryList[i] == null) {
      inventoryList[i] = item;
      crateItems.splice(index, 1);
      crateInventories.set(crateKey, crateItems);
      return;
    }
  }
  
  console.log("Inventory full!");
}

// Store item in crate
function storeItemInCrate(invSlot) {
  if (inventoryList[invSlot] == null) return;
  
  const crateKey = currentCrateRow + "," + currentCrateCol;
  const crateItems = crateInventories.get(crateKey) || [];
  
  const item = inventoryList[invSlot];
  
  // Find matching item constructor
  const itemConstructor = itemConstructors.find(ic => 
    ic[0] === item.type && ic[1] === item.name
  );
  
  if (itemConstructor) {
    // Create new constructor with current amount
    const newConstructor = [itemConstructor[0], itemConstructor[1], item.amount, itemConstructor[3]];
    crateItems.push(newConstructor);
    crateInventories.set(crateKey, crateItems);
    inventoryList[invSlot] = null;
  }
}

// Simple key-value store for click handling
const clickStore = {};
function get(key) {
  return clickStore[key] || false;
}
function set(key, value) {
  clickStore[key] = value;
}
