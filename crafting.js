
// Crafting menu state
var craftingMenuOpen = false;
var craftingMenuClosing = false;
var craftingMenuAlpha = 0; // Fade in effect
var craftingMenuSlideY = 50; // Slide up animation
var craftingMenuScale = 0; // Scale animation
var craftingRecipes = [
  {
    name: "Glock",
    type: "item",
    ingredients: [
      { itemName: "rock", amount: 10 }
    ],
    output: { type: "gun", name: "glock", amount: 1 }
  },
  {
    name: "Grenade",
    type: "item",
    ingredients: [
      { itemName: "rock", amount: 5 },
      { itemName: "cheese", amount: 1 }
    ],
    output: { type: "projectile", name: "grenade", amount: 1 }
  },
  {
    name: "Fast Buschy",
    type: "player",
    playerConstructor: {width : 35, height : 25, speed : 5, health : 50, damage : 1},
    ingredients: [
      { itemName: "rock", amount: 5 },
      { itemName: "cheese", amount: 1 },
      { itemName: "soda", amount: 1 }
    ]
  }
  // Add more recipes as needed
];

var selectedRecipe = 0;

function isNearWorkbench() {
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  
  const checkRadius = 175; // 3.5 tiles * 50 pixels
  
  // Check all tiles within radius
  for (let row = 0; row < gameWorld.length; row++) {
    for (let col = 0; col < gameWorld[row].length; col++) {
      const cell = gameWorld[row][col];
      if (!cell) continue;
      
      // Calculate distance to tile center
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
    selectedRecipe = 0;
    // Reset animation values
    craftingMenuAlpha = 0;
    craftingMenuSlideY = 50;
    craftingMenuScale = 0;
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
}

  if (recipe.type === "player") {
    let p = recipe.playerConstructor;
    players.push(new Player(pX + 50, pY, p.width, p.height, p.speed, p.health, p.damage, PlayerImage));
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
  stroke(100, 255, 255, craftingMenuAlpha * 0.8);
  noFill();
  rect(600, 375, 800 * craftingMenuScale, 550 * craftingMenuScale, 10);
  noStroke();
  rectMode(CORNER);
  
  // Only draw content if scale is reasonable
  if (craftingMenuScale > 0.3) {
    // Title
    fill(100, 255, 255, craftingMenuAlpha);
    textSize(32);
    textFont(Silkscreen);
    textAlign(CENTER, CENTER);
    text("CRAFTING MENU", 600, 140);
  
  // Instructions
    fill(100, 255, 255, craftingMenuAlpha * 0.9);
    textSize(16);
    text("Use UP/DOWN arrows to select, ENTER to craft, E to close", 600, 180);
    
    // Recipe list
    textAlign(LEFT, TOP);
    textSize(20);
    let yPos = 220;
    
    for (let i = 0; i < craftingRecipes.length; i++) {
      const recipe = craftingRecipes[i];
      const canCraft = canCraftRecipe(recipe);
      
      // Highlight selected recipe
      if (i === selectedRecipe) {
        fill(100, 255, 255, craftingMenuAlpha * 0.4);
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
      yPos += 100;
    }
    textAlign(CENTER, CENTER);
  }
  
  pop();
}

function handleCraftingInput() {
  if (!craftingMenuOpen) return;
  
  // Navigate recipes
  if (keyPressedOnce(UP_ARROW)) {
    selectedRecipe = (selectedRecipe - 1 + craftingRecipes.length) % craftingRecipes.length;
  }
  if (keyPressedOnce(DOWN_ARROW)) {
    selectedRecipe = (selectedRecipe + 1) % craftingRecipes.length;
  }
  
  // Craft selected recipe
  if (keyPressedOnce(ENTER)) {
    craftItem(craftingRecipes[selectedRecipe]);
  }
}
