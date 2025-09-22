var pX = 0; var pY = 0;
var pXVel = 0; var pYVel = 0;
var gameWorld = [];
var worldString = "";
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
  controls();
  pop();
  drawUI();
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
function keyPressed(){
  if (keyCode == 67 && keyIsDown(17)){
    navigator.clipboard.writeText(worldToString(gameWorld));
    console.log("map copied to clipboard");
  }
}