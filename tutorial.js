
// Tutorial System - Manages the bunker tutorial sequence

var tutorialActive = false;
var tutorialPhase = 0;
var tutorialComplete = false;
var humanBuschy = null; // Reference to original human character
var cryoChamberOpened = false;
var firstDroidCrafted = false;
var firstEnemySpawned = false;
var hasLearnedShooting = false;
var hasLearnedHealing = false;

// Tutorial phases:
// 0: Initial setup
// 1: Find and activate PROMETHEUS-IV (distance-dependent)
// 2: PROMETHEUS-IV activated, waiting for crafting dialogue
// 3: Learn about materials and crafting, wait for droid creation
// 4: First droid crafted, waiting for crate dialogue
// 5: Learn about items from crates, wait for crate opening
// 6: Enemy spawned, waiting for shooting dialogue
// 7: Learn shooting mechanics, monitor for damage
// 8: Learn healing mechanics
// 9: Tutorial complete

var tutorialMessages = {
  wakeUp: ["BUSCHY: Where... where am I?", "BUSCHY: Some kind of cryochamber... I need to find out what happened here."],
  findPrometheus: ["BUSCHY: That robot looks deactivated. Maybe I can power it on?"],
  prometheusActivation: [
    "PROMETHEUS-IV: SYSTEM BOOT... ONLINE",
    "PROMETHEUS-IV: Greetings, Human Buschy. I am PROMETHEUS-IV, your laboratory assistant.",
    "PROMETHEUS-IV: It appears you have been in cryosleep for an extended period.",
    "PROMETHEUS-IV: The bunker is in disarray. We must work together to survive."
  ],
  introduceCrafting: [
    "PROMETHEUS-IV: I can teach you to craft robotic bodies.",
    "PROMETHEUS-IV: Gather materials from around the bunker - CPUs, batteries, and other components.",
    "PROMETHEUS-IV: Approach the workbench and press E to open the crafting menu.",
    "PROMETHEUS-IV: Use the materials I've provided to craft your first droid body."
  ],
  firstDroidCrafted: [
    "PROMETHEUS-IV: Excellent work! You've created your first droid.",
    "PROMETHEUS-IV: Press Q to transfer your consciousness into it.",
    "PROMETHEUS-IV: I can communicate with you while your sentience is in the droid body.",
    "PROMETHEUS-IV: Your human form will remain here, safe in the bunker."
  ],
  introduceCrates: [
    "PROMETHEUS-IV: See those crates? They contain valuable items.",
    "PROMETHEUS-IV: Approach them and press E to open them.",
    "PROMETHEUS-IV: You'll find three types of items:",
    "PROMETHEUS-IV: GUNS for combat, PROJECTILES for throwing, and CONSUMABLES for healing."
  ],
  firstEnemy: [
    "PROMETHEUS-IV: WARNING! Hostile robot detected!",
    "PROMETHEUS-IV: This is a rogue AI unit. You must defend yourself!",
    "PROMETHEUS-IV: Equip a weapon using number keys 1-8."
  ],
  teachShooting: [
    "PROMETHEUS-IV: Aim with your mouse and click to shoot.",
    "PROMETHEUS-IV: Watch your ENERGY gauge - it depletes when firing.",
    "PROMETHEUS-IV: Your energy regenerates slowly over time. Conserve it!"
  ],
  teachHealing: [
    "PROMETHEUS-IV: You're damaged! Use consumable items to heal.",
    "PROMETHEUS-IV: Press the number key for a consumable, then click to use it.",
    "PROMETHEUS-IV: Batteries restore energy, while food restores health."
  ],
  tutorialComplete: [
    "PROMETHEUS-IV: Well done! You've learned the basics.",
    "PROMETHEUS-IV: The bunker exit is sealed. We need to find a way out.",
    "PROMETHEUS-IV: Explore the facility and gather more resources.",
    "PROMETHEUS-IV: I will guide you when needed. Good luck, Buschy."
  ]
};

// Tutorial crate for spawning starter items
var tutorialCratePos = { row: 253, col: 271 }; // Adjust based on bunker layout

function startTutorial() {
  tutorialActive = true;
  tutorialPhase = 0;
  
  // Store reference to human Buschy
  if (players.length > 0) {
    humanBuschy = players[0];
  }
  
  // Spawn PROMETHEUS-IV at specific location (deactivated initially)
  const prometheusX = 13350;
  const prometheusY = 12675;
  
  // Clear existing NPCs and add PROMETHEUS-IV (initially inactive)
  NonPlayerCharacters = [];
  NonPlayerCharacters.push(new NPC(prometheusX, prometheusY, "PROMETHEUS-IV (OFFLINE)", [], BadGuy));
  NonPlayerCharacters[0].active = false;
  
  // Show wake-up message immediately (not distance-dependent)
  messages.push(new Message("dialogue", tutorialMessages.wakeUp));
  console.log("Tutorial started - wake-up dialogue displayed");
  console.log("Messages array length:", messages.length);
  
  tutorialPhase = 1;
}

function updateTutorial() {
  if (!tutorialActive || tutorialComplete) return;
  
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  
  // Phase 1: Find PROMETHEUS-IV (distance-dependent interaction)
  if (tutorialPhase === 1) {
    const prometheusNPC = NonPlayerCharacters[0];
    if (prometheusNPC && !prometheusNPC.active) {
      const distToPrometheus = distance(playerCenterX, playerCenterY, prometheusNPC.x, prometheusNPC.y);
      if (distToPrometheus < 120 && keyPressedOnce(69)) {
        // Activate PROMETHEUS-IV
        prometheusNPC.active = true;
        prometheusNPC.name = "PROMETHEUS-IV";
        prometheusNPC.message = tutorialMessages.prometheusActivation;
        messages.push(new Message("dialogue", tutorialMessages.prometheusActivation));
        tutorialPhase = 2;
        
        // Give starter materials and show crafting message after activation dialogue
        setTimeout(() => {
          giveStarterMaterials();
          messages.push(new Message("dialogue", tutorialMessages.introduceCrafting));
          tutorialPhase = 3; // Move to crafting phase
        }, 8000); // Wait for activation dialogue to finish
      }
    }
  }
  
  // Phase 3: Wait for first droid to be crafted
  if (tutorialPhase === 3 && !firstDroidCrafted) {
    // Check if player crafted a droid (players.length > 1)
    if (players.length > 1) {
      firstDroidCrafted = true;
      tutorialPhase = 4;
      messages.push(new Message("dialogue", tutorialMessages.firstDroidCrafted));
      
      // Spawn tutorial crate with items
      setTimeout(() => {
        spawnTutorialCrate();
        messages.push(new Message("dialogue", tutorialMessages.introduceCrates));
        tutorialPhase = 5;
      }, 10000); // Wait for droid crafting dialogue to finish
    }
  }
  
  // Phase 5: Spawn first enemy after player opens crate
  if (tutorialPhase === 5 && !firstEnemySpawned) {
    // Check if crate was opened (simple check: if player has items)
    if (inventoryList.some(item => item !== null && (item.type === "gun" || item.type === "consumable"))) {
      firstEnemySpawned = true;
      tutorialPhase = 6;
      
      // Spawn tutorial enemy at a safe distance
      const enemyX = pX + 600 + 300;
      const enemyY = pY + 375;
      const tutorialEnemy = new Enemy("zombie");
      tutorialEnemy.x = enemyX;
      tutorialEnemy.y = enemyY;
      tutorialEnemy.health = 5; // Make it a bit tougher for tutorial
      enemies.push(tutorialEnemy);
      
      messages.push(new Message("dialogue", tutorialMessages.firstEnemy));
      
      setTimeout(() => {
        messages.push(new Message("dialogue", tutorialMessages.teachShooting));
        tutorialPhase = 7;
      }, 6000); // Wait for enemy warning dialogue
    }
  }
  
  // Phase 7: Monitor for damage to teach healing
  if (tutorialPhase === 7 && !hasLearnedHealing) {
    if (players[activePlayer] && players[activePlayer].health < players[activePlayer].maxHealth * 0.7) {
      hasLearnedHealing = true;
      tutorialPhase = 8;
      messages.push(new Message("dialogue", tutorialMessages.teachHealing));
      
      // Complete tutorial after healing lesson
      setTimeout(() => {
        tutorialPhase = 9;
        tutorialComplete = true;
        tutorialActive = false;
        messages.push(new Message("dialogue", tutorialMessages.tutorialComplete));
      }, 10000);
    }
  }
}

function giveStarterMaterials() {
  // Give materials needed to craft first Buschy droid
  // Recipe: 1 common CPU, 1 common battery, 1 cheese
  
  const materials = [
    new Item("material", "common CPU", 1),
    new Item("consumable", "common battery", 1),
    new Item("consumable", "cheese", 1)
  ];
  
  let slotIndex = 0;
  for (let mat of materials) {
    // Find empty slot
    while (slotIndex < inventoryList.length && inventoryList[slotIndex] !== null) {
      slotIndex++;
    }
    if (slotIndex < inventoryList.length) {
      inventoryList[slotIndex] = mat;
    }
  }
  
  messages.push(new Message("quest", "Materials Added to Inventory"));
}

function spawnTutorialCrate() {
  // Spawn a crate near the player with tutorial items
  const crateRow = Math.floor((pY + 375) / 50) + 3;
  const crateCol = Math.floor((pX + 600) / 50) + 2;
  
  // Place crate on layer 0
  setTile(crateRow, crateCol, 0, 5, 0); // type 5 = crate
  
  // Add items to crate
  const crateKey = crateRow + "," + crateCol;
  const crateItems = [
    itemConstructors[0], // glock
    itemConstructors[9], // rocks (projectile)
    itemConstructors[4], // soda (consumable)
    itemConstructors[3]  // cheese (consumable)
  ];
  
  crateInventories.set(crateKey, crateItems);
  console.log("Tutorial crate spawned at", crateKey, "with items");
}

// Add tutorial prompt rendering
var tutorialPromptAlpha = 0;
var currentTutorialPrompt = "";

function showTutorialPrompt(text) {
  currentTutorialPrompt = text;
  tutorialPromptAlpha = 255;
}

function drawTutorialPrompt() {
  if (!tutorialActive || tutorialPromptAlpha < 5) return;
  
  // Fade out slowly
  tutorialPromptAlpha = lerp(tutorialPromptAlpha, 0, 0.01);
  
  push();
  fill(255, 200, 0, tutorialPromptAlpha * 0.9);
  textSize(16);
  textFont(Silkscreen);
  textAlign(CENTER, CENTER);
  
  // Draw at top center of screen
  const promptWidth = textWidth(currentTutorialPrompt);
  fill(0, 0, 0, tutorialPromptAlpha * 0.7);
  rect(600 - promptWidth / 2 - 15, 15, promptWidth + 30, 30, 5);
  
  fill(255, 200, 0, tutorialPromptAlpha);
  text(currentTutorialPrompt, 600, 30);
  pop();
}
