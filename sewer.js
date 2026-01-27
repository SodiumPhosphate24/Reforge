var sewerLinks = new Map();
var linkingSewerMode = false;
var firstSewerCoord = null;
var inSewer = false;
var sewerRoom = null;
var sewerEntryPoint = null;
var sewerExitA = null;
var sewerExitB = null;
var currentSewerLink = null;
var sewerPrompt = null;

const SEWER_ROOM_WIDTH = 24;
const SEWER_ROOM_HEIGHT = 15;
const SEWER_BORDER_TILE = 26;
const SEWER_CENTER_TILE = 39;

function generateSewerRoom() {
  const room = [];
  for (let r = 0; r < SEWER_ROOM_HEIGHT; r++) {
    const row = [];
    for (let c = 0; c < SEWER_ROOM_WIDTH; c++) {
      const isBorder = r === 0 || r === SEWER_ROOM_HEIGHT - 1 || c === 0 || c === SEWER_ROOM_WIDTH - 1;
      const tileType = isBorder ? SEWER_BORDER_TILE : SEWER_CENTER_TILE;
      row.push({
        layers: [
          { type: tileType, rotation: 0, flipH: false, flipV: false, colorIndex: 0 },
          null,
          null,
          null,
          null
        ]
      });
    }
    room.push(row);
  }
  return room;
}

function initSewerRoom() {
  sewerRoom = [];
  for (let r = 0; r < SEWER_ROOM_HEIGHT; r++) {
    const row = [];
    for (let c = 0; c < SEWER_ROOM_WIDTH; c++) {
      const isBorder = r === 0 || r === SEWER_ROOM_HEIGHT - 1 || c === 0 || c === SEWER_ROOM_WIDTH - 1;
      const tileType = isBorder ? SEWER_BORDER_TILE : SEWER_CENTER_TILE;
      row.push({
        layers: [
          { type: tileType, rotation: 0, flipH: false, flipV: false, colorIndex: 0 },
          null,
          null,
          null,
          null
        ]
      });
    }
    sewerRoom.push(row);
  }
  
  sewerExitA = { x: 1 * 50 + 25, y: Math.floor(SEWER_ROOM_HEIGHT / 2) * 50 };
  sewerExitB = { x: (SEWER_ROOM_WIDTH - 2) * 50 + 25, y: Math.floor(SEWER_ROOM_HEIGHT / 2) * 50 };
}

function getSewerLinkKey(row, col) {
  return `${row},${col}`;
}

function linkSewers(row1, col1, row2, col2) {
  const key1 = getSewerLinkKey(row1, col1);
  const key2 = getSewerLinkKey(row2, col2);
  
  if (sewerLinks.has(key1)) {
    const oldPartner = sewerLinks.get(key1);
    sewerLinks.delete(oldPartner);
  }
  if (sewerLinks.has(key2)) {
    const oldPartner = sewerLinks.get(key2);
    sewerLinks.delete(oldPartner);
  }
  
  sewerLinks.set(key1, key2);
  sewerLinks.set(key2, key1);
  console.log(`Linked sewers: (${row1},${col1}) <-> (${row2},${col2})`);
}

function unlinkSewer(row, col) {
  const key = getSewerLinkKey(row, col);
  if (sewerLinks.has(key)) {
    const partnerKey = sewerLinks.get(key);
    sewerLinks.delete(key);
    sewerLinks.delete(partnerKey);
    console.log(`Unlinked sewer at (${row},${col})`);
  }
}

function isSewerLinked(row, col) {
  return sewerLinks.has(getSewerLinkKey(row, col));
}

function getLinkedSewer(row, col) {
  const key = getSewerLinkKey(row, col);
  if (sewerLinks.has(key)) {
    const partnerKey = sewerLinks.get(key);
    const [partnerRow, partnerCol] = partnerKey.split(',').map(Number);
    return { row: partnerRow, col: partnerCol };
  }
  return null;
}

function findNearbySewerCap(playerX, playerY, range = 80) {
  const playerCenterX = playerX + 600 + pWidth / 2;
  const playerCenterY = playerY + 375 + pHeight / 2;
  
  const startCol = Math.max(0, Math.floor((playerCenterX - range) / 50));
  const endCol = Math.min(gameWorld[0].length - 1, Math.ceil((playerCenterX + range) / 50));
  const startRow = Math.max(0, Math.floor((playerCenterY - range) / 50));
  const endRow = Math.min(gameWorld.length - 1, Math.ceil((playerCenterY + range) / 50));
  
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = gameWorld[r] && gameWorld[r][c];
      if (cell && cell.layers) {
        for (let layer of cell.layers) {
          if (layer && layer.type === 44) {
            const tileX = c * 50 + 25;
            const tileY = r * 50 + 25;
            const dist = distance(playerCenterX, playerCenterY, tileX, tileY);
            if (dist < range && isSewerLinked(r, c)) {
              return { row: r, col: c, x: tileX, y: tileY };
            }
          }
        }
      }
    }
  }
  return null;
}

function enterSewer(sewerRow, sewerCol) {
  const linkedSewer = getLinkedSewer(sewerRow, sewerCol);
  if (!linkedSewer) return false;
  
  currentSewerLink = {
    entry: { row: sewerRow, col: sewerCol },
    exit: linkedSewer
  };
  
  initSewerRoom();
  
  savedWorldState = {
    world: gameWorld,
    playerX: pX,
    playerY: pY
  };
  
  gameWorld = sewerRoom;
  
  pX = sewerExitA.x - 600 - pWidth / 2;
  pY = sewerExitA.y - 375 - pHeight / 2;
  
  inSewer = true;
  console.log("Entered sewer system");
  return true;
}

function exitSewer(exitSide) {
  if (!inSewer || !savedWorldState || !currentSewerLink) return false;
  
  gameWorld = savedWorldState.world;
  
  let exitCoords;
  if (exitSide === 'A') {
    exitCoords = currentSewerLink.entry;
  } else {
    exitCoords = currentSewerLink.exit;
  }
  
  pX = exitCoords.col * 50 - 600 + 25 - pWidth / 2;
  pY = exitCoords.row * 50 - 375 + 25 - pHeight / 2;
  
  inSewer = false;
  currentSewerLink = null;
  savedWorldState = null;
  console.log("Exited sewer system");
  return true;
}

var savedWorldState = null;

function checkSewerExits() {
  if (!inSewer) return;
  
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  
  const distToA = distance(playerCenterX, playerCenterY, sewerExitA.x, sewerExitA.y);
  const distToB = distance(playerCenterX, playerCenterY, sewerExitB.x, sewerExitB.y);
  
  if (distToA < 60 && keyPressedOnce(69)) {
    exitSewer('A');
  } else if (distToB < 60 && keyPressedOnce(69)) {
    exitSewer('B');
  }
}

function drawSewerPrompt() {
  if (inSewer) {
    if (!sewerPrompt) sewerPrompt = createPrompt();
    
    const playerCenterX = pX + 600 + pWidth / 2;
    const playerCenterY = pY + 375 + pHeight / 2;
    
    const distToA = distance(playerCenterX, playerCenterY, sewerExitA.x, sewerExitA.y);
    const distToB = distance(playerCenterX, playerCenterY, sewerExitB.x, sewerExitB.y);
    
    if (distToA < 60) {
      handleInteractionPrompt(sewerPrompt, sewerExitA.x, sewerExitA.y, 60, "Press E to exit sewer (Entry)", true);
    } else if (distToB < 60) {
      handleInteractionPrompt(sewerPrompt, sewerExitB.x, sewerExitB.y, 60, "Press E to exit sewer (Linked)", true);
    } else {
      sewerPrompt.update(false);
      sewerPrompt.draw("");
    }
  } else {
    const nearbySewer = findNearbySewerCap(pX, pY);
    if (nearbySewer) {
      if (!sewerPrompt) sewerPrompt = createPrompt();
      handleInteractionPrompt(sewerPrompt, nearbySewer.x, nearbySewer.y, 80, "Press E to enter sewer", true);
      
      if (keyPressedOnce(69)) {
        enterSewer(nearbySewer.row, nearbySewer.col);
      }
    } else if (sewerPrompt) {
      sewerPrompt.update(false);
      sewerPrompt.draw("");
    }
  }
}

function handleSewerEditorMode() {
  if (!editorMode) return;
  
  if (keyPressedOnce(76)) {
    linkingSewerMode = !linkingSewerMode;
    if (!linkingSewerMode) {
      firstSewerCoord = null;
    }
    console.log("Sewer linking mode:", linkingSewerMode ? "ON" : "OFF");
  }
  
  if (linkingSewerMode && mouseIsPressed && mouseButton === LEFT) {
    const worldX = mouseX - camX;
    const worldY = mouseY - camY;
    const col = Math.floor(worldX / 50);
    const row = Math.floor(worldY / 50);
    
    if (row >= 0 && row < gameWorld.length && col >= 0 && col < gameWorld[0].length) {
      const cell = gameWorld[row][col];
      if (cell && cell.layers) {
        let isSewerTile = false;
        for (let layer of cell.layers) {
          if (layer && layer.type === 44) {
            isSewerTile = true;
            break;
          }
        }
        
        if (isSewerTile) {
          if (!firstSewerCoord) {
            firstSewerCoord = { row, col };
            console.log(`First sewer selected at (${row}, ${col})`);
          } else if (firstSewerCoord.row !== row || firstSewerCoord.col !== col) {
            linkSewers(firstSewerCoord.row, firstSewerCoord.col, row, col);
            firstSewerCoord = null;
            linkingSewerMode = false;
          }
        }
      }
    }
  }
}

function drawSewerEditorUI() {
  if (!editorMode || !linkingSewerMode) return;
  
  push();
  fill(0, 200, 255);
  noStroke();
  textSize(16);
  textAlign(CENTER);
  text("SEWER LINKING MODE - Click two sewer caps to link them", width / 2, 70);
  
  if (firstSewerCoord) {
    text(`First sewer selected at (${firstSewerCoord.row}, ${firstSewerCoord.col}) - Click another sewer to link`, width / 2, 90);
    
    const sewerX = firstSewerCoord.col * 50 + camX;
    const sewerY = firstSewerCoord.row * 50 + camY;
    stroke(0, 255, 255);
    strokeWeight(3);
    noFill();
    rect(sewerX, sewerY, 50, 50);
  }
  
  for (let [key, partnerKey] of sewerLinks) {
    const [row, col] = key.split(',').map(Number);
    const [pRow, pCol] = partnerKey.split(',').map(Number);
    
    const x1 = col * 50 + 25 + camX;
    const y1 = row * 50 + 25 + camY;
    const x2 = pCol * 50 + 25 + camX;
    const y2 = pRow * 50 + 25 + camY;
    
    stroke(0, 255, 0, 150);
    strokeWeight(2);
    line(x1, y1, x2, y2);
    
    noStroke();
    fill(0, 255, 0, 100);
    ellipse(x1, y1, 20, 20);
  }
  
  pop();
}

function sewerLinksToString() {
  const pairs = [];
  const processed = new Set();
  
  for (let [key, partnerKey] of sewerLinks) {
    if (!processed.has(key) && !processed.has(partnerKey)) {
      pairs.push(`${key}:${partnerKey}`);
      processed.add(key);
      processed.add(partnerKey);
    }
  }
  
  return pairs.join(';');
}

function stringToSewerLinks(str) {
  sewerLinks.clear();
  if (!str || str.trim() === '') return;
  
  const pairs = str.split(';');
  for (let pair of pairs) {
    if (pair.includes(':')) {
      const [key1, key2] = pair.split(':');
      sewerLinks.set(key1, key2);
      sewerLinks.set(key2, key1);
    }
  }
  console.log(`Loaded ${sewerLinks.size / 2} sewer link pairs`);
}
