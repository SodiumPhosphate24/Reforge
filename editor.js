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
var editorLayer = 0;         // 0 & 1 behind; 2 in front
const EDIT_TILE_SIZE = 50;
var cratePlacementPaused = false; // Pauses tile placement after crate is placed
var lastCrateRow = -1;       // Row of last placed crate
var lastCrateCol = -1;       // Column of last placed crate

// Disable context menu so right-click can erase while editing
if (typeof window !== "undefined") {
  window.oncontextmenu = function(e) {
    if (editorMode) { e.preventDefault(); return false; }
  };
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
  text("Left-click: place | Right-click: erase | Alt+Click: pick | R: rotate | 1/2/3: layer", width / 2, 45);
  text(
    "Layer: " + editorLayer +
    " | Current tile: " + selectedTileType +
    " | Rotation: " + tileRotation + "°  | Scroll / , . to change tile",
    width / 2, 65
  );

  // Draw pause overlay if crate placement is paused
  if (cratePlacementPaused) {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    fill(255, 255, 0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Crate Placed - Press ENTER to continue", width / 2, height / 2);
  } else {
    drawTilePreview();
  }
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

  // Semi-transparent preview of selected tile in current layer
  if (tileImgs && tileImgs[selectedTileType]) {
    tint(255, 150);
    push();
    translate(snapX + 25, snapY + 25);
    rotate(radians(tileRotation));
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
        console.log("Picked tile", selectedTileType, "rot", tileRotation, "from layer", editorLayer);
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
      setTile(gridRow, gridCol, editorLayer, selectedTileType, tileRotation);
    } else {
      // Fallback if helpers missing (legacy)
      gameWorld[gridRow][gridCol] = { type: selectedTileType, rotation: tileRotation };
    }
    console.log("Placed type", selectedTileType, "rot", tileRotation, "at", gridRow, gridCol, "layer", editorLayer);
    
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

  // Resume from crate placement pause with Enter
  if (cratePlacementPaused && keyCode === 13) { // 13 is Enter
    cratePlacementPaused = false;
    console.log("Resumed tile placement");
    return;
  }

  if (cratePlacementPaused) return; // Don't allow other keys when paused

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
}

function handleEditorMouseWheel(event) {
  if (!editorMode) return false;
  if (cratePlacementPaused) return true; // Consume wheel but don't change tile when paused

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
