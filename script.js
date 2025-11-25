let Buschy, InventoryImg, FrameImg, Fog, IndicatorImg, BulletImgs = [0, 0, 0, 0, 0], GunImgs = [0, 0, 0], itemImgs = [0, 0, 0, 0, 0], projImgs = [0, 0, 0], matImgs = [0, 0, 0, 0, 0], Silkscreen, PlayerImage, titleScreenImg, BunkerImg, PrometheusIntroImg, CryochamberImg, Prometheus, WaypointImg;

// Waypoint system
var waypointCoordinates = [[12700, 12500], [13000, 12800], [12500, 13000]]; // Array of [x, y] coordinates
var currentWaypointIndex = 0; // Current waypoint to show
var itemConstructors = [];

// Alarm system
var alarmFlashAlpha = 0;
var alarmFlashIncreasing = true;
var pX = 12500; var pY = 12500; var playerDamage = 1;
var prePX = 0, prePY = 0;
var camX = -12500; var camY = -12500;
var pSpeed = 1.3;
var pXVel = 0; var pYVel = 0;
var pWidth = 35; var pHeight = 21.4;
var gameWorld = [];
var worldString = "";
var lastScroll = 0;
var scrollDelay = 20;
var hotbar = [];
var recoil = 10;
var tileImgs = ["grass", "asphalt", "lined asphalt", "Concrete", "Brick", "Crate", "Workbench", "dirt", "darkConcrete", "door", "window", "crack", "wood", "whiteConcrete", "barnDoor", "barnWindow", "fence", "fenceCorner", "fenceDown", "fenceEdge", "fencePost", "Grave 1", "Grave 2", "Grave 3", "Rail", "Stone Brick", "Stone Brick Wall", "Pipe", "CopperTileGreen", "Gravel", "Note", "ChainLink", "ChainLinkBottomCorner", "ChainLinkCorner", "ChainLinkVertical", "ChainLinkEnd"];
var tileWalls = [2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 1, 0, 2, 2, 0, 1, 1, 1, 1, 1]; // 0 walkable, 1 solid, 2 roof (walk-through + fades

// Tile color variants - each tile can have multiple color tints
// Format: tileColors[tileIndex] = [[r,g,b], [r,g,b], ...]
var tileColors = [
  [[255, 255, 255]], // 0 - grass (white = no tint, shows base green color)
  [[255, 255, 255]], // 1 - asphalt
  [[255, 255, 255]], // 2 - lined asphalt
  [[255, 255, 255]], // 3 - Concrete
  [[255, 255, 255], [200, 150, 150], [150, 150, 200]], // 4 - Brick (white, reddish, blueish)
  [[255, 255, 255]], // 5 - Crate
  [[255, 255, 255]], // 6 - Workbench
  [[255, 255, 255]], // 7 - dirt
  [[255, 255, 255]], // 8 - darkConcrete
  [[255, 255, 255]], // 9 - door
  [[255, 255, 255]], // 10 - window
  [[255, 255, 255]], // 11 - crack
  [[255, 255, 255], [180, 140, 100], [140, 100, 70], [180, 1, 1]], // 12 - wood (white, oak, dark oak, barn)
  [[255, 255, 255], [200, 1, 1], [180, 150, 110]], // 13 - whiteConcrete
  [[255, 255, 255]], // 14 - barnDoor
  [[255, 255, 255]], // 15 - barnWindow
  [[255, 255, 255]], // 16 - fence
  [[255, 255, 255]], // 17 - fenceCorner
  [[255, 255, 255]], // 18 - fenceDown
  [[255, 255, 255]], // 19 - fenceEdge
  [[255, 255, 255]],  // 20 - fencePost
  [[255, 255, 255]], // 21 - Grave 1
  [[255, 255, 255]], // 22 - Grave 2
  [[255, 255, 255]], // 23 - Grave 3
  [[255, 255, 255]], // 24 - Rail
  [[255, 255, 255], [240, 210, 170], [220, 190, 150], [200, 170, 130], [180, 150, 110]],  // 25 - Stone Brick (default white, light sepia, medium-light sepia, medium sepia, darker sepia)
  [[255, 255, 255], [240, 210, 170], [220, 190, 150], [200, 170, 130], [180, 150, 110]], // 26 - Stone Brick Wall
  [[240, 210, 170]], // 27 - Pipe
  [[240, 210, 170]], // 28 - CopperTileGreen
  [[255, 255, 255]], // 29 - Gravel
  [[255, 255, 255]], // 30 - Note
  [[255, 255, 255]], // 31 - ChainLink
  [[255, 255, 255]], // 32 - ChainLinkBottomCorner
  [[255, 255, 255]], // 33 - ChainLinkCorner
  [[255, 255, 255]], // 34 - ChainLinkVertical
  [[255, 255, 255]] // 35 - ChainLinkEnd

];

// Cache for tinted tile images - Format: tintedTileCache[tileIndex][colorIndex] = p5.Image

// Fade transition from intro to gameplay
var fadeToGameProgress = 0;

function updateFadeToGame() {
  fadeToGameProgress += 0.005; // Slower fade speed (was 0.01)

  if (fadeToGameProgress >= 1.0) {
    gameState = "playing";
    if (typeof startTutorial === 'function') {
      startTutorial();
    }
  }
}

function drawFadeToGame() {
  // Clear background
  background(50);

  // Draw the game underneath the fade
  push();
  // Position camera for gameplay view
  controlCamera();
  translate(camX, camY);

  // Draw all game layers
  drawWorldLayer(gameWorld, 0);
  drawWorldLayer(gameWorld, 1);

  // Draw items (dropped items)
  updateDroppedItems();

  // Draw NPCs before roofs so they appear underneath
  fill(255);
  drawNPCs();

  drawWorldLayer(gameWorld, 2);
  drawWorldLayer(gameWorld, 3);

  fill(255);
  drawPlayers();

  drawGunDebugRect();
  drawEnemies();
  drawBullets();

  drawWorldLayer(gameWorld, 4);

  pop();

  // Draw pickup prompt after camera pop (screen-fixed)
  drawPickupPromptIfNeeded();

  // Draw NPC prompt after camera pop (screen-fixed)
  drawNPCPromptIfNeeded();

  // Draw UI elements
  drawUI();
  messageDisplay();

  // Draw fog centered on camera, constrained to screen
  tint(255, 200);
  const fogSize = width + 100;
  imageMode(CENTER);
  let fogX = pX + camX + 600;
  let fogY = pY + camY + 375;
  fogX = constrain(fogX, width / 2, width / 2);
  fogY = constrain(fogY, height / 2, height / 2);

  image(Fog, fogX, fogY, fogSize, fogSize);
  imageMode(CORNER);
  noTint();

  // Overlay with fading black (eyes opening)
  push();
  const fadeAlpha = map(fadeToGameProgress, 0, 1, 255, 0);
  fill(0, 0, 0, fadeAlpha);
  noStroke();
  rect(0, 0, width, height);
  pop();

  // Draw "EXIT THE CRYOCHAMBER" text with simple fade in/out
  if (fadeToGameProgress < 0.9) {
    push();
    textFont(Silkscreen);
    textAlign(CENTER, CENTER);

    // Calculate text alpha - simple fade in then fade out
    let textAlpha;
    if (fadeToGameProgress < 0.15) {
      // Fade in
      textAlpha = map(fadeToGameProgress, 0, 0.15, 0, 255);
    } else if (fadeToGameProgress < 0.7) {
      // Stay visible
      textAlpha = 255;
    } else {
      // Fade out
      textAlpha = map(fadeToGameProgress, 0.7, 0.9, 255, 0);
    }

    // Draw text with sepia glow
    textSize(42);

    // Outer glow
    strokeWeight(6);
    stroke(112, 66, 20, textAlpha * 0.4);
    fill(255, 200, 80, textAlpha);
    text("EXIT THE CRYOCHAMBER", width / 2, height / 2);

    // Inner sharp text
    noStroke();
    fill(255, 220, 100, textAlpha);
    text("EXIT THE CRYOCHAMBER", width / 2, height / 2);

    pop();
  }
}


var tintedTileCache = [];

// Tile variants storage
var tileVariants = {};
var enemies = [], bullets = [], messages = [], droppedItems = [], NonPlayerCharacters = [];
var inventoryList;
let maxTileTypes = 0; // will be set in setup()
var crateInventories = new Map(); // Stores crate contents: "row,col" -> [itemConstructor, ...]

function preload() {
  console.log("Updated version Prometheus");
  worldString = loadStrings("world.txt");
  Buschy = loadImage("Characters/Buschy.png");
  Prometheus = loadImage("Characters/Prometheus.png");
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
  tileImgs[3] = null; // Concrete uses variants, loaded below
  tileImgs[4] = loadImage("Tiles/Brick.png");
  tileImgs[5] = loadImage("Tiles/Crate.png");
  tileImgs[6] = loadImage("Tiles/Crafting.png");
  tileImgs[7] = loadImage("Tiles/Dirt.png");
  tileImgs[8] = null;
  tileImgs[9] = loadImage("Tiles/Door.png");
  tileImgs[10] = loadImage("Tiles/Window.png");
  tileImgs[11] = loadImage("Tiles/Crack.png");
  tileImgs[12] = loadImage("Tiles/Wood.png");
  tileImgs[13] = null;
  tileImgs[14] = loadImage("Tiles/BarnDoor.png");
  tileImgs[15] = loadImage("Tiles/BarnWindow.png");
  tileImgs[16] = loadImage("Tiles/Fence.png");
  tileImgs[17] = loadImage("Tiles/FenceCorner.png");
  tileImgs[18] = loadImage("Tiles/FenceDown.png");
  tileImgs[19] = loadImage("Tiles/FenceEdge.png");
  tileImgs[20] = loadImage("Tiles/FencePost.png");
  tileImgs[21] = loadImage("Tiles/Grave1.png");
  tileImgs[22] = loadImage("Tiles/Grave2.png");
  tileImgs[23] = loadImage("Tiles/Grave3.png");
  tileImgs[24] = loadImage("Tiles/Rail.png");
  tileImgs[25] = loadImage("Tiles/StoneBrick.png");
  tileImgs[26] = loadImage("Tiles/StoneBrick.png");
  tileImgs[27] = null; // Pipe uses variants, loaded below
  tileImgs[28] = loadImage("Tiles/CopperTile.png");
  tileImgs[29] = loadImage("Tiles/Gravel.png");
  tileImgs[30] = loadImage("Tiles/Note.png");
  tileImgs[31] = loadImage("Tiles/ChainLink.png");
  tileImgs[32] = loadImage("Tiles/ChainLinkBottomCorner.png");
  tileImgs[33] = loadImage("Tiles/ChainLinkCorner.png");
  tileImgs[34] = loadImage("Tiles/ChainLinkVertical.png");
  tileImgs[35] = loadImage("Tiles/ChainLinkEnd.png");
  itemImgs[0] = loadImage("Items/Consumables/Cheese.png");
  itemImgs[1] = loadImage("Items/Consumables/Soda.png");
  itemImgs[2] = loadImage("Items/Consumables/CommonCartridge.png");
  itemImgs[3] = loadImage("Items/Consumables/RareCartridge.png");
  itemImgs[4] = loadImage("Items/Consumables/LegendaryCartridge.png");
  matImgs[0] = loadImage("Items/Materials/CommonWheel.png");
  matImgs[1] = loadImage("Items/Materials/RareWheel.png");
  matImgs[2] = loadImage("Items/Materials/LegendaryWheel.png");
  matImgs[3] = loadImage("Items/Materials/Cog.png");
  matImgs[4] = loadImage("Tiles/Pipe.png");
  projImgs[0] = loadImage("Items/Projectiles/Grenade.png");
  projImgs[1] = loadImage("Items/Projectiles/Rock.png");
  projImgs[2] = loadImage("Items/Projectiles/OldWrench.png");
  InventoryImg = loadImage("hud/Inventory.png");
  FrameImg = loadImage("hud/Frame.png");
  Fog = loadImage("hud/Fog.png");
  IndicatorImg = loadImage("Indicator.png");
  Silkscreen = loadFont("Silkscreen-Regular.ttf");
  ReforgeLogo = loadImage("REFORGE.png");
  titleScreenImg = loadImage("hud/titleScreen.png");
  WaypointImg = loadImage("Waypoint.png");

  // Intro sequence images
  BunkerImg = loadImage("Buschwick Industries.png");
  PrometheusIntroImg = loadImage("PrometheusIntro.png");
  CryochamberImg = loadImage("Cryochamber.png");

  // Load concrete tile variants
  tileVariants[3] = {
    variants: {
      'full': loadImage("Tiles/Concrete.png"),
      'center': loadImage("Tiles/ConcreteCenter.png"),
      'edge': loadImage("Tiles/concreteEdge.png"),
      'corner': loadImage("Tiles/concreteCorner.png")
    }
  };
  tileVariants[8] = {
    variants: {
      'full': loadImage("Tiles/DarkConcrete.png"),
      'center': loadImage("Tiles/DarkConcreteCenter.png"),
      'edge': loadImage("Tiles/DarkConcreteEdge.png"),
      'corner': loadImage("Tiles/DarkConcreteCorner.png")
    }
  };
  tileVariants[13] = {
    variants: {
      'full': loadImage("Tiles/WhiteConcrete.png"),
      'center': loadImage("Tiles/WhiteConcreteCenter.png"),
      'edge': loadImage("Tiles/WhiteConcreteEdge.png"),
      'corner': loadImage("Tiles/WhiteConcreteCorner.png")
    }
  };

  // Pipe variants - straight, L, T, cross
  tileVariants[27] = {
    variants: {
      'straight': loadImage("Tiles/Pipe.png"),
      'L': loadImage("Tiles/PipeL.png"),
      'T': loadImage("Tiles/PipeT.png"),
      'cross': loadImage("Tiles/PipeCross.png")
    }
  }
}

// Generate cached tinted versions of all tiles
function generateTintedTileCache() {
  console.log("Generating tinted tile cache...");
  tintedTileCache = [];

  for (let tileIndex = 0; tileIndex < tileImgs.length; tileIndex++) {
    tintedTileCache[tileIndex] = [];
    const baseImg = tileImgs[tileIndex];

    // Skip if no image for this tile
    if (!baseImg) {
      tintedTileCache[tileIndex] = [null];
      continue;
    }

    const colors = tileColors[tileIndex] || [[255, 255, 255]];

    for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
      const [r, g, b] = colors[colorIndex];

      // Create a graphics buffer to render the tinted tile
      const tintedImg = createGraphics(50, 50);
      tintedImg.tint(r, g, b);
      tintedImg.image(baseImg, 0, 0, 50, 50);
      tintedImg.noTint();

      // Store the tinted image
      tintedTileCache[tileIndex][colorIndex] = tintedImg;
    }
  }

  // Also generate tinted variants for auto-tiling tiles
  for (let tileType in tileVariants) {
    const config = tileVariants[tileType];
    const colors = tileColors[tileType] || [[255, 255, 255]];

    // Store tinted variants
    config.tintedVariants = [];

    for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
      const [r, g, b] = colors[colorIndex];
      const tintedVariantSet = {};

      for (let variantName in config.variants) {
        const baseImg = config.variants[variantName];
        if (!baseImg) continue;

        const tintedImg = createGraphics(50, 50);
        tintedImg.tint(r, g, b);
        tintedImg.image(baseImg, 0, 0, 50, 50);
        tintedImg.noTint();

        tintedVariantSet[variantName] = tintedImg;
      }

      config.tintedVariants[colorIndex] = tintedVariantSet;
    }
  }

  console.log("Tinted tile cache generated successfully!");
}

function setup() {
  createCanvas(1200, 750);
  maxTileTypes = tileImgs.length;
  PlayerImage = Buschy;

  // Generate tinted tile cache after images are loaded
  generateTintedTileCache();

  // Initialize itemConstructors BEFORE parsing world so crate inventories can be loaded
  itemConstructors = [
    ["gun", "glock", 1, GunImgs[0]],
    ["gun", "western", 1, GunImgs[1]],
    ["gun", "rare pistol", 1, GunImgs[2]],
    ["consumable", "cheese", 1, itemImgs[0]],
    ["consumable", "soda", 1, itemImgs[1]],
    ["consumable", "common cartridge", 1, itemImgs[2]],
    ["consumable", "rare cartridge", 1, itemImgs[3]],
    ["consumable", "legendary cartridge", 1, itemImgs[4]],
    ["projectile", "grenade", 1, projImgs[0]],
    ["projectile", "rock", 10, projImgs[1]],
    ["material", "common wheel", 1, matImgs[0]],
    ["material", "rare wheel", 1, matImgs[1]],
    ["material", "legendary wheel", 1, matImgs[2]],
    ["material", "cog", 1, matImgs[3]],
    ["material", "pipe", 1, matImgs[4]]
  ];

  // Now parse the world with itemConstructors available
  gameWorld = stringToWorld(worldString[0]);
  console.log(worldString);
  initializeHardcodes();
  inventoryList = players[activePlayer].inventory;

  // Initialize indicator position
  indicatorCurrentX = pX + 600;
  indicatorCurrentY = pY + 375;
  indicatorTargetX = indicatorCurrentX;
  indicatorTargetY = indicatorCurrentY;

  // Intro will be started from menu screen
  // Roof fade will be initialized during intro sequence
}

function draw() {
  // Show menu screen if not playing
  if (gameState === "menu") {
    drawMenuScreen();
    return;
  }

  // Show credits screen
  if (gameState === "credits") {
    drawCreditsScreen();
    return;
  }

  // Show settings screen
  if (gameState === "settings") {
    drawSettingsScreen();
    return;
  }

  // Show transition fade
  if (gameState === "transition") {
    updateTransition();
    drawTransitionOverlay();
    return;
  }

  // Show intro cutscene (now includes fade)
  if (gameState === "intro") {
    updateIntro();
    drawIntro();
    return;
  }

  // Normal gameplay
  drawGameplay();
}

function mouseReleased() {
  if (typeof handleEditorMouseReleased === 'function') {
    handleEditorMouseReleased();
  }
}

function drawGameplay() {
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

  // LAYERS 0, 1 behind everything
  drawWorldLayer(gameWorld, 0);
  updateParticlesForLayer(0);
  drawWorldLayer(gameWorld, 1);
  updateParticlesForLayer(1);

  // Draw items (dropped items)
  updateDroppedItems();

  // Draw NPCs before roofs so they appear underneath
  fill(255);
  drawNPCs();

  // LAYERS 2, 3 over items but under player
  drawWorldLayer(gameWorld, 2);
  updateParticlesForLayer(2);
  drawWorldLayer(gameWorld, 3);
  updateParticlesForLayer(3);

  fill(255);
  drawPlayers();

  // --- Only the gun rotates (isolated) ---
  drawGunDebugRect(); // uses calculateAim()
  // ---------------------------------------

  mainHand();
  drawEnemies();
  drawBullets();

  // Check if player is holding old wrench
  const holdingOldWrench = inventoryList[inventorySlot - 1] != null && 
                           inventoryList[inventorySlot - 1].name === "old wrench";

  // Calculate player center for distance checks
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;

  // Spawn particles from sources
  if (typeof particleSources !== 'undefined') {
    for (let sourceIndex = 0; sourceIndex < particleSources.length; sourceIndex++) {
      const ps = particleSources[sourceIndex];
      
      // Check if this is one of the first 5 sources and player is holding old wrench
      let effectiveSpawnRate = ps.spawnRate;
      if (holdingOldWrench && sourceIndex < 5) {
        // Check distance to player (suppress if within 150 units)
        const distToPlayer = dist(playerCenterX, playerCenterY, ps.x, ps.y);
        if (distToPlayer < 150) {
          effectiveSpawnRate = 0; // Suppress particle spawning
        }
      }
      
      // Spawn particles based on spawn rate
      for (let i = 0; i < effectiveSpawnRate; i++) {
        if (random() < 0.3) { // 30% chance per particle slot
          const angle = random(ps.arcStart, ps.arcEnd);
          const particleSize = ps.size + random(-ps.sizeVariance, ps.sizeVariance);

          // Create particle using existing particle system
          const px = ps.x;
          const py = ps.y;

          // Manual particle creation with custom direction
          const p = new Particle(px, py, ps.color, ps.duration, ps.speed, ps.layer || 0);
          p.angle = radians(angle);
          p.vx = cos(p.angle) * ps.speed;
          p.vy = sin(p.angle) * ps.speed;
          p.size = Math.max(1, particleSize);
          particles.push(p);
        }
      }
    }
  }

  controls();
  resolveCollisions();

  // LAYER 4 on top of player
  drawWorldLayer(gameWorld, 4);
  updateParticlesForLayer(4);

  // Draw particle sources in editor mode
  if (typeof drawParticleSources === 'function') {
    drawParticleSources();
  }

  pop();

  // Draw pickup prompt after camera pop (screen-fixed)
  drawPickupPromptIfNeeded();

  // Draw NPC prompt after camera pop (screen-fixed)
  drawNPCPromptIfNeeded();

  // Draw waypoint arrow (screen-fixed at edge)
  drawWaypoint();

  drawUI();
  messageDisplay();

  // Draw alarm flash if waypoint index is 3 or less
  drawAlarmFlash();

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
  if ('layers' in cell) {
    // Ensure the layers array has 5 elements
    if (cell.layers.length < 5) {
      while (cell.layers.length < 5) {
        cell.layers.push(null);
      }
    }
    return cell.layers[layer] || null;
  }
  return (layer === 0) ? cell : null; // legacy cell is layer 0
}

function setTile(row, col, layer, type, rotation = 0, flipH = false, flipV = false, colorIndex = 0) {
  if (!gameWorld[row]) gameWorld[row] = [];
  if (!gameWorld[row][col]) {
    gameWorld[row][col] = { layers: [null, null, null, null, null] };
  } else if (!('layers' in gameWorld[row][col])) {
    const old = gameWorld[row][col];
    gameWorld[row][col] = { layers: [old, null, null, null, null] };
  }
  gameWorld[row][col].layers[layer] = (type == null) ? null : {
    type: parseInt(type, 10),
    rotation: parseInt(rotation, 10) || 0,
    flipH: flipH || false,
    flipV: flipV || false,
    colorIndex: parseInt(colorIndex, 10) || 0
  };
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
          // Add flip notation
          if (t.flipH || t.flipV) {
            if (!t.rotation) s += ":0"; // Add rotation 0 if not present
            s += ":" + (t.flipH ? "H" : "") + (t.flipV ? "V" : "");
          }
          // Add color index notation
          if (t.colorIndex && t.colorIndex !== 0) {
            if (!t.rotation && !t.flipH && !t.flipV) s += ":0"; // Add rotation if not present
            if (!t.flipH && !t.flipV) s += ":"; // Add flip separator if not present
            s += ":C" + t.colorIndex;
          }
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
        // Add flip notation
        if (cell.flipH || cell.flipV) {
          if (!cell.rotation) s += ":0"; // Add rotation 0 if not present
          s += ":" + (cell.flipH ? "H" : "") + (cell.flipV ? "V" : "");
        }
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

  // Add particle sources at the end with & separator
  if (typeof particleSources !== 'undefined' && particleSources.length > 0) {
    out += "&";
    const psData = particleSources.map(ps => {
      return `${ps.x},${ps.y},${ps.arcStart},${ps.arcEnd},${ps.color[0]},${ps.color[1]},${ps.color[2]},${ps.size},${ps.sizeVariance},${ps.speed},${ps.spawnRate},${ps.duration},${ps.layer || 0}`;
    });
    out += psData.join(";");
  }

  return out;
}

function stringToWorld(s) {
  if (!s) {
    console.log("No string provided to stringToWorld");
    return [];
  }

  crateInventories.clear(); // Clear before parsing

  // Check for particle sources (after & separator)
  let worldData = s;
  if (s.includes("&")) {
    const parts = s.split("&");
    worldData = parts[0];
    const psData = parts[1];

    // Parse particle sources
    if (typeof particleSources !== 'undefined') {
      particleSources.length = 0; // Clear existing
      const sources = psData.split(";");
      for (const sourceStr of sources) {
        if (!sourceStr.trim()) continue;
        const vals = sourceStr.split(",").map(v => parseFloat(v));
        if (vals.length === 13) {
          particleSources.push({
            x: vals[0],
            y: vals[1],
            arcStart: vals[2],
            arcEnd: vals[3],
            color: [vals[4], vals[5], vals[6]],
            size: vals[7],
            sizeVariance: vals[8],
            speed: vals[9],
            spawnRate: vals[10],
            duration: vals[11],
            layer: vals[12] || 0 // Default to layer 0 if not specified
          });
        }
      }
      console.log("Loaded", particleSources.length, "particle sources");
    }
  }

  const rows = worldData.split("|");
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
        const layers = [null, null, null, null, null];
        let crateItemsForCell = null;
        let crateLayerIndex = -1;

        for (let L = 0; L < Math.min(5, layerStrs.length); L++) {
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
            const parts = tileData.split(":");
            const t = parseInt(parts[0], 10);
            const rot = parseInt(parts[1], 10) || 0;
            const flipStr = parts[2] || "";
            const flipH = flipStr.includes("H");
            const flipV = flipStr.includes("V");
            const colorStr = parts[3] || "";
            const colorIndex = colorStr.startsWith("C") ? parseInt(colorStr.substring(1), 10) : 0;

            layers[L] = { type: t, rotation: rot, flipH: flipH, flipV: flipV, colorIndex: colorIndex || 0 };
          } else {
            layers[L] = { type: parseInt(tileData, 10), rotation: 0, flipH: false, flipV: false, colorIndex: 0 };
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
        // Legacy single-layer format - convert to new format with 5 layers
        let tileData = cellStr;
        let crateItemsStr = null;
        if (cellStr.includes("@")) {
          const parts = cellStr.split("@");
          tileData = parts[0];
          crateItemsStr = parts[1];
        }

        let legacyTile;
        if (tileData.includes(":")) {
          const parts = tileData.split(":");
          const t = parseInt(parts[0], 10);
          const rot = parseInt(parts[1], 10) || 0;
          const flipStr = parts[2] || "";
          const flipH = flipStr.includes("H");
          const flipV = flipStr.includes("V");
          const colorStr = parts[3] || "";
          const colorIndex = colorStr.startsWith("C") ? parseInt(colorStr.substring(1), 10) : 0;

          legacyTile = { type: t, rotation: rot, flipH: flipH, flipV: flipV, colorIndex: colorIndex || 0 };
        } else {
          legacyTile = { type: parseInt(tileData, 10), rotation: 0, flipH: false, flipV: false, colorIndex: 0 };
        }

        // Convert to multi-layer format
        outRow.push({ layers: [legacyTile, null, null, null, null] });

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

// Draw waypoint arrow pointing to current waypoint
function drawWaypoint() {
  if (currentWaypointIndex >= waypointCoordinates.length) return; // No more waypoints

  const targetX = waypointCoordinates[currentWaypointIndex][0];
  const targetY = waypointCoordinates[currentWaypointIndex][1];

  // Calculate player center in world coordinates
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;

  // Calculate distance to waypoint
  const distToWaypoint = dist(playerCenterX, playerCenterY, targetX, targetY);

  // Fade out when close (within 300 units), fade in when far
  const fadeDistance = 300;
  const maxDistance = 600;
  let waypointAlpha;

  if (distToWaypoint < fadeDistance) {
    // Close: fade out completely (0 alpha at 0px, 255 alpha at 300px)
    waypointAlpha = map(distToWaypoint, 0, fadeDistance, 0, 255);
  } else if (distToWaypoint < maxDistance) {
    // Medium distance: stay fully visible
    waypointAlpha = 255;
  } else {
    // Far: fully visible
    waypointAlpha = 255;
  }

  if (waypointAlpha < 5) return; // Don't draw if nearly invisible

  // Calculate angle from player to waypoint
  const angle = atan2(targetY - playerCenterY, targetX - playerCenterX);

  // Convert waypoint world coordinates to screen coordinates
  const waypointScreenX = targetX + camX;
  const waypointScreenY = targetY + camY;

  // Screen boundaries with padding
  const padding = 40;
  const minX = padding;
  const maxX = width - padding;
  const minY = padding;
  const maxY = height - padding;

  // Check if waypoint is on screen
  let arrowX, arrowY;

  if (waypointScreenX >= minX && waypointScreenX <= maxX &&
    waypointScreenY >= minY && waypointScreenY <= maxY) {
    // Waypoint is on screen - show arrow at waypoint location
    arrowX = waypointScreenX;
    arrowY = waypointScreenY;
  } else {
    // Waypoint is off screen - constrain to screen edge
    const screenCenterX = width / 2;
    const screenCenterY = height / 2;

    // Calculate direction from screen center to waypoint
    const dirX = waypointScreenX - screenCenterX;
    const dirY = waypointScreenY - screenCenterY;

    // Find intersection with screen boundaries
    const tX = dirX > 0 ? (maxX - screenCenterX) / dirX : (minX - screenCenterX) / dirX;
    const tY = dirY > 0 ? (maxY - screenCenterY) / dirY : (minY - screenCenterY) / dirY;
    const t = Math.min(tX, tY);

    arrowX = screenCenterX + dirX * t;
    arrowY = screenCenterY + dirY * t;
  }

  // Draw waypoint arrow with 180° flip and pointing toward waypoint
  push();
  translate(arrowX, arrowY);
  rotate(angle + HALF_PI + PI); // Add PI to flip 180°, HALF_PI to adjust for down-pointing default
  imageMode(CENTER);
  tint(255, waypointAlpha);
  image(WaypointImg, 0, 0, 40, 40);
  noTint();
  imageMode(CORNER);
  pop();
}

// Check if a tile has the same type as another (for auto-tiling)
function isSameTileType(row, col, layer, tileType) {
  const tile = getTile(row, col, layer);
  if (!tile) return false;
  return tile.type === tileType;
}

// Get the appropriate pipe variant and rotation based on neighbors
// Pipe (27) uses variants: straight, L, T, cross
function getPipeVariant(row, col, layer, tileType) {
  if (tileType !== 27) return null;

  // Check all cardinal neighbors for same pipe type
  const n = isSameTileType(row - 1, col, layer, tileType);
  const s = isSameTileType(row + 1, col, layer, tileType);
  const e = isSameTileType(row, col + 1, layer, tileType);
  const w = isSameTileType(row, col - 1, layer, tileType);

  // Count connections
  const connections = [n, s, e, w].filter(Boolean).length;

  let variant = 'straight';
  let rotation = 0;
  let flipH = false;

  if (connections === 0 || connections === 1) {
    // Dead end or isolated - use straight pipe
    variant = 'straight';
    if (n || s) rotation = 0;      // vertical
    else rotation = 90; // horizontal (default for isolated)
  } else if (connections === 2) {
    // Two connections - could be straight or L
    if ((n && s) || (e && w)) {
      // Opposite sides - straight pipe
      variant = 'straight';
      if (n && s) rotation = 0;   // vertical
      else rotation = 90;          // horizontal
    } else {
      // Adjacent sides - L pipe
      variant = 'L';
      // PipeL base is bottom-to-right, rotate to match connections
      if (s && e) rotation = 0;   // bottom-right (default)
      else if (s && w) rotation = 90;  // bottom-left
      else if (n && w) rotation = 180; // top-left
      else if (n && e) rotation = 270; // top-right
    }
  } else if (connections === 3) {
    // Three connections - T pipe
    variant = 'T';
    // PipeT base has connections on TOP, BOTTOM, and RIGHT (no left)
    // Need both rotation AND horizontal flip to properly orient all cases
    if (n && s && e) {
      rotation = 0;   // neighbors top-bottom-right = matches base orientation
      flipH = false;
    } else if (n && s && w) {
      rotation = 0;   // neighbors top-bottom-left = flip horizontally
      flipH = true;
    } else if (e && w && s) {
      rotation = 90;  // neighbors left-right-bottom = rotate 90°
      flipH = false;
    } else if (e && w && n) {
      rotation = 90;  // neighbors left-right-top = rotate 90° and flip
      flipH = true;
    }
  } else if (connections === 4) {
    // Four connections - cross pipe
    variant = 'cross';
    rotation = 0; // Cross is symmetrical
  }

  const config = tileVariants[27];
  return { variant, rotation, flipH, baseImg: config.variants[variant] };
}

// Get the appropriate tile variant and rotation based on neighbors
// Assumes edge piece has border on bottom, corner piece has borders on bottom-left
function getTileVariant(row, col, layer, tileType) {
  if (!tileVariants[tileType]) {
    return { variant: 'full', rotation: 0, img: null };
  }

  const config = tileVariants[tileType];

  // Check all cardinal neighbors
  const n = isSameTileType(row - 1, col, layer, tileType);     // north
  const s = isSameTileType(row + 1, col, layer, tileType);     // south
  const e = isSameTileType(row, col + 1, layer, tileType);     // east
  const w = isSameTileType(row, col - 1, layer, tileType);     // west

  let variant = 'full';
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
    variant = 'edge';
    // Edge piece has border on bottom, so rotate to put border on the empty side
    if (!n) rotation = 180;      // empty north = border on top
    else if (!s) rotation = 0;   // empty south = border on bottom
    else if (!e) rotation = 270; // empty east = border on right
    else if (!w) rotation = 90;  // empty west = border on left
  } else if (cardinalCount === 2) {
    if ((n && s) || (e && w)) {
      // Opposite sides - use center
      variant = 'center';
      rotation = 0;
    } else {
      // Adjacent sides - use corner
      variant = 'corner';
      // Corner piece has borders on bottom-left, rotate to match neighbor pattern
      if (n && e) rotation = 0;   // neighbors north+east = corner bottom-left
      else if (s && e) rotation = 90;  // neighbors south+east = corner top-left
      else if (s && w) rotation = 180; // neighbors south+west = corner top-right
      else if (n && w) rotation = 270; // neighbors north+west = corner bottom-right
    }
  } else if (cardinalCount === 1) {
    // One neighbor - use edge piece
    variant = 'edge';
    // Rotate edge to have border facing away from neighbor
    if (n) rotation = 0;   // neighbor north = border south
    else if (s) rotation = 180; // neighbor south = border north
    else if (e) rotation = 90;  // neighbor east = border west
    else if (w) rotation = 270; // neighbor west = border east
  }

  return { variant, rotation, baseImg: config.variants[variant] };
}

// --- Layered drawing: draw ONE layer index (0,1 behind; 2 above player) ---
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
      let colorIndex = tileObj.colorIndex || 0;

      // Check for roof fade alpha
      let roofFadeAlpha = 255;
      if ((layerIndex === 1 || layerIndex === 2 || layerIndex === 3 || layerIndex === 4) && tileWalls[tileType] === 2) {
        const __k = tileKey(i, j);
        roofFadeAlpha = roofAlpha.has(__k) ? roofAlpha.get(__k) : 255;
        if (roofFadeAlpha <= 0) continue; // fully transparent; skip draw
      }

      // Determine which image to draw (use cached tinted version)
      let imgToDraw = null;
      let finalRotation = rotation;

      // Check if this is a pipe tile (auto-connect pipes using variants)
      if (tileType === 27) {
        const pipeInfo = getPipeVariant(i, j, layerIndex, tileType);
        if (pipeInfo) {
          const config = tileVariants[27];
          if (config.tintedVariants && config.tintedVariants[colorIndex]) {
            imgToDraw = config.tintedVariants[colorIndex][pipeInfo.variant];
          } else {
            imgToDraw = pipeInfo.baseImg;
          }
          finalRotation = pipeInfo.rotation;
          // Override flipH from pipe variant calculation
          if (pipeInfo.flipH !== undefined) {
            tileObj.flipH = pipeInfo.flipH;
          }
        }
      }
      // Check if this tile type has variants registered
      else if (tileVariants[tileType]) {
        const variantInfo = getTileVariant(i, j, layerIndex, tileType);
        // Use tinted variant from cache
        const config = tileVariants[tileType];
        if (config.tintedVariants && config.tintedVariants[colorIndex]) {
          imgToDraw = config.tintedVariants[colorIndex][variantInfo.variant];
        } else {
          imgToDraw = variantInfo.baseImg;
        }
        finalRotation = variantInfo.rotation;
      } else {
        // Use cached tinted tile
        if (tintedTileCache[tileType] && tintedTileCache[tileType][colorIndex]) {
          imgToDraw = tintedTileCache[tileType][colorIndex];
        } else {
          imgToDraw = tileImgs[tileType];
        }
      }

      // Apply roof fade tint if needed
      if (roofFadeAlpha < 255) {
        tint(255, roofFadeAlpha);
      }

      // Draw the tile (apply rotation and flips)
      const needsTransform = finalRotation > 0 || tileObj.flipH || tileObj.flipV;
      if (needsTransform) {
        push();
        translate(j * 50 + 25, i * 50 + 25);
        rotate(radians(finalRotation));
        scale(tileObj.flipH ? -1 : 1, tileObj.flipV ? -1 : 1);
        image(imgToDraw, -25, -25, 50, 50);
        pop();
      } else {
        image(imgToDraw, j * 50, i * 50, 50, 50);
      }

      // Reset tint after drawing
      if (roofFadeAlpha < 255) {
        noTint();
      }

      // Draw crate inventory only when needed
      if (layerIndex === 2 && tileType === 5) {
        const crateKey = i + "," + j;
        if (crateInventories.has(crateKey)) {
          const items = crateInventories.get(crateKey);
          const maxDisplayItems = 3;
          for (let k = 0; k < Math.min(items.length, maxDisplayItems); k++) {
            const item = items[k];
            const itemImg = item[3];
            if (itemImg) {
              image(itemImg, j * 50 + 10 + k * 15, i * 50 + 10, 15, 15);
            }
          }
          if (items.length > maxDisplayItems) {
            fill(255);
            noStroke();
            textSize(10);
            text("+", j * 50 + 10 + maxDisplayItems * 15, i * 50 + 20);
          }
        }
      }
    }
  }
}

// --- Particle rendering by layer ---
function updateParticlesForLayer(layerIndex) {
  // Calculate viewport bounds in world coordinates
  const viewLeft = -camX - 50;
  const viewRight = -camX + width + 50;
  const viewTop = -camY - 50;
  const viewBottom = -camY + height + 50;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // Check if particle belongs to this layer
    if (p.layer === layerIndex) {
      p.update();

      // Apply roof fade if particle is on a roof layer and the roof is fading
      let fadeAlpha = 255;
      if (layerIndex >= 1 && layerIndex <= 4 && p.onRoof) { // Assuming 'onRoof' property is set on particle
        const __k = tileKey(p.roofRow, p.roofCol); // Assuming particle stores roof tile coords
        fadeAlpha = roofAlpha.has(__k) ? roofAlpha.get(__k) : 255;
        // Particles on layer 3 or higher disappear if part of a roof fade out
        if ((layerIndex >= 3 || p.layer >= 3) && fadeAlpha < 255) {
          fadeAlpha = 0; // Make particle disappear if it's on a fading roof and on layer 3+
        }
      }

      // Only draw particles within viewport and with sufficient alpha
      if (p.x >= viewLeft && p.x <= viewRight &&
        p.y >= viewTop && p.y <= viewBottom && fadeAlpha > 0) {
        p.draw(fadeAlpha); // Pass fadeAlpha to particle's draw method
      }

      if (p.isDead()) {
        particles.splice(i, 1);
      }
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

  // Check for crate collisions and destroy them
  checkCrateCollisions(pX, pY, w, h);

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

  // If neither alone resolves it (corner collision), revert both and stop
  if (!xCaused && !yCaused) {
    pX = prePX;
    pY = prePY;
    pXVel = 0;
    pYVel = 0;
    return;
  }

  // Revert only the axes that caused the collision
  if (xCaused) pX = prePX;
  if (yCaused) pY = prePY;

  // Pixel-walk toward intended direction until just before collision
  // Reduced max steps and added safety check
  const maxSteps = 100;

  if (xCaused && !yCaused) {
    const stepX = Math.sign(dx) || 0;
    let steps = 0;
    while (stepX !== 0 && steps < maxSteps) {
      // Check if next step would collide
      if (checkTileCollisions(pX + stepX, pY, w, h)) {
        break;
      }
      pX += stepX;
      steps++;
    }
    pXVel = 0;
  }

  if (yCaused && !xCaused) {
    const stepY = Math.sign(dy) || 0;
    let steps = 0;
    while (stepY !== 0 && steps < maxSteps) {
      // Check if next step would collide
      if (checkTileCollisions(pX, pY + stepY, w, h)) {
        break;
      }
      pY += stepY;
      steps++;
    }
    pYVel = 0;
  }

  // If both axes caused collision, we already reverted both above
  if (xCaused && yCaused) {
    pXVel = 0;
    pYVel = 0;
  }
}

/* ===== Check for crate collisions and destroy them ===== */
function checkCrateCollisions(x, y, w, h) {
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
        for (let L = 0; L < 5; L++) {
          const t = cell.layers[L];
          if (!t) continue;
          if (t.type === 5) { // Crate
            const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
            if (left < tR && right > tL && top < tB && bottom > tT) {
              // Get stored items for this crate
              const crateKey = row + "," + col;
              const storedItems = crateInventories.get(crateKey);

              if (storedItems && storedItems.length > 0) {
                // Drop all stored items
                for (const itemConstructor of storedItems) {
                  droppedItems.push(new DroppedItem(
                    new Item(itemConstructor[0], itemConstructor[1], itemConstructor[2]),
                    col * 50 + 25,
                    row * 50 + 25
                  ));
                }
                // Remove from inventory map
                crateInventories.delete(crateKey);
              } else {
                // Fallback: drop random item if no inventory stored
                let r = Math.floor(Math.random() * itemConstructors.length);
                droppedItems.push(new DroppedItem(
                  new Item(itemConstructors[r][0], itemConstructors[r][1], itemConstructors[r][2]),
                  col * 50 + 25,
                  row * 50 + 25
                ));
              }

              clearTile(row, col, L);
              particle(col * 50 + 25, row * 50 + 25, [139, 69, 19], 30, 5);
            }
          }
        }
      } else if (cell) { // legacy
        if (cell.type === 5) { // Crate
          const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
          if (left < tR && right > tL && top < tB && bottom > tT) {
            const crateKey = row + "," + col;
            const storedItems = crateInventories.get(crateKey);

            if (storedItems && storedItems.length > 0) {
              for (const itemConstructor of storedItems) {
                droppedItems.push(new DroppedItem(
                  new Item(itemConstructor[0], itemConstructor[1], itemConstructor[2]),
                  col * 50 + 25,
                  row * 50 + 25
                ));
              }
              crateInventories.delete(crateKey);
            } else {
              let r = Math.floor(Math.random() * itemConstructors.length);
              droppedItems.push(new DroppedItem(
                new Item(itemConstructors[r][0], itemConstructors[r][1], itemConstructors[r][2]),
                col * 50 + 25,
                row * 50 + 25
              ));
            }

            clearTile(row, col, 0);
            particle(col * 50 + 25, row * 50 + 25, [139, 69, 19], 30, 5);
          }
        }
      }
    }
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
        // Check all layers for solid tiles (tileWalls[type] === 1)
        for (let L = 0; L < 5; L++) {
          const t = cell.layers[L];
          if (!t) continue;
          if (tileWalls[t.type] === 1) {
            const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
            if (left < tR && right > tL && top < tB && bottom > tT) return true;
          }
        }
      } else if (cell) { // legacy
        if (tileWalls[cell.type] === 1) {
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

/* ========= Roof fade system (optimized with caching and range limiting) ========= */
const ROOF_FADE_SPEED = 42.5;   // alpha change per frame (0..255) - instant fade
const ROOF_MAX_DISTANCE = 25;  // max tiles to flood fill from player - reduced range
let roofAlpha = new Map();     // key "row,col" -> alpha
let roofTarget = new Set();    // keys that should fade to 0 this frame
let lastPlayerTile = { row: -1, col: -1 }; // cache player position
let cachedRoofTarget = new Set(); // cached flood fill results

function tileKey(r, c) { return r + "," + c; }

function isRoof(row, col) {
  if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row].length) return false;
  const cell = gameWorld[row][col];
  if (!cell) return false;

  // Treat roof as tiles placed on layers 1, 2, 3, or 4
  if ('layers' in cell) {
    for (let L = 1; L <= 4; L++) { // Check layers 1 through 4
      const t = cell.layers[L];
      if (t && tileWalls[t.type] === 2) return true;
    }
    return false;
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
  // Check if player moved to a new tile - only recalculate if so
  const playerTileRow = Math.floor((pY + 375) / 50);
  const playerTileCol = Math.floor((pX + 600) / 50);

  if (playerTileRow === lastPlayerTile.row && playerTileCol === lastPlayerTile.col && cachedRoofTarget.size > 0) {
    // Use cached results
    roofTarget = new Set(cachedRoofTarget);
    return;
  }

  // Update last position
  lastPlayerTile.row = playerTileRow;
  lastPlayerTile.col = playerTileCol;

  roofTarget.clear();
  if (!seeds.length) {
    cachedRoofTarget.clear();
    return;
  }

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

    // Limit flood fill distance from player
    const distFromPlayer = Math.abs(r - playerTileRow) + Math.abs(c - playerTileCol);
    if (distFromPlayer >= ROOF_MAX_DISTANCE) continue;

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (!isRoof(nr, nc)) continue;
      const nk = tileKey(nr, nc);
      if (!seen.has(nk)) { seen.add(nk); q.push([nr, nc]); }
    }
  }

  // Cache the results
  cachedRoofTarget = new Set(roofTarget);
}

function stepRoofFades() {
  // Fade targets toward transparent (0)
  for (const k of roofTarget) {
    const curr = roofAlpha.has(k) ? roofAlpha.get(k) : 255;
    if (curr === 0) continue; // Skip if already fully transparent
    const next = Math.max(0, curr - ROOF_FADE_SPEED);
    roofAlpha.set(k, next);
  }
  // Fade non-targets back toward opaque (255)
  const toDelete = [];
  for (const [k, curr] of roofAlpha.entries()) {
    if (roofTarget.has(k)) continue;
    if (curr === 255) continue; // Skip if already fully opaque
    const next = Math.min(255, curr + ROOF_FADE_SPEED);
    if (next === 255) {
      toDelete.push(k);
    } else {
      roofAlpha.set(k, next);
    }
  }
  // Batch delete fully opaque tiles
  for (const k of toDelete) {
    roofAlpha.delete(k);
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

      // Apply scale factor to base size
      baseSize *= (item.scaleFactor || 1.0);

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

// Update and draw all particles
function updateParticles() {
  // Calculate viewport bounds in world coordinates
  const viewLeft = -camX - 50;
  const viewRight = -camX + width + 50;
  const viewTop = -camY - 50;
  const viewBottom = -camY + height + 50;

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();

    // Only draw particles within viewport (with padding)
    if (particles[i].x >= viewLeft && particles[i].x <= viewRight &&
      particles[i].y >= viewTop && particles[i].y <= viewBottom) {
      particles[i].draw();
    }

    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

// Draw red alarm flash overlay
function drawAlarmFlash() {
  if (currentWaypointIndex > 3) return; // Stop alarm after waypoint 3

  // Calculate distance from bunker center (spawn point)
  const bunkerCenterX = 12500;
  const bunkerCenterY = 12500;
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  const distFromCenter = dist(playerCenterX, playerCenterY, bunkerCenterX, bunkerCenterY);

  // Fade out alarm based on distance (fully visible within 500 units, fades out by 2000 units)
  const minDistance = 500;
  const maxDistance = 2000;
  let distanceFade = 1.0;

  if (distFromCenter > minDistance) {
    if (distFromCenter >= maxDistance) {
      return; // Too far away, no alarm
    }
    distanceFade = map(distFromCenter, minDistance, maxDistance, 1.0, 0.0);
  }

  // Update flash alpha with pulsing effect
  if (alarmFlashIncreasing) {
    alarmFlashAlpha += 3;
    if (alarmFlashAlpha >= 80) {
      alarmFlashIncreasing = false;
    }
  } else {
    alarmFlashAlpha -= 3;
    if (alarmFlashAlpha <= 0) {
      alarmFlashIncreasing = true;
    }
  }

  // Draw red overlay with distance-based fade
  push();
  fill(255, 0, 0, alarmFlashAlpha * distanceFade);
  noStroke();
  rect(0, 0, width, height);
  pop();
}
function initializeHardcodes(){
  players.push(new Player(12500, 12500, pWidth, pHeight, pSpeed, healthPoints, playerDamage, PlayerImage));
  NonPlayerCharacters.push(new NPC(12950, 12650, "Prometheus IV", ["Prometheus IV: Ba-Bastiann... Welcome Back", "Prometheus IV: I am Prometheus IV", "Prometheus IV: I am the final robot unyeilding to Khronos' will.", "Prometheus IV: You are one of the last human engineers alive", "Prometheus IV: That cr...ate over there", "Prometheus IV: Take this, and break the crate to drop its contents"], Prometheus, "Prometheus", 3));
  droppedItems.push(new DroppedItem(new Item("projectile", "old wrench", 1), 16500, 14250));
}