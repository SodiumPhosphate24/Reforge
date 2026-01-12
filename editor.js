// Tile color reference array - RGB values for each tile type
// Used for minimap and visual reference
var tileColorReference = [
  [50, 160, 50],  // 0 - deadGrass - tan/beige
  [60, 60, 60],     // 1 - asphalt - dark gray
  [70, 70, 70],     // 2 - lined asphalt - slightly lighter gray
  [200, 200, 200],  // 3 - Concrete - light gray
  [150, 80, 60],    // 4 - Brick - reddish brown
  [160, 120, 80],   // 5 - Crate - brown/tan
  [100, 100, 120],  // 6 - Workbench - gray with blue tint
  [120, 90, 60],    // 7 - dirt - brown
  [50, 50, 50],     // 8 - darkConcrete - very dark gray
  [140, 100, 70],   // 9 - door - wood brown
  [180, 200, 220],  // 10 - window - light blue-gray
  [90, 90, 90],     // 11 - crack - medium gray
  [160, 120, 80],   // 12 - wood - brown
  [220, 220, 220],  // 13 - whiteConcrete - off-white
  [130, 90, 60],    // 14 - barnDoor - darker brown
  [170, 190, 200],  // 15 - barnWindow - blue-gray
  [150, 120, 90],   // 16 - fence - wood tone
  [150, 120, 90],   // 17 - fenceCorner - wood tone
  [150, 120, 90],   // 18 - fenceDown - wood tone
  [150, 120, 90],   // 19 - fenceEdge - wood tone
  [150, 120, 90],   // 20 - fencePost - wood tone
  [100, 100, 100],  // 21 - Grave 1 - stone gray
  [100, 100, 100],  // 22 - Grave 2 - stone gray
  [100, 100, 100],  // 23 - Grave 3 - stone gray
  [80, 80, 80],     // 24 - Rail - metallic gray
  [140, 130, 120],  // 25 - Stone Brick - gray-tan
  [140, 130, 120],  // 26 - Stone Brick Wall - gray-tan
  [180, 130, 90],   // 27 - Pipe - copper/bronze
  [120, 140, 120]   // 28 - CopperTileGreen - greenish
];


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
var tileColorIndex = 0;      // color variant index
var editorLayer = 0;         // 5 layers total: 0-1 behind, 2-3 between, 4 in front
const EDIT_TILE_SIZE = 50;
var cratePlacementPaused = false; // Pauses tile placement after crate is placed
var lastCrateRow = -1;       // Row of last placed crate
var lastCrateCol = -1;       // Column of last placed crate
var selectedItemIndex = 0;   // Currently selected item from itemConstructors
var selectedCrateItems = []; // Array to store selected item constructors for this crate
var crateInventories = new Map(); // Map to store items for each crate: key = "row,col", value = array of item constructors
var selectedEnemyIndex = 0;
var enemyTypes = ["harpy", "cyclops", "greg"]

// Particle source system
var particleSources = []; // Array of particle source objects
var placingParticleSource = false; // Flag for particle source placement mode
var editingParticleSourceIndex = -1; // Index of particle source being edited (-1 if none)
var particleSourceConfig = {
  x: 0,
  y: 0,
  arcStart: 0,      // Start angle in degrees
  arcEnd: 360,      // End angle in degrees
  color: [255, 100, 50], // RGB color
  size: 5,          // Base particle size
  sizeVariance: 2,  // Random size variance (+/-)
  speed: 2,         // Particle speed
  spawnRate: 5,     // Particles per frame
  duration: 60      // Particle lifetime in frames
};

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
  const maxColors = (tileColors[selectedTileType] || [[255, 255, 255]]).length;
  text(
    "Layer: " + editorLayer +
    " | Tile: " + selectedTileType +
    " | Rotation: " + tileRotation + "° | Flip: " + flipText +
    " | Color: " + tileColorIndex + "/" + (maxColors - 1) +
    " | [ ] to change color | O for Particles",
    width / 2, 65
  );

  // Show particle source mode indicator
  if (placingParticleSource) {
    fill(255, 255, 0);
    textSize(16);
    text("PARTICLE SOURCE MODE - Click to place | ESC to cancel", width / 2, 90);
    text(`Arc: ${particleSourceConfig.arcStart}° - ${particleSourceConfig.arcEnd}° | Size: ${particleSourceConfig.size}±${particleSourceConfig.sizeVariance}`, width / 2, 110);
    text(`Color: RGB(${particleSourceConfig.color[0]}, ${particleSourceConfig.color[1]}, ${particleSourceConfig.color[2]}) | Speed: ${particleSourceConfig.speed} | Rate: ${particleSourceConfig.spawnRate}`, width / 2, 130);
    text("+/- arc end | 1/2 arc start | 3-9 increase (Shift+3-9 decrease)", width / 2, 150);
  }

  // Show particle source count
  if (particleSources.length > 0) {
    fill(255, 255, 0);
    textSize(14);
    textAlign(LEFT);
    text(`Particle Sources: ${particleSources.length}`, 10, height - 10);
    textAlign(CENTER);
  }

  // Show mouse world position and tile coordinates
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

      // Apply color variant if available (skip white tints as they mean "no tint")
      if (typeof tileColors !== 'undefined' && tileColors[tileType] && tileColors[tileType][colorIndex]) {
        const variantColor = tileColors[tileType][colorIndex];
        // Check if this is a white tint (which means no tint should be applied)
        const isWhiteTint = variantColor[0] === 255 && variantColor[1] === 255 && variantColor[2] === 255;
        
        if (isWhiteTint) {
          // Use base color when tint is white
          minimapCache.fill(baseColor[0], baseColor[1], baseColor[2]);
        } else {
          // Apply the tint color
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

function drawTilePreview() {
  if (!(gameWorld && gameWorld.length > 0)) return;
  if (cratePlacementPaused) return; // Don't show preview when paused

  push();
  translate(camX, camY);

  // Draw particle source preview if in placement mode
  if (placingParticleSource) {
    var worldX = mouseX - camX;
    var worldY = mouseY - camY;
    
    // Draw preview circle
    noFill();
    stroke(255, 255, 0, 200);
    strokeWeight(2);
    ellipse(worldX, worldY, 20, 20);
    
    // Draw arc indicator
    stroke(particleSourceConfig.color[0], particleSourceConfig.color[1], particleSourceConfig.color[2], 150);
    strokeWeight(3);
    const arcRadius = 40;
    arc(worldX, worldY, arcRadius, arcRadius, 
        radians(particleSourceConfig.arcStart), 
        radians(particleSourceConfig.arcEnd));
    
    pop();
    return;
  }

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

  // Semi-transparent preview of selected tile in current layer
  if (tintedTileCache && tintedTileCache[selectedTileType] && tintedTileCache[selectedTileType][tileColorIndex]) {
    push();
    // Draw the cached tinted tile image
    translate(snapX + 25, snapY + 25);
    rotate(radians(tileRotation));
    scale(tileFlipH ? -1 : 1, tileFlipV ? -1 : 1);
    tint(255, 150); // Semi-transparent
    image(tintedTileCache[selectedTileType][tileColorIndex], -25, -25, 50, 50);
    noTint();
    pop();
  }

  // Grid cell outline
  noFill();
  stroke(255, 255, 0, 200);
  strokeWeight(2);
  rect(snapX, snapY, EDIT_TILE_SIZE, EDIT_TILE_SIZE);

  // Display tile name above the grid
  const tileName = tileImgs[selectedTileType] || "Unknown";
  noStroke();
  fill(0, 0, 0, 180);
  textSize(10);
  textAlign(CENTER, CENTER);
  const nameWidth = textWidth(tileName) + 8;
  rect(snapX + 25 - nameWidth / 2, snapY - 16, nameWidth, 14, 3);
  fill(255, 255, 0);
  text(tileName, snapX + 25, snapY - 9);

  // Small badge with current layer
  fill(0, 0, 0, 160);
  rect(snapX + 2, snapY + 2, 16, 16, 3);
  fill(255, 255, 0);
  textSize(12);
  text(String(editorLayer), snapX + 10, snapY + 10);

  pop();
}

// Draw all particle sources (called after camera translation)
function drawParticleSources() {
  if (!editorMode) return;
  
  for (let i = 0; i < particleSources.length; i++) {
    const ps = particleSources[i];
    
    // Draw source marker
    fill(ps.color[0], ps.color[1], ps.color[2], 100);
    stroke(255, 255, 0);
    strokeWeight(2);
    ellipse(ps.x, ps.y, 15, 15);
    
    // Draw arc indicator
    noFill();
    stroke(ps.color[0], ps.color[1], ps.color[2], 100);
    strokeWeight(2);
    arc(ps.x, ps.y, 30, 30, radians(ps.arcStart), radians(ps.arcEnd));
    
    // Draw index number
    noStroke();
    fill(255, 255, 0);
    textSize(10);
    textAlign(CENTER, CENTER);
    text(i, ps.x, ps.y);
  }
}

function handleEditorClick() {
  if (!(editorMode && gameWorld && gameWorld.length > 0)) return;
  if (cratePlacementPaused) return; // Don't allow clicks when paused

  var worldX = mouseX - camX;
  var worldY = mouseY - camY;

  // Handle particle source placement - but DON'T place here anymore
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
    // Always return when in particle mode to prevent tile placement
    return;
  }

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
        tileColorIndex = t.colorIndex || 0;
        console.log("Picked tile", selectedTileType, "rot", tileRotation, "flip H:", tileFlipH, "V:", tileFlipV, "color", tileColorIndex, "from layer", editorLayer);
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

  // Left click = paint current layer
  if (mouseButton === LEFT) {
    if (typeof setTile === 'function') {
      setTile(gridRow, gridCol, editorLayer, selectedTileType, tileRotation, tileFlipH, tileFlipV, tileColorIndex);
    } else {
      // Fallback if helpers missing (legacy)
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

  // Layer selection: 1-5 for layers 0-4
  if (key === '1') { editorLayer = 0; console.log("Layer -> 0"); }
  if (key === '2') { editorLayer = 1; console.log("Layer -> 1"); }
  if (key === '3') { editorLayer = 2; console.log("Layer -> 2"); }
  if (key === '4') { editorLayer = 3; console.log("Layer -> 3"); }
  if (key === '5') { editorLayer = 4; console.log("Layer -> 4"); }

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

  // [ to previous color
  if (keyCode == 219) { // [
    const maxColors = (tileColors[selectedTileType] || [[255, 255, 255]]).length;
    tileColorIndex = (tileColorIndex - 1 + maxColors) % maxColors;
    console.log("Color index:", tileColorIndex);
  }

  // ] to next color
  if (keyCode == 221) { // ]
    const maxColors = (tileColors[selectedTileType] || [[255, 255, 255]]).length;
    tileColorIndex = (tileColorIndex + 1) % maxColors;
    console.log("Color index:", tileColorIndex);
  }

  // O to toggle between particle source mode and tile editor mode
  if (keyCode == 79) { // O
    placingParticleSource = !placingParticleSource;
    console.log("Particle source mode:", placingParticleSource);
    console.log("Tile editor mode:", !placingParticleSource);
  }
    
  //T to spawn enemy
  if (keyCode == 84) {
    enemies.push(new Enemy(enemyTypes[selectedEnemyIndex], pX + mouseX, pY + mouseY));
    enemySpawns += "enemies.push(new Enemy(\"" + enemyTypes[selectedEnemyIndex] + "\", " + (pX + mouseX) + ", " + (pY + mouseY) + "));\n";
    console.log(enemySpawns);
  }

  //J/K to change enemy type
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

  // Ctrl+C to copy world string to clipboard
  if (keyCode == 67 && keyIsDown(CONTROL)) { // C with Ctrl
    const worldStr = worldToString(gameWorld);
    navigator.clipboard.writeText(worldStr).then(() => {
      console.log("World string copied to clipboard (including", particleSources.length, "particle sources)");
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  }

  // Particle source configuration keys (when in particle mode)
  if (placingParticleSource) {
    // ESC to cancel
    if (keyCode == 27) {
      placingParticleSource = false;
      console.log("Cancelled particle source placement");
    }
    
    // +/= to increase arc end
    if (keyCode == 187 || keyCode == 107) {
      particleSourceConfig.arcEnd = (particleSourceConfig.arcEnd + 15) % 360;
      console.log("Arc end:", particleSourceConfig.arcEnd);
    }
    
    // - to decrease arc end
    if (keyCode == 189 || keyCode == 109) {
      particleSourceConfig.arcEnd = (particleSourceConfig.arcEnd - 15 + 360) % 360;
      console.log("Arc end:", particleSourceConfig.arcEnd);
    }
    
    // 1 to increase arc start
    if (keyCode == 49) {
      particleSourceConfig.arcStart = (particleSourceConfig.arcStart + 15) % 360;
      console.log("Arc start:", particleSourceConfig.arcStart);
    }
    
    // 2 to decrease arc start
    if (keyCode == 50) {
      particleSourceConfig.arcStart = (particleSourceConfig.arcStart - 15 + 360) % 360;
      console.log("Arc start:", particleSourceConfig.arcStart);
    }
    
    // 3 to adjust size
    if (keyCode == 51) {
      const delta = keyIsDown(SHIFT) ? -1 : 1;
      particleSourceConfig.size = constrain(particleSourceConfig.size + delta, 1, 20);
      console.log("Size:", particleSourceConfig.size);
    }
    
    // 4 to adjust size variance
    if (keyCode == 52) {
      const delta = keyIsDown(SHIFT) ? -1 : 1;
      particleSourceConfig.sizeVariance = constrain(particleSourceConfig.sizeVariance + delta, 0, 10);
      console.log("Size variance:", particleSourceConfig.sizeVariance);
    }
    
    // 5 to adjust speed
    if (keyCode == 53) {
      const delta = keyIsDown(SHIFT) ? -0.5 : 0.5;
      particleSourceConfig.speed = constrain(particleSourceConfig.speed + delta, 0.5, 10);
      console.log("Speed:", particleSourceConfig.speed);
    }
    
    // 6 to adjust spawn rate
    if (keyCode == 54) {
      const delta = keyIsDown(SHIFT) ? -1 : 1;
      particleSourceConfig.spawnRate = constrain(particleSourceConfig.spawnRate + delta, 1, 20);
      console.log("Spawn rate:", particleSourceConfig.spawnRate);
    }
    
    // 7-9 to adjust RGB color
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

function handleEditorMouseReleased() {
  if (!editorMode) return false;
  if (cratePlacementPaused) return false;
  
  // Handle particle source placement on mouse release
  if (placingParticleSource && mouseButton === LEFT) {
    var worldX = mouseX - camX;
    var worldY = mouseY - camY;
    
    particleSources.push({
      x: worldX,
      y: worldY,
      layer: editorLayer, // Use current editor layer
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
// ============== END EDITOR (3-LAYER SUPPORT) ==============