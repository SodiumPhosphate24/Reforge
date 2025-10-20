function controls() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    pXVel -= players[activePlayer].speed;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    pXVel += players[activePlayer].speed;
  }
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
    pYVel -= players[activePlayer].speed;
  }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
    pYVel += players[activePlayer].speed;
  }
  pYVel *= 0.8;
  pXVel *= 0.8;
  pX += pXVel;
  pY += pYVel;
  players[activePlayer].x = pX;
  players[activePlayer].y = pY;
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
    console.log("map copied to clipboard");
  }

  if (keyCode >= 49 && keyCode <= 56) {
    inventorySlot = keyCode - 48;
  }

  if (keyCode == 69) {
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
                break;
              }
            }
          }
          if (!stacked) {
            if (inventoryList[inventorySlot - 1] == null) {
              inventoryList[inventorySlot - 1] = (droppedItems[i].item);
              droppedItems.splice(i, 1);
            }
            else {
              droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], pX + 600, pY + 340))
              inventoryList[inventorySlot - 1] = droppedItems[i].item;
              droppedItems.splice(i, 1);
            }
          }
        }
        else {
          if (inventoryList[inventorySlot - 1] == null) {
            inventoryList[inventorySlot - 1] = (droppedItems[i].item);
            droppedItems.splice(i, 1);
          }
          else {
            droppedItems.push(new DroppedItem(inventoryList[inventorySlot - 1], pX + 600, pY + 340))
            inventoryList[inventorySlot - 1] = droppedItems[i].item;
            droppedItems.splice(i, 1);
          }
          break;
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

  if (keyCode == 76) {
    let hasRocks = false;
    let rocksIndex = 0;
    let hasCheese = false;
    let cheeseIndex = 0;
    for (let i = 0; i < inventoryList.length; i++) {
      if (inventoryList[i] != null) {
        if (inventoryList[i].name == "rock" && inventoryList[i].amount >= 5) {
          hasRocks = true;
          rocksIndex = i;
        }
        if (inventoryList[i].name == "cheese") {
          hasCheese = true;
          cheeseIndex = i;
        }
      }
    }
    if (hasRocks && hasCheese) {
      inventoryList[rocksIndex].amount -= 5;
      inventoryList[cheeseIndex].amount -= 1;
      players.push(new Player(pX + 50, pY, 35, 25, 10, 50, 1, PlayerImage));
      if (inventoryList[rocksIndex].amount <= 0) {
        inventoryList[rocksIndex] = null;
      }
      if (inventoryList[cheeseIndex].amount <= 0) {
        inventoryList[cheeseIndex] = null;
      }
    }
  }

  if (keyCode == 71) {
    speedBuff = !speedBuff;
  }

  if (keyCode == 84) {
    enemies.push(new Enemy("zombie"));
  }
  if (keyCode == 77) {
    messages.push(new Message("dialogue", ["Buschy: granny smith apple", "Wing: Red delicious apple", "Mario: Honeycrisp apple", "Luigi: Carrot", "Luigi: Haha u thought I was gon say apple"]))
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

}

function mouseClicked() {
  if (!editorMode) {
    if (inventoryList[inventorySlot - 1] != null) {
      if (inventoryList[inventorySlot - 1].type == "gun") {
        bullets.push(new Bullet("common"));
      }
      if (inventoryList[inventorySlot - 1].type == "consumable") {
        if (inventoryList[inventorySlot - 1].name == "cheese") {
          healthPoints += 10;
          inventoryList[inventorySlot - 1].amount -= 1;
          if (inventoryList[inventorySlot - 1].amount <= 0) {
            inventoryList[inventorySlot - 1] = null;
          }
        }
      }
    }
  }
}

function mouseWheel(event) {
  if (handleEditorMouseWheel && handleEditorMouseWheel(event)) {
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