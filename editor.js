
var editorMode = false;

function toggleEditorMode() {
  editorMode = !editorMode;
  console.log("Editor mode:", editorMode ? "ON" : "OFF");
}

function drawEditorUI() {
  // Draw semi-transparent overlay
  fill(0, 0, 0, 100);
  rect(0, 0, width, height);
  
  // Draw editor mode indicator
  fill(255, 255, 0);
  textSize(24);
  textAlign(CENTER);
  text("EDITOR MODE - Press Shift+E to exit", width/2, 30);
  text("Click tiles to toggle them", width/2, 60);
}

function handleEditorClick() {
  if (editorMode && gameWorld && gameWorld.length > 0) {
    // Convert mouse coordinates to world coordinates
    var worldX = mouseX + pX;
    var worldY = mouseY + pY;
    
    // Convert to grid coordinates
    var gridPos = coordsToGrid(worldX, worldY);
    
    // Check if the click is within bounds
    if (gridPos.row >= 0 && gridPos.row < gameWorld.length &&
        gridPos.col >= 0 && gridPos.col < gameWorld[gridPos.row].length) {
      
      // Toggle tile (0 becomes 1, 1 becomes 0)
      gameWorld[gridPos.row][gridPos.col] = gameWorld[gridPos.row][gridPos.col] === 0 ? 1 : 0;
    }
  }
}

function handleEditorKeyPress() {
  // Toggle editor mode with Shift+E
  if (keyCode == 69 && keyIsDown(SHIFT)) {
    toggleEditorMode();
  }
}
