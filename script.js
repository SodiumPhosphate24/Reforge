let Buschy, InventoryImg, EnergyTank, FrameImg, Fog, IndicatorImg, BulletImgs = [0, 0, 0, 0, 0], GunImgs = [0, 0, 0], itemImgs = [0, 0, 0, 0, 0], projImgs = [0, 0], matImgs = [0, 0, 0], Silkscreen, PlayerImage;
var itemConstructors = [];
var pX = 0; var pY = 0; var playerDamage = 1;
var prePX = 0, prePY = 0;
var camX = 0; var camY = 0;
var pSpeed = 1.3;
var pXVel = 0; var pYVel = 0;
var pWidth = 35; var pHeight = 25;
var gameWorld = [];
var worldString = "";
var lastScroll = 0;
var scrollDelay = 20;
var hotbar = [];
var recoil = 10;
var tileImgs = ["grass", "asphalt", "lined asphalt", "Concrete", "Brick", "Crate", "Workbench", "dirt"];
var tileWalls = [0, 0, 0, 2, 1, 1, 1, 0]; // 0 walkable, 1 solid, 2 roof (walk-through + fades)
var concreteVariantImgs = {}; // Stores loaded concrete variant images
var concreteTypes = [3]; // Only one concrete type
var enemies = [], bullets = [], messages = [], droppedItems = [], NonPlayerCharacters = [];
var inventoryList;
let maxTileTypes = 0; // will be set in setup()
var crateInventories = new Map(); // Stores crate contents: "row,col" -> [itemConstructor, ...]
//cheese
function preload() {
  worldString = loadStrings("world.txt");
  Buschy = loadImage("Characters/Buschy.png");
  BadGuy = loadImage("Characters/Enemy.png")
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
  concreteVariantImgs['full'] = loadImage("Tiles/Concrete.png");
  concreteVariantImgs['center'] = loadImage("Tiles/ConcreteCenter.png");
  concreteVariantImgs['edge'] = loadImage("Tiles/concreteEdge.png");
  concreteVariantImgs['corner'] = loadImage("Tiles/concreteCorner.png");
  tileImgs[4] = loadImage("Tiles/Brick.png");
  tileImgs[5] = loadImage("Tiles/Crate.png");
  tileImgs[6] = loadImage("Tiles/Crafting.png");
  tileImgs[7] = loadImage("Tiles/dirt.png");
  itemImgs[0] = loadImage("Items/Consumables/Cheese.png");
  itemImgs[1] = loadImage("Items/Consumables/Soda.png");
  itemImgs[2] = loadImage("Items/Consumables/CommonBattery.png");
  itemImgs[3] = loadImage("Items/Consumables/RareBattery.png");
  itemImgs[4] = loadImage("Items/Consumables/LegendaryBattery.png");
  matImgs[0] = loadImage("Items/Materials/CommonCard.png");
  matImgs[1] = loadImage("Items/Materials/RareCard.png");
  matImgs[2] = loadImage("Items/Materials/LegendaryCard.png");
  projImgs[0] = loadImage("Items/Projectiles/Grenade.png");
  projImgs[1] = loadImage("Items/Projectiles/Rock.png");
  InventoryImg = loadImage("hud/Inventory.png");
  FrameImg = loadImage("hud/Frame.png");
  Fog = loadImage("hud/Fog.png");
  IndicatorImg = loadImage("Indicator.png");
  Silkscreen = loadFont("Silkscreen-Regular.ttf");
  EnergyTank = loadImage("hud/EnergyTank.png");
}

function setup() {
  createCanvas(1200, 750);
  maxTileTypes = tileImgs.length;
  PlayerImage = Buschy;

  // Initialize itemConstructors BEFORE parsing world so crate inventories can be loaded
  itemConstructors = [
    ["gun", "glock", 1, GunImgs[0]], 
    ["gun", "western", 1, GunImgs[1]], 
    ["gun", "rare pistol", 1, GunImgs[2]], 
    ["consumable", "cheese", 1, itemImgs[0]], 
    ["consumable", "soda", 1, itemImgs[1]], 
    ["consumable", "common battery", 1, itemImgs[2]], 
    ["consumable", "rare battery", 1, itemImgs[3]], 
    ["consumable", "legendary battery", 1, itemImgs[4]], 
    ["projectile", "grenade", 1, projImgs[0]], 
    ["projectile", "rock", 10, projImgs[1]], 
    ["material", "common card", 1, matImgs[0]], 
    ["material", "rare card", 1, matImgs[1]], 
    ["material", "legendary card", 1, matImgs[2]]
  ];

  // Now parse the world with itemConstructors available
  gameWorld = stringToWorld(worldString[0]);
  console.log(worldString);
  console.log("asdf");
  players.push(new Player(0, 0, pWidth, pHeight, pSpeed, healthPoints, playerDamage, PlayerImage));
  players.push(new Player(0, 100, 100, 100, .5, 350, playerDamage, PlayerImage));
  players.push(new Player(500, 100, 25, 25, 2, healthPoints, playerDamage, PlayerImage));

  inventoryList = players[activePlayer].inventory;

  // Initialize indicator position
  indicatorCurrentX = pX + 600 + pWidth / 2;
  indicatorCurrentY = pY + 375 - 50;
  indicatorTargetX = indicatorCurrentX;
  indicatorTargetY = indicatorCurrentY;
  NonPlayerCharacters.push(new NPC(1000, 100, "Buschy", ["Buschy: granny smith apple", "Wing: Red delicious apple", "Mario: Honeycrisp apple", "Luigi: Carrot", "Luigi: Haha u thought I was gon say apple"], Buschy));
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
  drawPlayers();

  // --- Only the gun rotates (isolated) ---
  drawGunDebugRect(); // uses calculateAim()
  // ---------------------------------------

  mainHand();
  drawEnemies();
  drawNPCs();
  drawBullets();
  updateDroppedItems();
  updateParticles(); // Draw particles
  controls();
  resolveCollisions();

  // LAYER 2 in front of player
  drawWorldLayer(gameWorld, 2);

  pop();

  // Draw pickup prompt after camera pop (screen-fixed)
  drawPickupPromptIfNeeded();

  // Draw NPC prompt after camera pop (screen-fixed)
  drawNPCPromptIfNeeded();

  drawUI();
  messageDisplay();

  // Handle crafting menu
  if (typeof handleCraftingInput === 'function') {
    handleCraftingInput();
  }
  if (typeof drawCraftingMenu === 'function') {
    drawCraftingMenu();
  }

  // Draw fog centered on camera, constrained to screen
  tint(255, 200);
  const fogSize = width + 100;
  imageMode(CENTER);
  // Center fog on camera position
  let fogX = pX + camX + 600;
  let fogY = pY + camY + 375;
  fogX = constrain(fogX, width / 2, width / 2);
  fogY = constrain(fogY, height / 2, height / 2);

  image(Fog, fogX, fogY, fogSize, fogSize);
  imageMode(CORNER);
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

Crate inventory encoding:
- Inline with tile data: "type@itemIndex.itemIndex.itemIndex"
  e.g., "5@1.3.0" for a crate with items (indices from itemConstructors)

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
      if (c > 0) out += "/"; // Add separator before cell (except first)
      
      if (!cell) continue;

      if ('layers' in cell) {
        const parts = cell.layers.map(t => {
          if (!t) return "";
          let s = String(t.type);
          if (t.rotation && t.rotation !== 0) s += ":" + t.rotation;
          // Only add crate inventory if this specific layer contains a crate (type 5)
          if (t.type === 5) {
            const crateKey = r + "," + c;
            if (crateInventories.has(crateKey)) {
              const items = crateInventories.get(crateKey);
              // Convert items back to indices
              const itemIndices = items.map(itemConstructor => 
                itemConstructors.findIndex(ic => 
                  ic[0] === itemConstructor[0] && ic[1] === itemConstructor[1]
                )
              ).filter(idx => idx !== -1); // Ensure valid indices
              if (itemIndices.length > 0) {
                s += "@" + itemIndices.join("."); // Append inventory data
              }
            }
          }
          return s;
        });
        out += parts.join(",");
      } else {
        let s = String(cell.type);
        if (cell.rotation && cell.rotation !== 0) s += ":" + cell.rotation;
        // Check for crate inventory in legacy format (only for crates, type 5)
        const crateKey = r + "," + c;
        if (crateInventories.has(crateKey) && cell.type === 5) {
          const items = crateInventories.get(crateKey);
          const itemIndices = items.map(itemConstructor => 
            itemConstructors.findIndex(ic => 
              ic[0] === itemConstructor[0] && ic[1] === itemConstructor[1]
            )
          ).filter(idx => idx !== -1);
          if (itemIndices.length > 0) {
            s += "@" + itemIndices.join(".");
          }
        }
        out += s;
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

  crateInventories.clear(); // Clear before parsing
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
        // Multi-layer format
        const layerStrs = cellStr.split(",");
        const layers = [null, null, null];
        let crateItemsForCell = null;
        let crateLayerIndex = -1;
        
        for (let L = 0; L < Math.min(3, layerStrs.length); L++) {
          const tstr = layerStrs[L].trim();
          if (tstr === "") { layers[L] = null; continue; }

          // Check for crate inventory (@ separator)
          let tileData = tstr;
          let crateItemsStr = null;
          if (tstr.includes("@")) {
            const parts = tstr.split("@");
            tileData = parts[0];
            crateItemsStr = parts[1];
          }

          if (tileData.includes(":")) {
            const [t, rot] = tileData.split(":");
            layers[L] = { type: parseInt(t, 10), rotation: parseInt(rot, 10) || 0 };
          } else {
            layers[L] = { type: parseInt(tileData, 10), rotation: 0 };
          }

          // Store crate items info for later processing
          if (crateItemsStr && layers[L] && layers[L].type === 5) {
            crateItemsForCell = crateItemsStr;
            crateLayerIndex = L;
          }
        }
        
        // Process crate items after all layers are parsed
        if (crateItemsForCell && crateLayerIndex >= 0) {
          const itemIndices = crateItemsForCell.split(".").map(idx => parseInt(idx, 10));
          const items = itemIndices
            .filter(idx => !isNaN(idx) && idx >= 0 && idx < itemConstructors.length)
            .map(idx => itemConstructors[idx]);

          if (items.length > 0) {
            const crateKey = i + "," + j;
            crateInventories.set(crateKey, items);
            console.log("Multi-layer: Loaded crate at", crateKey, "with", items.length, "items:", itemIndices);
          }
        }
        
        outRow.push({ layers });
      } else {
        // Legacy single-layer format
        let tileData = cellStr;
        let crateItemsStr = null;
        if (cellStr.includes("@")) {
          const parts = cellStr.split("@");
          tileData = parts[0];
          crateItemsStr = parts[1];
        }

        if (tileData.includes(":")) {
          const [t, rot] = tileData.split(":");
          outRow.push({ type: parseInt(t, 10), rotation: parseInt(rot, 10) || 0 });
        } else {
          outRow.push({ type: parseInt(tileData, 10), rotation: 0 });
        }

        // Parse crate items if present
        if (crateItemsStr && parseInt(tileData.split(":")[0], 10) === 5) {
          const itemIndices = crateItemsStr.split(".").map(idx => parseInt(idx, 10));
          const items = itemIndices
            .filter(idx => !isNaN(idx) && idx >= 0 && idx < itemConstructors.length)
            .map(idx => itemConstructors[idx]);

          if (items.length > 0) {
            const crateKey = i + "," + j;
            crateInventories.set(crateKey, items);
            console.log("Legacy: Loaded crate at", crateKey, "with", items.length, "items:", itemIndices);
          }
        }
      }
    }
    if (outRow.length > 0) world.push(outRow);
  }

  console.log("Loaded", crateInventories.size, "crate inventories");
  return world;
}

// --- Grid helper (unchanged) ---
function coordsToGrid(x, y) {
  return {
    col: Math.floor(x / 50),
    row: Math.floor(y / 50)
  };
}

// Check if a tile is concrete (any variant)
function isConcrete(row, col, layer = 2) {
  const tile = getTile(row, col, layer);
  if (!tile) return false;
  return concreteTypes.includes(tile.type);
}

// Get the appropriate concrete variant and rotation based on neighbors
// Edge piece has border at BOTTOM
// Corner piece has borders at BOTTOM and LEFT
function getConcreteVariant(row, col, layer = 2) {
  if (!isConcrete(row, col, layer)) return { variant: 'full', rotation: 0 };
  
  // Check all cardinal neighbors
  const n = isConcrete(row - 1, col, layer);     // north
  const s = isConcrete(row + 1, col, layer);     // south
  const e = isConcrete(row, col + 1, layer);     // east
  const w = isConcrete(row, col - 1, layer);     // west
  
  let variant = 'full'; // Default to full border (Concrete.png)
  let rotation = 0;
  
  // Count cardinal neighbors
  const cardinalCount = [n, s, e, w].filter(Boolean).length;
  
  if (cardinalCount === 0) {
    // Isolated tile - use full border
    variant = 'full';
    rotation = 0;
  } else if (cardinalCount === 4) {
    // Surrounded on all sides - use center
    variant = 'center';
    rotation = 0;
  } else if (cardinalCount === 3) {
    // Three neighbors - use edge (border on one side)
    // Edge has border at bottom of image, rotate so border faces the empty side
    variant = 'edge';
    if (!n) rotation = 180;   // empty north, rotate 180 so bottom border faces north
    else if (!s) rotation = 0;   // empty south, bottom border already faces south
    else if (!e) rotation = 270; // empty east, rotate 270 (CCW) so bottom faces east
    else if (!w) rotation = 90;  // empty west, rotate 90 (CW) so bottom faces west
  } else if (cardinalCount === 2) {
    if ((n && s) || (e && w)) {
      // Opposite sides - use center
      variant = 'center';
      rotation = 0;
    } else {
      // Adjacent sides - use corner
      // Corner has borders at bottom and left of image
      variant = 'corner';
      if (n && e) rotation = 0;   // neighbors north+east, empty south-west, no rotation needed
      else if (s && e) rotation = 90; // neighbors south+east, empty north-west, rotate 90 CW
      else if (s && w) rotation = 180; // neighbors south+west, empty north-east, rotate 180
      else if (n && w) rotation = 270;  // neighbors north+west, empty south-east, rotate 270 CW
    }
  } else if (cardinalCount === 1) {
    // One neighbor - use edge piece
    // Edge has border at bottom of image, rotate so border faces away from neighbor
    variant = 'edge';
    if (n) rotation = 0; // neighbor north, border faces south (away from neighbor)
    else if (s) rotation = 180; // neighbor south, border faces north
    else if (e) rotation = 90; // neighbor east, border faces west
    else if (w) rotation = 270; // neighbor west, border faces east
  }
  
  return { variant, rotation };
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

      // Determine which image to draw (check for concrete auto-tiling)
      let imgToDraw = tileImgs[tileType];
      let finalRotation = rotation;
      
      if (tileType === 3) { // Concrete
        const variantInfo = getConcreteVariant(i, j, layerIndex);
        imgToDraw = concreteVariantImgs[variantInfo.variant];
        finalRotation = variantInfo.rotation;
      }
      
      // Draw the tile
      if (finalRotation > 0) {
        push();
        translate(j * 50 + 25, i * 50 + 25); // Move to center of tile
        rotate(radians(finalRotation));
        image(imgToDraw, -25, -25, 50, 50);
        pop();
      } else {
        image(imgToDraw, j * 50, i * 50, 50, 50);
      }

      // Draw crate inventory if this is a crate tile (type 5) on layer 2
      if (layerIndex === 2 && tileType === 5) {
        const crateKey = i + "," + j;
        if (crateInventories.has(crateKey)) {
          const items = crateInventories.get(crateKey);
          // Display a few items within the crate visual
          const maxDisplayItems = 3;
          for (let k = 0; k < Math.min(items.length, maxDisplayItems); k++) {
            const item = items[k];
            const itemImg = item[3]; // The image is the 4th element
            if (itemImg) {
              const xOffset = j * 50 + 10 + k * 15; // Position items within crate
              const yOffset = i * 50 + 10;
              image(itemImg, xOffset, yOffset, 15, 15);
            }
          }
          // If there are more items than displayed, indicate overflow (e.g., with '+')
          if (items.length > maxDisplayItems) {
            fill(255);
            textSize(10);
            text("+", j * 50 + 10 + maxDisplayItems * 15, i * 50 + 20);
          }
        }
      }

      if (__useTint) noTint();
    }
  }
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

  // Draw the item image pointing along +X with proper sizing
  if (inventoryList[inventorySlot - 1] != null) {
    if (inventorySlot - 1 < inventoryList.length) {
      const item = inventoryList[inventorySlot - 1];

      // Determine base size based on item type
      let baseSize = 30; // Default for guns

      if (item.type === "bullet") {
        baseSize = 18;
      } else if (item.type === "gun") {
        baseSize = 30;
      } else if (item.type === "consumable") {
        baseSize = 25;
      } else if (item.type === "projectile") {
        baseSize = 24;
      }

      // Calculate width and height based on aspect ratio
      let itemWidth, itemHeight;
      if (item.HtoW > 1) {
        // Height is larger
        itemHeight = baseSize;
        itemWidth = baseSize / item.HtoW;
      } else {
        // Width is larger or equal
        itemWidth = baseSize;
        itemHeight = baseSize * item.HtoW;
      }

      image(item.image, recoil, -itemHeight / 2, itemWidth, itemHeight);
    }
    else {
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
  let rate = 1;
  if (inventoryList[inventorySlot - 1] != null) {
    if (inventoryList[inventorySlot - 1].type == "gun") {
      rate = inventoryList[inventorySlot - 1].fireRate;
    }
  }
  if (recoil < 10) {
    recoil += rate;
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