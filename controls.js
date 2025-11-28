function controls() {
  // Don't allow controls during menu or transition
  if (gameState !== "playing") {
    return;
  }
  
  if (players[activePlayer].frozen == false) {
    if (keyIsDown(65)) {
      pXVel -= players[activePlayer].speed;
    }
    if (keyIsDown(68)) {
      pXVel += players[activePlayer].speed;
    }
    if (keyIsDown(87)) {
      pYVel -= players[activePlayer].speed;
    }
    if (keyIsDown(83)) {
      pYVel += players[activePlayer].speed;
    }
  }
  pYVel *= 0.8;
  pXVel *= 0.8;
  pX += pXVel;
  pY += pYVel;
  players[activePlayer].x = pX;
  players[activePlayer].y = pY;
  if(Math.abs(pXVel) > 0.2 || Math.abs(pYVel) > 0.2){
    players[activePlayer].health -= .025;
  }
  // Guard if world failed to load
  if (!gameWorld.length || !gameWorld[0]?.length) return;

  pX = constrain(pX, -600, gameWorld[0].length * 50 - width / 2 - pWidth);
  pY = constrain(pY, -400, gameWorld.length * 50 - height / 2 - pHeight);
}

function mousePressed() { }

function keyPressed() {
  if (keyCode == 81) {
    activePlayer += 1;
    if (activePlayer >= players.length) {
      activePlayer = 0;
    }
    switchPlayer(activePlayer);
  }
  if (keyCode == 67 && keyIsDown(17)) {
    navigator.clipboard.writeText(worldToString(gameWorld));
    console.log("map and crate inventories copied to clipboard");
  }

  if (keyCode >= 49 && keyCode <= 56) {
    inventorySlot = keyCode - 48;
  }

  if (keyCode == 69) {
    // Check for leak repair first (highest priority when holding wrench)
    if (nearestLeak) {
      // Permanently repair the leak by setting spawn rate to 0
      particleSources[nearestLeak.index].spawnRate = 0;
      nearestLeak = null; // Clear the nearest leak
      totalLeaks--;
      if (totalLeaks == 0){
        handleTriggers("Objective");
      }
      return;
    }

    for (let i = droppedItems.length - 1; i >= 0; i--) {
      if (droppedItems[i].checkPickup()) {
        if (droppedItems[i].item.stackable) {
          let stacked = false;
          for (let j = 0; j < inventoryList.length; j++) {
            if (inventoryList[j] != null) {
              if (inventoryList[j].name == droppedItems[i].item.name) {
                inventoryList[j].amount += droppedItems[i].item.amount;
                droppedItems.splice(i, 1);
                stacked = true;
                itemLabelAlpha = 1.5;
                handleTriggers("Pickup");
                return;
              }
            }
          }
          if (!stacked) {
            if (inventoryList[inventorySlot - 1] == null) {
              inventoryList[inventorySlot - 1] = (droppedItems[i].item);
              droppedItems.splice(i, 1);
              itemLabelAlpha = 1.5;
            }
            else {
              const dropX = pX + 600 + pWidth / 2 - 15; // Center drop position
              const dropY = pY + 375 + pHeight / 2 - 15;
              droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], dropX, dropY))
              inventoryList[inventorySlot - 1] = droppedItems[i].item;
              droppedItems.splice(i, 1);
              itemLabelAlpha = 1.5;
            }
            handleTriggers("Pickup");
            return;
          }
        }
        else {
          if (inventoryList[inventorySlot - 1] == null) {
            inventoryList[inventorySlot - 1] = (droppedItems[i].item);
            droppedItems.splice(i, 1);
            itemLabelAlpha = 1.5;
          }
          else {
            const dropX = pX + 600 + pWidth / 2 - 15; // Center drop position
            const dropY = pY + 375 + pHeight / 2 - 15;
            droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], dropX, dropY))
            inventoryList[inventorySlot - 1] = droppedItems[i].item;
            droppedItems.splice(i, 1);
            itemLabelAlpha = 1.5;
          }
          handleTriggers("Pickup");
          return;
        }
      }
    }

    if (typeof isNearWorkbench === 'function' && isNearWorkbench()) {
      toggleCraftingMenu();
      return;
    }
  }

  if (keyCode == 88) {
    if (inventoryList[inventorySlot - 1] != null) {
      droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], pX + 600, pY + 340));
      inventoryList[inventorySlot - 1] = null;
    }
  }

  if (keyCode == 71) {
    speedBuff = !speedBuff;
  }

  if (keyCode == 84) {
    enemies.push(new Enemy("zombie"));
  }
  if (keyCode == 77) {
    // Check if there's already a dialogue message active
    const hasActiveDialogue = messages.some(msg => msg.type === "dialogue");
    if (!hasActiveDialogue) {
      messages.push(new Message("dialogue", ["Buschy: granny smith apple", "Wing: Red delicious apple", "Mario: Honeycrisp apple", "Luigi: Carrot", "Luigi: Haha u thought I was gon say apple"]))
    }
    messages.push(new Message("quest", "Big nerd time"))
  }
  if (keyCode == 86) {
    droppedItems.push(new DroppedItem(new Item("gun", "glock", 1), pX + 600, pY + 340));
  }

  if (keyCode == 67) {
    let r = Math.floor(Math.random() * itemConstructors.length);
    droppedItems.push(new DroppedItem(new Item(itemConstructors[r][0], itemConstructors[r][1], itemConstructors[r][2]), pX + 600, pY + 340));
  }

  if (typeof handleEditorKeyPress === "function") {
    handleEditorKeyPress();
  }

  // Layer switching for editor mode
  if (editorMode) {
    if (keyPressedOnce(49)) editorLayer = 0; // Key '1'
    if (keyPressedOnce(50)) editorLayer = 1; // Key '2'
    if (keyPressedOnce(51)) editorLayer = 2; // Key '3'
    if (keyPressedOnce(52)) editorLayer = 3; // Key '4'
  }

}

function mouseClicked() {
  // Don't allow game interactions during menu or transition
  if (gameState !== "playing") {
    return;
  }
  
  if (!editorMode) {
    if (inventoryList[inventorySlot - 1] != null) {
      var currentItem = inventoryList[inventorySlot - 1];

      if (currentItem.type == "gun") {
        if (players[activePlayer].health > 10 && recoil >= 10) {
          players[activePlayer].health -= 3;
          bullets.push(new Bullet("common", currentItem.damage));
        }
      }
      if (currentItem.type == "consumable" && currentWaypointIndex != 0) {
        if (healthPoints < players[activePlayer].maxHealth) {
          switch (currentItem.name) {
            case "cheese":
              players[activePlayer].health += 10;
              break;
            case "soda":
              players[activePlayer].health += 50;
              break;
            case "common cartridge":
              players[activePlayer].health += 25;
              break;
            case "rare cartridge":
              players[activePlayer].health += 50;
              break;
            case "legendary cartridge":
              players[activePlayer].health += 100;
              break;
          }
          // Use the item, then check if amount is zero.
          useItem();
          return;
        }
      }
    }
  }
}

function useItem(){
  inventoryList[inventorySlot - 1].amount -= 1;
  if (inventoryList[inventorySlot - 1].amount <= 0) {
    inventoryList[inventorySlot - 1] = null;
  }
}

function mouseWheel(event) {
  if (typeof handleEditorMouseWheel === 'function' && handleEditorMouseWheel(event)) {
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