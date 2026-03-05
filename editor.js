var editorMode = false;
var selectedTileType = 0; 
// Use global variable, fallback to tileImgs length if missing:
function __getMaxTileTypes() {
  if (typeof maxTileTypes !== "undefined") return maxTileTypes;
  if (typeof tileImgs !== "undefined" && tileImgs) return tileImgs.length;
  return 0;
}
var tileRotation = 0;       
var tileFlipH = false;       
var tileFlipV = false;      
var tileColorIndex = 0;      
var editorLayer = 0;         // 5 layers: 0-1 behind, 2-4 in front
const EDIT_TILE_SIZE = 50;
var cratePlacementPaused = false; 
var lastCrateRow = -1;       
var lastCrateCol = -1;       
var selectedItemIndex = 0;   
var selectedCrateItems = []; 
var crateInventories = new Map(); 

var selectedEnemyIndex = 0;
var enemyTypes = ["harpy", "cyclops", "greg", "hydra", "boss"]

var particleSources = []; 
var placingParticleSource = false; 
var editingParticleSourceIndex = -1; 
var particleSourceConfig = {
  x: 0,
  y: 0,
  arcStart: 0,      
  arcEnd: 360,      
  color: [255, 100, 50], 
  size: 5,          
  sizeVariance: 2,  
  speed: 2,         
  spawnRate: 5,     
  duration: 60      
};

var minimapCache = null;     
var lastMinimapPress = false; 
var minimapNeedsRedraw = true; 

// Enable Right-Click in Editor Mode
if (typeof window !== "undefined") {
  window.oncontextmenu = function(e) {
    if (editorMode) { e.preventDefault(); return false; }
  };
}

// Draw the selected item image in the center of the screen
function drawSelectedItemImage() {
  if (typeof itemConstructors === 'undefined' || !itemConstructors.length) return;

  // Get the selected item constructor
  const itemData = itemConstructors[selectedItemIndex];
  const itemType = itemData[0];
  const itemName = itemData[1];
  const itemImage = itemData[3]; // Get image from index 3

  push();
  imageMode(CENTER);

  // Background
  fill(0, 0, 0, 200);
  stroke(255, 255, 0);
  strokeWeight(3);
  rectMode(CENTER);
  rect(width / 2, height / 2 - 50, 200, 200, 10);

  // Image
  if (itemImage) {
    // Scales image to fit
    const maxSize = 150;
    let displayWidth, displayHeight;

    // Image Dimensions
    const imgWidth = itemImage.width;
    const imgHeight = itemImage.height;
    const aspectRatio = imgHeight / imgWidth;

    if (aspectRatio > 1) {
      displayHeight = maxSize;
      displayWidth = maxSize / aspectRatio;
    } else {
      displayWidth = maxSize;
      displayHeight = maxSize * aspectRatio;
    }

    image(itemImage, width / 2, height / 2 - 50, displayWidth, displayHeight);
  }

  // Item Name
  fill(255, 255, 0);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text(itemName, width / 2, height / 2 + 80);

  textSize(14);
  text(`Item ${selectedItemIndex + 1} of ${itemConstructors.length}`, width / 2, height / 2 + 110);

  pop();
}

// Toggle editor mode
function toggleEditorMode() {
  editorMode = !editorMode;
  console.log("Editor mode:", editorMode ? "ON" : "OFF");
}

// Draw editor UI elements
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
  const maxColors = (tileColors[selectedTileType] || [[255, 255, 255]]).length;
  text(
    "Layer: " + editorLayer +
    " | Tile: " + selectedTileType +
    " | Rotation: " + tileRotation + "° | Flip: " + flipText +
    " | Color: " + tileColorIndex + "/" + (maxColors - 1) +
    " | [ ] to change color | O for Particles",
    width / 2, 65
  );

  // Particle editor
  if (placingParticleSource) {
    fill(255, 255, 0);
    textSize(16);
    text("PARTICLE SOURCE MODE - Click to place | ESC to cancel", width / 2, 90);
    text(`Arc: ${particleSourceConfig.arcStart}° - ${particleSourceConfig.arcEnd}° | Size: ${particleSourceConfig.size}±${particleSourceConfig.sizeVariance}`, width / 2, 110);
    text(`Color: RGB(${particleSourceConfig.color[0]}, ${particleSourceConfig.color[1]}, ${particleSourceConfig.color[2]}) | Speed: ${particleSourceConfig.speed} | Rate: ${particleSourceConfig.spawnRate}`, width / 2, 130);
    text("+/- arc end | 1/2 arc start | 3-9 increase (Shift+3-9 decrease)", width / 2, 150);
  }

  // Particle Source Count
  if (particleSources.length > 0) {
    fill(255, 255, 0);
    textSize(14);
    textAlign(LEFT);
    text(`Particle Sources: ${particleSources.length}`, 10, height - 10);
    textAlign(CENTER);
  }

  // Mouse Coordinates
  const worldX = mouseX - camX;
  const worldY = mouseY - camY;
  const gridCol = Math.floor(worldX / 50);
  const gridRow = Math.floor(worldY / 50);
  
  fill(255, 255, 0);
  textSize(14);
  textAlign(LEFT);
  text(`World Position: (${Math.round(worldX)}, ${Math.round(worldY)})`, 10, height - 30);
  text(`Tile: Row ${gridRow}, Col ${gridCol}`, 10, height - 50);

  text("Press T to spawn enemy", 930, 650);
  text("Current Enemy Type: " + enemyTypes[selectedEnemyIndex], 930, 670);
  text("J/K: change enemy type", 930, 690);
  
  textAlign(CENTER);

  // Pause overlay if crate placed
  if (cratePlacementPaused) {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);

    fill(255, 255, 0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("SPACE: Add item | ENTER: Finish crate", width / 2, height - 80);
    text("ARROW KEYS or SCROLL to browse items", width / 2, height - 50);
    text(`Items in crate: ${selectedCrateItems.length}`, width / 2, height - 20);

    drawSelectedItemImage();
  } else {
    drawTilePreview();
  }

  // P key: Minimap
  const pKeyPressed = keyIsDown(80);

  if (pKeyPressed) {
    if (!lastMinimapPress) {
      minimapNeedsRedraw = true;
    }

    // Render minimap
    if (minimapNeedsRedraw) {
      renderMinimapToCache();
      minimapNeedsRedraw = false;
    }

    // Draw cached minimap
    drawCachedMinimap();

    // Draw player indicator
    drawMinimapPlayerIndicator();
  } else {
    // If P is not held, check if we need to clear the cache or hide it
    // The current implementation just stops calling drawCachedMinimap
  }
  
  // Save map as image when P is pressed (once)
  if (pKeyPressed && !lastMinimapPress) {
    if (minimapCache) {
      minimapCache.save("map", "png");
      console.log("Minimap saved as map.png");
    }
  }

  lastMinimapPress = pKeyPressed;
}

// Render minimap to buffer
function renderMinimapToCache() {
  if (!gameWorld || gameWorld.length === 0) return;

  const minimapSize = 250;
  const rows = gameWorld.length;
  const cols = gameWorld[0] ? gameWorld[0].length : 0;

  if (rows === 0 || cols === 0) return;

  // Graphics buffer
  if (!minimapCache) {
    minimapCache = createGraphics(minimapSize + 40, minimapSize + 40);
  }

  // Clears cache
  minimapCache.clear();

  const tileSize = Math.min(minimapSize / cols, minimapSize / rows);
  const mapWidth = cols * tileSize;
  const mapHeight = rows * tileSize;

  // Center the map in the minimap area
  const offsetX = 20 + (minimapSize - mapWidth) / 2;
  const offsetY = 20 + (minimapSize - mapHeight) / 2;

  // Background
  minimapCache.fill(0, 0, 0, 200);
  minimapCache.stroke(255, 255, 0);
  minimapCache.strokeWeight(2);
  minimapCache.rect(20, 20, minimapSize, minimapSize);

  minimapCache.noStroke();

  // Tiles
  for (let i = 0; i < rows; i++) {
    if (!gameWorld[i]) continue;

    for (let j = 0; j < cols; j++) {
      const cell = gameWorld[i][j];
      if (!cell) continue;

      // Finds highest visible layer
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
      const colorIndex = tileObj.colorIndex || 0;

      // Get base color - distinct colors for each tile type
      let baseColor = [140, 130, 110]; // default neutral

      if (tileType === 0) baseColor = [50, 160, 50];         // deadGrass - bright green
      else if (tileType === 1) baseColor = [50, 50, 50];     // asphalt - dark gray road
      else if (tileType === 2) baseColor = [65, 65, 65];     // lined asphalt - lighter gray
      else if (tileType === 3) baseColor = [150, 150, 150];  // Concrete - medium gray
      else if (tileType === 4) baseColor = [140, 70, 60];    // Brick - reddish brick
      else if (tileType === 5) baseColor = [160, 120, 70];   // Crate - wooden brown
      else if (tileType === 6) baseColor = [90, 90, 110];    // Workbench - blue-gray metal
      else if (tileType === 7) baseColor = [100, 70, 50];    // dirt - dark brown earth
      else if (tileType === 8) baseColor = [40, 40, 40];     // darkConcrete - very dark
      else if (tileType === 9) baseColor = [110, 80, 50];    // door - medium wood brown
      else if (tileType === 10) baseColor = [140, 170, 190]; // window - light blue glass
      else if (tileType === 11) baseColor = [80, 80, 80];    // crack - dark gray damage
      else if (tileType === 12) baseColor = [130, 95, 60];   // wood - natural wood
      else if (tileType === 13) baseColor = [200, 200, 200]; // whiteConcrete - bright white
      else if (tileType === 14) baseColor = [90, 60, 40];    // barnDoor - dark weathered wood
      else if (tileType === 15) baseColor = [120, 140, 150]; // barnWindow - dusty blue
      else if (tileType === 16) baseColor = [115, 90, 65];   // fence - weathered wood
      else if (tileType === 17) baseColor = [120, 95, 68];   // fenceCorner - slightly lighter
      else if (tileType === 18) baseColor = [110, 85, 62];   // fenceDown - slightly darker
      else if (tileType === 19) baseColor = [118, 92, 66];   // fenceEdge - medium tone
      else if (tileType === 20) baseColor = [112, 88, 64];   // fencePost - post tone
      else if (tileType === 21) baseColor = [95, 95, 95];    // Grave 1 - stone gray
      else if (tileType === 22) baseColor = [85, 85, 85];    // Grave 2 - darker stone
      else if (tileType === 23) baseColor = [105, 105, 105]; // Grave 3 - lighter stone
      else if (tileType === 24) baseColor = [70, 60, 50];    // Rail - rusty metal brown
      else if (tileType === 25) baseColor = [130, 120, 100]; // Stone Brick - tan stone
      else if (tileType === 26) baseColor = [120, 110, 90];  // Stone Brick Wall - darker tan
      else if (tileType === 27) baseColor = [180, 120, 80];  // Pipe - copper orange
      else if (tileType === 28) baseColor = [90, 140, 110];  // CopperTileGreen - green patina

      // Apply color variant
      if (typeof tileColors !== 'undefined' && tileColors[tileType] && tileColors[tileType][colorIndex]) {
        const variantColor = tileColors[tileType][colorIndex];
        // Check if white tint (no color change)
        const isWhiteTint = variantColor[0] === 255 && variantColor[1] === 255 && variantColor[2] === 255;
        
        if (isWhiteTint) {
          minimapCache.fill(baseColor[0], baseColor[1], baseColor[2]);
        } else {
          minimapCache.fill(variantColor[0], variantColor[1], variantColor[2]);
        }
      } else {
        minimapCache.fill(baseColor[0], baseColor[1], baseColor[2]);
      }

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

  // Draw cached minimap
  image(minimapCache, minimapX - 20, minimapY - 20);
}

// Draw player indicator on minimap
function drawMinimapPlayerIndicator() {
  if (!gameWorld || gameWorld.length === 0) return;

  const minimapSize = 250;
  const minimapX = width - minimapSize - 20;
  const minimapY = 90;

  const rows = gameWorld.length;
  const cols = gameWorld[0] ? gameWorld[0].length : 0;

  if (rows === 0 || cols === 0) return;

  const tileSize = Math.min(minimapSize / cols, minimapSize / rows);
  const mapWidth = cols * tileSize;
  const mapHeight = rows * tileSize;

  const offsetX = minimapX + (minimapSize - mapWidth) / 2;
  const offsetY = minimapY + (minimapSize - mapHeight) / 2;

  const playerGridX = Math.floor((pX + 600) / 50);
  const playerGridY = Math.floor((pY + 375) / 50);

  // Player indicator
  fill(255, 0, 0);
  stroke(255, 255, 255);
  strokeWeight(1);
  const playerMinimapX = offsetX + playerGridX * tileSize;
  const playerMinimapY = offsetY + playerGridY * tileSize;
  ellipse(playerMinimapX + tileSize / 2, playerMinimapY + tileSize / 2, tileSize * 2, tileSize * 2);
}

// Draw tile preview at mouse position
function drawTilePreview() {
  if (!(gameWorld && gameWorld.length > 0)) return;
  if (cratePlacementPaused) return;

  push();
  translate(camX, camY);

  // Particle source preview if in particle mode
  if (placingParticleSource) {
    var worldX = mouseX - camX;
    var worldY = mouseY - camY;
    
    noFill();
    stroke(255, 255, 0, 200);
    strokeWeight(2);
    ellipse(worldX, worldY, 20, 20);
    
    // Arc indicator
    stroke(particleSourceConfig.color[0], particleSourceConfig.color[1], particleSourceConfig.color[2], 150);
    strokeWeight(3);
    const arcRadius = 40;
    arc(worldX, worldY, arcRadius, arcRadius, 
        radians(particleSourceConfig.arcStart), 
        radians(particleSourceConfig.arcEnd));
    
    pop();
    return;
  }

  var worldX = mouseX - camX;
  var worldY = mouseY - camY;

  var gridCol = Math.floor(worldX / EDIT_TILE_SIZE);
  var gridRow = Math.floor(worldY / EDIT_TILE_SIZE);

  if (gridRow < 0 || gridRow >= gameWorld.length) return;
  if (gridCol < 0 || gridCol >= gameWorld[gridRow].length) return;

  var snapX = gridCol * EDIT_TILE_SIZE;
  var snapY = gridRow * EDIT_TILE_SIZE;

  // Semi-transparent tile preview
  if (tintedTileCache && tintedTileCache[selectedTileType] && tintedTileCache[selectedTileType][tileColorIndex]) {
    push();
    translate(snapX + 25, snapY + 25);
    rotate(radians(tileRotation));
    scale(tileFlipH ? -1 : 1, tileFlipV ? -1 : 1);
    tint(255, 150); 
    image(tintedTileCache[selectedTileType][tileColorIndex], -25, -25, 50, 50);
    noTint();
    pop();
  }

  // Grid cell outline
  noFill();
  stroke(255, 255, 0, 200);
  strokeWeight(2);
  rect(snapX, snapY, EDIT_TILE_SIZE, EDIT_TILE_SIZE);

  // Tile name
  const tileName = tileNames[selectedTileType] || "Unknown";
  noStroke();
  fill(0, 0, 0, 180);
  textSize(10);
  textAlign(CENTER, CENTER);
  const nameWidth = textWidth(tileName) + 8;
  rect(snapX + 25 - nameWidth / 2, snapY - 16, nameWidth, 14, 3);
  fill(255, 255, 0);
  text(tileName, snapX + 25, snapY - 9);

  // Current layer indicator
  fill(0, 0, 0, 160);
  rect(snapX + 2, snapY + 2, 16, 16, 3);
  fill(255, 255, 0);
  textSize(12);
  text(String(editorLayer), snapX + 10, snapY + 10);

  pop();
}

// Draw all particle sources
function drawParticleSources() {
  if (!editorMode) return;
  
  for (let i = 0; i < particleSources.length; i++) {
    const ps = particleSources[i];
    
    // Source marker
    fill(ps.color[0], ps.color[1], ps.color[2], 100);
    stroke(255, 255, 0);
    strokeWeight(2);
    ellipse(ps.x, ps.y, 15, 15);
    
    // Arc indicator
    noFill();
    stroke(ps.color[0], ps.color[1], ps.color[2], 100);
    strokeWeight(2);
    arc(ps.x, ps.y, 30, 30, radians(ps.arcStart), radians(ps.arcEnd));
    
    // Index number
    noStroke();
    fill(255, 255, 0);
    textSize(10);
    textAlign(CENTER, CENTER);
    text(i, ps.x, ps.y);
  }
}

// Handle editor mouse clicks
function handleEditorClick() {
  if (!(editorMode && gameWorld && gameWorld.length > 0)) return;
  if (cratePlacementPaused) return;
  

  var worldX = mouseX - camX;
  var worldY = mouseY - camY;

  // Handle particle source placement
  if (placingParticleSource) {
    if (mouseButton === RIGHT) {
      // Find and delete nearby particle source
      for (let i = particleSources.length - 1; i >= 0; i--) {
        const ps = particleSources[i];
        const d = dist(worldX, worldY, ps.x, ps.y);
        if (d < 25) {
          particleSources.splice(i, 1);
          console.log("Deleted particle source", i);
          break;
        }
      }
    }
    return;
  }

  var gridCol = Math.floor(worldX / EDIT_TILE_SIZE);
  var gridRow = Math.floor(worldY / EDIT_TILE_SIZE);

  if (gridRow < 0 || gridRow >= gameWorld.length) return;
  if (gridCol < 0 || gridCol >= gameWorld[gridRow].length) return;

  // Alt + Left click: eyedropper from current layer
  if (keyIsDown(18) && mouseButton === LEFT) {
    if (typeof getTile === 'function') {
      const t = getTile(gridRow, gridCol, editorLayer);
      if (t) {
        selectedTileType = t.type;
        tileRotation = t.rotation || 0;
        tileFlipH = t.flipH || false;
        tileFlipV = t.flipV || false;
        tileColorIndex = t.colorIndex || 0;
        console.log("Picked tile", selectedTileType, "rot", tileRotation, "flip H:", tileFlipH, "V:", tileFlipV, "color", tileColorIndex, "from layer", editorLayer);
      }
    }
    return;
  }

  // Right click: erase current layer
  if (mouseButton === RIGHT) {
    if (typeof clearTile === 'function') {
      clearTile(gridRow, gridCol, editorLayer);
      console.log("Erased at row", gridRow, "col", gridCol, "layer", editorLayer);
    } else {
      // Fallback
      gameWorld[gridRow][gridCol] = undefined;
    }
    return;
  }

  // Left click: edit current layer
  if (mouseButton === LEFT) {
    if (typeof setTile === 'function') {
      setTile(gridRow, gridCol, editorLayer, selectedTileType, tileRotation, tileFlipH, tileFlipV, tileColorIndex);
    } else {
      // Fallback
      gameWorld[gridRow][gridCol] = {
        type: selectedTileType,
        rotation: tileRotation,
        flipH: tileFlipH,
        flipV: tileFlipV,
        colorIndex: tileColorIndex
      };
    }
    console.log("Placed type", selectedTileType, "rot", tileRotation, "flip H:", tileFlipH, "V:", tileFlipV, "color", tileColorIndex, "at", gridRow, gridCol, "layer", editorLayer);

    // Check if a crate (type 5) was placed
    if (selectedTileType === 5) {
      cratePlacementPaused = true;
      lastCrateRow = gridRow;
      lastCrateCol = gridCol;
      console.log("Crate placed at row", gridRow, "col", gridCol, "- press ENTER to continue");
    }
  }
}

// Handle editor key presses
function handleEditorKeyPress() {
  // Shift + E: toggle editor mode
  if (keyCode == 69 && keyIsDown(SHIFT)) {
    toggleEditorMode();
  }

  if (!editorMode) return;

  // Space: add item to crate
  if (cratePlacementPaused && keyCode === 32) {
    if (typeof itemConstructors !== 'undefined' && itemConstructors.length > 0) {
      selectedCrateItems.push(itemConstructors[selectedItemIndex]);
      console.log("Added item to crate:", itemConstructors[selectedItemIndex][1]);
      console.log("Crate now contains", selectedCrateItems.length, "items");
    }
    return;
  }

  // Enter: finish crate
  if (cratePlacementPaused && keyCode === 13) {
    // Store the items for crate
    const crateKey = lastCrateRow + "," + lastCrateCol;
    crateInventories.set(crateKey, [...selectedCrateItems]);
    console.log("Stored", selectedCrateItems.length, "items for crate at", crateKey);

    selectedCrateItems = [];

    cratePlacementPaused = false;
    console.log("Resumed tile placement");
    return;
  }

  //Arrow keys: browse crate items
  if (cratePlacementPaused) {
    if (typeof itemConstructors !== 'undefined' && itemConstructors.length > 0) {
      if (keyCode === 37 || keyCode === 38) { // Left or Up arrow
        selectedItemIndex = (selectedItemIndex - 1 + itemConstructors.length) % itemConstructors.length;
        console.log("Selected item:", itemConstructors[selectedItemIndex][1]);
      }
      if (keyCode === 39 || keyCode === 40) { // Right or Down arrow
        selectedItemIndex = (selectedItemIndex + 1) % itemConstructors.length;
        console.log("Selected item:", itemConstructors[selectedItemIndex][1]);
      }
    }
    return;
  }

  // Number keys 1-5: switch layers
  if (key === '1') { editorLayer = 0; console.log("Layer -> 0"); }
  if (key === '2') { editorLayer = 1; console.log("Layer -> 1"); }
  if (key === '3') { editorLayer = 2; console.log("Layer -> 2"); }
  if (key === '4') { editorLayer = 3; console.log("Layer -> 3"); }
  if (key === '5') { editorLayer = 4; console.log("Layer -> 4"); }

  // ,/. keys: switch tiles
  if (keyCode == 188) {
    const m = __getMaxTileTypes();
    if (m > 0) selectedTileType = (selectedTileType - 1 + m) % m;
    console.log("Changed to tile type:", selectedTileType);
  }
  if (keyCode == 190) {
    const m = __getMaxTileTypes();
    if (m > 0) selectedTileType = (selectedTileType + 1) % m;
    console.log("Changed to tile type:", selectedTileType);
  }

  // R: rotate tile
  if (keyCode == 82) {
    tileRotation = (tileRotation + 90) % 360;
    console.log("Rotated tile to:", tileRotation + "°");
  }

  // H: flip horizontally
  if (keyCode == 72) {
    tileFlipH = !tileFlipH;
    console.log("Horizontal flip:", tileFlipH);
  }

  // V: flip vertically
  if (keyCode == 86) {
    tileFlipV = !tileFlipV;
    console.log("Vertical flip:", tileFlipV);
  }

  // [: previous color
  if (keyCode == 219) { // [
    const maxColors = (tileColors[selectedTileType] || [[255, 255, 255]]).length;
    tileColorIndex = (tileColorIndex - 1 + maxColors) % maxColors;
    console.log("Color index:", tileColorIndex);
  }

  // ]: next color
  if (keyCode == 221) { // ]
    const maxColors = (tileColors[selectedTileType] || [[255, 255, 255]]).length;
    tileColorIndex = (tileColorIndex + 1) % maxColors;
    console.log("Color index:", tileColorIndex);
  }

  // O: switch editor modes
  if (keyCode == 79) {
    placingParticleSource = !placingParticleSource;
    console.log("Particle source mode:", placingParticleSource);
    console.log("Tile editor mode:", !placingParticleSource);
  }
    
  // T: spawn enemy
  if (keyCode == 84) {
    enemies.push(new Enemy(enemyTypes[selectedEnemyIndex], pX + mouseX, pY + mouseY));
    enemySpawns += "enemies.push(new Enemy(\"" + enemyTypes[selectedEnemyIndex] + "\", " + Math.floor(pX + mouseX) + ", " + Math.floor(pY + mouseY) + "));\n";
    console.log(enemySpawns);
  }

  // J/K: change enemy type
  if (keyCode == 74) {
    selectedEnemyIndex--;
    if(selectedEnemyIndex < 0){
      selectedEnemyIndex = enemyTypes.length - 1;
    }
  }
  if (keyCode == 75) {
    selectedEnemyIndex++;
    if(selectedEnemyIndex >= enemyTypes.length){
      selectedEnemyIndex = 0;
    }
  }

  // Ctrl+C: copy world string to clipboard
  if (keyCode == 67 && keyIsDown(CONTROL)) { // C with Ctrl
    const worldStr = worldToString(gameWorld);
    navigator.clipboard.writeText(worldStr).then(() => {
      console.log("World string copied to clipboard (including", particleSources.length, "particle sources)");
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  }

  // Particle source keys
  if (placingParticleSource) {
    // Esc: cancel
    if (keyCode == 27) {
      placingParticleSource = false;
      console.log("Cancelled particle source placement");
    }
    
    // +/=: increase arc end
    if (keyCode == 187 || keyCode == 107) {
      particleSourceConfig.arcEnd = (particleSourceConfig.arcEnd + 15) % 360;
      console.log("Arc end:", particleSourceConfig.arcEnd);
    }
    
    // -: decrease arc end
    if (keyCode == 189 || keyCode == 109) {
      particleSourceConfig.arcEnd = (particleSourceConfig.arcEnd - 15 + 360) % 360;
      console.log("Arc end:", particleSourceConfig.arcEnd);
    }
    
    // 1: increase arc start
    if (keyCode == 49) {
      particleSourceConfig.arcStart = (particleSourceConfig.arcStart + 15) % 360;
      console.log("Arc start:", particleSourceConfig.arcStart);
    }
    
    // 2: decrease arc start
    if (keyCode == 50) {
      particleSourceConfig.arcStart = (particleSourceConfig.arcStart - 15 + 360) % 360;
      console.log("Arc start:", particleSourceConfig.arcStart);
    }
    
    // 3: adjust size
    if (keyCode == 51) {
      const delta = keyIsDown(SHIFT) ? -1 : 1;
      particleSourceConfig.size = constrain(particleSourceConfig.size + delta, 1, 20);
      console.log("Size:", particleSourceConfig.size);
    }
    
    // 4: adjust size variance
    if (keyCode == 52) {
      const delta = keyIsDown(SHIFT) ? -1 : 1;
      particleSourceConfig.sizeVariance = constrain(particleSourceConfig.sizeVariance + delta, 0, 10);
      console.log("Size variance:", particleSourceConfig.sizeVariance);
    }
    
    // 5: adjust speed
    if (keyCode == 53) {
      const delta = keyIsDown(SHIFT) ? -0.5 : 0.5;
      particleSourceConfig.speed = constrain(particleSourceConfig.speed + delta, 0.5, 10);
      console.log("Speed:", particleSourceConfig.speed);
    }
    
    // 6: adjust spawn rate
    if (keyCode == 54) {
      const delta = keyIsDown(SHIFT) ? -1 : 1;
      particleSourceConfig.spawnRate = constrain(particleSourceConfig.spawnRate + delta, 1, 20);
      console.log("Spawn rate:", particleSourceConfig.spawnRate);
    }
    
    // 7-9: adjust RGB color
    if (keyCode == 55) {
      const delta = keyIsDown(SHIFT) ? -5 : 5;
      particleSourceConfig.color[0] = (particleSourceConfig.color[0] + delta + 256) % 256;
      console.log("Color R:", particleSourceConfig.color[0]);
    }
    if (keyCode == 56) {
      const delta = keyIsDown(SHIFT) ? -5 : 5;
      particleSourceConfig.color[1] = (particleSourceConfig.color[1] + delta + 256) % 256;
      console.log("Color G:", particleSourceConfig.color[1]);
    }
    if (keyCode == 57) {
      const delta = keyIsDown(SHIFT) ? -5 : 5;
      particleSourceConfig.color[2] = (particleSourceConfig.color[2] + delta + 256) % 256;
      console.log("Color B:", particleSourceConfig.color[2]);
    }
  }
}


// Editor mouse events
function handleEditorMouseWheel(event) {
  if (!editorMode) return false;

  // Crate scrolling
  if (cratePlacementPaused) {
    if (typeof itemConstructors !== 'undefined' && itemConstructors.length > 0) {
      if (event.delta > 0) {
        selectedItemIndex = (selectedItemIndex + 1) % itemConstructors.length;
      } else {
        selectedItemIndex = (selectedItemIndex - 1 + itemConstructors.length) % itemConstructors.length;
      }
    }
    return true;
  }

  // Tile type wheel
  const m = __getMaxTileTypes();
  if (m > 0) {
    if (event.delta > 0) {
      selectedTileType = (selectedTileType + 1) % m;
    } else {
      selectedTileType = (selectedTileType - 1 + m) % m;
    }
  }
  console.log("Mouse wheel changed to tile type:", selectedTileType);
  return true;
}

// Editor mouse released
function handleEditorMouseReleased() {
  if (!editorMode) return false;
  if (cratePlacementPaused) return false;
  
  // Particle source placement
  if (placingParticleSource && mouseButton === LEFT) {
    var worldX = mouseX - camX;
    var worldY = mouseY - camY;
    
    particleSources.push({
      x: worldX,
      y: worldY,
      layer: editorLayer, 
      arcStart: particleSourceConfig.arcStart,
      arcEnd: particleSourceConfig.arcEnd,
      color: [...particleSourceConfig.color],
      size: particleSourceConfig.size,
      sizeVariance: particleSourceConfig.sizeVariance,
      speed: particleSourceConfig.speed,
      spawnRate: particleSourceConfig.spawnRate,
      duration: particleSourceConfig.duration
    });
    console.log("Placed particle source at", worldX, worldY, "on layer", editorLayer);
    return true;
  }
  
  return false;
}