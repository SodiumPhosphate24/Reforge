
var editorMode = false;
var selectedTileType = 0; // Currently selected tile type
var maxTileTypes = 4; // Number of available tile types (0, 1, 2)
var tileRotation = 0; // Current tile rotation (0, 90, 180, 270 degrees)

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
  text("EDITOR MODE - Press Shift+E to exit", width / 2, 25);
  text("Click to place - Scroll/comma/period to change tile - R to rotate", width / 2, 45);
  text("Current tile: " + selectedTileType + " | Rotation: " + tileRotation + "°", width / 2, 65);

  // Draw preview tile at mouse position
  drawTilePreview();
}

function drawTilePreview() {
  if (gameWorld && gameWorld.length > 0) {
    // Convert mouse coordinates to world coordinates using camera offset
    var worldX = mouseX - camX;
    var worldY = mouseY - camY;

    // Convert to grid coordinates and snap to grid
    var gridCol = Math.floor(worldX / 50);
    var gridRow = Math.floor(worldY / 50);

    // Check if the preview position is within bounds
    if (gridRow >= 0 && gridRow < gameWorld.length &&
      gridCol >= 0 && gridCol < gameWorld[gridRow].length) {

      // Calculate snapped world position
      var snapX = gridCol * 50;
      var snapY = gridRow * 50;

      // Draw preview tile with transparency
      push();
      translate(camX, camY);

      // Draw the faded tile image with rotation
      if (tileImgs[selectedTileType]) {
        tint(255, 150); // Make it semi-transparent
        push();
        translate(snapX + 25, snapY + 25); // Move to center of tile
        rotate(radians(tileRotation));
        image(tileImgs[selectedTileType], -25, -25, 50, 50);
        pop();
        noTint();
      }

      // Draw grid outline for the preview tile
      noFill();
      stroke(255, 255, 0, 200);
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
      var gridCol = Math.floor(worldX / 50);
      var gridRow = Math.floor(worldY / 50);

      // Check if the click is within bounds
      if (gridRow >= 0 && gridRow < gameWorld.length &&
        gridCol >= 0 && gridCol < gameWorld[gridRow].length) {

        // Place the selected tile type with rotation
        gameWorld[gridRow][gridCol] = {
          type: selectedTileType,
          rotation: tileRotation
        };
        console.log("Placed tile type", selectedTileType, "with rotation", tileRotation + "° at row", gridRow, "col", gridCol);
      }
    }
}

function handleEditorKeyPress() {
  // Toggle editor mode with Shift+E
  if (keyCode == 69 && keyIsDown(SHIFT)) {
    toggleEditorMode();
  }

  // Handle tile switching with comma and period keys
  if (editorMode) {
    if (keyCode == 188) { // Comma key (,)
      selectedTileType = (selectedTileType - 1 + maxTileTypes) % maxTileTypes;
      console.log("Changed to tile type:", selectedTileType);
    }
    if (keyCode == 190) { // Period key (.)
      selectedTileType = (selectedTileType + 1) % maxTileTypes;
      console.log("Changed to tile type:", selectedTileType);
    }
    if (keyCode == 82) { // R key
      tileRotation = (tileRotation + 90) % 360;
      console.log("Rotated tile to:", tileRotation + "°");
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
