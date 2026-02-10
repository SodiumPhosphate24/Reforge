
// Crafting menu state
var craftingMenuOpen = false;
var craftingMenuClosing = false;
var craftingMenuAlpha = 0; // Fade in effect
var craftingMenuSlideY = 50; // Slide up animation
var craftingMenuScale = 0; // Scale animation

// Crafting prompt animation
let craftingPrompt = null;

// Crafting tabs
var craftingTabs = ["Robots", "Weapons", "Items"];
var selectedTab = 0;

var craftingRecipes = [
  // ROBOTS
  {
    name: "SPUD",
    category: "Robots",
    type: "player",
    unlocked : false,
    playerConstructor: {width : 35, height : 35, speed : 1.3, health : 100, damage : 1},
    ingredients: [
      { itemName: "common wheel", amount: 2 },
      { itemName: "common cartridge", amount: 1 },
      { itemName: "cog", amount: 1 },
      { itemName: "pipe", amount: 1 }
    ],
    output: { type: "player", name: "SPUD", amount: 1 }
  },
  {
    name: "SCAMPER",
    category: "Robots",
    type: "player",
    unlocked : false,
    playerConstructor: {width : 35, height : 25, speed : 1.7, health : 75, damage : 1},
    ingredients: [
      { itemName: "rare wheel", amount: 2 },
      { itemName: "rare cartridge", amount: 2 },
      { itemName: "cog", amount: 5 },
      { itemName: "pipe", amount: 5}
    ],
    output: { type: "player", name: "SCAMPER", amount: 1 }
  },
  {
    name: "STUR-D",
    category: "Robots",
    type: "player",
    unlocked : false,
    playerConstructor: {width : 105, height : 75, speed : .9, health : 150, damage : 1},
    ingredients: [
      { itemName: "rare wheel", amount: 4 },
      { itemName: "legendary cartridge", amount: 2 },
      { itemName: "cog", amount: 10},
      { itemName: "pipe", amount: 10}
    ],
    output: { type: "player", name: "STUR-D", amount: 1 }
  },
  {
    name : "ARGO",
    category : "Robots",
    type : "player",
    unlocked : false,
    playerConstructor: {width : 225, height : 95, speed : .5, health : 100, damage : 1},
    ingredients: [
      { itemName: "pipe", amount: 25 },
      { itemName: "cog", amount: 25 },
      { itemName: "rare cartridge", amount: 4 },
      { itemName: "legendary wheel", amount: 4 },
      { itemName: "train blueprint", amount: 1 }
    ],
    output: { type: "player", name: "ARGO", amount: 1 }
  },
  // WEAPONS
  {
    name: "steam gun",
    category: "Weapons",
    type: "item",
    unlocked : true,
    ingredients: [
      { itemName: "cog", amount: 5 },
      { itemName: "pipe", amount: 2 },
      { itemName: "common cartridge", amount: 1 }
    ],
    output: { type: "gun", name: "steam gun", amount: 1 }
  },
  {
    name: "steam shotgun",
    category: "Weapons",
    type: "item",
    unlocked : true,
    ingredients: [
      { itemName: "cog", amount: 5},
      { itemName: "pipe", amount: 5},
      {itemName: "rare cartridge", amount: 2}
    ],
    output: { type: "gun", name: "steam shotgun", amount: 1 }
  },
  {
    name: "steam rifle",
    category: "Weapons",
    type: "item",
    unlocked : true,
    ingredients: [
      { itemName: "cog", amount: 10},
      { itemName: "pipe", amount: 10},
      { itemName: "legendary cartridge", amount: 1}
    ],
    output: { type: "gun", name: "steam rifle gun", amount: 1 }
  },
  // ITEMS
  {
    name: "Rare Cartridge",
    category: "Items",
    type: "item",
    unlocked : true,
    ingredients: [
      { itemName: "common cartridge", amount: 4 }
    ],
    output: { type: "material", name: "rare cartridge", amount: 1 }
  },
  {
    name: "Legendary Cartridge",
    category: "Items",
    type: "item",
    unlocked : true,
    ingredients: [
      { itemName: "rare cartridge", amount: 4 }
    ],
    output: { type: "material", name: "legendary cartridge", amount: 1 }
  }
];

var selectedRecipe = 0;
var craftingScrollOffset = 0; // Tracks scroll position
var maxVisibleRecipes = 4; // How many recipes to show at once

function unlockRecipe(name) {
  for (let i = 0; i < craftingRecipes.length; i++) {
    if (craftingRecipes[i].name === name) {
      craftingRecipes[i].unlocked = true;
      return;
    }
  }
}

function isNearWorkbench() {
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;

  const checkRadius = 150; // Slightly larger radius for 2x2 workbench

  // Check all tiles within radius
  for (let row = 0; row < gameWorld.length; row++) {
    for (let col = 0; col < gameWorld[row].length; col++) {
      const cell = gameWorld[row][col];
      if (!cell) continue;

      // For 2x2 workbench, calculate distance to the center of the 2x2 cluster
      // We'll check if ANY workbench tile is nearby
      const tileCenterX = col * 50 + 25;
      const tileCenterY = row * 50 + 25;
      const dist = Math.sqrt(
        Math.pow(playerCenterX - tileCenterX, 2) + 
        Math.pow(playerCenterY - tileCenterY, 2)
      );

      if (dist <= checkRadius) {
        // Check all layers for workbench (type 6)
        if ('layers' in cell) {
          for (let L = 0; L < 3; L++) {
            const tile = cell.layers[L];
            if (tile && tile.type === 6) {
              return true;
            }
          }
        } else if (cell.type === 6) {
          return true;
        }
      }
    }
  }
  return false;
}

function toggleCraftingMenu() {
  if (craftingMenuOpen) {
    // Start closing animation
    craftingMenuClosing = true;
  } else if (isNearWorkbench()) {
    // Open menu
    craftingMenuOpen = true;
    craftingMenuClosing = false;

    // Reset to first tab
    selectedTab = 0;

    // Find first unlocked recipe in the selected tab
    const tabRecipes = craftingRecipes.filter(r => r.category === craftingTabs[selectedTab]);
    selectedRecipe = 0;
    for (let i = 0; i < craftingRecipes.length; i++) {
      if (craftingRecipes[i].unlocked && craftingRecipes[i].category === craftingTabs[selectedTab]) {
        selectedRecipe = i;
        break;
      }
    }

    // Reset animation and scroll values
    craftingMenuAlpha = 0;
    craftingMenuSlideY = 50;
    craftingMenuScale = 0;
    craftingScrollOffset = 0;
  }
  frozen = craftingMenuOpen;
}

function canCraftRecipe(recipe) {
  for (let ingredient of recipe.ingredients) {
    let foundAmount = 0;
    for (let item of inventoryList) {
      if (item && item.name === ingredient.itemName) {
        foundAmount += item.amount;
      }
    }
    if (foundAmount < ingredient.amount) {
      return false;
    }
  }
  return true;
}

function searchInventory(itemName){
  for (let item of inventoryList) {
    if (item && item.name === itemName) {
      return true;
    }
  }
  return false;
}

function craftItem(recipe) {
  if (!canCraftRecipe(recipe)) return;

  // Remove ingredients from inventory
  for (let ingredient of recipe.ingredients) {
    let remaining = ingredient.amount;
    for (let i = 0; i < inventoryList.length && remaining > 0; i++) {
      if (inventoryList[i] && inventoryList[i].name === ingredient.itemName) {
        const toRemove = Math.min(remaining, inventoryList[i].amount);
        inventoryList[i].amount -= toRemove;
        remaining -= toRemove;

        if (inventoryList[i].amount <= 0) {
          inventoryList[i] = null;
        }
      }
    }
  }

  if (recipe.type === "item") {
    // Add crafted item to inventory
    const craftedItem = new Item(recipe.output.type, recipe.output.name, recipe.output.amount);

    // Try to stack with existing items
    let stacked = false;
    if (craftedItem.stackable) {
      for (let i = 0; i < inventoryList.length; i++) {
        if (inventoryList[i] && inventoryList[i].name === craftedItem.name) {
          inventoryList[i].amount += craftedItem.amount;
          stacked = true;
          break;
        }
      }
    }

    // If not stacked, find empty slot
    if (!stacked) {
      for (let i = 0; i < inventoryList.length; i++) {
        if (inventoryList[i] === null) {
          inventoryList[i] = craftedItem;
          break;
        }
      }
    }
  }

  if (recipe.type === "player") {
    let p = recipe.playerConstructor;
    // Determine which image to use based on recipe name
    let robotImage = PlayerImage;
    if (recipe.name === "SPUD") {
      robotImage = SPUDImage;
    }
    if (recipe.name === "ARGO") {
      robotImage = ARGOImage;
    }

    // Find nearest workbench position (bottom-right corner of 2x2 workbench)
    const playerCenterX = pX + 600 + pWidth / 2;
    const playerCenterY = pY + 375 + pHeight / 2;
    const checkRadius = 150;

    let workbenchBottomRightX = pX; // Fallback to player position
    let workbenchBottomRightY = pY;
    let foundWorkbench = false;

    // Find all workbench tiles near player
    const workbenchTiles = [];
    for (let row = 0; row < gameWorld.length; row++) {
      for (let col = 0; col < gameWorld[row].length; col++) {
        const cell = gameWorld[row][col];
        if (!cell) continue;

        const tileCenterX = col * 50 + 25;
        const tileCenterY = row * 50 + 25;
        const dist = Math.sqrt(
          Math.pow(playerCenterX - tileCenterX, 2) + 
          Math.pow(playerCenterY - tileCenterY, 2)
        );

        if (dist <= checkRadius) {
          if ('layers' in cell) {
            for (let L = 0; L < 3; L++) {
              const tile = cell.layers[L];
              if (tile && tile.type === 6) {
                workbenchTiles.push({ row, col });
                break;
              }
            }
          } else if (cell.type === 6) {
            workbenchTiles.push({ row, col });
          }
        }
      }
    }

    // Find the bottom-right corner of the workbench cluster
    if (workbenchTiles.length > 0) {
      let maxRow = workbenchTiles[0].row;
      let maxCol = workbenchTiles[0].col;
      
      for (const tile of workbenchTiles) {
        if (tile.row > maxRow || (tile.row === maxRow && tile.col > maxCol)) {
          maxRow = tile.row;
          maxCol = tile.col;
        }
      }
      
      // Position is 200px to the right of the bottom-right tile's right edge
      workbenchBottomRightX = (maxCol + 1) * 50 + 200 - 600;
      workbenchBottomRightY = maxRow * 50 - 375;
      foundWorkbench = true;
    }

    if(recipe.name === "ARGO"){
      players.push(new Player(workbenchBottomRightX-400, workbenchBottomRightY + 50, p.width, p.height, p.speed, p.health, p.damage, robotImage, recipe.name));
    }
    else {
      players.push(new Player(workbenchBottomRightX, workbenchBottomRightY + 15, p.width, p.height, p.speed, p.health, p.damage, robotImage, recipe.name));
    }

    // Trigger particle system #5 for 1 second
    if (typeof particleSources !== 'undefined' && particleSources.length > 5) {
      particleSources[5].spawnRate = 20;
      setTimeout(() => {
        if (particleSources.length > 5) {
          particleSources[5].spawnRate = 0;
        }
      }, 1000);
    }
  }

  handleTriggers("Crafting");

  // Close crafting menu after crafting
  craftingMenuClosing = true;
}



function drawCraftingMenu() {
  if (!craftingMenuOpen && !craftingMenuClosing) return;

  // Auto-close if too far from workbench
  if (craftingMenuOpen && !craftingMenuClosing && !isNearWorkbench()) {
    craftingMenuClosing = true;
  }

  // Handle closing animation
  if (craftingMenuClosing) {
    craftingMenuAlpha = lerp(craftingMenuAlpha, 0, 0.2);
    craftingMenuSlideY = lerp(craftingMenuSlideY, 50, 0.25);
    craftingMenuScale = lerp(craftingMenuScale, 0, 0.3);

    // Finish closing when alpha is nearly 0
    if (craftingMenuAlpha < 1) {
      craftingMenuOpen = false;
      craftingMenuClosing = false;
      frozen = false;
    }
  } else {
    // Opening animations
    if (craftingMenuAlpha < 255) {
      craftingMenuAlpha = lerp(craftingMenuAlpha, 255, 0.15);
    }

    if (craftingMenuSlideY > 0) {
      craftingMenuSlideY = lerp(craftingMenuSlideY, 0, 0.2);
    }

    if (craftingMenuScale < 1) {
      craftingMenuScale = lerp(craftingMenuScale, 1, 0.25);
    }
  }

  push();
  translate(0, craftingMenuSlideY);

  // Semi-transparent background with scale and fade
  fill(0, 0, 0, craftingMenuAlpha * 0.78);
  rectMode(CENTER);
  rect(600, 375, 800 * craftingMenuScale, 550 * craftingMenuScale, 10);

  // Accent border
  strokeWeight(3);
  stroke(255, 150, 0, craftingMenuAlpha * 0.8);
  noFill();
  rect(600, 375, 800 * craftingMenuScale, 550 * craftingMenuScale, 10);
  noStroke();
  rectMode(CORNER);

  // Only draw content if scale is reasonable
  if (craftingMenuScale > 0.3) {
    // Title
    fill(255, 150, 0, craftingMenuAlpha);
    textSize(32);
    textFont(Silkscreen);
    textAlign(CENTER, CENTER);
    text("CRAFTING MENU", 600, 120);

    // Draw tabs
    textSize(18);
    const tabWidth = 200;
    const tabStartX = 600 - (craftingTabs.length * tabWidth) / 2;
    for (let i = 0; i < craftingTabs.length; i++) {
      const tabX = tabStartX + i * tabWidth;
      const tabY = 155;

      // Tab background
      if (i === selectedTab) {
        fill(255, 150, 0, craftingMenuAlpha * 0.6);
      } else {
        fill(50, 50, 50, craftingMenuAlpha * 0.4);
      }
      rect(tabX, tabY, tabWidth - 10, 35, 5);

      // Tab text
      fill(255, 255, 255, craftingMenuAlpha);
      textAlign(CENTER, CENTER);
      text(craftingTabs[i], tabX + (tabWidth - 10) / 2, tabY + 17);
    }

    // Instructions
    fill(255, 150, 0, craftingMenuAlpha * 0.9);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("LEFT/RIGHT: Switch tabs | UP/DOWN: Select | ENTER: Craft | E: Close", 600, 205);

    // Recipe list with scrolling
    textAlign(LEFT, TOP);
    textSize(20);

    // Filter unlocked recipes for current tab
    let unlockedRecipes = [];
    for (let i = 0; i < craftingRecipes.length; i++) {
      const recipe = craftingRecipes[i];
      const canCraft = canCraftRecipe(recipe);

      /*
      if (!recipe.unlocked && canCraft) {
        recipe.unlocked = true;
      }
      */

      if (recipe.unlocked && recipe.category === craftingTabs[selectedTab]) {
        unlockedRecipes.push({ index: i, recipe: recipe });
      }
    }

    // Adjust scroll offset to keep selected recipe in view
    if (selectedRecipe < craftingScrollOffset) {
      craftingScrollOffset = selectedRecipe;
    }
    if (selectedRecipe >= craftingScrollOffset + maxVisibleRecipes) {
      craftingScrollOffset = selectedRecipe - maxVisibleRecipes + 1;
    }

    // Clamp scroll offset
    craftingScrollOffset = Math.max(0, Math.min(craftingScrollOffset, Math.max(0, unlockedRecipes.length - maxVisibleRecipes)));

    // Draw visible recipes
    let yPos = 235;
    const recipeHeight = 100;

    for (let i = craftingScrollOffset; i < Math.min(craftingScrollOffset + maxVisibleRecipes, unlockedRecipes.length); i++) {
      const { index, recipe } = unlockedRecipes[i];
      const canCraft = canCraftRecipe(recipe);

      // Highlight selected recipe
      if (index === selectedRecipe) {
        fill(255, 150, 0, craftingMenuAlpha * 0.4);
        rect(220, yPos - 5, 760, 80, 5);
      }

      // Recipe name
      if (canCraft) {
        fill(100, 255, 100, craftingMenuAlpha);
      } else {
        fill(255, 100, 100, craftingMenuAlpha);
      }
      text(recipe.name, 240, yPos);

      // Ingredients
      fill(255, 255, 255, craftingMenuAlpha);
      textSize(16);
      let ingredientText = "Requires: ";
      for (let j = 0; j < recipe.ingredients.length; j++) {
        ingredientText += recipe.ingredients[j].amount + "x " + recipe.ingredients[j].itemName;
        if (j < recipe.ingredients.length - 1) {
          ingredientText += ", ";
        }
      }
      text(ingredientText, 240, yPos + 30);

      // Output
      text("Crafts: " + recipe.output.amount + "x " + recipe.output.name, 240, yPos + 55);

      textSize(20);
      yPos += recipeHeight;
    }

    // Draw scroll indicators
    if (unlockedRecipes.length > maxVisibleRecipes) {
      fill(255, 150, 0, craftingMenuAlpha * 0.6);
      textSize(14);
      textAlign(CENTER, CENTER);

      if (craftingScrollOffset > 0) {
        text("▲ Scroll Up", 600, 220);
      }
      if (craftingScrollOffset + maxVisibleRecipes < unlockedRecipes.length) {
        text("▼ Scroll Down", 600, 630);
      }

      // Show position indicator
      const scrollPercent = craftingScrollOffset / Math.max(1, unlockedRecipes.length - maxVisibleRecipes);
      fill(255, 150, 0, craftingMenuAlpha * 0.3);
      rect(970, 235, 10, 385, 5);
      fill(255, 150, 0, craftingMenuAlpha);
      const indicatorHeight = 385 / Math.max(1, unlockedRecipes.length / maxVisibleRecipes);
      rect(970, 235 + scrollPercent * (385 - indicatorHeight), 10, indicatorHeight, 5);
    }

    textAlign(CENTER, CENTER);
  }

  pop();
}

// Draw crafting prompt when near workbench
function drawCraftingPromptIfNeeded() {
  if (!craftingPrompt) craftingPrompt = createPrompt();
  
  const nearWorkbench = isNearWorkbench();

  if (nearWorkbench && !craftingMenuOpen) {
    handleInteractionPrompt(
      craftingPrompt,
      pX + 600, // Workbench is wherever player is interacting, but typically we'd use workbench pos. 
      pY + 340, // Here we use player center as proxy since isNearWorkbench() uses player pos
      50,
      "Press E to Craft"
    );
  } else {
    craftingPrompt.update(false);
    craftingPrompt.draw("");
  }
}

function handleCraftingInput() {
  if (!craftingMenuOpen) return;

  // Switch tabs
  if (keyPressedOnce(LEFT_ARROW)) {
    selectedTab--;
    if (selectedTab < 0) selectedTab = craftingTabs.length - 1;
    craftingScrollOffset = 0;

    // Find first unlocked recipe in new tab
    for (let i = 0; i < craftingRecipes.length; i++) {
      if (craftingRecipes[i].unlocked && craftingRecipes[i].category === craftingTabs[selectedTab]) {
        selectedRecipe = i;
        break;
      }
    }
  }
  if (keyPressedOnce(RIGHT_ARROW)) {
    selectedTab++;
    if (selectedTab >= craftingTabs.length) selectedTab = 0;
    craftingScrollOffset = 0;

    // Find first unlocked recipe in new tab
    for (let i = 0; i < craftingRecipes.length; i++) {
      if (craftingRecipes[i].unlocked && craftingRecipes[i].category === craftingTabs[selectedTab]) {
        selectedRecipe = i;
        break;
      }
    }
  }

  // Get unlocked recipe indices for current tab
  let unlockedIndices = [];
  for (let i = 0; i < craftingRecipes.length; i++) {
    if (craftingRecipes[i].unlocked && craftingRecipes[i].category === craftingTabs[selectedTab]) {
      unlockedIndices.push(i);
    }
  }

  if (unlockedIndices.length === 0) return;

  // Navigate recipes (only through unlocked ones in current tab)
  if (keyPressedOnce(UP_ARROW)) {
    let currentPos = unlockedIndices.indexOf(selectedRecipe);
    if (currentPos > 0) {
      selectedRecipe = unlockedIndices[currentPos - 1];
    } else {
      selectedRecipe = unlockedIndices[unlockedIndices.length - 1];
    }
  }
  if (keyPressedOnce(DOWN_ARROW)) {
    let currentPos = unlockedIndices.indexOf(selectedRecipe);
    if (currentPos < unlockedIndices.length - 1) {
      selectedRecipe = unlockedIndices[currentPos + 1];
    } else {
      selectedRecipe = unlockedIndices[0];
    }
  }

  // Craft selected recipe
  if (keyPressedOnce(ENTER)) {
    if (craftingRecipes[selectedRecipe].unlocked) {
      craftItem(craftingRecipes[selectedRecipe]);
    }
  }
}