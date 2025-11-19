// ============== EDITOR (3-LAYER SUPPORT) ==============
var editorMode = false;
var selectedTileType = 0;    // current tile type
// Use global maxTileTypes from your main script; fallback to tileImgs length if missing:
function __getMaxTileTypes() {
  if (typeof maxTileTypes !== "undefined") return maxTileTypes;
  if (typeof tileImgs !== "undefined" && tileImgs) return tileImgs.length;
  return 0;
}
var tileRotation = 0;        // 0, 90, 180, 270
var tileFlipH = false;       // horizontal flip
var tileFlipV = false;       // vertical flip
var editorLayer = 0;         // 0 & 1 behind; 2 & 3 in front
const EDIT_TILE_SIZE = 50;
var cratePlacementPaused = false; // Pauses tile placement after crate is placed
var lastCrateRow = -1;       // Row of last placed crate
var lastCrateCol = -1;       // Column of last placed crate
var selectedItemIndex = 0;   // Currently selected item from itemConstructors
var selectedCrateItems = []; // Array to store selected item constructors for this crate
var crateInventories = new Map(); // Map to store items for each crate: key = "row,col", value = array of item constructors

// Tile tinting
var tileTintR = 255;
var tileTintG = 255;
var tileTintB = 255;
var draggingSlider = null; // Which slider is being dragged (null, 'r', 'g', or 'b')

// Minimap caching variables
var minimapCache = null;     // Cached screenshot of the minimap
var lastMinimapPress = false; // Track if M was pressed last frame
var minimapNeedsRedraw = true; // Flag to trigger minimap redraw

// Disable context menu so right-click can erase while editing
if (typeof window !== "undefined") {
  window.oncontextmenu = function(e) {
    if (editorMode) { e.preventDefault(); return false; }
  };
}



function drawSelectedItemImage() {
  if (typeof itemConstructors === 'undefined' || !itemConstructors.length) return;
  
  // Get the selected item constructor
  const itemData = itemConstructors[selectedItemIndex];
  const itemType = itemData[0];
  const itemName = itemData[1];
  const itemImage = itemData[3]; // Get image from index 3 (4th position)
  
  // Draw the item image centered on screen
  push();
  imageMode(CENTER);
  
  // Draw background box
  fill(0, 0, 0, 200);
  stroke(255, 255, 0);
  strokeWeight(3);
  rectMode(CENTER);
  rect(width / 2, height / 2 - 50, 200, 200, 10);
  
  // Draw the item image
  if (itemImage) {
    // Calculate size to fit in box while maintaining aspect ratio
    const maxSize = 150;
    let displayWidth, displayHeight;
    
    // Get image dimensions to calculate aspect ratio
    const imgWidth = itemImage.width;
    const imgHeight = itemImage.height;
    const aspectRatio = imgHeight / imgWidth; // HtoW ratio
    
    if (aspectRatio > 1) {
      // Height is larger
      displayHeight = maxSize;
      displayWidth = maxSize / aspectRatio;
    } else {
      // Width is larger or equal
      displayWidth = maxSize;
      displayHeight = maxSize * aspectRatio;
    }
    
    image(itemImage, width / 2, height / 2 - 50, displayWidth, displayHeight);
  }
  
  // Draw item name below image
  fill(255, 255, 0);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text(itemName, width / 2, height / 2 + 80);
  
  // Draw counter showing position in list
  textSize(14);
  text(`Item ${selectedItemIndex + 1} of ${itemConstructors.length}`, width / 2, height / 2 + 110);
  
  pop();
}

function toggleEditorMode() {
  editorMode = !editorMode;
  console.log("Editor mode:", editorMode ? "ON" : "OFF");
}

function drawEditorUI() {
  // Border
  stroke(255, 255, 0);
  strokeWeight(8);
  noFill();
  rect(4, 4, width - 8, height - 8);

  // Header text
  fill(255, 255, 0);
  noStroke();
  textSize(18);
  textAlign(CENTER);
  text("EDITOR MODE - Press Shift+E to exit", width / 2, 25);
  text("Left-click: place | Right-click: erase | Alt+Click: pick | R: rotate | H: flip horizontal | V: flip vertical", width / 2, 45);
  
  const flipText = (tileFlipH ? "H" : "") + (tileFlipV ? "V" : "") || "none";
  text(
    "Layer: " + editorLayer +
    " | Tile: " + selectedTileType +
    " | Rotation: " + tileRotation + "° | Flip: " + flipText + " | Scroll / , . to change tile",
    width / 2, 65
  );

  // Draw RGB sliders
  drawRGBSliders();

  // Draw pause overlay if crate placement is paused
  if (cratePlacementPaused) {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);

    fill(255, 255, 0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("SPACE: Add item | ENTER: Finish crate", width / 2, height - 80);
    text("ARROW KEYS or SCROLL to browse items", width / 2, height - 50);
    text(`Items in crate: ${selectedCrateItems.length}`, width / 2, height - 20);
    
    // Draw selected item image
    drawSelectedItemImage();
  } else {
    drawTilePreview();
  }
  
  // Draw minimap when P is held
  const pKeyPressed = keyIsDown(80); // 80 is 'P'
  
  if (pKeyPressed) {
    // If P just got pressed (transition from not pressed to pressed)
    if (!lastMinimapPress) {
      minimapNeedsRedraw = true;
    }
    
    // Render minimap (either fresh or from cache)
    if (minimapNeedsRedraw) {
      renderMinimapToCache();
      minimapNeedsRedraw = false;
    }
    
    // Draw the cached minimap
    drawCachedMinimap();
    
    // Draw player indicator in real-time (not cached)
    drawMinimapPlayerIndicator();
  }
  
  // Update last frame state
  lastMinimapPress = pKeyPressed;
}

function renderMinimapToCache() {
  if (!gameWorld || gameWorld.length === 0) return;
  
  const minimapSize = 250;
  const rows = gameWorld.length;
  const cols = gameWorld[0] ? gameWorld[0].length : 0;
  
  if (rows === 0 || cols === 0) return;
  
  // Create graphics buffer for minimap
  if (!minimapCache) {
    minimapCache = createGraphics(minimapSize + 40, minimapSize + 40);
  }
  
  // Clear the cache
  minimapCache.clear();
  
  // Calculate tile size on minimap
  const tileSize = Math.min(minimapSize / cols, minimapSize / rows);
  const mapWidth = cols * tileSize;
  const mapHeight = rows * tileSize;
  
  // Center the map in the minimap area
  const offsetX = 20 + (minimapSize - mapWidth) / 2;
  const offsetY = 20 + (minimapSize - mapHeight) / 2;
  
  // Draw background
  minimapCache.fill(0, 0, 0, 200);
  minimapCache.stroke(255, 255, 0);
  minimapCache.strokeWeight(2);
  minimapCache.rect(20, 20, minimapSize, minimapSize);
  
  minimapCache.noStroke();
  
  // Draw tiles
  for (let i = 0; i < rows; i++) {
    if (!gameWorld[i]) continue;
    
    for (let j = 0; j < cols; j++) {
      const cell = gameWorld[i][j];
      if (!cell) continue;
      
      // Find the highest visible layer
      let tileObj = null;
      if ('layers' in cell) {
        for (let L = 3; L >= 0; L--) {
          if (cell.layers[L]) {
            tileObj = cell.layers[L];
            break;
          }
        }
      } else {
        tileObj = cell;
      }
      
      if (!tileObj) continue;
      
      const tileType = tileObj.type;
      
      // Color code tiles by type
      if (tileType === 0) minimapCache.fill(100, 150, 100);
      else if (tileType === 1) minimapCache.fill(80, 80, 80);
      else if (tileType === 2) minimapCache.fill(90, 90, 90);
      else if (tileType === 3) minimapCache.fill(150, 150, 150);
      else if (tileType === 4) minimapCache.fill(160, 80, 60);
      else if (tileType === 5) minimapCache.fill(200, 150, 100);
      else if (tileType === 6) minimapCache.fill(100, 100, 200);
      else if (tileType === 7) minimapCache.fill(120, 90, 60);
      else if (tileType === 8) minimapCache.fill(60, 60, 60);
      else if (tileType === 9) minimapCache.fill(139, 90, 60);
      else if (tileType === 10) minimapCache.fill(173, 216, 230);
      else if (tileType === 11) minimapCache.fill(100, 100, 100);
      else if (tileType === 12) minimapCache.fill(139, 90, 43);
      else minimapCache.fill(200, 200, 200);
      
      minimapCache.rect(offsetX + j * tileSize, offsetY + i * tileSize, tileSize, tileSize);
    }
  }
  
  // Label
  minimapCache.noStroke();
  minimapCache.fill(255, 255, 0);
  minimapCache.textSize(14);
  minimapCache.textAlign(LEFT);
  minimapCache.text("MINIMAP (Hold P)", 25, 15);
}

function drawCachedMinimap() {
  if (!minimapCache) return;
  
  const minimapSize = 250;
  const minimapX = width - minimapSize - 20;
  const minimapY = 90;
  
  // Draw the cached minimap image
  image(minimapCache, minimapX - 20, minimapY - 20);
}

function drawMinimapPlayerIndicator() {
  if (!gameWorld || gameWorld.length === 0) return;
  
  const minimapSize = 250;
  const minimapX = width - minimapSize - 20;
  const minimapY = 90;
  
  const rows = gameWorld.length;
  const cols = gameWorld[0] ? gameWorld[0].length : 0;
  
  if (rows === 0 || cols === 0) return;
  
  // Calculate tile size on minimap
  const tileSize = Math.min(minimapSize / cols, minimapSize / rows);
  const mapWidth = cols * tileSize;
  const mapHeight = rows * tileSize;
  
  // Center the map in the minimap area
  const offsetX = minimapX + (minimapSize - mapWidth) / 2;
  const offsetY = minimapY + (minimapSize - mapHeight) / 2;
  
  // Draw player position
  const playerGridX = Math.floor((pX + 600) / 50);
  const playerGridY = Math.floor((pY + 375) / 50);
  
  fill(255, 0, 0);
  stroke(255, 255, 255);
  strokeWeight(1);
  const playerMinimapX = offsetX + playerGridX * tileSize;
  const playerMinimapY = offsetY + playerGridY * tileSize;
  ellipse(playerMinimapX + tileSize / 2, playerMinimapY + tileSize / 2, tileSize * 2, tileSize * 2);
}

function drawRGBSliders() {
  const sliderX = 20;
  const sliderY = 100;
  const sliderWidth = 200;
  const sliderHeight = 20;
  const spacing = 35;

  push();
  textAlign(LEFT, CENTER);
  textSize(14);

  // Red slider
  fill(255, 255, 255);
  text("R:", sliderX, sliderY);
  drawSlider(sliderX + 25, sliderY - 10, sliderWidth, sliderHeight, tileTintR, 255, 0, 0, 'r');

  // Green slider
  fill(255, 255, 255);
  text("G:", sliderX, sliderY + spacing);
  drawSlider(sliderX + 25, sliderY + spacing - 10, sliderWidth, sliderHeight, tileTintG, 0, 255, 0, 'g');

  // Blue slider
  fill(255, 255, 255);
  text("B:", sliderX, sliderY + spacing * 2);
  drawSlider(sliderX + 25, sliderY + spacing * 2 - 10, sliderWidth, sliderHeight, tileTintB, 0, 0, 255, 'b');

  // Reset button
  const buttonX = sliderX + 25;
  const buttonY = sliderY + spacing * 3 - 10;
  const buttonWidth = 80;
  const buttonHeight = 25;
  
  // Check if mouse is over reset button
  const overButton = mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                     mouseY >= buttonY && mouseY <= buttonY + buttonHeight;
  
  fill(overButton ? 200 : 150);
  stroke(255);
  strokeWeight(2);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
  
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  text("Reset", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

  // Tint preview box
  const previewX = sliderX + sliderWidth + 50;
  const previewY = sliderY - 10;
  const previewSize = 80;
  
  fill(tileTintR, tileTintG, tileTintB);
  stroke(255);
  strokeWeight(2);
  rect(previewX, previewY, previewSize, previewSize);
  
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(12);
  text("Tint Preview", previewX + previewSize / 2, previewY + previewSize + 15);

  pop();
}

function drawSlider(x, y, w, h, value, r, g, b, id) {
  // Background track
  fill(50);
  stroke(200);
  strokeWeight(1);
  rect(x, y, w, h, 3);

  // Colored fill
  fill(r, g, b, 150);
  noStroke();
  rect(x, y, (value / 255) * w, h, 3);

  // Handle
  const handleX = x + (value / 255) * w;
  fill(255);
  stroke(0);
  strokeWeight(2);
  ellipse(handleX, y + h / 2, 15, 15);

  // Value text
  fill(255);
  noStroke();
  textAlign(RIGHT, CENTER);
  textSize(12);
  text(Math.round(value), x + w + 30, y + h / 2);
}

function handleSliderDrag() {
  if (!editorMode) return;

  const sliderX = 20 + 25;
  const sliderY = 100 - 10;
  const sliderWidth = 200;
  const sliderHeight = 20;
  const spacing = 35;

  // Check if dragging or starting to drag
  if (mouseIsPressed) {
    // Check reset button
    const buttonX = 20 + 25;
    const buttonY = sliderY + spacing * 3;
    const buttonWidth = 80;
    const buttonHeight = 25;
    
    if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
      if (draggingSlider === null) {
        tileTintR = 255;
        tileTintG = 255;
        tileTintB = 255;
        draggingSlider = 'reset'; // Prevent multiple resets
      }
      return true;
    }

    // Check which slider is being dragged
    if (draggingSlider === null) {
      // Red slider
      if (mouseX >= sliderX && mouseX <= sliderX + sliderWidth &&
          mouseY >= sliderY && mouseY <= sliderY + sliderHeight) {
        draggingSlider = 'r';
      }
      // Green slider
      else if (mouseX >= sliderX && mouseX <= sliderX + sliderWidth &&
               mouseY >= sliderY + spacing && mouseY <= sliderY + spacing + sliderHeight) {
        draggingSlider = 'g';
      }
      // Blue slider
      else if (mouseX >= sliderX && mouseX <= sliderX + sliderWidth &&
               mouseY >= sliderY + spacing * 2 && mouseY <= sliderY + spacing * 2 + sliderHeight) {
        draggingSlider = 'b';
      }
    }

    // Update slider value if dragging
    if (draggingSlider === 'r' || draggingSlider === 'g' || draggingSlider === 'b') {
      const value = constrain(((mouseX - sliderX) / sliderWidth) * 255, 0, 255);
      if (draggingSlider === 'r') tileTintR = value;
      else if (draggingSlider === 'g') tileTintG = value;
      else if (draggingSlider === 'b') tileTintB = value;
      return true; // Consuming the mouse event
    }
  } else {
    draggingSlider = null;
  }

  return false;
}

function drawTilePreview() {
  if (!(gameWorld && gameWorld.length > 0)) return;
  if (cratePlacementPaused) return; // Don't show preview when paused

  // World coords from mouse
  var worldX = mouseX - camX;
  var worldY = mouseY - camY;

  // Grid cell
  var gridCol = Math.floor(worldX / EDIT_TILE_SIZE);
  var gridRow = Math.floor(worldY / EDIT_TILE_SIZE);

  // In-bounds?
  if (gridRow < 0 || gridRow >= gameWorld.length) return;
  if (gridCol < 0 || gridCol >= gameWorld[gridRow].length) return;

  var snapX = gridCol * EDIT_TILE_SIZE;
  var snapY = gridRow * EDIT_TILE_SIZE;

  push();
  translate(camX, camY);

  // Semi-transparent preview of selected tile in current layer with tint
  if (tileImgs && tileImgs[selectedTileType]) {
    tint(tileTintR, tileTintG, tileTintB, 150);
    push();
    translate(snapX + 25, snapY + 25);
    rotate(radians(tileRotation));
    scale(tileFlipH ? -1 : 1, tileFlipV ? -1 : 1);
    image(tileImgs[selectedTileType], -25, -25, 50, 50);
    pop();
    noTint();
  }

  // Grid cell outline
  noFill();
  stroke(255, 255, 0, 200);
  strokeWeight(2);
  rect(snapX, snapY, EDIT_TILE_SIZE, EDIT_TILE_SIZE);

  // Small badge with current layer
  noStroke();
  fill(0, 0, 0, 160);
  rect(snapX + 2, snapY + 2, 16, 16, 3);
  fill(255, 255, 0);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(String(editorLayer), snapX + 10, snapY + 10);

  pop();
}

function handleEditorClick() {
  if (!(editorMode && gameWorld && gameWorld.length > 0)) return;
  if (cratePlacementPaused) return; // Don't allow clicks when paused

  // Check if clicking on sliders first
  if (handleSliderDrag()) return;

  var worldX = mouseX - camX;
  var worldY = mouseY - camY;

  var gridCol = Math.floor(worldX / EDIT_TILE_SIZE);
  var gridRow = Math.floor(worldY / EDIT_TILE_SIZE);

  if (gridRow < 0 || gridRow >= gameWorld.length) return;
  if (gridCol < 0 || gridCol >= gameWorld[gridRow].length) return;

  // Alt + Left click = eyedropper from current layer
  if (keyIsDown(18) && mouseButton === LEFT) { // 18 is Alt in p5
    if (typeof getTile === 'function') {
      const t = getTile(gridRow, gridCol, editorLayer);
      if (t) {
        selectedTileType = t.type;
        tileRotation = t.rotation || 0;
        tileFlipH = t.flipH || false;
        tileFlipV = t.flipV || false;
        // Pick tint if available
        if (t.tintR !== undefined) {
          tileTintR = t.tintR;
          tileTintG = t.tintG;
          tileTintB = t.tintB;
        }
        console.log("Picked tile", selectedTileType, "rot", tileRotation, "flip H:", tileFlipH, "V:", tileFlipV, "from layer", editorLayer);
      }
    }
    return;
  }

  // Right click = erase current layer
  if (mouseButton === RIGHT) {
    if (typeof clearTile === 'function') {
      clearTile(gridRow, gridCol, editorLayer);
      console.log("Erased at row", gridRow, "col", gridCol, "layer", editorLayer);
    } else {
      // Fallback if helpers missing (legacy)
      gameWorld[gridRow][gridCol] = undefined;
    }
    return;
  }

  // Left click = paint current layer with tint
  if (mouseButton === LEFT) {
    if (typeof setTile === 'function') {
      setTile(gridRow, gridCol, editorLayer, selectedTileType, tileRotation, tileFlipH, tileFlipV, tileTintR, tileTintG, tileTintB);
    } else {
      // Fallback if helpers missing (legacy)
      gameWorld[gridRow][gridCol] = { 
        type: selectedTileType, 
        rotation: tileRotation, 
        flipH: tileFlipH, 
        flipV: tileFlipV,
        tintR: tileTintR,
        tintG: tileTintG,
        tintB: tileTintB
      };
    }
    console.log("Placed type", selectedTileType, "rot", tileRotation, "flip H:", tileFlipH, "V:", tileFlipV, "tint RGB:", tileTintR, tileTintG, tileTintB, "at", gridRow, gridCol, "layer", editorLayer);

    // Check if a crate (type 5) was placed
    if (selectedTileType === 5) {
      cratePlacementPaused = true;
      lastCrateRow = gridRow;
      lastCrateCol = gridCol;
      console.log("Crate placed at row", gridRow, "col", gridCol, "- press ENTER to continue");
    }
  }
}

function handleEditorKeyPress() {
  // Toggle editor mode with Shift+E
  if (keyCode == 69 && keyIsDown(SHIFT)) { // E
    toggleEditorMode();
  }

  if (!editorMode) return;

  // Add item to crate with SPACE (without closing menu)
  if (cratePlacementPaused && keyCode === 32) { // 32 is SPACE
    if (typeof itemConstructors !== 'undefined' && itemConstructors.length > 0) {
      selectedCrateItems.push(itemConstructors[selectedItemIndex]);
      console.log("Added item to crate:", itemConstructors[selectedItemIndex][1]);
      console.log("Crate now contains", selectedCrateItems.length, "items");
    }
    return;
  }
  
  // Finalize and close crate menu with Enter
  if (cratePlacementPaused && keyCode === 13) { // 13 is Enter
    // Store the items for this specific crate using its coordinates
    const crateKey = lastCrateRow + "," + lastCrateCol;
    crateInventories.set(crateKey, [...selectedCrateItems]); // Store a copy of the array
    console.log("Stored", selectedCrateItems.length, "items for crate at", crateKey);
    
    // Reset the array for the next crate
    selectedCrateItems = [];
    
    cratePlacementPaused = false;
    console.log("Resumed tile placement");
    return;
  }

  // Handle item browsing when paused
  if (cratePlacementPaused) {
    if (typeof itemConstructors !== 'undefined' && itemConstructors.length > 0) {
      // Arrow keys to browse items
      if (keyCode === 37 || keyCode === 38) { // Left or Up arrow
        selectedItemIndex = (selectedItemIndex - 1 + itemConstructors.length) % itemConstructors.length;
        console.log("Selected item:", itemConstructors[selectedItemIndex][1]);
      }
      if (keyCode === 39 || keyCode === 40) { // Right or Down arrow
        selectedItemIndex = (selectedItemIndex + 1) % itemConstructors.length;
        console.log("Selected item:", itemConstructors[selectedItemIndex][1]);
      }
    }
    return; // Don't allow other keys when paused
  }

  // Layer selection: 1 / 2 / 3
  if (key === '1') { editorLayer = 0; console.log("Layer -> 0"); }
  if (key === '2') { editorLayer = 1; console.log("Layer -> 1"); }
  if (key === '3') { editorLayer = 2; console.log("Layer -> 2"); }

  // Tile switching with comma and period keys
  if (keyCode == 188) { // ,
    const m = __getMaxTileTypes();
    if (m > 0) selectedTileType = (selectedTileType - 1 + m) % m;
    console.log("Changed to tile type:", selectedTileType);
  }
  if (keyCode == 190) { // .
    const m = __getMaxTileTypes();
    if (m > 0) selectedTileType = (selectedTileType + 1) % m;
    console.log("Changed to tile type:", selectedTileType);
  }

  // R to rotate
  if (keyCode == 82) { // R
    tileRotation = (tileRotation + 90) % 360;
    console.log("Rotated tile to:", tileRotation + "°");
  }

  // H to flip horizontal
  if (keyCode == 72) { // H
    tileFlipH = !tileFlipH;
    console.log("Horizontal flip:", tileFlipH);
  }

  // V to flip vertical
  if (keyCode == 86) { // V
    tileFlipV = !tileFlipV;
    console.log("Vertical flip:", tileFlipV);
  }
}

function handleEditorMouseWheel(event) {
  if (!editorMode) return false;
  
  // If paused, use wheel to browse items instead
  if (cratePlacementPaused) {
    if (typeof itemConstructors !== 'undefined' && itemConstructors.length > 0) {
      if (event.delta > 0) {
        selectedItemIndex = (selectedItemIndex + 1) % itemConstructors.length;
      } else {
        selectedItemIndex = (selectedItemIndex - 1 + itemConstructors.length) % itemConstructors.length;
      }
      console.log("Selected item:", itemConstructors[selectedItemIndex][1]);
    }
    return true; // Consume wheel when paused
  }

  const m = __getMaxTileTypes();
  if (m > 0) {
    if (event.delta > 0) {
      selectedTileType = (selectedTileType + 1) % m;
    } else {
      selectedTileType = (selectedTileType - 1 + m) % m;
    }
  }
  console.log("Mouse wheel changed to tile type:", selectedTileType);
  return true; // consume wheel in editor mode
}
// ============== END EDITOR (3-LAYER SUPPORT) ==============
