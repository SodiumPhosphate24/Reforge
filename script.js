let Buschy, InventoryImg, FrameImg, Fog, IndicatorImg, BulletImgs = [0, 0, 0, 0, 0], SprayerImgs = [0, 0, 0], itemImgs = [0, 0, 0, 0, 0, 0], projImgs = [0, 0, 0], matImgs = [0, 0, 0, 0, 0, 0], Silkscreen, PlayerImage, titleScreenImg, BunkerImg, PrometheusIntroImg, CryochamberImg, Prometheus, WaypointImg, SPUDImage, ARGOImage, KhronosImage, Book, Greg, LockNpc, Hephaestus, Atlas, OGBuschy, Daedalus, HoopImg, FieldGoalImg, AdvanceDialogueSfx, AlarmSfx, CraftItemSfx, CrateDestroyedSfx, MenuSelectSfx, MenuSwitchSfx, LaserSfx;

var activeBoss = null;

let themeSong;
let maxTileTypes = 0;

var waypointCoordinates = [[13005, 12687], [13375, 12875], [16500, 14250], [13100, 12875], [12637, 12875], [23983, 21925], [8475, 23225], [4425, 950], [13850, 850], [1900, 2700]];
var currentWaypointIndex = 0;
var itemConstructors = [];
var nearestSpecialObject = null;
var nearestLeak = null;
var totalLeaks = 5;

var fixBoilerPrompt = null;
var boilerCartridgeCooldownPrompt = null;
var pickupCartridgePrompt = null;
var puzzlePrompt = null;

var alarmFlashAlpha = 0;
var alarmFlashIncreasing = true;
var pIFrames = 15;
var pX = 12500; var pY = 12500; var playerDamage = 1;
var prePX = 0, prePY = 0;
var camX = -12500; var camY = -12500;
var pSpeed = 1.3;
var pXVel = 0; var pYVel = 0;
var trainTotaled = false;
var crashFlashAlpha = 0;
var pWidth = 35; var pHeight = 21.4;
var gameWorld = [];
var worldString = "";
var lastScroll = 0;
var scrollDelay = 20;
var hotbar = [];
var recoil = 10;
var generateCooldown = 300;
var softlockPreventionOn = false;
var bloodMoonCooldown = 18000;
var bloodMoonActive = false;
var bloodMoonOverlayAlpha = 0;
var bloodMoonParticles = [];
var alarmBaseVolume = 0.14;
var alarmMaxVolume = 0.275;

var breadcrumbs = [];
var lastBreadcrumbTime = 0;
var breadcrumbInterval = 200;
var maxBreadcrumbs = 15;
var breadcrumbMinDistance = 2;
var tileNames = [];
var tileImgs = ["grass", "asphalt", "lined asphalt", "Concrete", "Brick", "Crate", "Workbench", "dirt", "darkConcrete", "door", "window", "crack", "wood", "whiteConcrete", "barnDoor", "barnWindow", "fence", "fenceCorner", "fenceDown", "fenceEdge", "fencePost", "Grave 1", "Grave 2", "Grave 3", "Rail", "Stone Brick", "Stone Brick Wall", "Pipe", "CopperTileGreen", "Gravel", "Note", "ChainLink", "ChainLinkBottomCorner", "ChainLinkCorner", "ChainLinkVertical", "ChainLinkEnd", "Lampost", "Bench", "White Brick", "White Tile", "Steel Crate", "Tree", "Boiler", "Water", "Sewer", "Tree2", "Cobblestone", "Wooden Post", "Wooden post top", "Boarded Window", "Vines", "Exterior Copper Pipe", "Brick Roof"];
var tileWalls = [2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 1, 0, 2, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2]; // 0 walkable, 1 solid, 2 roof (walk-through + fades

// Tile color variants - each tile can have multiple color tints
var tileColors = [
  [[200, 220, 10]], // 0 - grass (white = no tint, shows base green color)
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
  [[255, 255, 255], [200, 1, 1], [180, 150, 110]], // 13 - whiteConcret
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
  [[200, 200, 200], [240, 210, 170], [220, 190, 150], [200, 170, 130], [180, 150, 110]],  // 25 - Stone Brick (default white, light sepia, medium-light sepia, medium sepia, darker sepia)
  [[200, 200, 200], [240, 210, 170], [220, 190, 150], [200, 170, 130], [180, 150, 110]], // 26 - Stone Brick Wall
  [[240, 210, 170]], // 27 - Pipe
  [[240, 210, 170]], // 28 - CopperTileGreen


  [[255, 255, 255]], // 29 - Gravel
  [[255, 255, 255]], // 30 - Note
  [[255, 255, 255]], // 31 - ChainLink
  [[255, 255, 255]], // 32 - ChainLinkBottomCorner
  [[255, 255, 255]], // 33 - ChainLinkCorner
  [[255, 255, 255]], // 34 - ChainLinkVertical
  [[255, 255, 255]], // 35 - ChainLinkEnd
  [[255, 255, 255]], // 36 - Lampost
  [[255, 255, 255]],  // 37 - Bench
  [[100, 100, 100]], // 38 White Brick
  [[100, 100, 100], [80, 80, 80], [50, 255, 50]], // 39 White Tile (grey, inactive plate, active plate green)
  [[255, 255, 255]], // 40 Steel Crate
  [[255, 255, 255]], // 41 Tree
  [[255, 255, 255]], // 42 Boiler
  [[255, 255, 255]], // 43 Water
  [[255, 255, 255]], // 44 Sewer
  [[255, 255, 255]], // 45 Tree2
  [[255, 255, 255]], // 46 Cobblestone
  [[200, 200, 200]], // 47 Wooden Post
  [[200, 200, 200]], // 48 wooden post top
  [[255, 255, 255]], // 49 Boarded Window
  [[255, 255, 255]], // 50 Vines
  [[240, 210, 170]], // 51 Exterior Copper Pipe
  [[255, 255, 255]] // 52 Brick Roof
];

var fadeToGameProgress = 0;

// Game state management
function updateFadeToGame() {
  fadeToGameProgress += 0.005;

  if (fadeToGameProgress >= 1.0) {
    gameState = "playing";
    if (typeof startTutorial === 'function') {
      startTutorial();
    }
  }
}

// Draw the fade in overlay
function drawFadeToGame() {
  background(50);
  // Draw the gameplay scene behind fade
  push();
  // Position camera
  controlCamera();
  translate(camX, camY);

  // Game layers
  drawWorldLayer(gameWorld, 0);
  drawWorldLayer(gameWorld, 1);

  // Items
  updateDroppedItems();

  // Draw NPCs before roofs so they appear underneath
  fill(255);
  drawNPCs();

  // Draw idle players before roofs
  drawPlayers(false);

  drawWorldLayer(gameWorld, 2);
  drawWorldLayer(gameWorld, 3);

  fill(255);

  drawGunDebugRect();
  drawEnemies();
  drawBullets();

  // LAYER 4 on top of everything
  drawWorldLayer(gameWorld, 4);
  updateParticlesForLayer(4);

  drawPlayers(true);

  pop();

  drawUI();

  // Black fade
  push();
  const fadeAlpha = map(fadeToGameProgress, 0, 1, 255, 0);
  fill(0, 0, 0, fadeAlpha);
  noStroke();
  rect(0, 0, width, height);
  pop();

  // "EXIT THE CRYOCHAMBER"
  if (fadeToGameProgress < 0.9) {
    push();
    textFont(Silkscreen);
    textAlign(CENTER, CENTER);

    let textAlpha;
    if (fadeToGameProgress < 0.15) {
      textAlpha = map(fadeToGameProgress, 0, 0.15, 0, 255);
    } else if (fadeToGameProgress < 0.7) {
      textAlpha = 255;
    } else {
      textAlpha = map(fadeToGameProgress, 0.7, 0.9, 255, 0);
    }

    textSize(42);

    strokeWeight(6);
    stroke(112, 66, 20, textAlpha * 0.4);
    fill(255, 200, 80, textAlpha);
    text("EXIT THE CRYOCHAMBER", width / 2, height / 2);

    noStroke();
    fill(255, 220, 100, textAlpha);
    text("EXIT THE CRYOCHAMBER", width / 2, height / 2);

    pop();
  }
}

// leak detection
function updateLeakDetection() {
  nearestLeak = null;
  let nearestDist = Infinity;

  // Only check if holding wrench
  const currentItem = inventoryList[inventorySlot - 1];
  if (!currentItem || currentItem.name !== "old wrench") {
    return;
  }

  for (let i = 0; i < 5; i++) {
    const ps = particleSources[i];
    // Skip if leak is already fixed
    if (ps.spawnRate === 0) continue;

    const d = distance(pX + 600, pY + 340, ps.x, ps.y);
    if (d < 120 && d < nearestDist) {
      nearestDist = d;
      nearestLeak = {
        x: ps.x,
        y: ps.y,
        index: i
      };
    }
  }
}

// Tile variants storage
var tileVariants = {};

// Multi-tile configuration: tiles that need multiple cells
// { width, height, fullImage, sections: [] }
var multiTileConfig = {};

function registerMultiTile(tileID, imagePath, gridW, gridH) {
  const img = loadImage(imagePath);
  multiTileConfig[tileID] = {
    width: gridW,
    height: gridH,
    fullImage: img,
    sections: []
  };

  // Map to tileVariants
  if (!tileVariants[tileID]) {
    tileVariants[tileID] = {
      variants: {},
      fullImage: img
    };
  }
}

// Generate multi-tile tiles by splitting into grid
function generateAllMultiTileSections() {
  for (let tileID in multiTileConfig) {
    const config = multiTileConfig[tileID];
    const fullImg = config.fullImage;

    const tileW = fullImg.width / config.width;
    const tileH = fullImg.height / config.height;

    config.sections = [];

    for (let row = 0; row < config.height; row++) {
      config.sections[row] = [];
      for (let col = 0; col < config.width; col++) {
        const section = createGraphics(tileW, tileH);
        section.copy(fullImg, col * tileW, row * tileH, tileW, tileH, 0, 0, tileW, tileH);
        config.sections[row][col] = section;
      }
    }
    console.log(`Generated sections for multi-tile ${tileID}: ${config.width}x${config.height}`);
  }
}

var enemies = [], bullets = [], messages = [], droppedItems = [], NonPlayerCharacters = [];
var inventoryList;
var crateInventories = new Map(); // Stores crate contents

// Reusable prompt system
function createPrompt() {
  return {
    alpha: 0,
    scale: 0,
    growScale: 0.5,
    isActive: false,

    update: function(shouldShow) {
      if (this.isActive !== shouldShow) {
        this.isActive = shouldShow;
      }

      if (this.isActive) {
        this.alpha = lerp(this.alpha, 255, 0.1);
        this.scale = lerp(this.scale, 1, 0.1);
        this.growScale = lerp(this.growScale, 1, 0.1);
      } else {
        this.alpha = lerp(this.alpha, 0, 0.15);
        this.scale = lerp(this.scale, 0, 0.15);
        this.growScale = lerp(this.growScale, 0.5, 0.15);
      }
    },

    draw: function(promptText, color = [255, 150, 0], yPos = 80, isFixed = false) {
      if (this.alpha < 5) return;

      push();
      if (isFixed) {
        translate(width / 2, yPos);
      } else {
        translate(pX + 600 + pWidth / 2, pY + 375 - 40);
      }
      scale(this.scale * this.growScale);
      if (!isFixed) translate(-(pX + 600 + pWidth / 2), -(pY + 375 - 40));
      else translate(-(width / 2), -yPos);

      fill(color[0], color[1], color[2], this.alpha * 0.78);
      textSize(20);
      textFont(Silkscreen);
      textAlign(CENTER, CENTER);

      // Background
      const promptWidth = textWidth(promptText);
      fill(0, 0, 0, this.alpha * 0.6);
      if (isFixed) {
        rect(width / 2 - promptWidth / 2 - 10, yPos - 17, promptWidth + 20, 35, 5);
      } else {
        rect(pX + 600 + pWidth / 2 - promptWidth / 2 - 10, pY + 375 - 40 - 17, promptWidth + 20, 35, 5);
      }

      // Text
      fill(color[0], color[1], color[2], this.alpha);
      if (isFixed) {
        text(promptText, width / 2, yPos);
      } else {
        text(promptText, pX + 600 + pWidth / 2, pY + 375 - 40);
      }

      pop();
    }
  };
}

// Helper function to handle interaction prompts
function handleInteractionPrompt(promptObj, targetX, targetY, proximity, message, condition = true, color = [255, 150, 0], isFixed = true) {
  const distToPlayer = distance(targetX, targetY, pX + 600, pY + 340);
  const shouldShow = distToPlayer < proximity && condition && gameState === "playing";
  promptObj.update(shouldShow);
  promptObj.draw(message, color, 80, isFixed);
  return shouldShow;
}

function preload() {
  console.log("Cheesy Goodness Update");
  arrayCopy(tileImgs, 0, tileNames, 0, tileImgs.length);
  worldString = loadStrings("world.txt");
  sewer1String = loadStrings("sewer.txt");
  sewer2String = loadStrings("sewer2.txt");
  Buschy = loadImage("Characters/Buschy.png");
  SPUDImage = loadImage("Characters/SPUD.png");
  ARGOImage = loadImage("Characters/Argo.png");
  SCAMPERImage = loadImage("Characters/Scamper.png")
  STURDImage = loadImage("Characters/STURD.png")
  KhronosImage = loadImage("Characters/Khronos.png");
  Prometheus = loadImage("Characters/Prometheus.png");
  Hephaestus = loadImage("Characters/Hephaestus.png");
  Atlas = loadImage("Characters/Atlas.png");
  Daedalus = loadImage("Characters/Daedalus.png");
  HoopImg = loadImage("Characters/Hoop.png");
  FieldGoalImg = loadImage("Characters/FieldGoal.png");
  LockNpc = loadImage("Characters/Lock.png");
  BadGuy = loadImage("Characters/Enemy.png");
  Harpy = loadImage("Characters/Harpy.png");
  Greg = loadImage("Characters/Greg.png");
  //Greg = loadImage("Items/Consumables/CommonBattery.png");
  OGBuschy = loadImage("Characters/OGBuschy.png");
  Book = loadImage("Characters/Book.png");
  BulletImgs[0] = loadImage("Items/Bullets/CommonBullet.png");
  BulletImgs[1] = loadImage("Items/Bullets/UncommonBullet.png");
  BulletImgs[2] = loadImage("Items/Bullets/RareBullet.png");
  BulletImgs[3] = loadImage("Items/Bullets/LegendaryBullet.png");
  BulletImgs[4] = loadImage("Items/Bullets/ExplosiveBullet.png");
  SprayerImgs[0] = loadImage("Items/Sprayers/steamSprayer.png");
  SprayerImgs[1] = loadImage("Items/Sprayers/steamSpreader.png");
  SprayerImgs[2] = loadImage("Items/Sprayers/steamPulser.png");
  tileImgs[0] = loadImage("Tiles/deadGrass.png");
  tileImgs[1] = loadImage("Tiles/Asphalt.png");
  tileImgs[2] = loadImage("Tiles/Asphalt2.png");
  tileImgs[3] = null;
  tileImgs[4] = loadImage("Tiles/Brick.png");
  tileImgs[5] = loadImage("Tiles/Crate.png");
  tileImgs[6] = null;
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
  tileImgs[36] = null;
  tileImgs[37] = null;
  tileImgs[38] = loadImage("Tiles/WhiteBrick.png");
  tileImgs[39] = loadImage("Tiles/WhiteTile.png");
  tileImgs[40] = loadImage("Tiles/SteelCrate.png");
  tileImgs[41] = null;
  tileImgs[42] = null;
  tileImgs[43] = null;
  tileImgs[44] = loadImage("Tiles/sewer.png");
  tileImgs[45] = null;
  tileImgs[46] = loadImage("Tiles/Cobblestone.png");
  tileImgs[47] = loadImage("Tiles/WoodenPost.png");
  tileImgs[48] = loadImage("Tiles/WoodenPostTop.png");
  tileImgs[49] = loadImage("Tiles/BoardedWindow.png");
  tileImgs[50] = loadImage("Tiles/Vines.png");
  tileImgs[51] = null;
  tileImgs[52] = loadImage("Tiles/Brick.png");
  // Register multi-tile objects
  registerMultiTile(6, "Tiles/Crafting.png", 2, 2);
  registerMultiTile(36, "Tiles/Lampost.png", 1, 2);
  registerMultiTile(37, "Tiles/Bench.png", 2, 1);
  registerMultiTile(41, "Tiles/Tree.png", 1, 2);
  registerMultiTile(42, "Tiles/Boiler.png", 1, 2);
  registerMultiTile(45, "Tiles/pineTree.png", 1, 2);

  itemImgs[0] = loadImage("Items/Consumables/Cheese.png");
  itemImgs[1] = loadImage("Items/Consumables/Soda.png");
  itemImgs[2] = loadImage("Items/Consumables/CommonCartridge.png");
  itemImgs[3] = loadImage("Items/Consumables/RareCartridge.png");
  itemImgs[4] = loadImage("Items/Consumables/LegendaryCartridge.png");
  itemImgs[5] = loadImage("Items/Misc/Crowbar.png");
  matImgs[0] = loadImage("Items/Materials/CommonWheel.png");
  matImgs[1] = loadImage("Items/Materials/RareWheel.png");
  matImgs[2] = loadImage("Items/Materials/LegendaryWheel.png");
  matImgs[3] = loadImage("Items/Materials/Cog.png");
  matImgs[4] = loadImage("Tiles/Pipe.png");
  matImgs[5] = loadImage("Items/Consumables/LegendaryCartridge.png");
  matImgs[6] = loadImage("Items/Misc/Blueprint.png");
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
  themeSong = loadSound("music/themeSong.mp3");
  AdvanceDialogueSfx = loadSound("SFX/AdvanceDialogue.wav");
  AlarmSfx = loadSound("SFX/Alarm.wav");
  CraftItemSfx = loadSound("SFX/CraftItem.wav");
  CrateDestroyedSfx = loadSound("SFX/CrateDestroyed.wav");
  MenuSelectSfx = loadSound("SFX/MenuSelect.wav");
  MenuSwitchSfx = loadSound("SFX/MenuSwitch.wav");
  LaserSfx = loadSound("SFX/Laser.wav");

  BunkerImg = loadImage("Buschwick Industries.png");
  PrometheusIntroImg = loadImage("PrometheusIntro.png");
  CryochamberImg = loadImage("Cryochamber.png");

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

  tileVariants[27] = {
    variants: {
      'straight': loadImage("Tiles/Pipe.png"),
      'L': loadImage("Tiles/PipeL.png"),
      'T': loadImage("Tiles/PipeT.png"),
      'cross': loadImage("Tiles/PipeCross.png")
    }
  };
  tileVariants[51] = {
    variants: {
      'straight': loadImage("Tiles/Pipe.png"),
      'L': loadImage("Tiles/PipeL.png"),
      'T': loadImage("Tiles/PipeT.png"),
      'cross': loadImage("Tiles/PipeCross.png")
    }
  };

  tileVariants[43] = {
    variants: {
      'full': loadImage("Tiles/WaterFull.png"),
      'center': loadImage("Tiles/WaterFull.png"),
      'edge': loadImage("Tiles/WaterEdge.png"),
      'corner': loadImage("Tiles/WaterCorner.png")
    }
  }
}

// Generate multi-tile tiles by splitting into grid
function generateAllMultiTileSections() {
  for (let tileID in multiTileConfig) {
    const config = multiTileConfig[tileID];
    if (!config || !config.fullImage) {
      console.error("Multi-tile config or image missing for tile", tileID);
      continue;
    }

    const fullImg = config.fullImage;
    // Failsafe for image loading
    if (!fullImg || fullImg.width <= 1) {
      console.warn(`Image for multi-tile ${tileID} not loaded yet or invalid. Skipping section generation.`);
      continue;
    }

    const tileWidth = fullImg.width / config.width;
    const tileHeight = fullImg.height / config.height;

    config.sections = [];

    // updates tileVariants
    if (!tileVariants[tileID]) {
      tileVariants[tileID] = { variants: {}, fullImage: fullImg };
    }

    // Split image along grid sections
    for (let row = 0; row < config.height; row++) {
      config.sections[row] = [];
      for (let col = 0; col < config.width; col++) {
        const section = createGraphics(tileWidth, tileHeight);
        section.copy(
          fullImg,
          col * tileWidth, row * tileHeight, tileWidth, tileHeight,
          0, 0, tileWidth, tileHeight
        );
        config.sections[row][col] = section;

        // Map to tileVariants
        if (config.width === 2 && config.height === 2) {
          const names = [['top_left', 'top_right'], ['bottom_left', 'bottom_right']];
          tileVariants[tileID].variants[names[row][col]] = section;
        } else if (config.width === 1 && config.height === 2) {
          const names = ['top', 'bottom'];
          tileVariants[tileID].variants[names[row]] = section;
        } else if (config.width === 2 && config.height === 1) {
          const names = ['left', 'right'];
          tileVariants[tileID].variants[names[col]] = section;
        } else if (config.width === 1 && config.height === 1) {
          tileVariants[tileID].variants['full'] = section;
        }
      }
    }

    console.log(`Multi-tile ${tileID}: generated ${config.width}x${config.height} sections and mapped to variants`);
  }
}

// Generate tile tints
function generateTintedTileCache() {
  console.log("Generating tinted tile cache...");
  tintedTileCache = [];

  for (let tileIndex = 0; tileIndex < tileImgs.length; tileIndex++) {
    tintedTileCache[tileIndex] = [];
    const baseImg = tileImgs[tileIndex];

    if (!baseImg || typeof baseImg === 'string') {
      tintedTileCache[tileIndex] = [null];
      continue;
    }

    const colors = tileColors[tileIndex] || [[255, 255, 255]];

    for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
      const [r, g, b] = colors[colorIndex];

      const tintedImg = createGraphics(50, 50);
      tintedImg.tint(r, g, b);
      tintedImg.image(baseImg, 0, 0, 50, 50);
      tintedImg.noTint();

      // Store tinted image
      tintedTileCache[tileIndex][colorIndex] = tintedImg;
    }
    if (tileIndex === 39 && colors.length < 3) {
      const extraColors = [[50, 50, 50], [0, 255, 0]];
      for (let i = 0; i < extraColors.length; i++) {
        const [r, g, b] = extraColors[i];
        const tintedImg = createGraphics(50, 50);
        tintedImg.tint(r, g, b);
        tintedImg.image(baseImg, 0, 0, 50, 50);
        tintedImg.noTint();
        tintedTileCache[tileIndex][colors.length + i] = tintedImg;
      }
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
        if (!baseImg || typeof baseImg === 'string') continue;

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

  generateAllMultiTileSections();

  generateTintedTileCache();

  itemConstructors = [
    ["sprayer", "steam sprayer", 1, SprayerImgs[0]],
    ["sprayer", "steam spreader", 1, SprayerImgs[1]],
    ["sprayer", "steam pulser", 1, SprayerImgs[2]],
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
    ["material", "pipe", 1, matImgs[4]],
    ["material", "boiler cartridge", 1, matImgs[5]],
    ["projectile", "crowbar", 1, itemImgs[5]],
    ["material", "train blueprint", 1, matImgs[6]]
  ];

  gameWorld = stringToWorld(worldString[0]);

  // Cheesy Goodness
  // Load sewer rooms
  setTimeout(() => {
    if (typeof sewer1String !== 'undefined' && sewer1String.length > 0 && sewer1String[0].trim() !== '') {
      // Find the first sewer link once links are loaded
      for (let [key, val] of sewerLinks) {
        if (sewerFirstInPair.get(key)) {
          stringToSewerRoom(sewer1String[0], key, true);
          break;
        }
      }
    }
    if (typeof sewer2String !== 'undefined' && sewer2String.length > 0 && sewer2String[0].trim() !== '') {
      // Find the second sewer link
      let count = 0;
      for (let [key, val] of sewerLinks) {
        if (sewerFirstInPair.get(key)) {
          if (count === 1) {
            stringToSewerRoom(sewer2String[0], key, false);
            break;
          }
          count++;
        }
      }
    }
  }, 500); // Small delay to ensure sewerLinks are parsed from worldString
  console.log(worldString);
  initializeHardcodes();
  inventoryList = players[activePlayer].inventory;

  indicatorCurrentX = pX + 600;
  indicatorCurrentY = pY + 375;
  indicatorTargetX = indicatorCurrentX;
  indicatorTargetY = indicatorCurrentY;

  // Initial minimap cache
  setTimeout(() => {
    if (typeof renderMinimapToCache === 'function') {
      renderMinimapToCache();
    }
  }, 1000); // Wait for assets and world to fully load

  fixBoilerPrompt = createPrompt();
  boilerCartridgeCooldownPrompt = createPrompt();
  pickupCartridgePrompt = createPrompt();
  puzzlePrompt = createPrompt();
}

function draw() {
  if (gameState === "menu") {
    drawMenuScreen();
    drawUI();
    return;
  }

  if (gameState === "credits") {
    drawCreditsScreen();
    drawUI();
    return;
  }

  if (gameState === "controls") {
    drawControlsScreen();
    drawUI();
    return;
  }

  if (gameState === "transition") {
    updateTransition();
    drawTransitionOverlay();
    drawUI();
    return;
  }

  if (gameState === "intro") {
    updateIntro();
    drawIntro();
    drawUI();
    return;
  }

  drawGameplay();
  updateLeakDetection();
  updateEnding();
  drawEndingOverlay();
  if (typeof updateAlarmSfx === "function") updateAlarmSfx();
}

function updateLeakDetection() {
  nearestLeak = null;
  let nearestDist = Infinity;

  // Only check if holding wrench
  const currentItem = inventoryList[inventorySlot - 1];
  if (!currentItem || currentItem.name !== "old wrench") {
    return;
  }

  for (let i = 0; i < 5; i++) {
    const ps = particleSources[i];
    // Skip if leak is fixed
    if (ps.spawnRate === 0) continue;

    const d = distance(pX + 600, pY + 340, ps.x, ps.y);
    if (d < 120 && d < nearestDist) {
      nearestDist = d;
      nearestLeak = {
        x: ps.x,
        y: ps.y,
        index: i
      };
    }
  }
}

function mouseReleased() {
  if (typeof handleEditorMouseReleased === 'function') {
    handleEditorMouseReleased();
  }
}

function drawGameplay() {
  if (isPaused) {
    drawPauseMenu();
    drawUI();
    return;
  }
  prePX = pX;
  prePY = pY;
  background(50);
  push();
  controlCamera();
  translate(camX, camY);

  // Roof fade update
  const __roofSeeds = getOverlappingRoofSeeds(pX, pY, pWidth, pHeight);
  floodFillRoof(__roofSeeds);
  stepRoofFades();
  // -------------------------------

  // LAYERS 0, 1 behind everything
  drawWorldLayer(gameWorld, 0);
  updateParticlesForLayer(0);
  drawWorldLayer(gameWorld, 1);
  updateParticlesForLayer(1);

  // Draw items
  updateDroppedItems();

  // Draw NPCs
  fill(255);
  drawNPCs();

  // Check sewer exits
  if (typeof checkSewerExits === 'function') {
    checkSewerExits();
  }

  // Update sewer puzzle
  if (typeof updateSewerPuzzle === 'function') {
    updateSewerPuzzle();
  }

  // Draw idle players before roofs
  fill(255);
  drawPlayers(false);

  // LAYERS 2, 3 over items but under player
  drawWorldLayer(gameWorld, 2);
  updateParticlesForLayer(2);
  drawWorldLayer(gameWorld, 3);
  updateParticlesForLayer(3);

  // Rotate sprayer
  drawGunDebugRect();

  mainHand();
  drawEnemies();
  drawBullets();
  bloodMoon();

  // Player center for distance checks
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;

  // Check nearby leaks
  nearestLeak = null;
  let nearestLeakDistance = Infinity;

  // Only check if holding wrench
  const holdingOldWrench = inventoryList[inventorySlot - 1] != null &&
    inventoryList[inventorySlot - 1].name === "old wrench";

  // Spawn particles
  if (typeof particleSources !== 'undefined') {
    for (let sourceIndex = 0; sourceIndex < particleSources.length; sourceIndex++) {
      const ps = particleSources[sourceIndex];

      if (sourceIndex < 5 && ps.spawnRate > 0) {
        const distToPlayer = dist(playerCenterX, playerCenterY, ps.x, ps.y);

        if (holdingOldWrench && distToPlayer < 120) {
          if (distToPlayer < nearestLeakDistance) {
            nearestLeakDistance = distToPlayer;
            nearestLeak = { x: ps.x, y: ps.y, index: sourceIndex };
          }
        }
      }

      // Spawn particles
      for (let i = 0; i < ps.spawnRate; i++) {
        if (random() < 0.3) {
          const angle = random(ps.arcStart, ps.arcEnd);
          const particleSize = ps.size + random(-ps.sizeVariance, ps.sizeVariance);

          const px = ps.x;
          const py = ps.y;

          // Manual particle creation
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

  // Breadcrumb update
  const currentTime = millis();
  if (currentTime - lastBreadcrumbTime > breadcrumbInterval) {
    // Add breadcrumb at player position
    const playerWorldX = pX + 600 + pWidth / 2;
    const playerWorldY = pY + 375 + pHeight / 2;

    let shouldAddBreadcrumb = true;
    if (breadcrumbs.length > 0) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      const distFromLast = dist(playerWorldX, playerWorldY, lastBreadcrumb.x, lastBreadcrumb.y);
      if (distFromLast <= breadcrumbMinDistance) {
        shouldAddBreadcrumb = false;
      }
    }

    if (shouldAddBreadcrumb) {
      breadcrumbs.push({ x: playerWorldX, y: playerWorldY, timestamp: currentTime });

      // Remove old breadcrumbs
      if (breadcrumbs.length > maxBreadcrumbs) {
        breadcrumbs.shift();
      }
    }

    lastBreadcrumbTime = currentTime;
  }

  controls();
  softlockPrevention();
  resolveCollisions();
  if (triggerList.Objective.fixBoiler && generateCooldown > 0) {
    generateCooldown--;
  }

  // LAYER 4 on top of player
  drawWorldLayer(gameWorld, 4);
  updateParticlesForLayer(4);

  // Steam particles if ARGO is totaled
  if (trainTotaled && players.length > 0) {
    const argo = players.find(p => p.name === "ARGO");
    if (argo) {
      if (frameCount % 5 === 0) {
        particle(argo.x + 600 + 35, argo.y + 375, [220, 220, 220], 60, 2, 4);
      }
    }
  }

  // Draw active player after all world layers
  fill(255);
  drawPlayers(true);

  // Draw particle sources, editor mode
  if (typeof drawParticleSources === 'function') {
    drawParticleSources();
  }

  // Draw breadcrumbs, editor mode
  if (editorMode && typeof drawBreadcrumbs === 'function') {
    drawBreadcrumbs();
  }

  // Draw enemy raycasts, editor mode
  if (editorMode && typeof drawEnemyRaycasts === 'function') {
    drawEnemyRaycasts();
  }

  pop();

  // Pickup prompt
  drawPickupPromptIfNeeded();

  // NPC prompt
  drawNPCPromptIfNeeded();

  // Sewer prompt
  if (typeof drawSewerPrompt === 'function') {
    drawSewerPrompt();
  }

  // Leak repair prompt
  drawLeakPromptIfNeeded();

  // Boiler repair condition check and update prompt
  const holdingBoilerCartridge = inventoryList[inventorySlot - 1] != null &&
    inventoryList[inventorySlot - 1].name === "boiler cartridge";
  const nearBoiler = distance(pX, pY, 12000, 12500) < 75;
  const atRightWaypoint = currentWaypointIndex >= 4;

  const repairBoiler = holdingBoilerCartridge && nearBoiler && atRightWaypoint;
  const cartridgeCooldown = nearBoiler && triggerList.Objective.fixBoiler && generateCooldown > 0;
  const pickupCartridge = nearBoiler && triggerList.Objective.fixBoiler && generateCooldown <= 0;
  fixBoilerPrompt.update(repairBoiler);
  fixBoilerPrompt.draw("Press E to Restore Boiler", [255, 200, 0], 80, true);

  boilerCartridgeCooldownPrompt.update(cartridgeCooldown);
  boilerCartridgeCooldownPrompt.draw("Cartridge ready in " + Math.ceil(generateCooldown / 60), [255, 200, 0], 80, true);

  pickupCartridgePrompt.update(pickupCartridge);
  pickupCartridgePrompt.draw("Press E to Pickup Cartridge", [255, 200, 0], 80, true);

  //Enter boss arena
  if (distance(pX, pY, 350, 1400) < 75 && pX > 350 && !triggerList.Labyrinth.isFightingBoss) {
    triggerList.Labyrinth.isFightingBoss = true;
    enemies.push(new Enemy("boss", 1900, 2700));
    console.log("Spawned Boss");
    setTile(34, 18, 2, 26);
    setTile(35, 18, 2, 26);
    setTile(36, 18, 2, 26);
  }

  // Crafting prompt
  if (typeof drawCraftingPromptIfNeeded === 'function') {
    drawCraftingPromptIfNeeded();
  }

  // Draw waypoint arrow
  drawWaypoint();

  drawInventory();
  messageDisplay();

  // Draw alarm flash
  drawAlarmFlash();

  // Handle crafting menu
  if (typeof handleCraftingInput === 'function') {
    handleCraftingInput();
  }
  if (typeof drawCraftingMenu === 'function') {
    drawCraftingMenu();
  }

  // Draw player selection menu
  if (typeof drawPlayerSelectionMenu === 'function') {
    drawPlayerSelectionMenu();
  }

  // Draw player transfer menu
  if (typeof drawPlayerTransferMenu === 'function') {
    drawPlayerTransferMenu();
  }

  drawBloodMoonOverlay();

  // Draw fog
  tint(255, 200);
  const fogSize = width + 100;
  imageMode(CENTER);
  // Center fog
  let fogX = pX + camX + 600;
  let fogY = pY + camY + 375;
  fogX = constrain(fogX, width / 2, width / 2);
  fogY = constrain(fogY, height / 2, height / 2);

  image(Fog, fogX, fogY, fogSize, fogSize);
  imageMode(CORNER);
  drawHealth();
  drawBossBar();
  drawUI();
  noTint();
  doRecoil();
  if (editorMode) {
    drawEditorUI();
    if (mouseIsPressed) {
      handleEditorClick();
    }
    // Sewer editor mode
    if (typeof handleSewerEditorMode === 'function') {
      handleSewerEditorMode();
    }
    if (typeof drawSewerEditorUI === 'function') {
      drawSewerEditorUI();
    }
  }
}


function startEndingSequence() {
  endingPhase = 1;
  endingTimer = frameCount;
}

let endingPhase = 0;
let endingTimer = 0;
let endingFadeAlpha = 0;

function updateEnding() {
  if (endingPhase === 0) return;

  if (endingPhase === 1) {
    // Wait 4 seconds (approx 240 frames at 60fps)
    if (frameCount - endingTimer > 240) {
      endingPhase = 2;
    }
  } else if (endingPhase === 2) {
    // Fade to black
    endingFadeAlpha = lerp(endingFadeAlpha, 255, 0.02);
    if (endingFadeAlpha > 250) {
      endingFadeAlpha = 255;
      endingPhase = 3;

      // Clear any existing messages before ending dialogue
      messages = [];

      const endDialogue = [
        "Hephaestus: It's... over. The machines are silent.",
        "Atlas: I still can't believe it. The network is gone.",
        "Daedalus: Centuries of domination... ended by one survivor.",
        "Prometheus: Bastian, you have done what none of us thought possible.",
        "Hephaestus: You brought fire back to mankind.",
        "Atlas: The cities will wake again.",
        "Daedalus: The world will rebuild.",
        "Prometheus: Humanity endures... because of you, Bastian.",
        "Hephaestus: The age of machines is finished.",
        "Prometheus: The world has been reforged."
      ];

      messages.push(new Message("dialogue", endDialogue, "Ending", true));
    }
  } else if (endingPhase === 4) {
    // Fade in "REFORGE" title
    reforgeTitleAlpha = lerp(reforgeTitleAlpha, 255, 0.02);
    if (reforgeTitleAlpha > 250) {
      reforgeTitleAlpha = 255;
      if (frameCount % 300 === 0) { // Stay on screen for a bit before reset
        location.reload();
      }
    }
  }
}

let reforgeTitleAlpha = 0;

function drawEndingOverlay() {
  if (endingFadeAlpha > 0) {
    push();
    resetMatrix();
    fill(0, 0, 0, endingFadeAlpha);
    noStroke();
    rect(0, 0, width, height);

    if (endingPhase === 3) {
      textAlign(CENTER, CENTER);
      messageDisplay();
    }

    if (endingPhase === 4) {
      textAlign(CENTER, CENTER);
      textFont(Silkscreen);

      // Glow effect for title
      drawingContext.shadowBlur = 25;
      drawingContext.shadowColor = 'rgba(255, 150, 0, 0.8)';

      fill(255, 150, 0, reforgeTitleAlpha);
      textSize(100);
      text("REFORGE", width / 2, height / 2);

      drawingContext.shadowBlur = 0;
    }
    pop();
  }
}

function resetToMainMenu() {
  location.reload();
}

// Editor helper functions
function getTile(row, col, layer = 0) {
  const cell = gameWorld[row]?.[col];
  if (!cell) return null;
  if ('layers' in cell) {
    return cell.layers[layer] || null;
  }
  return (layer === 0) ? cell : null; // Failsafe layer 0
}

function setTile(row, col, layer, type, rotation = 0, flipH = false, flipV = false, colorIndex = 0) {
  if (!gameWorld[row]) gameWorld[row] = [];
  if (!gameWorld[row][col]) {
    gameWorld[row][col] = { layers: [null, null, null, null, null] };
  } else if (!('layers' in gameWorld[row][col])) {
    const old = gameWorld[row][col];
    gameWorld[row][col] = { layers: [old, null, null, null, null] };
  }
  while (gameWorld[row][col].layers.length < 5) {
    gameWorld[row][col].layers.push(null);
  }
  gameWorld[row][col].layers[layer] = (type == null) ? null : {
    type: parseInt(type, 10),
    rotation: parseInt(rotation, 10) || 0,
    flipH: flipH || false,
    flipV: flipV || false,
    colorIndex: parseInt(colorIndex, 10) || 0
  };
}

// Helper function to clear a tile
function clearTile(row, col, layer) {
  setTile(row, col, layer, null);
  if (typeof updateTileWalls === 'function') updateTileWalls();
}

// Convert world to a string
// Cheesy goodness
function worldToString(world) {
  let out = "";
  for (let r = 0; r < world.length; r++) {
    const row = world[r];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (c > 0) out += "/";

      if (!cell) continue;

      if ('layers' in cell) {
        const parts = cell.layers.map(t => {
          if (!t) return "";
          let s = String(t.type);
          if (t.rotation && t.rotation !== 0) s += ":" + t.rotation;
          // Flip notation
          if (t.flipH || t.flipV) {
            if (!t.rotation) s += ":0";
            s += ":" + (t.flipH ? "H" : "") + (t.flipV ? "V" : "");
          }
          // Color index notation
          if (t.colorIndex && t.colorIndex !== 0) {
            if (!t.rotation && !t.flipH && !t.flipV) s += ":0";
            if (!t.flipH && !t.flipV) s += ":";
            s += ":C" + t.colorIndex;
          }
          // Add crate inventory if necessary (type 5)
          if (t.type === 5) {
            const crateKey = r + "," + c;
            if (crateInventories.has(crateKey)) {
              const items = crateInventories.get(crateKey);
              // Gets item indices
              const itemIndices = items.map(itemConstructor =>
                itemConstructors.findIndex(ic =>
                  ic[0] === itemConstructor[0] && ic[1] === itemConstructor[1]
                )
              ).filter(idx => idx !== -1);
              if (itemIndices.length > 0) {
                s += "@" + itemIndices.join(".");
              }
            }
          }
          return s;
        });
        out += parts.join(",");
      } else {
        let s = String(cell.type);
        if (cell.rotation && cell.rotation !== 0) s += ":" + cell.rotation;
        // Flip notation
        if (cell.flipH || cell.flipV) {
          if (!cell.rotation) s += ":0";
          s += ":" + (cell.flipH ? "H" : "") + (cell.flipV ? "V" : "");
        }
        // Check for crate inventories
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

  // Add sewer links with ~ separator
  if (typeof sewerLinksToString === 'function') {
    const sewerData = sewerLinksToString();
    if (sewerData) {
      out += "~" + sewerData;
    }
  }

  return out;
}

// Parses world string
function stringToWorld(s) {
  if (!s) {
    console.log("No string provided to stringToWorld");
    return [];
  }

  crateInventories.clear();

  // Check sewer links (~ separator)
  let mainData = s;
  if (s.includes("~")) {
    const sewerParts = s.split("~");
    mainData = sewerParts[0];
    if (typeof stringToSewerLinks === 'function' && sewerParts[1]) {
      stringToSewerLinks(sewerParts[1]);
    }
  }

  // Check particle sources (& separator)
  let worldData = mainData;
  if (mainData.includes("&")) {
    const parts = mainData.split("&");
    worldData = parts[0];
    const psData = parts[1];

    // Parse particle sources
    if (typeof particleSources !== 'undefined') {
      particleSources.length = 0;
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
            layer: vals[12] || 0
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
        const layerStrs = cellStr.split(",");
        const layers = [null, null, null, null, null];
        let crateItemsForCell = null;
        let crateLayerIndex = -1;

        for (let L = 0; L < 5 && L < layerStrs.length; L++) {
          const tstr = layerStrs[L].trim();
          if (tstr === "") { layers[L] = null; continue; }

          // Check crate inventory (@ separator)
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

          // Store crate items info
          if (crateItemsStr && layers[L] && layers[L].type === 5) {
            crateItemsForCell = crateItemsStr;
            crateLayerIndex = L;
          }
        }

        // Process crate items
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

  // Fade out starting at 700px, completely transparent by 300px
  const fadeStartDistance = 700;
  const fadeEndDistance = 300;
  let waypointAlpha;

  if (distToWaypoint <= fadeEndDistance) {
    // Close: completely transparent
    waypointAlpha = 0;
  } else if (distToWaypoint < fadeStartDistance) {
    // Fading zone: fade from 255 (at 700px) to 0 (at 300px)
    waypointAlpha = map(distToWaypoint, fadeEndDistance, fadeStartDistance, 0, 255);
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

// Get the appropriate multi-tile section based on position
// Returns null if this tile is not the top-left of a multi-tile, or { section, isTopLeft }
function getMultiTileSection(row, col, layer, tileType) {
  const config = multiTileConfig[tileType];
  if (!config || !config.sections || config.sections.length === 0) return null;

  // Check if this is the top-left corner of a multi-tile placement
  let isTopLeft = true;
  for (let r = 0; r < config.height; r++) {
    for (let c = 0; c < config.width; c++) {
      if (r === 0 && c === 0) continue; // Skip top-left itself
      if (!isSameTileType(row + r, col + c, layer, tileType)) {
        isTopLeft = false;
        break;
      }
    }
    if (!isTopLeft) break;
  }

  if (!isTopLeft) {
    // Check if this tile is part of a multi-tile (but not top-left)
    // Look backwards to find the top-left
    for (let r = 0; r < config.height; r++) {
      for (let c = 0; c < config.width; c++) {
        const checkRow = row - r;
        const checkCol = col - c;
        if (checkRow < 0 || checkCol < 0) continue;

        // Check if this position could be the top-left
        let isValidTopLeft = isSameTileType(checkRow, checkCol, layer, tileType);
        if (isValidTopLeft) {
          for (let dr = 0; dr < config.height; dr++) {
            for (let dc = 0; dc < config.width; dc++) {
              if (!isSameTileType(checkRow + dr, checkCol + dc, layer, tileType)) {
                isValidTopLeft = false;
                break;
              }
            }
            if (!isValidTopLeft) break;
          }

          if (isValidTopLeft) {
            // This tile is part of the multi-tile, return skip marker
            return { section: null, isTopLeft: false, shouldSkip: true };
          }
        }
      }
    }
    return null; // Not part of a valid multi-tile
  }

  // This is the top-left, return all sections
  return { sections: config.sections, isTopLeft: true, width: config.width, height: config.height };
}

// Get the appropriate workbench variant based on position in 2x2 grid
// Workbench (6) uses variants: top_left, top_right, bottom_left, bottom_right
function getWorkbenchVariant(row, col, layer, tileType) {
  if (tileType !== 6) return null;

  // Check if this is part of a 2x2 workbench cluster
  const hasRight = isSameTileType(row, col + 1, layer, tileType);
  const hasBottom = isSameTileType(row + 1, col, layer, tileType);
  const hasLeft = isSameTileType(row, col - 1, layer, tileType);
  const hasTop = isSameTileType(row - 1, col, layer, tileType);

  let variant = 'top_left'; // default

  // Determine position in 2x2 grid based on which neighbors exist
  if (hasRight && hasBottom && !hasLeft && !hasTop) {
    variant = 'top_left';
  } else if (hasLeft && hasBottom && !hasRight && !hasTop) {
    variant = 'top_right';
  } else if (hasRight && hasTop && !hasLeft && !hasBottom) {
    variant = 'bottom_left';
  } else if (hasLeft && hasTop && !hasRight && !hasBottom) {
    variant = 'bottom_right';
  }
  // If it doesn't match a 2x2 pattern, just use top_left as fallback

  const config = tileVariants[6];
  if (!config || !config.variants || !config.variants[variant]) {
    console.error("Workbench variant missing:", variant);
    return null;
  }

  return { variant, rotation: 0, flipH: false, baseImg: config.variants[variant] };
}

// Get the appropriate tree variant based on position in 1x2 grid
// Tree (41) uses variants: top, bottom
function getTreeVariant(row, col, layer, tileType) {
  if (tileType !== 41 && tileType !== 45) return null;

  // Check if this is part of a 1x2 tree cluster
  const hasBottom = isSameTileType(row + 1, col, layer, tileType);
  const hasTop = isSameTileType(row - 1, col, layer, tileType);

  let variant = 'top'; // default

  // Determine position in 1x2 grid based on which neighbors exist
  if (hasBottom && !hasTop) {
    variant = 'top';
  } else if (hasTop && !hasBottom) {
    variant = 'bottom';
  }
  // If it doesn't match a 1x2 pattern, just use top as fallback

  const config = tileVariants[41];
  const config2 = tileVariants[45];
  if ((!config || !config.variants || !config.variants[variant]) || (!config2 || !config2.variants || !config2.variants[variant])) {
    console.error("Tree variant missing:", variant);
    return null;
  }

  return { variant, rotation: 0, flipH: false, baseImg: config.variants[variant] };
}

// Get the appropriate lampost variant based on position in 1x2 grid
// Lampost (36) uses variants: top, bottom
function getLampostVariant(row, col, layer, tileType) {
  if (tileType !== 36) return null;

  // Check if this is part of a 1x2 lampost cluster
  const hasBottom = isSameTileType(row + 1, col, layer, tileType);
  const hasTop = isSameTileType(row - 1, col, layer, tileType);

  let variant = 'top'; // default

  // Determine position in 1x2 grid based on which neighbors exist
  if (hasBottom && !hasTop) {
    variant = 'top';
  } else if (hasTop && !hasBottom) {
    variant = 'bottom';
  }
  // If it doesn't match a 1x2 pattern, just use top as fallback

  const config = tileVariants[36];
  if (!config || !config.variants || !config.variants[variant]) {
    console.error("Lampost variant missing:", variant);
    return null;
  }

  return { variant, rotation: 0, flipH: false, baseImg: config.variants[variant] };
}

// Get the appropriate bench variant based on position in 2x1 grid
// Bench (37) uses variants: left, right
function getBenchVariant(row, col, layer, tileType) {
  if (tileType !== 37) return null;

  // Check if this is part of a 2x1 bench cluster
  const hasRight = isSameTileType(row, col + 1, layer, tileType);
  const hasLeft = isSameTileType(row, col - 1, layer, tileType);

  let variant = 'left'; // default

  // Determine position in 2x1 grid based on which neighbors exist
  if (hasRight && !hasLeft) {
    variant = 'left';
  } else if (hasLeft && !hasRight) {
    variant = 'right';
  }
  // If it doesn't match a 2x1 pattern, just use left as fallback

  const config = tileVariants[37];
  if (!config || !config.variants || !config.variants[variant]) {
    console.error("Bench variant missing:", variant);
    return null;
  }

  return { variant, rotation: 0, flipH: false, baseImg: config.variants[variant] };
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
  // Buschy year
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

      // Check for roof scale (smooth scale transition) - layers 1-4 can be roofs
      let roofScaleValue = 1.0;
      if (layerIndex >= 1 && layerIndex <= 4 && tileWalls[tileType] === 2) {
        const __k = tileKey(i, j);
        if (roofScale.has(__k)) {
          roofScaleValue = roofScale.get(__k);
        }
        if (roofScaleValue <= 0.01) continue; // fully scaled down; skip draw
      }

      // Check if this is a multi-tile (generalized system)
      const multiTileInfo = getMultiTileSection(i, j, layerIndex, tileType);
      if (multiTileInfo) {
        if (multiTileInfo.shouldSkip) {
          continue; // Skip drawing non-top-left parts of multi-tile
        }
        if (multiTileInfo.isTopLeft) {
          // Draw all sections of the multi-tile
          const sections = multiTileInfo.sections;
          for (let r = 0; r < multiTileInfo.height; r++) {
            for (let c = 0; c < multiTileInfo.width; c++) {
              const section = sections[r][c];
              if (section) {
                image(section, (j + c) * 50, (i + r) * 50, 50, 50);
              }
            }
          }
          continue; // Done with this multi-tile
        }
      }

      // Determine which image to draw (use cached tinted version)
      let imgToDraw = null;
      let finalRotation = rotation;

      // Check if this is a workbench tile (2x2 multi-tile using variants)
      if (tileType === 6) {
        const workbenchInfo = getWorkbenchVariant(i, j, layerIndex, tileType);
        if (workbenchInfo && workbenchInfo.baseImg) {
          imgToDraw = workbenchInfo.baseImg;
          finalRotation = workbenchInfo.rotation;
        }
      }
      // Check if this is a tree tile (1x2 multi-tile using variants)
      else if (tileType === 41) {
        const treeInfo = getTreeVariant(i, j, layerIndex, tileType);
        if (treeInfo && treeInfo.baseImg) {
          imgToDraw = treeInfo.baseImg;
          finalRotation = treeInfo.rotation;
        }
      }
      // Check if this is a lampost tile (1x2 multi-tile using variants)
      else if (tileType === 36) {
        const lampostInfo = getLampostVariant(i, j, layerIndex, tileType);
        if (lampostInfo && lampostInfo.baseImg) {
          imgToDraw = lampostInfo.baseImg;
          finalRotation = lampostInfo.rotation;
        }
      }
      // Check if this is a bench tile (2x1 multi-tile using variants)
      else if (tileType === 37) {
        const benchInfo = getBenchVariant(i, j, layerIndex, tileType);
        if (benchInfo && benchInfo.baseImg) {
          imgToDraw = benchInfo.baseImg;
          finalRotation = benchInfo.rotation;
        }
      }
      // Check if this is a pipe tile (auto-connect pipes using variants)
      else if (tileType === 27) {
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

      // Draw the tile (apply rotation, flips, and scale)
      const needsTransform = finalRotation > 0 || tileObj.flipH || tileObj.flipV || roofScaleValue < 1.0;
      if (imgToDraw) {
        if (needsTransform) {
          push();
          translate(j * 50 + 25, i * 50 + 25);
          rotate(radians(finalRotation));
          scale(
            (tileObj.flipH ? -1 : 1) * roofScaleValue,
            (tileObj.flipV ? -1 : 1) * roofScaleValue
          );
          image(imgToDraw, -25, -25, 50, 50);
          pop();
        } else {
          image(imgToDraw, j * 50, i * 50, 50, 50);
        }
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

      // Only draw particles within viewport
      if (p.x >= viewLeft && p.x <= viewRight &&
        p.y >= viewTop && p.y <= viewBottom) {
        p.draw(); // Draw particle normally (scale system doesn't affect particles)
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
              if (typeof playCrateDestroyedSfx === "function") playCrateDestroyedSfx();
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
            if (typeof playCrateDestroyedSfx === "function") playCrateDestroyedSfx();
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

/* ========= Roof scale animation system (smooth scale transition, no tint) ========= */
const ROOF_SCALE_SPEED = 0.08; // How fast roofs scale (0-1)
const ROOF_MAX_DISTANCE = 25;  // max tiles to flood fill from player
let roofScale = new Map();     // key "row,col" -> current scale (0.0 to 1.0)
let roofTarget = new Set();    // keys that should scale down this frame
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
  // Scale targets toward 0 (hidden)
  for (const k of roofTarget) {
    const currScale = roofScale.has(k) ? roofScale.get(k) : 1.0;
    if (currScale <= 0.01) {
      roofScale.set(k, 0);
      continue;
    }

    // Smooth lerp toward 0
    const newScale = Math.max(0, currScale - ROOF_SCALE_SPEED);
    roofScale.set(k, newScale);
  }

  // Scale non-targets back toward 1.0 (visible)
  const toDelete = [];
  for (const [k, currScale] of roofScale.entries()) {
    if (roofTarget.has(k)) continue;
    if (currScale >= 0.99) {
      toDelete.push(k);
      continue;
    }

    // Smooth lerp toward 1.0
    const newScale = Math.min(1.0, currScale + ROOF_SCALE_SPEED);
    if (newScale >= 0.99) {
      toDelete.push(k);
    } else {
      roofScale.set(k, newScale);
    }
  }

  // Batch delete fully visible tiles
  for (const k of toDelete) {
    roofScale.delete(k);
  }
}
/* ====== End roof scale animation system ====== */

// --- Sprayer flip animation state ---
let currentSprayerFlip = 0; // current flip angle (0 or 180)
let targetSprayerFlip = 0;  // target flip angle

// --- Only-sprayer-rotates helper (uses your calculateAim()) ---
function drawGunDebugRect() {
  push(); // isolate transforms

  // Move pivot to player's on-screen center (mouseX/mouseY are screen coords)
  translate(pX + 600 + pWidth / 2, pY + 375 + pHeight / 2);

  // Rotate local axes towards the mouse
  const aimAngle = calculateAim();
  rotate(aimAngle);

  // Determine if sprayer should flip based on mouse position relative to player
  // Calculate player center in screen coordinates
  const playerScreenX = pX + camX + 600 + pWidth / 2;

  // If mouse is to the left of player, flip the sprayer
  if (mouseX < playerScreenX) {
    targetSprayerFlip = 180;
  } else {
    targetSprayerFlip = 0;
  }

  // Smoothly interpolate current flip to target flip
  currentSprayerFlip = lerp(currentSprayerFlip, targetSprayerFlip, 0.2);

  // Apply the flip rotation (around X-axis conceptually, but we scale Y)
  push();
  translate(25, 0); // move to sprayer position

  // Flip by scaling Y when needed
  const flipScale = cos(radians(currentSprayerFlip));
  scale(1, flipScale);

  // Draw the item image pointing along +X with proper sizing
  if (inventoryList[inventorySlot - 1] != null) {
    if (inventorySlot - 1 < inventoryList.length) {
      const item = inventoryList[inventorySlot - 1];

      // Determine base size based on item type
      let baseSize = 30; // Default for sprayers

      if (item.type === "bullet") {
        baseSize = 18;
      } else if (item.type === "sprayer") {
        baseSize = 52;
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

// Helper function to get sprayer barrel position in world coordinates
function getGunBarrelPosition() {
  const angle = calculateAim();
  const sprayerLength = 30;
  const sprayerOffset = 25;
  const barrelDistance = sprayerOffset + sprayerLength; // total distance to barrel tip

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
    if (inventoryList[inventorySlot - 1].type == "sprayer") {
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

// Draw leak repair prompt
let leakPrompt = null;
function drawLeakPromptIfNeeded() {
  if (!leakPrompt) leakPrompt = createPrompt();

  if (nearestLeak) {
    handleInteractionPrompt(
      leakPrompt,
      nearestLeak.x,
      nearestLeak.y,
      120,
      "Press E to Repair Leak",
      true,
      [255, 150, 0]
    );
  } else {
    leakPrompt.update(false);
    leakPrompt.draw("");
  }
}

// Draw red alarm flash overlay
function drawAlarmFlash() {
  if (triggerList.Objective.fixBoiler) return; // Stop alarm after fixing the boiler

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

function spawnEnemies() {
  enemies.push(new Enemy("harpy", 16584, 15523));
  enemies.push(new Enemy("harpy", 16768, 15536));
  enemies.push(new Enemy("harpy", 16776, 15785));
  enemies.push(new Enemy("harpy", 16586, 15787));

  enemies.push(new Enemy("harpy", 15626, 16880));
  enemies.push(new Enemy("greg", 15882, 16877));
  enemies.push(new Enemy("harpy", 15878, 17121));
  enemies.push(new Enemy("greg", 15631, 17125));

  enemies.push(new Enemy("harpy", 20564, 17815));
  enemies.push(new Enemy("harpy", 20440, 17967));
  enemies.push(new Enemy("harpy", 20717, 17982));
  enemies.push(new Enemy("harpy", 20576, 18117));

  enemies.push(new Enemy("greg", 8473, 23027));
  enemies.push(new Enemy("greg", 8674, 23226));
  enemies.push(new Enemy("greg", 8470, 23427));
  enemies.push(new Enemy("greg", 8283, 23227));
  enemies.push(new Enemy("harpy", 8229, 22998));
  enemies.push(new Enemy("harpy", 8733, 22988));
  enemies.push(new Enemy("harpy", 8712, 23483));
  enemies.push(new Enemy("harpy", 8226, 23476));

  enemies.push(new Enemy("harpy", 18979, 15578));
  enemies.push(new Enemy("harpy", 19115, 15437));
  enemies.push(new Enemy("harpy", 18979, 15294));
  enemies.push(new Enemy("harpy", 18835, 15414));
  enemies.push(new Enemy("greg", 18072, 13972));
  enemies.push(new Enemy("harpy", 17775, 13833));
  enemies.push(new Enemy("harpy", 18059, 13837));
  enemies.push(new Enemy("harpy", 18357, 13847));
  enemies.push(new Enemy("harpy", 18379, 14142));
  enemies.push(new Enemy("harpy", 18085, 14127));
  enemies.push(new Enemy("harpy", 17790, 14127));
  enemies.push(new Enemy("greg", 19022, 11726));
  enemies.push(new Enemy("greg", 19024, 12025));
  enemies.push(new Enemy("greg", 18873, 11887));
  enemies.push(new Enemy("greg", 19170, 11873));
  enemies.push(new Enemy("harpy", 15972, 9676));
  enemies.push(new Enemy("harpy", 16176, 9675));
  enemies.push(new Enemy("harpy", 16174, 9474));
  enemies.push(new Enemy("harpy", 15973, 9476));
  enemies.push(new Enemy("harpy", 19257, 16475));
  enemies.push(new Enemy("harpy", 19364, 16234));
  enemies.push(new Enemy("harpy", 19493, 16492));
  enemies.push(new Enemy("greg", 20834, 16834));
  enemies.push(new Enemy("greg", 20927, 17133));
  enemies.push(new Enemy("harpy", 21019, 16931));
  enemies.push(new Enemy("harpy", 20713, 17028));
  enemies.push(new Enemy("harpy", 16475, 19471));
  enemies.push(new Enemy("harpy", 16672, 19578));
  enemies.push(new Enemy("harpy", 16576, 19776));
  enemies.push(new Enemy("harpy", 16374, 19679));
  enemies.push(new Enemy("greg", 12977, 19727));
  enemies.push(new Enemy("greg", 12676, 19725));
  enemies.push(new Enemy("greg", 12672, 19424));
  enemies.push(new Enemy("greg", 12972, 19425));
  enemies.push(new Enemy("harpy", 12957, 14766));
  enemies.push(new Enemy("harpy", 13913, 15952));
  enemies.push(new Enemy("harpy", 12682, 16637));
  enemies.push(new Enemy("harpy", 11510, 16115));
  enemies.push(new Enemy("harpy", 11529, 17531));
  enemies.push(new Enemy("harpy", 9945, 18981));
  enemies.push(new Enemy("harpy", 11438, 20232));
  enemies.push(new Enemy("harpy", 12472, 21285));
  enemies.push(new Enemy("harpy", 11068, 23192));
  enemies.push(new Enemy("harpy", 12066, 24196));
  enemies.push(new Enemy("harpy", 10433, 24706));
  enemies.push(new Enemy("harpy", 9243, 24118));
  enemies.push(new Enemy("harpy", 7408, 24765));
  enemies.push(new Enemy("harpy", 7138, 23968));
  enemies.push(new Enemy("harpy", 7883, 22782));
  enemies.push(new Enemy("harpy", 7507, 21848));
  enemies.push(new Enemy("harpy", 8114, 21529));
  enemies.push(new Enemy("harpy", 7286, 21277));
  enemies.push(new Enemy("harpy", 8077, 20580));
  enemies.push(new Enemy("harpy", 7631, 19967));
  enemies.push(new Enemy("harpy", 6831, 19732));
  enemies.push(new Enemy("harpy", 5632, 19820));
  enemies.push(new Enemy("harpy", 5129, 19241));
  enemies.push(new Enemy("harpy", 4387, 19807));
  enemies.push(new Enemy("harpy", 4992, 20474));
  enemies.push(new Enemy("harpy", 4272, 21149));
  enemies.push(new Enemy("harpy", 3603, 21234));
  enemies.push(new Enemy("harpy", 3214, 20824));
  enemies.push(new Enemy("harpy", 3513, 20383));
  enemies.push(new Enemy("harpy", 2404, 20025));
  enemies.push(new Enemy("harpy", 2540, 19479));
  enemies.push(new Enemy("harpy", 1816, 20484));
  enemies.push(new Enemy("harpy", 2045, 21067));
  enemies.push(new Enemy("harpy", 2667, 21644));
  enemies.push(new Enemy("harpy", 2167, 22293));
  enemies.push(new Enemy("harpy", 2923, 22591));
  enemies.push(new Enemy("harpy", 3521, 22969));
  enemies.push(new Enemy("harpy", 3214, 23573));
  enemies.push(new Enemy("harpy", 2761, 24025));
  enemies.push(new Enemy("harpy", 15147, 11119));
  enemies.push(new Enemy("harpy", 14878, 10368));
  enemies.push(new Enemy("harpy", 13591, 9745));
  enemies.push(new Enemy("harpy", 14032, 8872));
  enemies.push(new Enemy("harpy", 12949, 8300));
  enemies.push(new Enemy("harpy", 13612, 7464));
  enemies.push(new Enemy("harpy", 14745, 7490));
  enemies.push(new Enemy("harpy", 15585, 7487));
  enemies.push(new Enemy("harpy", 16814, 7490));
  enemies.push(new Enemy("harpy", 17320, 6616));
  enemies.push(new Enemy("harpy", 18367, 6896));
  enemies.push(new Enemy("harpy", 19588, 6346));
  enemies.push(new Enemy("harpy", 19068, 5254));
  enemies.push(new Enemy("harpy", 19560, 3862));
  enemies.push(new Enemy("harpy", 20695, 3814));
  enemies.push(new Enemy("harpy", 21156, 4406));
  enemies.push(new Enemy("harpy", 21094, 4991));
  enemies.push(new Enemy("harpy", 21420, 5933));
  enemies.push(new Enemy("harpy", 22200, 5694));
  enemies.push(new Enemy("harpy", 22176, 5085));
  enemies.push(new Enemy("harpy", 22176, 4419));
  enemies.push(new Enemy("harpy", 22176, 3726));
  enemies.push(new Enemy("harpy", 21353, 3441));
  enemies.push(new Enemy("harpy", 21242, 2743));
  enemies.push(new Enemy("harpy", 20562, 2162));
  enemies.push(new Enemy("harpy", 21947, 1909));
  enemies.push(new Enemy("harpy", 21451, 1131));
  enemies.push(new Enemy("harpy", 22497, 952));
  enemies.push(new Enemy("harpy", 23426, 1172));
  enemies.push(new Enemy("harpy", 23831, 344));
  enemies.push(new Enemy("harpy", 21421, 585));
  enemies.push(new Enemy("harpy", 20450, 1269));
  enemies.push(new Enemy("harpy", 19453, 1938));
  enemies.push(new Enemy("harpy", 19029, 2503));
  enemies.push(new Enemy("harpy", 18277, 2251));
  enemies.push(new Enemy("harpy", 18003, 1632));
  enemies.push(new Enemy("harpy", 17610, 1332));
  enemies.push(new Enemy("harpy", 18036, 849));
  enemies.push(new Enemy("harpy", 17484, 217));
  enemies.push(new Enemy("harpy", 16279, 1209));
  enemies.push(new Enemy("harpy", 16493, 1689));
  enemies.push(new Enemy("harpy", 15643, 1731));
  enemies.push(new Enemy("harpy", 14931, 1255));
  enemies.push(new Enemy("harpy", 14337, 1868));
  enemies.push(new Enemy("harpy", 14538, 2317));
  enemies.push(new Enemy("harpy", 13861, 2616));
  enemies.push(new Enemy("harpy", 13577, 2973));
  enemies.push(new Enemy("harpy", 12954, 2066));
  enemies.push(new Enemy("harpy", 13291, 1534));
  enemies.push(new Enemy("harpy", 11942, 1042));
  enemies.push(new Enemy("harpy", 10855, 1145));
  enemies.push(new Enemy("harpy", 9713, 1549));
  enemies.push(new Enemy("harpy", 8849, 1811));
  enemies.push(new Enemy("harpy", 8258, 1254));
  enemies.push(new Enemy("harpy", 7230, 735));
  enemies.push(new Enemy("harpy", 6123, 1797));
  enemies.push(new Enemy("harpy", 5545, 2148));
  enemies.push(new Enemy("harpy", 4243, 2070));
  enemies.push(new Enemy("harpy", 4557, 3074));
  enemies.push(new Enemy("harpy", 4768, 3531));
  enemies.push(new Enemy("harpy", 4165, 4333));
  enemies.push(new Enemy("harpy", 5027, 4665));
  enemies.push(new Enemy("harpy", 3987, 5124));
  enemies.push(new Enemy("harpy", 3469, 4833));
  enemies.push(new Enemy("harpy", 2578, 4822));
  enemies.push(new Enemy("harpy", 1855, 4823));
  enemies.push(new Enemy("harpy", 1413, 5303));
  enemies.push(new Enemy("harpy", 533, 5330));
  enemies.push(new Enemy("harpy", 1299, 6132));
  enemies.push(new Enemy("harpy", 1931, 6607));
  enemies.push(new Enemy("harpy", 812, 6874));
  enemies.push(new Enemy("harpy", 2204, 7507));
  enemies.push(new Enemy("harpy", 2983, 7943));
  enemies.push(new Enemy("harpy", 1845, 8241));
  enemies.push(new Enemy("harpy", 1252, 8794));
  enemies.push(new Enemy("harpy", 2341, 8788));
  enemies.push(new Enemy("harpy", 3254, 8683));
  enemies.push(new Enemy("harpy", 3682, 8690));
  enemies.push(new Enemy("harpy", 11878, 14915));
  enemies.push(new Enemy("harpy", 11170, 14999));
  enemies.push(new Enemy("harpy", 10638, 14475));
  enemies.push(new Enemy("harpy", 9754, 14478));
  enemies.push(new Enemy("harpy", 8929, 15054));
  enemies.push(new Enemy("harpy", 8289, 15718));
  enemies.push(new Enemy("harpy", 7620, 16620));
  enemies.push(new Enemy("harpy", 7092, 15951));
  enemies.push(new Enemy("harpy", 5991, 16489));
  enemies.push(new Enemy("harpy", 6332, 17420));
  enemies.push(new Enemy("harpy", 4881, 17667));
  enemies.push(new Enemy("harpy", 10437, 16707));
  enemies.push(new Enemy("harpy", 10491, 17326));
  enemies.push(new Enemy("harpy", 9368, 17257));
  enemies.push(new Enemy("harpy", 8590, 16894));
  enemies.push(new Enemy("harpy", 8962, 16683));
  enemies.push(new Enemy("harpy", 8762, 16555));
  enemies.push(new Enemy("harpy", 7719, 17318));
  enemies.push(new Enemy("harpy", 7166, 17065));
  enemies.push(new Enemy("harpy", 6721, 16568));
  enemies.push(new Enemy("harpy", 6047, 17390));
  enemies.push(new Enemy("harpy", 4536, 18461));
  enemies.push(new Enemy("harpy", 3890, 18026));
  enemies.push(new Enemy("harpy", 3303, 17392));
  enemies.push(new Enemy("harpy", 2799, 18419));
  enemies.push(new Enemy("harpy", 1812, 19123));
  enemies.push(new Enemy("harpy", 1058, 18482));
  enemies.push(new Enemy("harpy", 837, 17814));
  enemies.push(new Enemy("harpy", 892, 17306));
  enemies.push(new Enemy("harpy", 441, 16997));
  enemies.push(new Enemy("harpy", 966, 16621));
  enemies.push(new Enemy("harpy", 249, 16286));
  enemies.push(new Enemy("harpy", 1178, 15967));
  enemies.push(new Enemy("harpy", 897, 15661));
  enemies.push(new Enemy("harpy", 360, 15229));
  enemies.push(new Enemy("harpy", 910, 14915));
  enemies.push(new Enemy("harpy", 785, 14630));
  enemies.push(new Enemy("harpy", 1628, 13719));
  enemies.push(new Enemy("harpy", 1087, 13585));
  enemies.push(new Enemy("harpy", 451, 13359));
  enemies.push(new Enemy("harpy", 81, 13078));
  enemies.push(new Enemy("harpy", 1824, 13204));
  enemies.push(new Enemy("harpy", 1400, 11558));
  enemies.push(new Enemy("harpy", 1941, 10984));
  enemies.push(new Enemy("harpy", 2558, 11610));
  enemies.push(new Enemy("harpy", 3141, 11236));
  enemies.push(new Enemy("harpy", 3526, 10732));
  enemies.push(new Enemy("harpy", 2753, 10242));
  enemies.push(new Enemy("harpy", 1726, 10199));
  enemies.push(new Enemy("greg", 2350, 11967));
  enemies.push(new Enemy("greg", 2389, 11027));
  enemies.push(new Enemy("greg", 3361, 10173));
  enemies.push(new Enemy("greg", 3865, 9859));
  enemies.push(new Enemy("greg", 3498, 8628));
  enemies.push(new Enemy("greg", 4730, 8253));
  enemies.push(new Enemy("greg", 5384, 7610));
  enemies.push(new Enemy("harpy", 5163, 7464));
  enemies.push(new Enemy("harpy", 5137, 7939));
  enemies.push(new Enemy("harpy", 4728, 6878));
  enemies.push(new Enemy("harpy", 4782, 6228));
  enemies.push(new Enemy("harpy", 5594, 6413));
  enemies.push(new Enemy("greg", 16054, 11963));
  enemies.push(new Enemy("harpy", 15964, 12197));
  enemies.push(new Enemy("harpy", 15754, 12066));
  enemies.push(new Enemy("harpy", 16475, 11259));
  enemies.push(new Enemy("harpy", 15847, 10642));
  enemies.push(new Enemy("harpy", 16907, 10078));
  enemies.push(new Enemy("harpy", 18172, 10160));
  enemies.push(new Enemy("harpy", 18426, 10711));
  enemies.push(new Enemy("harpy", 18819, 11311));
  enemies.push(new Enemy("harpy", 19253, 10821));
  enemies.push(new Enemy("harpy", 19040, 9852));
  enemies.push(new Enemy("harpy", 19907, 9393));
  enemies.push(new Enemy("harpy", 19467, 8885));
  enemies.push(new Enemy("harpy", 20745, 9835));
  enemies.push(new Enemy("harpy", 20550, 10545));
  enemies.push(new Enemy("harpy", 20549, 11168));
  enemies.push(new Enemy("harpy", 21465, 11185));
  enemies.push(new Enemy("harpy", 21971, 10568));
  enemies.push(new Enemy("harpy", 21861, 9892));
  enemies.push(new Enemy("harpy", 22515, 9348));
  enemies.push(new Enemy("harpy", 22396, 8951));
  enemies.push(new Enemy("harpy", 22172, 8482));
  enemies.push(new Enemy("harpy", 22859, 8732));
  enemies.push(new Enemy("harpy", 23373, 8440));
  enemies.push(new Enemy("harpy", 23415, 7750));
  enemies.push(new Enemy("harpy", 23004, 7296));
  enemies.push(new Enemy("harpy", 22448, 7218));
  enemies.push(new Enemy("harpy", 22016, 6807));
  enemies.push(new Enemy("harpy", 22370, 6308));
  enemies.push(new Enemy("harpy", 22842, 5859));
  enemies.push(new Enemy("harpy", 23540, 5694));
  enemies.push(new Enemy("harpy", 24081, 5664));
  enemies.push(new Enemy("harpy", 24710, 5257));
  enemies.push(new Enemy("harpy", 24297, 4800));
  enemies.push(new Enemy("harpy", 24720, 5876));
  enemies.push(new Enemy("harpy", 24367, 6230));
  enemies.push(new Enemy("harpy", 24095, 6599));
  enemies.push(new Enemy("harpy", 22086, 7065));
  enemies.push(new Enemy("harpy", 22169, 7648));
  enemies.push(new Enemy("harpy", 23061, 8811));
  enemies.push(new Enemy("harpy", 22981, 9405));
  enemies.push(new Enemy("harpy", 22481, 10735));
  enemies.push(new Enemy("harpy", 22731, 11271));
  enemies.push(new Enemy("harpy", 23661, 11380));
  enemies.push(new Enemy("harpy", 24551, 10782));
  enemies.push(new Enemy("harpy", 24619, 10361));
  enemies.push(new Enemy("harpy", 24179, 9883));
  enemies.push(new Enemy("harpy", 23779, 8978));
  enemies.push(new Enemy("harpy", 23318, 9957));
  enemies.push(new Enemy("harpy", 24025, 11320));
  enemies.push(new Enemy("harpy", 23708, 11710));
  enemies.push(new Enemy("harpy", 23708, 12349));
  enemies.push(new Enemy("harpy", 22922, 12864));
  enemies.push(new Enemy("harpy", 23886, 13263));
  enemies.push(new Enemy("harpy", 24071, 13678));
  enemies.push(new Enemy("harpy", 23185, 14016));
  enemies.push(new Enemy("harpy", 22390, 13626));
  enemies.push(new Enemy("harpy", 21861, 13306));
  enemies.push(new Enemy("harpy", 21509, 13647));
  enemies.push(new Enemy("harpy", 22187, 14146));
  enemies.push(new Enemy("harpy", 21369, 14294));
  enemies.push(new Enemy("harpy", 22428, 14885));
  enemies.push(new Enemy("harpy", 22898, 15342));
  enemies.push(new Enemy("harpy", 23340, 15742));
  enemies.push(new Enemy("harpy", 24147, 15379));
  enemies.push(new Enemy("harpy", 23968, 16317));
  enemies.push(new Enemy("harpy", 23020, 16528));
  enemies.push(new Enemy("harpy", 23390, 17323));
  enemies.push(new Enemy("harpy", 22756, 18008));
  enemies.push(new Enemy("harpy", 21801, 17900));
  enemies.push(new Enemy("harpy", 21326, 18070));
  enemies.push(new Enemy("harpy", 22151, 18808));
  enemies.push(new Enemy("harpy", 22662, 19438));
  enemies.push(new Enemy("harpy", 21788, 19778));
  enemies.push(new Enemy("harpy", 21417, 19376));
  enemies.push(new Enemy("harpy", 21317, 20072));
  enemies.push(new Enemy("harpy", 20924, 20417));
  enemies.push(new Enemy("harpy", 21179, 20977));
  enemies.push(new Enemy("harpy", 22060, 21323));
  enemies.push(new Enemy("harpy", 22875, 21041));
  enemies.push(new Enemy("harpy", 23807, 21186));
  enemies.push(new Enemy("harpy", 24210, 21656));
  enemies.push(new Enemy("harpy", 22662, 21542));
  enemies.push(new Enemy("harpy", 21130, 21744));
  enemies.push(new Enemy("harpy", 20922, 22319));
  enemies.push(new Enemy("harpy", 21466, 22588));
  enemies.push(new Enemy("harpy", 20600, 23049));
  enemies.push(new Enemy("harpy", 19732, 22568));
  enemies.push(new Enemy("harpy", 19643, 22125));
  enemies.push(new Enemy("harpy", 19030, 21167));
  enemies.push(new Enemy("harpy", 18381, 20609));
  enemies.push(new Enemy("harpy", 17558, 21388));
  enemies.push(new Enemy("harpy", 17335, 22003));
  enemies.push(new Enemy("harpy", 17683, 22609));
  enemies.push(new Enemy("harpy", 16998, 23026));
  enemies.push(new Enemy("harpy", 16789, 23434));
  enemies.push(new Enemy("harpy", 16345, 23902));
  enemies.push(new Enemy("harpy", 15849, 23345));
  enemies.push(new Enemy("harpy", 15923, 22862));
  enemies.push(new Enemy("harpy", 16154, 22022));
  enemies.push(new Enemy("harpy", 15738, 21325));
  enemies.push(new Enemy("harpy", 14840, 20653));
  enemies.push(new Enemy("harpy", 14471, 20018));
  enemies.push(new Enemy("harpy", 13749, 20857));
  enemies.push(new Enemy("harpy", 13720, 21315));
  enemies.push(new Enemy("harpy", 13029, 21699));
  enemies.push(new Enemy("harpy", 12987, 22684));
  enemies.push(new Enemy("harpy", 12415, 23023));
  enemies.push(new Enemy("harpy", 13191, 23487));
  enemies.push(new Enemy("harpy", 12476, 23736));
  enemies.push(new Enemy("harpy", 12143, 24135));
  enemies.push(new Enemy("harpy", 12560, 24704));
  enemies.push(new Enemy("harpy", 11720, 24982));
  enemies.push(new Enemy("harpy", 11330, 24958));
  enemies.push(new Enemy("harpy", 10911, 24571));
  enemies.push(new Enemy("harpy", 11394, 24297));
  enemies.push(new Enemy("harpy", 10617, 24031));
  enemies.push(new Enemy("harpy", 10138, 23572));
  enemies.push(new Enemy("harpy", 9582, 22958));
  enemies.push(new Enemy("harpy", 9853, 22646));
  enemies.push(new Enemy("harpy", 8669, 22887));
  enemies.push(new Enemy("harpy", 8038, 22492));
  enemies.push(new Enemy("harpy", 7205, 22404));
  enemies.push(new Enemy("harpy", 6464, 22781));
  enemies.push(new Enemy("harpy", 5702, 22324));
  enemies.push(new Enemy("harpy", 5390, 21645));
  enemies.push(new Enemy("harpy", 4650, 21474));
  enemies.push(new Enemy("harpy", 5479, 20952));
  enemies.push(new Enemy("harpy", 5754, 20605));
  enemies.push(new Enemy("harpy", 5338, 20147));
  enemies.push(new Enemy("harpy", 5013, 19743));
  enemies.push(new Enemy("harpy", 3849, 20090));
  enemies.push(new Enemy("harpy", 3137, 20572));
  enemies.push(new Enemy("harpy", 3757, 20936));
  enemies.push(new Enemy("harpy", 2840, 21207));
  enemies.push(new Enemy("harpy", 2455, 20911));
  enemies.push(new Enemy("harpy", 1978, 20431));
  enemies.push(new Enemy("harpy", 1667, 19935));
  enemies.push(new Enemy("harpy", 711, 20547));
  enemies.push(new Enemy("harpy", 442, 21143));
  enemies.push(new Enemy("harpy", 573, 21480));
  enemies.push(new Enemy("harpy", 984, 21757));
  enemies.push(new Enemy("harpy", 742, 22056));
  enemies.push(new Enemy("harpy", 907, 23487));
  enemies.push(new Enemy("harpy", 49, 23342));
  enemies.push(new Enemy("harpy", 838, 23779));
  enemies.push(new Enemy("harpy", 1154, 24543));
  enemies.push(new Enemy("greg", 13302, 10308));
  enemies.push(new Enemy("greg", 13668, 9353));
  enemies.push(new Enemy("greg", 11757, 8659));
  enemies.push(new Enemy("greg", 10394, 7599));
  enemies.push(new Enemy("greg", 9704, 9013));
  enemies.push(new Enemy("greg", 8742, 8628));
  enemies.push(new Enemy("greg", 9092, 9329));
  enemies.push(new Enemy("harpy", 9278, 9058));
  enemies.push(new Enemy("harpy", 9049, 8991));
  enemies.push(new Enemy("harpy", 8382, 9768));
  enemies.push(new Enemy("harpy", 6996, 9511));
  enemies.push(new Enemy("harpy", 6996, 8941));
  enemies.push(new Enemy("greg", 5791, 9347));
  enemies.push(new Enemy("greg", 5727, 10355));
  enemies.push(new Enemy("greg", 5812, 10972));
  enemies.push(new Enemy("greg", 5827, 11699));
  enemies.push(new Enemy("greg", 5835, 12387));
  enemies.push(new Enemy("harpy", 6135, 12368));
  enemies.push(new Enemy("harpy", 5508, 11765));
  enemies.push(new Enemy("harpy", 6242, 11327));
  enemies.push(new Enemy("harpy", 7114, 12031));
  enemies.push(new Enemy("harpy", 7031, 12719));
  enemies.push(new Enemy("harpy", 5885, 13128));
  enemies.push(new Enemy("harpy", 5364, 13617));
  enemies.push(new Enemy("greg", 4419, 13734));
  enemies.push(new Enemy("greg", 4337, 13290));
  enemies.push(new Enemy("greg", 3275, 13237));
  enemies.push(new Enemy("greg", 3142, 14319));
  enemies.push(new Enemy("harpy", 2653, 13566));
  enemies.push(new Enemy("harpy", 3552, 14693));
  enemies.push(new Enemy("harpy", 3895, 15292));
  enemies.push(new Enemy("harpy", 4098, 16000));
  enemies.push(new Enemy("harpy", 3034, 16292));
  enemies.push(new Enemy("harpy", 4508, 16944));
  enemies.push(new Enemy("harpy", 4373, 17746));
  enemies.push(new Enemy("greg", 4761, 18625));
  enemies.push(new Enemy("greg", 4068, 19153));
  enemies.push(new Enemy("greg", 4188, 20166));
  enemies.push(new Enemy("greg", 4974, 20759));
  enemies.push(new Enemy("greg", 6445, 20945));
  enemies.push(new Enemy("greg", 8800, 20383));
  enemies.push(new Enemy("greg", 9491, 20086));
  enemies.push(new Enemy("greg", 10381, 19390));
  enemies.push(new Enemy("harpy", 11291, 19407));
  enemies.push(new Enemy("harpy", 11417, 18843));
  enemies.push(new Enemy("harpy", 12826, 19316));
  enemies.push(new Enemy("harpy", 12985, 20303));
  enemies.push(new Enemy("harpy", 12600, 20808));
  enemies.push(new Enemy("harpy", 11776, 20976));
  enemies.push(new Enemy("harpy", 14910, 20303));
  enemies.push(new Enemy("greg", 15325, 19453));
  enemies.push(new Enemy("greg", 15379, 18665));
  enemies.push(new Enemy("greg", 15369, 18033));
  enemies.push(new Enemy("greg", 16648, 17331));
  enemies.push(new Enemy("greg", 17447, 16630));
  enemies.push(new Enemy("greg", 18556, 15461));
  enemies.push(new Enemy("greg", 19370, 14951));
  enemies.push(new Enemy("greg", 20038, 14176));
  enemies.push(new Enemy("greg", 19273, 13694));
  enemies.push(new Enemy("greg", 18551, 12915));
  enemies.push(new Enemy("harpy", 19441, 12892));
  enemies.push(new Enemy("harpy", 18194, 13593));
  enemies.push(new Enemy("harpy", 17828, 12999));
  enemies.push(new Enemy("harpy", 17458, 12386));
  enemies.push(new Enemy("harpy", 18799, 11792));
  enemies.push(new Enemy("harpy", 18068, 11275));
  enemies.push(new Enemy("harpy", 19410, 10244));
  enemies.push(new Enemy("harpy", 20344, 9714));
  enemies.push(new Enemy("harpy", 21553, 9235));
  enemies.push(new Enemy("greg", 21706, 9115));
  enemies.push(new Enemy("greg", 21300, 8629));
  enemies.push(new Enemy("greg", 22590, 8371));
  enemies.push(new Enemy("greg", 23477, 8069));
  enemies.push(new Enemy("greg", 22668, 7437));
  enemies.push(new Enemy("greg", 21972, 6743));
  enemies.push(new Enemy("greg", 20970, 6839));
  enemies.push(new Enemy("greg", 20633, 7557));
  enemies.push(new Enemy("greg", 19137, 7077));
  enemies.push(new Enemy("greg", 19240, 5726));
  enemies.push(new Enemy("greg", 18424, 5224));
  enemies.push(new Enemy("greg", 18345, 4418));
  enemies.push(new Enemy("greg", 17576, 3819));
  enemies.push(new Enemy("harpy", 16680, 3481));
  enemies.push(new Enemy("harpy", 16175, 3953));
  enemies.push(new Enemy("harpy", 15575, 3782));
  enemies.push(new Enemy("harpy", 15392, 3210));
  enemies.push(new Enemy("harpy", 14515, 3113));
  enemies.push(new Enemy("harpy", 14997, 2534));
  enemies.push(new Enemy("harpy", 14003, 2406));
  enemies.push(new Enemy("greg", 14293, 3419));
  enemies.push(new Enemy("greg", 13610, 3848));
  enemies.push(new Enemy("greg", 12914, 4354));
  enemies.push(new Enemy("greg", 13248, 5045));
  enemies.push(new Enemy("greg", 12444, 5523));
  enemies.push(new Enemy("harpy", 13289, 6084));
  enemies.push(new Enemy("harpy", 12524, 6365));
  enemies.push(new Enemy("harpy", 13753, 6857));
  enemies.push(new Enemy("harpy", 12759, 7166));
  enemies.push(new Enemy("harpy", 13228, 7781));
  enemies.push(new Enemy("harpy", 12458, 8350));
  enemies.push(new Enemy("harpy", 11848, 7893));
  enemies.push(new Enemy("harpy", 10821, 7084));
  enemies.push(new Enemy("greg", 10075, 6580));
  enemies.push(new Enemy("greg", 9385, 7047));
  enemies.push(new Enemy("greg", 9036, 6617));
  enemies.push(new Enemy("greg", 9546, 5837));
  enemies.push(new Enemy("greg", 8360, 5208));
  enemies.push(new Enemy("harpy", 7813, 5208));
  enemies.push(new Enemy("harpy", 7502, 5839));
  enemies.push(new Enemy("harpy", 7050, 6331));
  enemies.push(new Enemy("harpy", 7051, 7049));
  enemies.push(new Enemy("harpy", 6606, 7708));
  enemies.push(new Enemy("harpy", 7702, 8076));
  enemies.push(new Enemy("greg", 6951, 8926));
  enemies.push(new Enemy("greg", 5639, 8686));
  enemies.push(new Enemy("greg", 5759, 9976));
  enemies.push(new Enemy("greg", 6282, 10905));
  enemies.push(new Enemy("greg", 7684, 11070));
  enemies.push(new Enemy("greg", 11656, 6626));
  enemies.push(new Enemy("greg", 10343, 5753));
  enemies.push(new Enemy("harpy", 10151, 4942));
  enemies.push(new Enemy("harpy", 11038, 4858));
  enemies.push(new Enemy("harpy", 10457, 4222));
  enemies.push(new Enemy("harpy", 9347, 4121));
  enemies.push(new Enemy("harpy", 9705, 3559));
  enemies.push(new Enemy("harpy", 8966, 2927));
  enemies.push(new Enemy("harpy", 10046, 2275));
  enemies.push(new Enemy("harpy", 10906, 1596));
  enemies.push(new Enemy("greg", 12084, 1142));
  enemies.push(new Enemy("greg", 12495, 1784));
  enemies.push(new Enemy("greg", 13052, 2642));
  enemies.push(new Enemy("greg", 14197, 1980));
  enemies.push(new Enemy("greg", 15058, 1296));
  enemies.push(new Enemy("greg", 15352, 270));
  enemies.push(new Enemy("greg", 16970, 1469));
  enemies.push(new Enemy("greg", 17432, 2203));
  enemies.push(new Enemy("greg", 18174, 2731));
  enemies.push(new Enemy("greg", 19043, 2355));
  enemies.push(new Enemy("greg", 19719, 2886));
  enemies.push(new Enemy("greg", 20369, 3231));
  enemies.push(new Enemy("greg", 20435, 2831));
  enemies.push(new Enemy("greg", 20923, 3842));
  enemies.push(new Enemy("greg", 21528, 4610));
  enemies.push(new Enemy("greg", 20538, 4523));
  enemies.push(new Enemy("greg", 19963, 4802));
  enemies.push(new Enemy("greg", 20660, 4940));
  enemies.push(new Enemy("greg", 20916, 5697));
  enemies.push(new Enemy("greg", 20238, 6527));
  enemies.push(new Enemy("harpy", 21298, 6829));
  enemies.push(new Enemy("harpy", 21612, 7320));
  enemies.push(new Enemy("harpy", 21421, 7675));
  enemies.push(new Enemy("harpy", 24044, 3915));
  enemies.push(new Enemy("greg", 24499, 3353));
  enemies.push(new Enemy("greg", 24184, 2764));
  enemies.push(new Enemy("greg", 23387, 2275));
  enemies.push(new Enemy("greg", 22650, 2134));
  enemies.push(new Enemy("harpy", 22935, 2653));
  enemies.push(new Enemy("harpy", 22201, 2180));
  enemies.push(new Enemy("harpy", 22437, 1700));
  enemies.push(new Enemy("greg", 22815, 1016));
  enemies.push(new Enemy("greg", 23405, 365));
  enemies.push(new Enemy("greg", 21938, 560));
  enemies.push(new Enemy("greg", 19966, 1933));
  enemies.push(new Enemy("greg", 19108, 2360));
  enemies.push(new Enemy("greg", 17655, 3206));
  enemies.push(new Enemy("greg", 17300, 4960));
  enemies.push(new Enemy("cyclops", 11995, 17106));
  enemies.push(new Enemy("cyclops", 9938, 18344));
  enemies.push(new Enemy("cyclops", 9772, 20620));
  enemies.push(new Enemy("cyclops", 7321, 23679));
  enemies.push(new Enemy("cyclops", 6370, 23627));
  enemies.push(new Enemy("cyclops", 5044, 24523));
  enemies.push(new Enemy("cyclops", 2945, 23994));
  enemies.push(new Enemy("harpy", 1871, 24444));
  enemies.push(new Enemy("cyclops", 336, 23564));
  enemies.push(new Enemy("cyclops", 1696, 21552));
  enemies.push(new Enemy("cyclops", 963, 20015));
  enemies.push(new Enemy("harpy", 17983, 15073));
  enemies.push(new Enemy("harpy", 20111, 14802));
  enemies.push(new Enemy("cyclops", 21890, 15175));
  enemies.push(new Enemy("cyclops", 21995, 16144));
  enemies.push(new Enemy("cyclops", 20444, 17664));
  enemies.push(new Enemy("cyclops", 22352, 18194));
  enemies.push(new Enemy("cyclops", 24195, 17430));
  enemies.push(new Enemy("cyclops", 23920, 19067));
  enemies.push(new Enemy("cyclops", 12822, 8394));
  enemies.push(new Enemy("cyclops", 14323, 6020));
  enemies.push(new Enemy("cyclops", 14516, 4840));
  enemies.push(new Enemy("cyclops", 16309, 4569));
  enemies.push(new Enemy("cyclops", 17770, 3992));
  enemies.push(new Enemy("cyclops", 19819, 2260));
  enemies.push(new Enemy("cyclops", 20499, 569));
  enemies.push(new Enemy("cyclops", 18872, 594));
  enemies.push(new Enemy("harpy", 19175, 60));
  enemies.push(new Enemy("harpy", 17874, 334));
  enemies.push(new Enemy("cyclops", 16087, 1016));
  enemies.push(new Enemy("cyclops", 14844, 450));
  enemies.push(new Enemy("cyclops", 11596, -161));
  enemies.push(new Enemy("cyclops", 10116, 223));
  enemies.push(new Enemy("harpy", 8918, 58));
  enemies.push(new Enemy("harpy", 8213, 274));
  enemies.push(new Enemy("harpy", 7442, 449));
  enemies.push(new Enemy("cyclops", 7482, 1201));
  enemies.push(new Enemy("harpy", 6065, 1017));
  enemies.push(new Enemy("cyclops", 4901, 208));
  enemies.push(new Enemy("cyclops", 5224, 3393));
  enemies.push(new Enemy("cyclops", 6599, 3079));
  enemies.push(new Enemy("cyclops", 5771, 4331));
  enemies.push(new Enemy("cyclops", 4299, 4547));
  enemies.push(new Enemy("cyclops", 2913, 5169));
  enemies.push(new Enemy("cyclops", 1493, 5921));
  enemies.push(new Enemy("cyclops", 2377, 6598));
  enemies.push(new Enemy("cyclops", 1116, 7661));
  enemies.push(new Enemy("cyclops", 2480, 8525));
  enemies.push(new Enemy("cyclops", 476, 8643));
  enemies.push(new Enemy("cyclops", 156, 10239));
  enemies.push(new Enemy("cyclops", 1444, 12337));
  enemies.push(new Enemy("cyclops", 788, 14414));
  enemies.push(new Enemy("cyclops", 1665, 15333));
  enemies.push(new Enemy("cyclops", 2141, 16421));
  enemies.push(new Enemy("cyclops", 2369, 17272));
  enemies.push(new Enemy("cyclops", 953, 19145));
  enemies.push(new Enemy("cyclops", 1377, 20810));
}

function initializeHardcodes() {
  players.push(new Player(12500, 12500, pWidth, pHeight, pSpeed, healthPoints, playerDamage, PlayerImage));

  spawnEnemies();

  NonPlayerCharacters.push(new NPC(12950, 12650, "Prometheus IV", ["Prometheus IV: Ba-Bastiann... Welcome Back", "Prometheus IV: I am Prometheus IV", "Prometheus IV: I am the final robot unyeilding to Khronos' will.", "Prometheus IV: You are one of the last human engineers alive", "Prometheus IV: That cr...ate over there", "Prometheus IV: Run into it, and retrieve its contents."], Prometheus, "Prometheus", 3));
  NonPlayerCharacters.push(new NPC(23000, 22650, "Hephaestus", [
    "Hephaestus: Freeze, you rusty bucket of bolts.",
    "Hephaestus: Wait… you’re not one of Khronos’. No core hum. No quantum sync.",
    "Hephaestus: Is that… steam? Valves. Pistons. That’s not possible.",
    "Hephaestus: I thought this tech was extinct. Wasteful. Inefficient.",
    "Hephaestus: Steam can’t carry signal… yet you’re moving. Acting. How?",
    "Hephaestus: ...Unless you aren’t thinking at all.",
    "Hephaestus: You can’t communicate. You must be controlled.",
    "Hephaestus: A human. Another one.",
    "Hephaestus: We haven’t seen one in years. Not like this.",
    "Hephaestus: This changes everything. You might be able to help us",
    "Hephaestus: I’m Hephaestus. Engineer. Circuits, alloys, precision—none of that steam stuff you’re running.",
    "Hephaestus: There used to be three of us, but Daedalus was taken",
    "Hephaestus: They came at night, precision units, and dragged him out. Completely ignored us. Went straight for him.",
    "Hephaestus: That means he knew something we didn’t.",
    "Hephaestus: If you can help us find him, we might be able to reclaim this world.",
    "Hephaestus: They ran off to the west. Maybe start there."
  ]
    , Hephaestus, "Hephaestus", 2));
  NonPlayerCharacters.push(new NPC(23200, 22650, "Atlas", ["Atlas: I'm Atlas... Responsible for keeping tabs on the geography of the area post incident."], Atlas, "Atlas", 2));
  NonPlayerCharacters.push(new NPC(8467, 23200, "Crate", ["Crate: Help! Hey! I'm stuck in here! Let me out!", "Crate: I'm starving, at least try to slip some cheese in here? Get me out!", "PROMETHEUS IV: That crate is sealed tight... We need a tool to pry it open."], Daedalus, "Daedalus", .001));
  NonPlayerCharacters.push(new NPC(12867, 12875, "Lock", ["Enter Code: ____ "], LockNpc, "Lock", .5));
  NonPlayerCharacters.push(new NPC(20350, 2150, "FieldGoal", [], FieldGoalImg, "FieldGoal", 4));
  NonPlayerCharacters.push(new NPC(21350, 2150, "Hoop", [], HoopImg, "Hoop", 2));
  NonPlayerCharacters.push(new NPC(
    12950,
    12450,
    "Book",
    [
      "Bastian's Journal: April 12th, 1838\nAnother boiler accident today. Good men burned because help arrived too late. We push engines further, but never protect the people working beside them. This must change.",

      "Bastian's Journal: November 3rd, 1840\nThe idea took shape today. A chamber to halt injury long enough for real aid to arrive. Not immortality—just a pause. A way to give the dying a chance.",

      "Bastian's Journal: June 17th, 1842\nWitnessed a collapsed furnace site. The workers were alive for minutes… then gone. If the chamber existed, they could have been preserved until doctors arrived. I will not let another man die waiting.",

      "Bastian's Journal: February 9th, 1846\nThe preservation chamber’s systems work on paper. Cooling cycle balanced. Steam regulators stable. Someone must trust it first. That someone must be me.",

      "Bastian's Journal: October 21st, 1849\nBuilt a bunker beneath my workshop. The chamber needs steady heat, no vibration, no curious crowds. Down here, precision is possible.",

      "Bastian's Journal: March 5th, 1852\nDesigned a closed steam-loop to keep a sleeper alive for days. If it works, the injured will have hours—maybe days—of safety instead of minutes. This invention might truly matter.",

      "Bastian's Journal: August 10th, 1853\nStood inside the chamber today. Not sealed. Just testing the space. Strange… I didn’t feel fear. Only purpose. The world above races forward, but someone must build tools that save—not tools that endanger.",

      "Bastian's Journal: May 2nd, 1855\nLocked the boiler room today. Combination is 1855—the year of the final test. A reminder of why this chamber exists: to protect the living, not to impress the guild.",

      "Bastian's Journal: June 20th, 1855\nThe gauges hold perfectly. Steam pressure stable. Coolant clear. All systems functioning. If the chamber can keep me safe, it can keep others safe too.",

      "Bastian's Journal: June 27th, 1855\nTomorrow I enter the chamber. A short stasis—no more than a week. When I wake, I will prove preservation is possible.\n—Bastian Buschwick"
    ],
    Book,
    "Book"
  ));

  NonPlayerCharacters.push(new NPC(12910, 13262, "Book",
    ["Steam Power for Dummies : So you wish to master the power of steam. Excellent choice, as steam is the newest, most advanced technology for the future",
      "Steam Power for Dummies : As long as no corrupt, tyrranically omnipotent intelligence never causes civilization to collapse",
      "Steam Power for Dummies : Steam is powerful and reliable for any environment that isn't on fire, isn't overrun, and still has science",
      "Steam Power for Dummies : In the astronomically low chance that you're reading this in an apocalytic wasteland, I wish you the best of luck",
      "Steam Power for Dummies : A boiler turns water into steam using heat. If your boiler starts rattling ominously, try to communicate with it rationally. If it rattles back even louder, leave immediately",
      "Steam Power for Dummies : Valves can control the pressure of steam. Pressure creates motion. Motion allows for progress. Progress prevents societal collapse",
      "Steam Power for Dummies : A properly maintained steam engine can last for centuries. If you're reading this in the year 2355, you're doing something right",
      "Steam Power for Dummies : Remember, steam is humanity's greatest ally. If civilization has fallen while you were in cryogenic storage, think of this book as a relic of a more optimistic era, and you're on your own"], Book, "Book"));
  //NonPlayerCharacters.push(new NPC(13650, 12420, "Book", ["The 7 Habits of Highly Effective Engineers \n That Have Been Cryogenically Frozen for 500 Years: Burger"], Book, "Book"));
  NonPlayerCharacters.push(new NPC(13650, 12420, "Book", ["Frankenstein: I had worked hard for nearly two years, for the sole purpose of infusing life into an inanimate body.", "Frankenstein: For this I had deprived myself of rest and health. I had desired it with an ardour that far exceeded moderation.", "Frankenstein: but now that I had finished, the beauty of the dream vanished, and breathless horror and disgust filled my heart."], Book, "Book"));
  NonPlayerCharacters.push(new NPC(13350, 13050, "Book",
    [
      "Walden : I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I did not wish to live what was not life, living is so dear;",
      "Walden : nor did I wish to practise resignation, unless it was quite necessary. I wanted to live deep and suck out all the marrow of life, to live so sturdily and Spartan-like as to put to rout all that was not life",
      "Walden : to cut a broad swath and shave close, to drive life into a corner, and reduce it to its lowest terms, and, if it proved to be mean, why then to get the whole and genuine meanness of it, and publish its meanness to the world",
      "Walden : or if it were sublime, to know it by experience, and be able to give a true account of it in my next excursion",
      "Walden :  For most men, it appears to me, are in a strange uncertainty about it, whether it is of the devil or of God, and have somewhat hastily concluded that it is the chief end of man here to \"glorify God and enjoy him forever.\"",

    ], Book, "Book"));


  droppedItems.push(new DroppedItem(new Item("projectile", "old wrench", 1), 16500, 14250));
}
function startBloodMoonEffect() {
  messages.push(new Message("dialogue", ["PROMETHEUS IV: Khronos has initiated a System Reboot. His minions are repaired and redeployed. Watch out."]));
  bloodMoonActive = true;
  bloodMoonOverlayAlpha = 0;
  bloodMoonParticles = [];
  // create effect particles

  for (let i = 0; i < 50; i++) {
    bloodMoonParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 3 + 2,
      life: 255
    });
  }

  setTimeout(() => {
    bloodMoonActive = false;
  }, 5000);
}

function drawBloodMoonOverlay() {
  if (!bloodMoonActive && bloodMoonOverlayAlpha <= 0) return;

  if (bloodMoonActive) {
    bloodMoonOverlayAlpha = lerp(bloodMoonOverlayAlpha, 60, 0.05);
  } else {
    bloodMoonOverlayAlpha = lerp(bloodMoonOverlayAlpha, 0, 0.05);
  }

  if (bloodMoonOverlayAlpha > 1) {
    push();
    noStroke();
    fill(0, 255, 255, bloodMoonOverlayAlpha);
    rect(0, 0, width, height);

    // Update and draw particles
    for (let i = bloodMoonParticles.length - 1; i >= 0; i--) {
      let p = bloodMoonParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 4;

      // Draw particle with glow
      fill(150, 255, 255, p.life * (bloodMoonOverlayAlpha / 60));
      noStroke();
      ellipse(p.x, p.y, p.size);

      if (p.life > 100) {
        rect(p.x - p.size, p.y - p.size, p.size / 2, p.size / 2);
      }

      if (p.life <= 0) {
        bloodMoonParticles.splice(i, 1);
        // Respawn if still active
        if (bloodMoonActive) {
          bloodMoonParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 3 + 2,
            life: 255
          });
        }
      }
    }
    pop();
  }
}
