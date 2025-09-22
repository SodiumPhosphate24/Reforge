var pX = 0; var pY = 0;
var pXVel = 0; var pYVel = 0;
var gameWorld = [];
var worldString = "";
var editorMode = false;
function preload() {
  worldString = loadStrings("world.txt");
}
function setup() {
  createCanvas(1200, 750);
  gameWorld = stringToWorld(worldString[0]);
  console.log(worldString);
}

function draw() {
  background(50);
  push();
  translate(-pX, -pY);
  drawWorld(gameWorld, 0);
  fill(255);
  rect(pX + 600, pY + 375, 25, 50);
  
  if (!editorMode) {
    controls();
  }
  
  pop();
  drawUI();
  
  if (editorMode) {
    drawEditorUI();
  }
}

function worldToString(world){
  var string = "";
  for (let i = 0; i < world.length; i++) {
    for (let j = 0; j < world[i].length; j++) {
      string += world[i][j];
      string += "/";
    }
    string += "|";
  }
  return string;
}

function stringToWorld(s) {
  if (!s) {
    console.log("No string provided to stringToWorld");
    return [];
  }
  
  // Split rows by "|"
  let rows = s.split("|");
  let world = [];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].trim() === "") continue; // Skip empty rows
    
    // Split each row into columns by "/"
    let cols = rows[i].split("/");

    // Convert each column value to an integer, filter out empty strings
    let rowArray = cols.filter(col => col !== "").map(num => parseInt(num, 10));
    
    if (rowArray.length > 0) {
      world.push(rowArray);
    }
  }

  return world;
}


function coordsToGrid(x, y) {
  return {
    col: Math.floor(x / 50),
    row: Math.floor(y / 50)
  };
}

function drawWorld(world, layer) {
  if (!world || world.length === 0) {
    return; // Exit if world is not properly loaded
  }
  
  var rows = world.length;
  var columns = world[0] ? world[0].length : 0;
  
  // Calculate viewport bounds
  var topLeft = coordsToGrid(pX, pY);
  var bottomRight = coordsToGrid(pX + width, pY + height);
  
  // Add padding to ensure smooth scrolling
  var startRow = Math.max(0, topLeft.row - 1);
  var endRow = Math.min(rows - 1, bottomRight.row + 1);
  var startCol = Math.max(0, topLeft.col - 1);
  var endCol = Math.min(columns - 1, bottomRight.col + 1);
  
  // Only draw tiles that are visible
  for (let i = startRow; i <= endRow; i++) {
    if (!world[i]) continue; // Skip if row doesn't exist
    
    for (let j = startCol; j <= endCol && j < world[i].length; j++){
      if (world[i][j] == 0) {
        fill(24, 24, 24);
        rect(j*50, i*50, 50, 50);
      }
      if (world[i][j] == 1) {
        fill(200, 200, 200);
        rect(j*50, i*50, 50, 50);
      }
    }
  }
}

function controls() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    pXVel -= 1;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    pXVel += 1;
  }
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
    pYVel -= 1;
  }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
    pYVel += 1;
  }
  pYVel *= 0.8;
  pXVel *= 0.8;
  pX += pXVel;
  pY += pYVel;
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

function mousePressed() {
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

function keyPressed(){
  if (keyCode == 67 && keyIsDown(17)){
    navigator.clipboard.writeText(worldToString(gameWorld));
    console.log("map copied to clipboard");
  }
  
  // Toggle editor mode with Shift+E
  if (keyCode == 69 && keyIsDown(SHIFT)) {
    editorMode = !editorMode;
    console.log("Editor mode:", editorMode ? "ON" : "OFF");
  }
}