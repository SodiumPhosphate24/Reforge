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
    if (activePlayer >= players.length){
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
    let count = 0;
    for(let i = 0; i < droppedItems.length; i++){
      if (droppedItems[count].checkPickup()){
        if (droppedItems[count].item.stackable){
          for (let j = 0; j < inventoryList.length; j++){
            if (inventoryList[j].name == droppedItems[count].item.name){
              inventoryList[j].amount += droppedItems[count].item.amount;
              droppedItems.splice(count, 1);
              count--;
              break;
            }
          }
          if (inventoryList.length < 8){
            inventoryList.push(droppedItems[count].item);
            droppedItems.splice(count, 1);
            count--;
          }
          else if (inventoryList.length >= 8){
            droppedItems.push(new DroppedItem(inventoryList[inventorySlot-1], pX + 600, pY + 340))
            inventoryList[inventorySlot-1] = droppedItems[count].item;
            droppedItems.splice(count, 1);
          }
        }
        else{
          if (inventoryList.length < 8){
            inventoryList.push(droppedItems[count].item);
            droppedItems.splice(count, 1);
            count--;
          }
          else if (inventoryList.length >= 8){
            droppedItems.push(new DroppedItem(inventoryList[inventorySlot-1], pX + 600, pY + 340))
            inventoryList[inventorySlot-1] = droppedItems[count].item;
            droppedItems.splice(count, 1);
          }
          break;
        }
      }
      count++;
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
    if(inventoryList.length > 0 && inventorySlot-1 < inventoryList.length){
      if (inventoryList[inventorySlot-1].type == "gun"){
        bullets.push(new Bullet("common"));
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