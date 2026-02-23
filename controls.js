var enemySpawns = "";
var lockCodeInput = "";
var lockCodeActive = false; 

function controls() {
  mouseHeld();
  // No controls during menu or transition
  if (gameState !== "playing") {
    return;
  }

  // Q Key: Player Switching
  if (keyIsDown(81) && players.length > 1) {
    qKeyHeldFrames++;
    if (qKeyHeldFrames >= qKeyHoldThreshold && !playerSelectionMenuOpen) {
      playerSelectionMenuOpen = true;
      selectedPlayerIndex = activePlayer;
      frozen = true;
    }
  } else {
    if (playerSelectionMenuOpen) {
      // Q released
      frozen = false;
    }
  }

  if (players[activePlayer].frozen == false && !playerSelectionMenuOpen) {
    if (trainTotaled && players[activePlayer].name === "ARGO") {
      // Allow slight residual movement while totaled
      if (keyIsDown(65)) pXVel -= players[activePlayer].speed * 0.1;
      if (keyIsDown(68)) pXVel += players[activePlayer].speed * 0.1;
      pXVel *= 0.8;
      pYVel *= 0.8;
    } else {
      if (keyIsDown(65)) {
        pXVel -= players[activePlayer].speed;
      }
      if (keyIsDown(68)) {
        pXVel += players[activePlayer].speed;
      }
      if (players[activePlayer].name != "ARGO") {
        if (keyIsDown(87)) {
          pYVel -= players[activePlayer].speed;
        }
        if (keyIsDown(83)) {
          pYVel += players[activePlayer].speed;
        }
      }
    }
  }
  pYVel *= 0.8;
  if (players[activePlayer].name != "ARGO") {
    pXVel *= 0.8;
  }
  else { pXVel *= .99 } //Argo has more momentum
  pX += pXVel;
  pY += pYVel;
  players[activePlayer].x = pX;
  players[activePlayer].y = pY;
  if (Math.abs(pXVel) > 0.2 || Math.abs(pYVel) > 0.2) {
    // No health depletion for human (activePlayer 0)
    if (activePlayer !== 0) {
      players[activePlayer].health -= .025;
    }
  }
  // Failsafe for failure to load world
  if (!gameWorld.length || !gameWorld[0]?.length) return;

  pX = constrain(pX, -600, gameWorld[0].length * 50 - width / 2 - pWidth);
  pY = constrain(pY, -400, gameWorld.length * 50 - height / 2 - pHeight);
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    if (gameState === "playing") {
      isPaused = !isPaused;
    }
  }
  // Q key: Player Selection
  if (keyCode == 67 && keyIsDown(17)) {
    navigator.clipboard.writeText(worldToString(gameWorld));
    console.log("map and crate inventories copied to clipboard");
  }

  // Number keys 1-8: Inventory Slots
  if (keyCode >= 49 && keyCode <= 56) {
    const hasActiveDialogue = messages.some(msg => msg.type === "dialogue");
    if (!hasActiveDialogue) {
      inventorySlot = keyCode - 48;
    }
  }

  // E key: Interaction
  if (keyCode == 69) {
    if (canFreeDaedalus) {
      clearTile(464, 169, 1);
    }
    // Check for leak repair
    if (nearestLeak) {
      particleSources[nearestLeak.index].spawnRate = 0;
      nearestLeak = null;
      totalLeaks--;
      if (totalLeaks == 0) {
        handleTriggers("Objective");
      }
      return;
    }
    // Check for boiler interaction
    if (distance(pX, pY, 12000, 12500) < 75) {
      // Checks fix first, if holding boiler cartridge
      if (triggerList.Objective.fixBoiler == false) {
        if (triggerList.Objective.fixLeaks) {
          if (inventoryList[inventorySlot - 1] != null) {
            if (inventoryList[inventorySlot - 1].name == "boiler cartridge") {
              useItem();
              handleTriggers("Objective");
            }
          }
        }
        else if(messages.length == 0){
          messages.push(new Message("dialogue", ["Prometheus IV: You need to fix the leaks before you can fix the boiler"]));
        }
      }
      // Then checks for a cartridge pickup
      else {
        if (generateCooldown <= 0) {
          for (let i = 0; i < inventoryList.length; i++) {
            if (inventoryList[i] != null) {
              if (inventoryList[i].name == "common cartridge") {
                inventoryList[i].amount++;
                generateCooldown = 1000;
                return;
              }
            }
            else {
              inventoryList[i] = new Item("consumable", "common cartridge", 1);
              generateCooldown = 750;
              return;
            }
          }
        }
      }
    }

    // Checks for item pickup
    if (nearestPickupItem) {
      const itemIndex = droppedItems.indexOf(nearestPickupItem);
      if (itemIndex === -1) return; // Item was removed, shouldn't happen

      const item = droppedItems[itemIndex];
      // If item is stackable, checks for existing stack
      if (item.item.stackable) {
        let stacked = false;
        for (let j = 0; j < inventoryList.length; j++) {
          if (inventoryList[j] != null) {
            if (inventoryList[j].name == item.item.name) {
              inventoryList[j].amount += item.item.amount;
              droppedItems.splice(itemIndex, 1);
              stacked = true;
              itemLabelAlpha = 1.5;
              handleTriggers("Pickup");
              return;
            }
          }
        }
        // If no stack found, checks for empty slot
        if (!stacked) {
          for (let j = 0; j < 8; j++) {
            if (inventoryList[j] == null) {
              inventoryList[j] = item.item;
              droppedItems.splice(itemIndex, 1);
              itemLabelAlpha = 1.5;
              handleTriggers("Pickup");
              return;
            }
          }
          const dropX = pX + 600 + pWidth / 2 - 15;
          const dropY = pY + 375 + pHeight / 2 - 15;
          droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], dropX, dropY))
          inventoryList[inventorySlot - 1] = item.item;
          droppedItems.splice(itemIndex, 1);
          itemLabelAlpha = 1.5;
          handleTriggers("Pickup");
          return;
        }
      }
      // If item is not stackable, checks for empty slot
      else {
        for (let j = 0; j < 8; j++) {
          if (inventoryList[j] == null) {
            inventoryList[j] = item.item;
            droppedItems.splice(itemIndex, 1);
            itemLabelAlpha = 1.5;
            handleTriggers("Pickup");
            return;
          }
        }
        const dropX = pX + 600 + pWidth / 2 - 15;
        const dropY = pY + 375 + pHeight / 2 - 15;
        droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], dropX, dropY))
        inventoryList[inventorySlot - 1] = item.item;
        droppedItems.splice(itemIndex, 1);
        itemLabelAlpha = 1.5;
        handleTriggers("Pickup");
        return;
      }
    }
    // Checks for crafting bench
    if (!inSewer && typeof isNearWorkbench === 'function' && isNearWorkbench()) {
      toggleCraftingMenu();
      return;
    }
  }

  // X key: Drop Item
  if (keyCode == 88) {
    if (inventoryList[inventorySlot - 1] != null) {
      droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], pX + 600, pY + 340));
      inventoryList[inventorySlot - 1] = null;
    }
  }

  // R key: Item Transfer
  if (keyCode == 82) {
    // Opens player transfer menu if holding an item and there are other players
    if (players.length > 1) {
      if (inventoryList[inventorySlot - 1] != null) {
        if (!playerTransferMenuOpen) {
          playerTransferMenuOpen = true;
          selectedTransferPlayerIndex = activePlayer;
          frozen = true;
        }
      }
    }
  }

  // V key: Drop legendary cartridge (Dev tool)
  if (keyCode == 86) {
    droppedItems.push(new DroppedItem(new Item("consumable", "legendary cartridge", 5), pX + 600, pY + 340));
  }

  // Number keys 0-9: Lock Code Input
  if (lockCodeActive && keyCode >= 48 && keyCode <= 57) {
    if (lockCodeInput.length < 4) {
      lockCodeInput += String.fromCharCode(keyCode);
    }
  }

  // Backspace: Delete last digit of lock code
  if (lockCodeActive && keyCode == 8) {
    lockCodeInput = lockCodeInput.slice(0, -1);
  }

  // Enter: Submit lock code
  if (lockCodeActive && keyCode == 13) {
    // Correct Code
    if (lockCodeInput === "1855") {
      lockCodeActive = false;
      lockCodeInput = "";
      handleTriggers("LockOpened");
      for (let k = messages.length - 1; k >= 0; k--) {
        if (messages[k].id === "Lock") {
          messages[k].closing = true;
        }
      }
      // Remove door tiles
      clearTile(256, 257, 1);
      clearTile(257, 257, 1);
      clearTile(258, 257, 1);
      // Remove Lock NPC
      for (let i = NonPlayerCharacters.length - 1; i >= 0; i--) {
        if (NonPlayerCharacters[i].id === "Lock") {
          NonPlayerCharacters.splice(i, 1);
          break;
        }
      }
    } else { // Wrong Code
      lockCodeActive = false;
      lockCodeInput = "";
      for (let k = messages.length - 1; k >= 0; k--) {
        if (messages[k].id === "Lock") {
          messages[k].closing = true;
        }
      }
    }
  }

  // Z key to dismiss lock dialogue
  if (lockCodeActive && keyCode == 90) {
    lockCodeActive = false;
    lockCodeInput = "";
    for (let k = messages.length - 1; k >= 0; k--) {
      if (messages[k].id === "Lock") {
        messages[k].closing = true;
      }
    }
  }

  // C key: Drop random item (Dev tool)
  if (keyCode == 67) {
    let r = Math.floor(Math.random() * itemConstructors.length);
    droppedItems.push(new DroppedItem(new Item(itemConstructors[r][0], itemConstructors[r][1], itemConstructors[r][2]), pX + 600, pY + 340));
  }

  // Arrow Keys: Player Selection Menu
  if (playerSelectionMenuOpen) {
    if (keyCode === UP_ARROW) {
      selectedPlayerIndex = (selectedPlayerIndex - 1 + players.length) % players.length;
    }
    if (keyCode === DOWN_ARROW) {
      selectedPlayerIndex = (selectedPlayerIndex + 1) % players.length;
    }
  }

  // Arrow Keys: Player Transfer Menu
  if (playerTransferMenuOpen) {
    if (keyCode === UP_ARROW) {
      selectedTransferPlayerIndex = (selectedTransferPlayerIndex - 1 + players.length) % players.length;
    }
    if (keyCode === DOWN_ARROW) {
      selectedTransferPlayerIndex = (selectedTransferPlayerIndex + 1) % players.length;
    }
  }

  // Editor key press handler
  if (typeof handleEditorKeyPress === "function") {
    handleEditorKeyPress();
  }

  // Number keys 1-4: Editor Layer Selection
  if (editorMode) {
    if (keyPressedOnce(49)) editorLayer = 0;
    if (keyPressedOnce(50)) editorLayer = 1;
    if (keyPressedOnce(51)) editorLayer = 2;
    if (keyPressedOnce(52)) editorLayer = 3;
  }

}

function keyReleased() {
  // Q key release - switch to selected player
  if (keyCode == 81) {
    if (playerSelectionMenuOpen) {
      switchPlayer(selectedPlayerIndex);
      playerSelectionMenuOpen = false;
    }
    qKeyHeldFrames = 0;
  }

  // R key release - complete transfer
  if (keyCode == 82) {
    if (players.length > 1) {
      if (playerTransferMenuOpen) {
        const itemToTransfer = inventoryList[inventorySlot - 1];
        const targetPlayer = players[selectedTransferPlayerIndex];

        // Find empty slot in target player's inventory
        let transferred = false;
        if (selectedTransferPlayerIndex != activePlayer){
          for (let i = 0; i < targetPlayer.inventory.length; i++) {
            if (targetPlayer.inventory[i] == null) {
              targetPlayer.inventory[i] = itemToTransfer;
              inventoryList[inventorySlot - 1] = null;
              transferred = true;
              break;
            }
            if (targetPlayer.inventory[i].name == itemToTransfer.name && itemToTransfer.stackable) {
              targetPlayer.inventory[i].amount += itemToTransfer.amount;
              inventoryList[inventorySlot - 1] = null;
              transferred = true;
              break;
            }
          }
        }

        playerTransferMenuOpen = false;
        frozen = false;
      }
    }
  }
}

function mouseHeld() {
  if (gameState !== "playing") {
    return;
  }
  //If holding a rifle, it will fire continuously
  if (mouseIsPressed){
    if (!editorMode) {
      if (inventoryList[inventorySlot-1] != null){
        if (recoil >= 10){
          if (inventoryList[inventorySlot-1].name == "rifle"){
            if (activePlayer === 0) {
              shoot("rifle");
            } else if (players[activePlayer].health > 10) {
              players[activePlayer].health -= 3;
              shoot("rifle");
              console.log("Shot Rifle");
            }
          }
        }
      }
    }
  }
}

function mouseClicked() {
  // No mouse input during menu or transition
  if (gameState !== "playing") {
    return;
  }

  if (!editorMode) {
    if (inventoryList[inventorySlot - 1] != null) {
      var currentItem = inventoryList[inventorySlot - 1];

      if (currentItem.type == "gun" && currentItem.name != "rifle") {
        // Only humans or healthy robots can shoot, and only robots consume battery
        if (activePlayer === 0) {
          shoot(currentItem.name);
        } else if (players[activePlayer].health > 10) {
          players[activePlayer].health -= 3;
          shoot(currentItem.name);
        }
      }
      if (currentItem.type == "consumable" && activePlayer != 0) {
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

function shoot(type){
  //Different shot patterns for different guns
  var currentItem = inventoryList[inventorySlot - 1];
  if (recoil >= 10) {
    if(type == "steam gun") {
      bullets.push(new Bullet("common", currentItem.damage));
    }
    if(type == "shotgun") {
      bullets.push(new Bullet("common", currentItem.damage));
      bullets.push(new Bullet("common", currentItem.damage, calculateAim() - 0.06));
      bullets.push(new Bullet("common", currentItem.damage, calculateAim() + 0.14));
    }
    if(type == "rifle") {
      bullets.push(new Bullet("common", currentItem.damage));
    }
  }
}

function useItem() {
  // Decrement item amount and remove if zero
  inventoryList[inventorySlot - 1].amount -= 1;
  if (inventoryList[inventorySlot - 1].amount <= 0) {
    inventoryList[inventorySlot - 1] = null;
  }
}

function mouseWheel(event) {
  if (typeof handleEditorMouseWheel === 'function' && handleEditorMouseWheel(event)) {
    return false; // Prevent default behavior in editor mode
  }

  // No scroll wheel input if active message
  const hasActiveDialogue = messages.some(msg => msg.type === "dialogue");
  if (hasActiveDialogue) {
    return false;
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

  return false; // Prevents default scrolling behavior
}