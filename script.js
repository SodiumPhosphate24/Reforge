let Buschy, InventoryImg, FrameImg, Fog, BulletImgs = [0, 0, 0, 0, 0], GunImgs = [0, 0, 0], itemImgs = [0, 0], Silkscreen;
var itemConstructors = [["gun", "glock"], ["gun", "western"], ["gun", "rare pistol"], ["bullet", "common"], ["bullet", "uncommon"], ["bullet", "rare"], ["bullet", "legendary"], ["consumable", "cheese"], ["consumable", "soda"]];
var pX = 0; var pY = 0;
var prePX = 0, prePY = 0;
var camX = 0; var camY = 0;
var pSpeed = 1.3;
var pXVel = 0; var pYVel = 0;
var gameWorld = [];
var worldString = "";
var lastScroll = 0;
var scrollDelay = 20;
var hotbar = [];
var recoil = 10;
var tileImgs = ["grass", "asphalt", "lined asphalt", "Concrete", "Brick", "Crate"];
var tileWalls = [0, 0, 0, 2, 1, 1]; // 0 walkable, 1 solid, 2 roof (walk-through + fades)
const pWidth = 35, pHeight = 25;
var enemies = [], bullets = [], messages = [], droppedItems = []; 
var inventoryList = [];
let maxTileTypes = 0; // will be set in setup()

function preload() {
  worldString = loadStrings("world.txt");
  Buschy = loadImage("Characters/Buschy.png");
  BulletImgs[0] = loadImage("Items/Bullets/CommonBullet.png");
  BulletImgs[1] = loadImage("Items/Bullets/UncommonBullet.png");
  BulletImgs[2] = loadImage("Items/Bullets/RareBullet.png");
  BulletImgs[3] = loadImage("Items/Bullets/LegendaryBullet.png");
  BulletImgs[4] = loadImage("Items/Bullets/ExplosiveBullet.png");
  GunImgs[0] = loadImage("Items/Guns/Glock.png");
  GunImgs[1] = loadImage("Items/Guns/WesternPistol.png");
  GunImgs[2] = loadImage("Items/Guns/RarePistol.png");
  tileImgs[0] = loadImage("Tiles/deadGrass.png");
  tileImgs[1] = loadImage("Tiles/Asphalt.png");
  tileImgs[2] = loadImage("Tiles/Asphalt2.png");
  tileImgs[3] = loadImage("Tiles/Concrete.png");
  tileImgs[4] = loadImage("Tiles/Brick.png");
  tileImgs[5] = loadImage("Tiles/Crate.png");
  itemImgs[0] = loadImage("Items/Consumables/Cheese.png");
  itemImgs[1] = loadImage("Items/Consumables/Soda.png");
  InventoryImg = loadImage("hud/Inventory.png");
  FrameImg = loadImage("hud/Frame.png");
  Fog = loadImage("hud/Fog.png");
  Silkscreen = loadFont("Silkscreen-Regular.ttf");
}

function setup() {
  createCanvas(1200, 750);
  gameWorld = stringToWorld(worldString[0]);
  console.log(worldString);
  console.log("asdf");
  maxTileTypes = tileImgs.length;
  players.push(new Player(0, 0, 35, 25, 1.3, 1.3, 1, "Buschy"));
}

function draw() {
  prePX = pX;
  prePY = pY;
  background(50);
  push();
  controlCamera();
  translate(camX, camY);

  // --- Roof fade update (kept) ---
  const __roofSeeds = getOverlappingRoofSeeds(pX, pY, pWidth, pHeight);
  floodFillRoof(__roofSeeds);
  stepRoofFades();
  // -------------------------------

  // LAYERS 0 & 1 behind player
  drawWorldLayer(gameWorld, 0);
  drawWorldLayer(gameWorld, 1);

  fill(255);
  // shadow
  fill(0, 0, 0, 80 - sin(frameCount / 25) * 10);
  ellipse(pX + 617, pY + 395, 35, 21);
  image(Buschy, pX + 600, pY + 340, pWidth, pHeight + 35);

  // --- Only the gun rotates (isolated) ---
  drawGunDebugRect(); // uses calculateAim()
  // ---------------------------------------

  mainHand();
  drawEnemies();
  drawBullets();
  updateDroppedItems();
  updateParticles(); // Draw particles
  controls();
  resolveCollisions();

  // LAYER 2 in front of player
  drawWorldLayer(gameWorld, 2);

  pop();
  drawUI();
  messageDisplay();
  tint(255, 200);
  image(Fog, pX + camX - 600, pY + camY - 600, width + 1200, height + 1200);
  noTint();
  doRecoil();
  if (editorMode) {
    drawEditorUI();
    if (mouseIsPressed) {
      handleEditorClick();
    }
  }
}

/* ===================== LAYERED WORLD (3 layers: 0,1 behind; 2 above player) =====================

Cell encoding in world.txt (backwards compatible):
- Legacy single layer: "3" or "3:90"
- Multi-layer: "L0,L1,L2" where each Ln is "" or "type[:rot]"
Rows use '|' and columns use '/' as you already had.

Example row:
0,,/1,3,/2,,/,,4/|

================================================================================================= */

// --- Editor-friendly helpers ---
function getTile(row, col, layer = 0) {
  const cell = gameWorld[row]?.[col];
  if (!cell) return null;
  if ('layers' in cell) return cell.layers[layer] || null;
  return (layer === 0) ? cell : null; // legacy cell is layer 0
}

function setTile(row, col, layer, type, rotation = 0) {
  if (!gameWorld[row]) gameWorld[row] = [];
  if (!gameWorld[row][col]) {
    gameWorld[row][col] = { layers: [null, null, null] };
  } else if (!('layers' in gameWorld[row][col])) {
    const old = gameWorld[row][col];
    gameWorld[row][col] = { layers: [old, null, null] };
  }
  gameWorld[row][col].layers[layer] = (type == null) ? null : { type: parseInt(type, 10), rotation: parseInt(rotation, 10) || 0 };
}

function clearTile(row, col, layer) {
  setTile(row, col, layer, null);
}

// --- Serializer / Parser (with backward compatibility) ---
function worldToString(world) {
  let out = "";
  for (let r = 0; r < world.length; r++) {
    const row = world[r];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (!cell) { out += "/"; continue; }

      if ('layers' in cell) {
        const parts = cell.layers.map(t => {
          if (!t) return "";
          let s = String(t.type);
          if (t.rotation && t.rotation !== 0) s += ":" + t.rotation;
          return s;
        });
        out += parts.join(",") + "/";
      } else {
        let s = String(cell.type);
        if (cell.rotation && cell.rotation !== 0) s += ":" + cell.rotation;
        out += s + "/";
      }
    }
    out += "|";
  }
  return out;
}

function stringToWorld(s) {
  if (!s) {
    console.log("No string provided to stringToWorld");
    return [];
  }

  const rows = s.split("|");
  const world = [];

  for (let i = 0; i < rows.length; i++) {
    const rowStr = rows[i];
    if (rowStr.trim() === "") continue;

    const cols = rowStr.split("/");
    const outRow = [];

    for (let j = 0; j < cols.length; j++) {
      const cellStr = cols[j].trim();
      if (cellStr === "") { outRow.push(undefined); continue; }

      if (cellStr.includes(",")) {
        const layerStrs = cellStr.split(",");
        const layers = [null, null, null];
        for (let L = 0; L < Math.min(3, layerStrs.length); L++) {
          const tstr = layerStrs[L].trim();
          if (tstr === "") { layers[L] = null; continue; }
          if (tstr.includes(":")) {
            const [t, rot] = tstr.split(":");
            layers[L] = { type: parseInt(t, 10), rotation: parseInt(rot, 10) || 0 };
          } else {
            layers[L] = { type: parseInt(tstr, 10), rotation: 0 };
          }
        }
        outRow.push({ layers });
      } else {
        if (cellStr.includes(":")) {
          const [t, rot] = cellStr.split(":");
          outRow.push({ type: parseInt(t, 10), rotation: parseInt(rot, 10) || 0 });
        } else {
          outRow.push({ type: parseInt(cellStr, 10), rotation: 0 });
        }
      }
    }
    if (outRow.length > 0) world.push(outRow);
  }
  return world;
}

// --- Grid helper (unchanged) ---
function coordsToGrid(x, y) {
  return {
    col: Math.floor(x / 50),
    row: Math.floor(y / 50)
  };
}

// --- Layered drawing: draw ONE layer index (0,1 behind; 2 in front) ---
function drawWorldLayer(world, layerIndex) {
  if (!world || world.length === 0) return;

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
    if (!world[i]) continue;

    for (let j = startCol; j <= endCol && j < world[i].length; j++) {
      let cell = world[i][j];
      if (!cell) continue;

      // Pick the tile in this layer (legacy cells only draw on layer 0)
      let tileObj = null;
      if ('layers' in cell) {
        tileObj = cell.layers[layerIndex] || null;
      } else {
        tileObj = (layerIndex === 0) ? cell : null;
      }
      if (!tileObj) continue;

      let tileType = tileObj.type;
      let rotation = tileObj.rotation || 0;

      // Roof tinting only on foreground layer 2
      let __useTint = false;
      if (layerIndex === 2 && tileWalls[tileType] === 2) {
        const __k = tileKey(i, j);
        const __alpha = roofAlpha.has(__k) ? roofAlpha.get(__k) : 255;
        if (__alpha <= 0) continue; // fully transparent; skip draw
        if (__alpha < 255) { tint(255, __alpha); __useTint = true; }
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

      if (__useTint) noTint();
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

  // Guard if world failed to load
  if (!gameWorld.length || !gameWorld[0]?.length) return;

  pX = constrain(pX, -600, gameWorld[0].length * 50 - width / 2 - pWidth);
  pY = constrain(pY, -400, gameWorld.length * 50 - height / 2 - pHeight);
}

function mousePressed() { }

function keyPressed() {
  if (keyCode == 67 && keyIsDown(17)) {
    navigator.clipboard.writeText(worldToString(gameWorld));
    console.log("map copied to clipboard");
  }

  if (keyCode >= 49 && keyCode <= 56) {
    inventorySlot = keyCode - 48;
  }

  if (keyCode == 69) {
    let count = 0;
    for(let i = 0; i < droppedItems.length; i++){
      if (droppedItems[count].checkPickup()){
        if (inventoryList.length < 8){
          inventoryList.push(droppedItems[count].item);
          droppedItems.splice(count, 1);
          count--;
        }
        else if (inventoryList.length >= 8){
          droppedItems.push(new DroppedItem(inventoryList[inventorySlot-1], pX + 600, pY + 340))
          inventoryList[inventorySlot-1] = droppedItems[count].item;
          droppedItems.splice(count, 1);
        }
        break;
      }
      count++;
    }
  }

  if (keyCode == 71) {
    speedBuff = !speedBuff;
  }

  if (keyCode == 84) {
    enemies.push(new Enemy("zombie"));
  }
  if (keyCode == 77) {
    messages.push(new Message("dialogue", ["Buschy: granny smith apple", "Wing: Red delicious apple", "Mario: Honeycrisp apple", "Luigi: Carrot", "Luigi: Haha u thought I was gon say apple"]))
  }
  if (keyCode == 86) {
    droppedItems.push(new DroppedItem(new Item("gun", "glock"), pX + 600, pY + 340));
  }

  if (keyCode == 67) {
    let r = Math.floor(Math.random() * itemConstructors.length);
    droppedItems.push(new DroppedItem(new Item(itemConstructors[r][0], itemConstructors[r][1]), pX + 600, pY + 340));
  }

  if (typeof handleEditorKeyPress === "function") {
    handleEditorKeyPress();
  }
}

function mouseClicked() {
  if (!editorMode) {
    if(inventoryList.length > 0 && inventorySlot-1 < inventoryList.length){
      if (inventoryList[inventorySlot-1].type == "gun"){
        bullets.push(new Bullet("common"));
      }
    }
  }
}

function mouseWheel(event) {
  if (handleEditorMouseWheel && handleEditorMouseWheel(event)) {
    return false; // Editor handled it, prevent default behavior
  }

  let currentTime = millis();

  if (currentTime - lastScroll > scrollDelay) {
    if (event.delta > 0) {
      inventorySlot = (inventorySlot % 8) + 1;
    } else {
      inventorySlot = (inventorySlot - 2 + 8) % 8 + 1;
    }
    lastScroll = currentTime;
  }

  return false; // Prevents default scrolling behavior (reducing system lag)
}

// Editor functionality comes from editor.js (you’ll share next)

function controlCamera() {
  camX -= (camX + pX) * 0.1;
  camY -= (camY + pY) * 0.1;

  if (!gameWorld.length || !gameWorld[0]?.length) return;

  camX = constrain(camX, -(gameWorld[0].length * 50) + width, 0);
  camY = constrain(camY, -(gameWorld.length * 50) + height, 0);
}

function resolveCollisions() {
  const w = pWidth, h = pHeight;

  // If new position isn't colliding, we're done
  if (!checkTileCollisions(pX, pY, w, h)) return;

  const dx = pX - prePX;
  const dy = pY - prePY;

  // Test each axis independently by substituting the previous coordinate
  const collIfRevertX = checkTileCollisions(prePX, pY, w, h);
  const collIfRevertY = checkTileCollisions(pX, prePY, w, h);

  // "Caused" means: reverting that axis removes the collision
  const xCaused = !collIfRevertX;
  const yCaused = !collIfRevertY;

  // If neither alone resolves it (corner squeeze), revert both
  if (!xCaused && !yCaused) {
    pX = prePX;
    pY = prePY;
    return;
  }

  // Revert only the axes that caused the collision
  if (xCaused) pX = prePX;
  if (yCaused) pY = prePY;

  // Pixel-walk toward intended direction until just before collision
  const maxSteps = 1000;

  if (xCaused) {
    const stepX = Math.sign(dx) || 0;
    let steps = 0;
    while (stepX !== 0 && !checkTileCollisions(pX + stepX, pY, w, h) && steps < maxSteps) {
      pX += stepX;
      steps++;
    }
    pXVel = 0;
  }

  if (yCaused) {
    const stepY = Math.sign(dy) || 0;
    let steps = 0;
    while (stepY !== 0 && !checkTileCollisions(pX, pY + stepY, w, h) && steps < maxSteps) {
      pY += stepY;
      steps++;
    }
    pYVel = 0;
  }
}

/* ===== Collision now checks ALL layers; only tileWalls[type] === 1 blocks ===== */
function checkTileCollisions(x, y, w, h) {
  const left = x + 600;
  const top = y + 375;
  const right = left + w;
  const bottom = top + h;

  const leftTile = Math.floor(left / 50);
  const rightTile = Math.floor(right / 50);
  const topTile = Math.floor(top / 50);
  const bottomTile = Math.floor(bottom / 50);

  for (let row = topTile; row <= bottomTile; row++) {
    for (let col = leftTile; col <= rightTile; col++) {
      if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row].length) continue;

      const cell = gameWorld[row][col];

      if (cell && 'layers' in cell) {
        for (let L = 0; L < 3; L++) {
          const t = cell.layers[L];
          if (!t) continue;
          if (tileWalls[t.type] == 1) {
            const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
            if (left < tR && right > tL && top < tB && bottom > tT) return true;
          }
        }
      } else if (cell) { // legacy
        if (tileWalls[cell.type] == 1) {
          const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
          if (left < tR && right > tL && top < tB && bottom > tT) return true;
        }
      }
    }
  }
  return false;
}

function checkCollision(x, y, x2, y2, w, h, w2 = 50, h2 = 50) {
  return (
    x < x2 + w2 &&
    x + w > x2 &&
    y < y2 + h2 &&
    y + h > y2
  );
}

/* ========= Roof fade system (unchanged logic; updated to look at layer 2) ========= */
const ROOF_FADE_SPEED = 25;   // alpha change per frame (0..255)
let roofAlpha = new Map();     // key "row,col" -> alpha
let roofTarget = new Set();    // keys that should fade to 0 this frame

function tileKey(r, c) { return r + "," + c; }

function isRoof(row, col) {
  if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row].length) return false;
  const cell = gameWorld[row][col];
  if (!cell) return false;

  // Treat roof as the tile placed on FOREGROUND layer 2
  if ('layers' in cell) {
    const L2 = cell.layers?.[2];
    if (!L2) return false;
    return tileWalls[L2.type] === 2;
  } else {
    // legacy single-layer maps: allow roof there too
    return tileWalls[cell.type] === 2;
  }
}

function getOverlappingRoofSeeds(x, y, w, h) {
  const left = x + 600;
  const top = y + 375;
  const right = left + w;
  const bottom = top + h;

  const TILE = 50;
  const leftTile = Math.floor(left / TILE);
  const rightTile = Math.floor(right / TILE);
  const topTile = Math.floor(top / TILE);
  const bottomTile = Math.floor(bottom / TILE);

  const seeds = [];
  for (let r = topTile; r <= bottomTile; r++) {
    for (let c = leftTile; c <= rightTile; c++) {
      if (!isRoof(r, c)) continue;

      const tL = c * TILE, tT = r * TILE, tR = tL + TILE, tB = tT + TILE;
      if (left < tR && right > tL && top < tB && bottom > tT) {
        seeds.push([r, c]);
      }
    }
  }
  return seeds;
}

function floodFillRoof(seeds) {
  roofTarget.clear();
  if (!seeds.length) return;

  const q = [];
  const seen = new Set();
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // 4-connected

  for (const s of seeds) {
    const k = tileKey(s[0], s[1]);
    if (!seen.has(k)) { seen.add(k); q.push(s); }
  }

  while (q.length) {
    const [r, c] = q.shift();
    const k = tileKey(r, c);
    roofTarget.add(k);

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (!isRoof(nr, nc)) continue;
      const nk = tileKey(nr, nc);
      if (!seen.has(nk)) { seen.add(nk); q.push([nr, nc]); }
    }
  }
}

function stepRoofFades() {
  // Fade targets toward transparent (0)
  for (const k of roofTarget) {
    const curr = roofAlpha.has(k) ? roofAlpha.get(k) : 255;
    const next = Math.max(0, curr - ROOF_FADE_SPEED);
    roofAlpha.set(k, next);
  }
  // Fade non-targets back toward opaque (255)
  for (const [k, curr] of roofAlpha.entries()) {
    if (roofTarget.has(k)) continue;
    const next = Math.min(255, curr + ROOF_FADE_SPEED);
    if (next === 255) roofAlpha.delete(k); else roofAlpha.set(k, next);
  }
}
/* ====== End roof fade system ====== */

// --- Gun flip animation state ---
let currentGunFlip = 0; // current flip angle (0 or 180)
let targetGunFlip = 0;  // target flip angle

// --- Only-gun-rotates helper (uses your calculateAim()) ---
function drawGunDebugRect() {
  push(); // isolate transforms

  // Move pivot to player's on-screen center (mouseX/mouseY are screen coords)
  translate(pX + 600 + pWidth / 2, pY + 375 + pHeight / 2);

  // Rotate local axes towards the mouse
  const aimAngle = calculateAim();
  rotate(aimAngle);

  // Determine if gun should flip based on mouse position relative to player
  // Calculate player center in screen coordinates
  const playerScreenX = pX + camX + 600 + pWidth / 2;

  // If mouse is to the left of player, flip the gun
  if (mouseX < playerScreenX) {
    targetGunFlip = 180;
  } else {
    targetGunFlip = 0;
  }

  // Smoothly interpolate current flip to target flip
  currentGunFlip = lerp(currentGunFlip, targetGunFlip, 0.2);

  // Apply the flip rotation (around X-axis conceptually, but we scale Y)
  push();
  translate(25, 0); // move to gun position

  // Flip by scaling Y when needed
  const flipScale = cos(radians(currentGunFlip));
  scale(1, flipScale);

  // Draw the gun image pointing along +X
  if (inventoryList.length > 0) {
    if(inventorySlot-1 < inventoryList.length){
      image(inventoryList[inventorySlot-1].image, recoil, -10, 30, 20);
    }
    else{
      rectMode(CORNER);
    rect(0, -5, 20, 10);
    }
  } 
  else {
    // Fallback rect if image not loaded
    
  }
  pop();

  pop(); // restore transforms
}

// Helper function to get gun barrel position in world coordinates
function getGunBarrelPosition() {
  const angle = calculateAim();
  const gunLength = 30; // matches gun image width
  const gunOffset = 25; // distance from player center to gun start
  const barrelDistance = gunOffset + gunLength; // total distance to barrel tip

  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;

  // Use the same calculation for both left and right sides
  const barrelX = playerCenterX + barrelDistance * cos(angle);
  const barrelY = playerCenterY + barrelDistance * sin(angle);

  return {
    x: barrelX,
    y: barrelY
  };
}

function mainHand() {
  return false;
}
function doRecoil() {
  if (recoil < 10) {
    recoil += 1;
  }
}

function distance(x1, y1, x2, y2) {
  return sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
let pressedKeys = {};

function keyPressedOnce(k) {
  if (keyIsDown(k) && !pressedKeys[k]) {
    pressedKeys[k] = true;
    return true;  // fires once
  }
  if (!keyIsDown(k)) {
    pressedKeys[k] = false;
  }
  return false;
}
