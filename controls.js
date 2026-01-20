var enemySpawns = "";
var lockCodeInput = ""; // Track code input for Lock NPC
var lockCodeActive = false; // Whether we're inputting a code

function controls() {
  // Don't allow controls during menu or transition
  if (gameState !== "playing") {
    return;
  }

  // Handle Q key hold for player selection menu
  if (keyIsDown(81) && players.length > 1) {
    qKeyHeldFrames++;
    if (qKeyHeldFrames >= qKeyHoldThreshold && !playerSelectionMenuOpen) {
      playerSelectionMenuOpen = true;
      selectedPlayerIndex = activePlayer;
      frozen = true; // Freeze game while menu is open
    }
  } else {
    if (playerSelectionMenuOpen) {
      // Q was released, close menu
      frozen = false;
    }
  }

  if (players[activePlayer].frozen == false && !playerSelectionMenuOpen) {
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
  if (Math.abs(pXVel) > 0.2 || Math.abs(pYVel) > 0.2) {
    // No health depletion for human (activePlayer 0)
    if (activePlayer !== 0) {
      players[activePlayer].health -= .025;
    }
  }
  // Guard if world failed to load
  if (!gameWorld.length || !gameWorld[0]?.length) return;

  pX = constrain(pX, -600, gameWorld[0].length * 50 - width / 2 - pWidth);
  pY = constrain(pY, -400, gameWorld.length * 50 - height / 2 - pHeight);
}

function mousePressed() { }

function keyPressed() {
  // Q key handling moved to keyReleased for hold-to-select menu
  if (keyCode == 67 && keyIsDown(17)) {
    navigator.clipboard.writeText(worldToString(gameWorld));
    console.log("map and crate inventories copied to clipboard");
  }

  if (keyCode >= 49 && keyCode <= 56) {
    // Don't allow inventory switching during dialogue
    const hasActiveDialogue = messages.some(msg => msg.type === "dialogue");
    if (!hasActiveDialogue) {
      inventorySlot = keyCode - 48;
    }
  }

  if (keyCode == 69) {
    if (canFreeDaedalus) {
      clearTile(464, 169, 1);
    }
    // Check for leak repair first (highest priority when holding wrench)
    if (nearestLeak) {
      // Permanently repair the leak by setting spawn rate to 0
      particleSources[nearestLeak.index].spawnRate = 0;
      nearestLeak = null; // Clear the nearest leak
      totalLeaks--;
      if (totalLeaks == 0) {
        handleTriggers("Objective");
      }
      return;
    }
    // Check for boiler repair next (if holding boiler cartridge)
    if (distance(pX, pY, 12000, 12500) < 75) {
      if (triggerList.Objective.fixBoiler == false) {
        if (inventoryList[inventorySlot - 1] != null) {
          if (inventoryList[inventorySlot - 1].name == "boiler cartridge") {
            useItem();
            handleTriggers("Objective");
          }
        }
      }
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
              generateCooldown = 1000;
              return;
            }
          }
        }
      }
    }

    if (inventoryList[inventorySlot - 1] != null) {
      if (inventoryList[inventorySlot - 1].name == "boiler cartridge") {
        useItem();
        handleTriggers("Objective");
      }
    }

    // Use nearestPickupItem instead of looping
    if (nearestPickupItem) {
      const itemIndex = droppedItems.indexOf(nearestPickupItem);
      if (itemIndex === -1) return; // Item was removed, shouldn't happen

      const item = droppedItems[itemIndex];

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
        if (!stacked) {
          let space = false;
          for (let j = 0; j < inventoryList.length; j++) {
            
          }
          if (inventoryList[inventorySlot - 1] == null) {
            inventoryList[inventorySlot - 1] = item.item;
            droppedItems.splice(itemIndex, 1);
            itemLabelAlpha = 1.5;
          }
          else {
            const dropX = pX + 600 + pWidth / 2 - 15;
            const dropY = pY + 375 + pHeight / 2 - 15;
            droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], dropX, dropY))
            inventoryList[inventorySlot - 1] = item.item;
            droppedItems.splice(itemIndex, 1);
            itemLabelAlpha = 1.5;
          }
          handleTriggers("Pickup");
          return;
        }
      }
      else {
        if (inventoryList[inventorySlot - 1] == null) {
          inventoryList[inventorySlot - 1] = item.item;
          droppedItems.splice(itemIndex, 1);
          itemLabelAlpha = 1.5;
        }
        else {
          const dropX = pX + 600 + pWidth / 2 - 15;
          const dropY = pY + 375 + pHeight / 2 - 15;
          droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], dropX, dropY))
          inventoryList[inventorySlot - 1] = item.item;
          droppedItems.splice(itemIndex, 1);
          itemLabelAlpha = 1.5;
        }
        handleTriggers("Pickup");
        return;
      }
    }

    if (typeof isNearWorkbench === 'function' && isNearWorkbench()) {
      toggleCraftingMenu();
      return;
    }

    // Crowbar/Crate interaction
    const heldItem = inventoryList[inventorySlot - 1];
    if (heldItem && heldItem.name.toLowerCase().includes("crowbar")) {
      const checkRange = 60;
      const gridX = Math.floor((pX + 600 + pWidth / 2) / 50);
      const gridY = Math.floor((pY + 375 + pHeight / 2) / 50);

      for (let r = gridY - 2; r <= gridY + 2; r++) {
        for (let c = gridX - 2; c <= gridX + 2; c++) {
          if (r >= 0 && r < gameWorld.length && c >= 0 && c < gameWorld[0].length) {
            for (let L = 0; L < 4; L++) {
              if (gameWorld[r][c].layers[L] && (gameWorld[r][c].layers[L].type === 5 || gameWorld[r][c].layers[L].type === 40)) {
                let centerX = c * 50 + 25;
                let centerY = r * 50 + 25;
                if (distance(pX + 600 + pWidth / 2, pY + 375 + pHeight / 2, centerX, centerY) < checkRange) {
                  const crateKey = r + "," + c;
                  const storedItems = crateInventories.get(crateKey);
                  if (storedItems && storedItems.length > 0) {
                    for (let item of storedItems) {
                      droppedItems.push(new DroppedItem(new Item(item[0], item[1], item[2]), centerX - 15, centerY - 15));
                    }
                    crateInventories.delete(crateKey);
                  }
                  clearTile(c, r, L);
                  console.log("Crate Opened");
                  return;
                }
              }
            }
          }
        }
      }
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

  if (keyCode == 82) {
    // Open player selection menu for item transfer (if holding item)
    if (inventoryList[inventorySlot - 1] != null) {
      if (!playerTransferMenuOpen) {
        playerTransferMenuOpen = true;
        selectedTransferPlayerIndex = 0;
        frozen = true;
      }
    }
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
    droppedItems.push(new DroppedItem(new Item("consumable", "legendary cartridge", 5), pX + 600, pY + 340));
  }

  // Handle numeric input for Lock code (0-9)
  if (lockCodeActive && keyCode >= 48 && keyCode <= 57) {
    if (lockCodeInput.length < 4) {
      lockCodeInput += String.fromCharCode(keyCode);
    }
  }

  // Backspace to delete last digit
  if (lockCodeActive && keyCode == 8) {
    lockCodeInput = lockCodeInput.slice(0, -1);
  }

  // Enter to submit code or dismiss if already open
  if (lockCodeActive && keyCode == 13) {
    if (lockCodeInput === "1855") {
      // Correct code!
      lockCodeActive = false;
      lockCodeInput = "";
      handleTriggers("LockOpened");
      // Close the dialogue
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
      // Trigger objective
    } else {
      // Wrong code or just dismissing
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

  if (keyCode == 67) {
    let r = Math.floor(Math.random() * itemConstructors.length);
    droppedItems.push(new DroppedItem(new Item(itemConstructors[r][0], itemConstructors[r][1], itemConstructors[r][2]), pX + 600, pY + 340));
  }

  // Handle arrow keys for player selection menu
  if (playerSelectionMenuOpen) {
    if (keyCode === UP_ARROW) {
      selectedPlayerIndex = (selectedPlayerIndex - 1 + players.length) % players.length;
    }
    if (keyCode === DOWN_ARROW) {
      selectedPlayerIndex = (selectedPlayerIndex + 1) % players.length;
    }
  }

  // Handle arrow keys for transfer menu
  if (playerTransferMenuOpen) {
    if (keyCode === UP_ARROW) {
      selectedTransferPlayerIndex = (selectedTransferPlayerIndex - 1 + players.length) % players.length;
    }
    if (keyCode === DOWN_ARROW) {
      selectedTransferPlayerIndex = (selectedTransferPlayerIndex + 1) % players.length;
    }
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

function keyReleased() {
  // Q key release - switch to selected player if menu was open
  if (keyCode == 81) {
    if (playerSelectionMenuOpen) {
      switchPlayer(selectedPlayerIndex);
      playerSelectionMenuOpen = false;
    }
    qKeyHeldFrames = 0;
  }

  // R key release - complete transfer
  if (keyCode == 82) {
    if (playerTransferMenuOpen) {
      const itemToTransfer = inventoryList[inventorySlot - 1];
      const targetPlayer = players[selectedTransferPlayerIndex];

      // Find empty slot in target player's inventory
      let transferred = false;
      for (let i = 0; i < targetPlayer.inventory.length; i++) {
        if (targetPlayer.inventory[i] == null) {
          targetPlayer.inventory[i] = itemToTransfer;
          inventoryList[inventorySlot - 1] = null;
          transferred = true;
          break;
        }
      }

      playerTransferMenuOpen = false;
      frozen = false;
    }
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
        if (recoil >= 10) {
          // Only humans or healthy robots can shoot, and only robots consume battery
          if (activePlayer === 0) {
            bullets.push(new Bullet("common", currentItem.damage));
          } else if (players[activePlayer].health > 10) {
            players[activePlayer].health -= 3;
            bullets.push(new Bullet("common", currentItem.damage));
          }
        }
      }
      if (currentItem.type == "consumable" && currentWaypointIndex > 1) {
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

function useItem() {
  inventoryList[inventorySlot - 1].amount -= 1;
  if (inventoryList[inventorySlot - 1].amount <= 0) {
    inventoryList[inventorySlot - 1] = null;
  }
}

function mouseWheel(event) {
  if (typeof handleEditorMouseWheel === 'function' && handleEditorMouseWheel(event)) {
    return false; // Editor handled it, prevent default behavior
  }

  // Check if there's an active dialogue - prevent inventory switching
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

  return false; // Prevents default scrolling behavior (reducing system lag)
}