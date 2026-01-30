var sewerLinks = new Map();
var sewerFirstInPair = new Map(); // Tracks which sewer is "first" (left exit) in each pair
var pendingSewerLink = null;
var puzzleSolved = new Map(); // Map of linkKey -> [leftOpen, rightOpen]
var puzzlePressurePlates = new Map(); // Map of linkKey -> [{x, y, active}]
var inSewer = false;
var sewerRooms = new Map(); // Map of linkKey -> roomData
var sewerEntryPoint = null;
var sewerExitA = null;
var sewerExitB = null;
var currentSewerLink = null;
var sewerPrompt = null;

const SEWER_ROOM_WIDTH = 24;
const SEWER_ROOM_HEIGHT = 15;
const SEWER_BORDER_TILE = 26;
const SEWER_CENTER_TILE = 39;
const SEWER_FENCE_TILE = 34;

function generateSewerRoom(isPuzzleRoom = false, linkKey = null) {
  const room = [];
  const midRow = Math.floor(SEWER_ROOM_HEIGHT / 2);
  const midCol = Math.floor(SEWER_ROOM_WIDTH / 2);

  let plates = [];
  if (isPuzzleRoom) {
    // 3x3 grid of pressure plates centered vertically, moved 2 tiles to the right
    const startX = 4; // Moved from 2 to 4
    const startY = midRow - 1; // Row index (centered for 3x3)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        plates.push({ 
          x: (startX + c) * 50 + 25, 
          y: (startY + r) * 50 + 25, 
          active: false,
          gridX: c,
          gridY: r,
          lastOccupied: false
        });
      }
    }
    if (linkKey) puzzlePressurePlates.set(linkKey, plates);
  }

  for (let r = 0; r < SEWER_ROOM_HEIGHT; r++) {
    const row = [];
    for (let c = 0; c < SEWER_ROOM_WIDTH; c++) {
      const isBorder = r === 0 || r === SEWER_ROOM_HEIGHT - 1 || c === 0 || c === SEWER_ROOM_WIDTH - 1;
      const isLeftOpening = c === 0 && (r === midRow || r === midRow - 1 || r === midRow + 1);
      const isRightOpening = c === SEWER_ROOM_WIDTH - 1 && (r === midRow || r === midRow - 1 || r === midRow + 1);
      const isMiddleWall = isPuzzleRoom && c === midCol && !isBorder && !isLeftOpening && !isRightOpening;

      let isPressurePlate = false;
      for (let pp of plates) {
        if (Math.floor(pp.x / 50) === c && Math.floor(pp.y / 50) === r) {
          isPressurePlate = true;
          break;
        }
      }

      let tileType;
      let colorIndex = 0;
      if (isLeftOpening || isRightOpening) {
        tileType = SEWER_CENTER_TILE;
      } else if (isMiddleWall) {
        tileType = SEWER_BORDER_TILE;
      } else if (isPressurePlate) {
        tileType = SEWER_CENTER_TILE;
        colorIndex = 1;
      } else if (isBorder) {
        tileType = SEWER_BORDER_TILE;
      } else {
        tileType = SEWER_CENTER_TILE;
      }

      row.push({
        layers: [
          { type: tileType, rotation: 0, flipH: false, flipV: false, colorIndex: colorIndex },
          null, null, null, null
        ]
      });
    }
    room.push(row);
  }
  return room;
}

var puzzleInteractionCount = new Map(); // Map of linkKey -> interactionCount

function updateSewerPuzzle() {
  if (!inSewer || !currentSewerLink) return;
  const linkKey = getSewerLinkKey(currentSewerLink.first.row, currentSewerLink.first.col);
  const plates = puzzlePressurePlates.get(linkKey);
  const room = sewerRooms.get(linkKey);
  if (!plates || !room) return;

  const midCol = Math.floor(SEWER_ROOM_WIDTH / 2);
  const solved = puzzleSolved.get(linkKey);
  if (solved && solved[0]) return; // Already solved

  // Handle toggle logic on Press E
  for (let j = 0; j < plates.length; j++) {
    const pp = plates[j];
    const px = pX + 600 + (pWidth || 35) / 2;
    const py = pY + 375 + (pHeight || 21) / 2;
    
    if (dist(px, py, pp.x, pp.y) < 25) {
      if (keyPressedOnce(69)) { // Press E
        togglePlateAndNeighbors(plates, pp.gridX, pp.gridY);
        // Increment interaction count
        const count = puzzleInteractionCount.get(linkKey) || 0;
        puzzleInteractionCount.set(linkKey, count + 1);
      }
      break;
    }
  }

  // Draw puzzle instruction prompt
  const firstKey = getSewerLinkKey(currentSewerLink.first.row, currentSewerLink.first.col);
  const interactionCount = puzzleInteractionCount.get(firstKey) || 0;
  
  if (puzzlePressurePlates.has(firstKey) && interactionCount === 0 && (!solved || !solved[0])) {
    if (!sewerPrompt) sewerPrompt = createPrompt();
    // Only call update(true) if it's not already active to avoid restarting the animation
    if (!sewerPrompt.isActive) {
      sewerPrompt.update(true);
    } else {
      // Still call update to let lerps finish, but with the same state
      sewerPrompt.update(true);
    }
    sewerPrompt.draw("Press E to toggle cell", [255, 150, 0], 100, true);
  } else if (sewerPrompt) {
    sewerPrompt.update(false);
    sewerPrompt.draw("", [255, 150, 0], 100, true);
  }

  // Update visual state
  for (let pp of plates) {
    const c = Math.floor(pp.x / 50), r = Math.floor(pp.y / 50);
    room[r][c].layers[0].colorIndex = pp.active ? 2 : 1;
  }

  // Check if all are active
  if (plates.every(p => p.active)) {
    for (let r = 1; r < SEWER_ROOM_HEIGHT - 1; r++) {
      room[r][midCol].layers[0].type = SEWER_CENTER_TILE;
    }
    puzzleSolved.set(linkKey, [true, true]);
    messages.push(new Message("Puzzle Solved!", 600, 375));
  }
}

function togglePlateAndNeighbors(plates, gx, gy) {
  const toggle = (x, y) => {
    const p = plates.find(plt => plt.gridX === x && plt.gridY === y);
    if (p) p.active = !p.active;
  };

  toggle(gx, gy);     // Center
  toggle(gx + 1, gy); // Right
  toggle(gx - 1, gy); // Left
  toggle(gx, gy + 1); // Down
  toggle(gx, gy - 1); // Up
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
    sewerFirstInPair.delete(key1);
    sewerFirstInPair.delete(oldPartner);
  }
  if (sewerLinks.has(key2)) {
    const oldPartner = sewerLinks.get(key2);
    sewerLinks.delete(oldPartner);
    sewerFirstInPair.delete(key2);
    sewerFirstInPair.delete(oldPartner);
  }
  
  sewerLinks.set(key1, key2);
  sewerLinks.set(key2, key1);
  sewerFirstInPair.set(key1, true);
  sewerFirstInPair.set(key2, false);
}

function unlinkSewer(row, col) {
  const key = getSewerLinkKey(row, col);
  if (sewerLinks.has(key)) {
    const partnerKey = sewerLinks.get(key);
    sewerLinks.delete(key);
    sewerLinks.delete(partnerKey);
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

function findNearbySewerCap(playerX, playerY, range = 80, requireLinked = true) {
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
            if (dist < range) {
              if (!requireLinked || isSewerLinked(r, c)) {
                return { row: r, col: c, x: tileX, y: tileY, linked: isSewerLinked(r, c) };
              }
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

  const entryKey = getSewerLinkKey(sewerRow, sewerCol);
  const enteredFromFirst = sewerFirstInPair.get(entryKey) === true;
  const firstKey = enteredFromFirst ? entryKey : getSewerLinkKey(linkedSewer.row, linkedSewer.col);

  currentSewerLink = {
    first: enteredFromFirst ? { row: sewerRow, col: sewerCol } : linkedSewer,
    second: enteredFromFirst ? linkedSewer : { row: sewerRow, col: sewerCol }
  };

  if (!sewerRooms.has(firstKey)) {
    const isFirstLink = sewerRooms.size === 0;
    sewerRooms.set(firstKey, generateSewerRoom(isFirstLink, firstKey));
    if (isFirstLink) puzzleSolved.set(firstKey, [false, false]);
  }

  if (!savedWorldState) savedWorldState = { world: gameWorld };
  gameWorld = sewerRooms.get(firstKey);

  const midRow = Math.floor(SEWER_ROOM_HEIGHT / 2);
  sewerExitA = { x: 1 * 50 + 25, y: midRow * 50 + 25 };
  sewerExitB = { x: (SEWER_ROOM_WIDTH - 2) * 50 + 25, y: midRow * 50 + 25 };

  pX = (enteredFromFirst ? sewerExitA.x : sewerExitB.x) - 600 - pWidth / 2;
  pY = (enteredFromFirst ? sewerExitA.y : sewerExitB.y) - 375 - pHeight / 2;

  players[activePlayer].x = pX;
  players[activePlayer].y = pY;
  players[activePlayer].inSewer = true;
  inSewer = true;
  return true;
}

function exitSewer(exitSide) {
  if (!savedWorldState || !currentSewerLink) return false;
  
  // Reset puzzle instruction count for this room when leaving
  const currentKey = getSewerLinkKey(currentSewerLink.first.row, currentSewerLink.first.col);
  puzzleInteractionCount.set(currentKey, 0);

  gameWorld = savedWorldState.world;
  const exitCoords = exitSide === 'A' ? currentSewerLink.first : currentSewerLink.second;
  pX = exitCoords.col * 50 - 600 + 25 - pWidth / 2;
  pY = exitCoords.row * 50 - 375 + 25 - pHeight / 2;
  players[activePlayer].x = pX;
  players[activePlayer].y = pY;
  players[activePlayer].inSewer = false;
  camX = -pX; camY = -pY;
  inSewer = false;
  return true;
}

var savedWorldState = null;

function checkSewerExits() {
  if (!inSewer) return;
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  const midRow = Math.floor(SEWER_ROOM_HEIGHT / 2);
  const midY = midRow * 50 + 25;
  const nearMiddleY = Math.abs(playerCenterY - midY) < 75;
  
  if (playerCenterX < 50 && nearMiddleY) {
    exitSewer('A');
  } else if (playerCenterX > (SEWER_ROOM_WIDTH - 1) * 50 && nearMiddleY) {
    exitSewer('B');
  }
}

function drawSewerPrompt() {
  if (inSewer) {
    if (sewerPrompt) {
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

// Serialization for sewer rooms
function sewerRoomToString(linkKey) {
  const room = sewerRooms.get(linkKey);
  if (!room) return "";
  // We can reuse the worldToString logic if we make it generic, 
  // but for now let's just use the current room
  return worldToString(room);
}

function stringToSewerRoom(str, linkKey, isPuzzle = false) {
  if (!str || str.trim() === "") return null;
  // Save current world to restore it after parsing
  const oldWorld = gameWorld;
  // Use stringToWorld to parse the room
  // This is a bit hacky because stringToWorld sets global gameWorld
  stringToWorld(str);
  const parsedRoom = gameWorld;
  gameWorld = oldWorld;
  sewerRooms.set(linkKey, parsedRoom);
  if (isPuzzle) puzzleSolved.set(linkKey, [false, false]);
  return parsedRoom;
}

function handleSewerEditorMode() {
  if (!editorMode) return;

  // Copy sewer room string to clipboard if in sewer
  if (inSewer && keyIsDown(CONTROL) && keyPressedOnce(67)) { // Ctrl+C
    if (currentSewerLink) {
      const entryKey = getSewerLinkKey(currentSewerLink.first.row, currentSewerLink.first.col);
      const roomStr = sewerRoomToString(entryKey);
      copyToClipboard(roomStr);
      console.log("Sewer room copied to clipboard!");
    }
  }

  if (keyPressedOnce(76)) {
    const nearbySewer = findNearbySewerCap(pX, pY, 80, false);
    if (nearbySewer && !nearbySewer.linked) {
      if (!pendingSewerLink) {
        pendingSewerLink = { row: nearbySewer.row, col: nearbySewer.col };
      } else if (pendingSewerLink.row !== nearbySewer.row || pendingSewerLink.col !== nearbySewer.col) {
        linkSewers(pendingSewerLink.row, pendingSewerLink.col, nearbySewer.row, nearbySewer.col);
        pendingSewerLink = null;
      }
    } else if (!nearbySewer) {
      if (pendingSewerLink) pendingSewerLink = null;
    }
  }
}

function drawSewerEditorUI() {
  if (!editorMode) return;
  push();
  if (pendingSewerLink) {
    fill(0, 200, 255);
    noStroke();
    textSize(16);
    textAlign(CENTER);
    text(`Sewer marked - Press L near another to link`, width / 2, 70);
    const sewerX = pendingSewerLink.col * 50 + camX;
    const sewerY = pendingSewerLink.row * 50 + camY;
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
  }
  pop();
}

function sewerLinksToString() {
  const pairs = [];
  const processed = new Set();
  for (let [key, partnerKey] of sewerLinks) {
    if (!processed.has(key) && !processed.has(partnerKey)) {
      if (sewerFirstInPair.get(key) === true) {
        pairs.push(`${key}:${partnerKey}`);
      } else {
        pairs.push(`${partnerKey}:${key}`);
      }
      processed.add(key);
      processed.add(partnerKey);
    }
  }
  return pairs.join(';');
}

function stringToSewerLinks(str) {
  sewerLinks.clear();
  sewerFirstInPair.clear();
  if (!str || str.trim() === '') return;
  const pairs = str.split(';');
  for (let pair of pairs) {
    if (pair.includes(':')) {
      const [key1, key2] = pair.split(':');
      sewerLinks.set(key1, key2);
      sewerLinks.set(key2, key1);
      sewerFirstInPair.set(key1, true);
      sewerFirstInPair.set(key2, false);
    }
  }
}
