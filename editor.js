
var editorMode = false;
var selectedTileType = 0; // Currently selected tile type
var maxTileTypes = 3; // Number of available tile types (0, 1, 2)

function toggleEditorMode() {
  editorMode = !editorMode;
  console.log("Editor mode:", editorMode ? "ON" : "OFF");
}

function drawEditorUI() {
  // Draw border around screen
  stroke(255, 255, 0);
  strokeWeight(8);
  noFill();
  rect(4, 4, width - 8, height - 8);
  
  // Draw editor mode indicator
  fill(255, 255, 0);
  noStroke();
  textSize(18);
  textAlign(CENTER);
  text("EDITOR MODE - Press Shift+E to exit", width/2, 25);
  text("Click tiles to place - Scroll to change tile type", width/2, 45);
  text("Current tile: " + selectedTileType, width/2, 65);
  
  // Draw preview tile at mouse position
  drawTilePreview();
}

function drawTilePreview() {
  if (gameWorld && gameWorld.length > 0) {
    // Convert mouse coordinates to world coordinates using camera offset
    var worldX = mouseX - camX;
    var worldY = mouseY - camY;
    
    // Convert to grid coordinates
    var gridPos = coordsToGrid(worldX, worldY);
    
    // Check if the preview position is within bounds
    if (gridPos.row >= 0 && gridPos.row < gameWorld.length &&
        gridPos.col >= 0 && gridPos.col < gameWorld[gridPos.row].length) {
      
      // Snap to grid position
      var snapX = gridPos.col * 50;
      var snapY = gridPos.row * 50;
      
      // Draw preview tile with transparency
      push();
      translate(camX, camY);
      
      if (tileImgs[selectedTileType]) {
        tint(255, 128); // Make it 50% transparent
        image(tileImgs[selectedTileType], snapX, snapY, 50, 50);
        noTint(); // Reset tint immediately after drawing
      } else {
        // Fallback if image isn't loaded
        fill(100, 100, 100, 128);
        noStroke();
        rect(snapX, snapY, 50, 50);
      }
      
      // Draw grid outline for the preview tile
      noFill();
      stroke(255, 255, 0, 150);
      strokeWeight(2);
      rect(snapX, snapY, 50, 50);
      
      pop();
    }
  }
}

function handleEditorClick() {
  if (editorMode && gameWorld && gameWorld.length > 0) {
    // Convert mouse coordinates to world coordinates using camera offset
    var worldX = mouseX - camX;
    var worldY = mouseY - camY;
    
    // Convert to grid coordinates
    var gridPos = coordsToGrid(worldX, worldY);
    
    // Check if the click is within bounds
    if (gridPos.row >= 0 && gridPos.row < gameWorld.length &&
        gridPos.col >= 0 && gridPos.col < gameWorld[gridPos.row].length) {
      
      // Place the selected tile type
      gameWorld[gridPos.row][gridPos.col] = selectedTileType;
      console.log("Placed tile type", selectedTileType, "at", gridPos.row, gridPos.col);
    }
  }
}

function handleEditorKeyPress() {
  // Toggle editor mode with Shift+E
  if (keyCode == 69 && keyIsDown(SHIFT)) {
    toggleEditorMode();
  }
  
  // Use comma and period keys to change tile type
  if (editorMode) {
    if (keyCode == 188) { // Comma key
      selectedTileType = (selectedTileType - 1 + maxTileTypes) % maxTileTypes;
      console.log("Changed to tile type:", selectedTileType);
    }
    if (keyCode == 190) { // Period key
      selectedTileType = (selectedTileType + 1) % maxTileTypes;
      console.log("Changed to tile type:", selectedTileType);
    }
  }
}

function handleEditorMouseWheel(event) {
  if (editorMode) {
    // Change selected tile type with mouse wheel
    if (event.delta > 0) {
      selectedTileType = (selectedTileType + 1) % maxTileTypes;
    } else {
      selectedTileType = (selectedTileType - 1 + maxTileTypes) % maxTileTypes;
    }
    console.log("Mouse wheel changed to tile type:", selectedTileType);
    return true; // Prevent default scrolling behavior in editor mode
  }
  return false; // Allow normal scrolling when not in editor mode
}
