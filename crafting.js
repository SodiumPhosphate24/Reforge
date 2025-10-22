
// Crafting menu state
var craftingMenuOpen = false;
var craftingRecipes = [
  {
    name: "Glock",
    ingredients: [
      { itemName: "rock", amount: 10 }
    ],
    output: { type: "gun", name: "glock", amount: 1 }
  },
  {
    name: "Grenade",
    ingredients: [
      { itemName: "rock", amount: 5 },
      { itemName: "cheese", amount: 1 }
    ],
    output: { type: "projectile", name: "grenade", amount: 1 }
  }
  // Add more recipes as needed
];

var selectedRecipe = 0;

function isNearWorkbench() {
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  
  const col = Math.floor(playerCenterX / 50);
  const row = Math.floor(playerCenterY / 50);
  
  // Check surrounding tiles (3x3 area)
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r < 0 || c < 0 || r >= gameWorld.length || c >= gameWorld[r].length) continue;
      
      const cell = gameWorld[r][c];
      if (!cell) continue;
      
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
  return false;
}

function toggleCraftingMenu() {
  if (isNearWorkbench()) {
    craftingMenuOpen = !craftingMenuOpen;
    if (craftingMenuOpen) {
      selectedRecipe = 0;
    }
  }
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

function drawCraftingMenu() {
  if (!craftingMenuOpen) return;
  
  // Semi-transparent background
  fill(0, 0, 0, 200);
  rect(200, 100, 800, 550, 10);
  
  // Title
  fill(100, 255, 255);
  textSize(32);
  textFont(Silkscreen);
  textAlign(CENTER, CENTER);
  text("CRAFTING MENU", 600, 140);
  
  // Instructions
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
      fill(100, 255, 255, 100);
      rect(220, yPos - 5, 760, 80, 5);
    }
    
    // Recipe name
    fill(canCraft ? color(100, 255, 100) : color(255, 100, 100));
    text(recipe.name, 240, yPos);
    
    // Ingredients
    fill(255);
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
