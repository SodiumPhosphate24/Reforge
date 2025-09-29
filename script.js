let Buschy, InventoryImg, FrameImg, Fog;
var pX = 0; var pY = 0;
var prePX = 0, prePY = 0;
var camX = 0; var camY = 0;
var pSpeed = 1.3;
var pXVel = 0; var pYVel = 0;
var gameWorld = [];
var worldString = "";
var lastScroll = 0;
var scrollDelay = 20;
var tileImgs = [0, 0, 0];
const pWidth = 35, pHeight = 60;
let enemies = [];
function preload() {
  worldString = loadStrings("world.txt");
  Buschy = loadImage("Characters/Buschy.png");
  tileImgs[0] = loadImage("Tiles/deadGrass.png");
  tileImgs[1] = loadImage("Tiles/Asphalt.png");
  tileImgs[2] = loadImage("Tiles/Asphalt2.png");
  InventoryImg = loadImage("hud/Inventory.png");
  FrameImg = loadImage("hud/Frame.png");
  Fog = loadImage("hud/Fog.png")
}

function setup() {
  createCanvas(1200, 750);
  gameWorld = stringToWorld(worldString[0]);
  console.log(worldString);
}

function draw() {
  prePX = pX;
  prePY = pY;
  background(50);
  push();
  controlCamera();
  translate(camX, camY);
  drawWorld(gameWorld, 0);
  fill(255);
  //shadow
  fill(0, 0, 0, 80 - sin(frameCount / 25) * 10);
  ellipse(pX + 617, pY + 432, 35, 21);
  image(Buschy, pX + 600, pY + 375, pWidth, pHeight);
  controls();
  resolveCollisions();
  pop();
  drawEnemies();
  drawUI();
  tint(255, 200);
  image(Fog, pX+camX-600, pY+camY-600, width+1200, height+1200);
  noTint();

  if (editorMode) {
    drawEditorUI();
    if (mouseIsPressed) {
      handleEditorClick();
    }
  }

}

function worldToString(world) {
  var string = "";
  for (let i = 0; i < world.length; i++) {
    for (let j = 0; j < world[i].length; j++) {
      let tile = world[i][j];
      if (typeof tile === 'object') {
        string += tile.type;
        if (tile.rotation > 0) {
          string += ":" + tile.rotation;
        }
      } else {
        string += tile; // Backwards compatibility
      }
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

    // Convert each column value to tile object or integer for backwards compatibility
    let rowArray = cols.filter(col => col !== "").map(tileData => {
      if (tileData.includes(":")) {
        // New format: "type:rotation"
        let parts = tileData.split(":");
        return {
          type: parseInt(parts[0], 10),
          rotation: parseInt(parts[1], 10) || 0
        };
      } else {
        // Old format: just the tile type
        return {
          type: parseInt(tileData, 10),
          rotation: 0
        };
      }
    });

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
  var topLeft = coordsToGrid(-camX, -camY);
  var bottomRight = coordsToGrid(-camX + width, -camY + height);

  // Add padding to ensure smooth scrolling
  var startRow = Math.max(0, topLeft.row - 1);
  var endRow = Math.min(rows - 1, bottomRight.row + 1);
  var startCol = Math.max(0, topLeft.col - 1);
  var endCol = Math.min(columns - 1, bottomRight.col + 1);

  // Only draw tiles that are visible
  for (let i = startRow; i <= endRow; i++) {
    if (!world[i]) continue; // Skip if row doesn't exist

    for (let j = startCol; j <= endCol && j < world[i].length; j++) {
      fill(24, 24, 24);
      let tile = world[i][j];
      let tileType, rotation;

      if (typeof tile === 'object') {
        tileType = tile.type;
        rotation = tile.rotation || 0;
      } else {
        tileType = tile; // Backwards compatibility
        rotation = 0;
      }

      if (rotation > 0) {
        push();
        translate(j * 50 + 25, i * 50 + 25); // Move to center of tile
        rotate(radians(rotation));
        image(tileImgs[tileType], -25, -25, 50, 50);
        pop();
      } else {
        image(tileImgs[tileType], j * 50, i * 50, 50, 50);
      }
    }
  }
}

function controls() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    pXVel -= pSpeed;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    pXVel += pSpeed;
  }
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
    pYVel -= pSpeed;
  }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
    pYVel += pSpeed;
  }
  pYVel *= 0.8;
  pXVel *= 0.8;
  pX += pXVel;
  pY += pYVel;
  pX = constrain(pX, -600, gameWorld[0].length * 50 - width / 2 - pWidth);
  pY = constrain(pY, -400, gameWorld.length * 50 - height / 2 - pHeight);
}

function mousePressed() {

}

function keyPressed() {
  if (keyCode == 67 && keyIsDown(17)) {
    navigator.clipboard.writeText(worldToString(gameWorld));
    console.log("map copied to clipboard");
  }

  if (keyCode >= 49 && keyCode <= 56) {
    inventorySlot = keyCode - 48;
  }

  if (keyCode == 32) {
    healthPoints -= 10;
  }

  if (keyCode == 84) {
    enemies.push(new Enemy("zombie"));
  }

  handleEditorKeyPress();
}

function mouseWheel(event) {
  // Check if editor should handle the mouse wheel event
  if (handleEditorMouseWheel && handleEditorMouseWheel(event)) {
    return false; // Editor handled it, prevent default behavior
  }

  let currentTime = millis();

  // Ensure there's a delay between inventory updates to prevent rapid changes
  if (currentTime - lastScroll > scrollDelay) {
    if (event.delta > 0) {
      inventorySlot = (inventorySlot % 8) + 1;
    } else {
      inventorySlot = (inventorySlot - 2 + 8) % 8 + 1;
    }

    lastScroll = currentTime; // Update scroll timer
  }

  return false; // Prevents default scrolling behavior (reducing system lag)
}

// Editor functionality will be in editor.js
// Assuming editor.js contains:
// var editorMode = false;
// function drawEditorUI() { ... }
// function handleEditorClick() { ... }
// function handleEditorKeyPress() { ... }

function controlCamera() {
  camX -= (camX + pX) * 0.1;
  camY -= (camY + pY) * 0.1;
  camX = constrain(camX, -(gameWorld[0].length * 50) + width, 0);
  camY = constrain(camY, -(gameWorld.length * 50) + height, 0);
}
function resolveCollisions() {
  const w = pWidth, h = pHeight;

  // If we're not colliding at the new position, nothing to do
  if (!checkTileCollisions(pX, pY, w, h)) return;

  const dx = pX - prePX;
  const dy = pY - prePY;

  const xCaused = checkTileCollisions(prePX, pY, w, h); // reverting X alone still collides? => X movement caused it
  const yCaused = checkTileCollisions(pX, prePY, w, h); // reverting Y alone still collides? => Y movement caused it

  // Revert axes responsible for the collision
  if (xCaused) pX = prePX;
  if (yCaused) pY = prePY;

  // Corner case: neither axis alone seems to be "responsible" but current position collides (diagonal squeeze)
  if (!xCaused && !yCaused && checkTileCollisions(pX, pY, w, h)) {
    pX = prePX;
    pY = prePY;
  }

  // Nudge along each reverted axis toward the original intent until just before collision
  const maxSteps = 200; // safety guard

  // Only nudge X if we changed X (or we reverted both)
  if (prePX !== pX) {
    const stepX = Math.sign(dx) || 0; // direction we tried to move in X
    let steps = 0;
    while (stepX !== 0 && !checkTileCollisions(pX + stepX, pY, w, h) && steps < maxSteps) {
      pX += stepX;
      steps++;
    }
    // stop one step before collision (loop ensures we never step into collision)
    pXVel = 0;
  }

  // Only nudge Y if we changed Y (or we reverted both)
  if (prePY !== pY) {
    const stepY = Math.sign(dy) || 0; // direction we tried to move in Y
    let steps = 0;
    while (stepY !== 0 && !checkTileCollisions(pX, pY + stepY, w, h) && steps < maxSteps) {
      pY += stepY;
      steps++;
    }
    pYVel = 0;
  }

  // Final clamp (optional, in case of edge cases)
  // if (checkTileCollisions(pX, pY, w, h)) {
  //   pX = prePX;
  //   pY = prePY;
  // }
}


function checkTileCollisions(x, y, w, h) {
  // Get rectangle bounds
  const left = x;
  const top = y;
  const right = x + w;
  const bottom = y + h;

  // Convert to tile indices
  const leftTile = Math.floor(left / 50);
  const rightTile = Math.floor(right / 50);
  const topTile = Math.floor(top / 50);
  const bottomTile = Math.floor(bottom / 50);

  // Loop through tiles in vicinity
  for (let row = topTile; row <= bottomTile; row++) {
    for (let col = leftTile; col <= rightTile; col++) {
      // Check bounds
      if (row >= 0 && row < gameWorld.length &&
          col >= 0 && col < gameWorld[row].length) {

        let tile = gameWorld[row][col];
        let tileType = (typeof tile === 'object') ? tile.type : tile;

        if (tileType > 0) { // treat >0 as solid
          const tileLeft = col * 50;
          const tileTop = row * 50;
          const tileRight = tileLeft + 50;
          const tileBottom = tileTop + 50;

          // AABB check
          if (left < tileRight &&
              right > tileLeft &&
              top < tileBottom &&
              bottom > tileTop) {
            return true; // Collision
          }
        }
      }
    }
  }

  return false; // No collision
}

function checkCollision(x, y, x2, y2, w, h, w2 = 50, h2 = 50) {
  // First rectangle: (x, y) is top-left, width = w, height = h
  // Second rectangle: (x2, y2) is top-left, width = w2, height = h2

  if (
    x < x2 + w2 &&     // left edge of rect1 is left of right edge of rect2
    x + w > x2 &&      // right edge of rect1 is right of left edge of rect2
    y < y2 + h2 &&     // top edge of rect1 is above bottom edge of rect2
    y + h > y2         // bottom edge of rect1 is below top edge of rect2
  ) {
    return true; // collision
  }

  return false; // no collision
}
