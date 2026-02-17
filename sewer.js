var sewerLinks = new Map();
var sewerFirstInPair = new Map(); // Tracks which sewer is "first" (left exit) in each pair
var pendingSewerLink = null;
var puzzleSolved = new Map(); // Map of linkKey -> [leftOpen, rightOpen]
var puzzlePressurePlates = new Map(); // Map of linkKey -> [{x, y, active}]
var puzzleInteractionCount = new Map(); // Map of linkKey -> interactionCount
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

var mazePaths = new Map(); // Map of linkKey -> Set of "r,c" safe tiles
var mazeFlashTimers = new Map(); // Map of linkKey -> timer
var mazeScanProgress = new Map(); // Map of linkKey -> scan column progress (for animation)
var mazeTileAlpha = new Map(); // Map of linkKey -> Map of "r,c" -> alpha (for smooth fade)

// Fixed constant path for the shadow maze (always the same)
const FIXED_MAZE_PATH = new Set([
  "7,3", "7,4", "6,4", "6,5", "5,5", "5,6", "5,7", "6,7", "7,7", "7,8",
  "8,8", "8,9", "8,10", "7,10", "6,10", "6,11", "6,12", "7,12", "8,12",
  "8,13", "8,14", "7,14", "6,14", "5,14", "5,15", "5,16", "6,16", "7,16",
  "7,17", "7,18", "7,19", "7,20"
]);

function generateSewerRoom(roomType = "empty", linkKey = null) {
  const room = [];
  const midRow = Math.floor(SEWER_ROOM_HEIGHT / 2);
  const midCol = Math.floor(SEWER_ROOM_WIDTH / 2);

  let plates = [];
  if (roomType === "puzzle1") {
    // 3x3 grid of pressure plates centered vertically, moved 2 tiles to the right
    const startX = 4;
    const startY = midRow - 1;
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
  } else if (roomType === "puzzle2") {
    // Use the fixed constant path for the maze
    if (linkKey) {
      mazePaths.set(linkKey, FIXED_MAZE_PATH);
      mazeScanProgress.set(linkKey, -1); // -1 means not scanning
      mazeTileAlpha.set(linkKey, new Map());
    }
  }

  for (let r = 0; r < SEWER_ROOM_HEIGHT; r++) {
    const row = [];
    for (let c = 0; c < SEWER_ROOM_WIDTH; c++) {
      const isBorder = r === 0 || r === SEWER_ROOM_HEIGHT - 1 || c === 0 || c === SEWER_ROOM_WIDTH - 1;
      const isLeftOpening = c === 0 && (r === midRow || r === midRow - 1 || r === midRow + 1);
      const isRightOpening = c === SEWER_ROOM_WIDTH - 1 && (r === midRow || r === midRow - 1 || r === midRow + 1);
      const isMiddleWall = roomType === "puzzle1" && c === midCol && !isBorder && !isLeftOpening && !isRightOpening;
      const isMazeArea = roomType === "puzzle2" && c >= 3 && c <= SEWER_ROOM_WIDTH - 4 && !isBorder;

      let isPressurePlate = false;
      for (let pp of plates) {
        if (Math.floor(pp.x / 50) === c && Math.floor(pp.y / 50) === r) {
          isPressurePlate = true;
          break;
        }
      }

      let tileType = SEWER_CENTER_TILE;
      let colorIndex = 0;
      
      if (isLeftOpening || isRightOpening) {
        tileType = SEWER_CENTER_TILE;
      } else if (isMiddleWall) {
        tileType = SEWER_BORDER_TILE;
      } else if (isPressurePlate) {
        tileType = SEWER_CENTER_TILE;
        colorIndex = 1;
      } else if (isMazeArea) {
        tileType = SEWER_CENTER_TILE;
        colorIndex = 1; // Darker inactive plate color
      } else if (isBorder) {
        tileType = SEWER_BORDER_TILE;
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
  // Add terminal logic check (no tile)
  return room;
}

function updateSewerPuzzle() {
  if (!inSewer || !currentSewerLink) return;
  const linkKey = getSewerLinkKey(currentSewerLink.first.row, currentSewerLink.first.col);
  const room = sewerRooms.get(linkKey);
  if (!room) return;

  const plates = puzzlePressurePlates.get(linkKey);
  const mazePath = mazePaths.get(linkKey);
  const solved = puzzleSolved.get(linkKey);

  if (plates) {
    updateLightsOutPuzzle(linkKey, plates, room, solved);
  } else if (mazePath) {
    updateMazePuzzle(linkKey, mazePath, room, solved);
  }
}

function updateLightsOutPuzzle(linkKey, plates, room, solved) {
  if (solved && solved[0]) return;
  const midCol = Math.floor(SEWER_ROOM_WIDTH / 2);

  for (let j = 0; j < plates.length; j++) {
    const pp = plates[j];
    const px = pX + 600 + (pWidth || 35) / 2;
    const py = pY + 375 + (pHeight || 21) / 2;
    if (pp && dist(px, py, pp.x, pp.y) < 25 && keyPressedOnce(69)) {
      togglePlateAndNeighbors(plates, pp.gridX, pp.gridY);
      const count = puzzleInteractionCount.get(linkKey) || 0;
      puzzleInteractionCount.set(linkKey, count + 1);
      break;
    }
  }

  const interactionCount = puzzleInteractionCount.get(linkKey) || 0;
  if (interactionCount === 0) {
    if (!sewerPrompt) sewerPrompt = createPrompt();
    if (!sewerPrompt.isActive) sewerPrompt.update(true);
    else sewerPrompt.update(true);
    sewerPrompt.draw("Press E to toggle cell", [255, 150, 0], 80, true);
  } else if (sewerPrompt) {
    sewerPrompt.update(false);
    sewerPrompt.draw("", [255, 150, 0], 80, true);
  }

  for (let pp of plates) {
    const c = Math.floor(pp.x / 50), r = Math.floor(pp.y / 50);
    room[r][c].layers[0].colorIndex = pp.active ? 2 : 1;
  }

  if (plates.every(p => p.active)) {
    for (let r = 1; r < SEWER_ROOM_HEIGHT - 1; r++) {
      room[r][midCol].layers[0].type = SEWER_CENTER_TILE;
    }
    puzzleSolved.set(linkKey, [true, true]);
    messages.push(new Message("Puzzle Solved!", 600, 375));
  }
}

function updateMazePuzzle(linkKey, path, room, solved) {
  const midRow = Math.floor(SEWER_ROOM_HEIGHT / 2);
  const px = pX + 600 + (pWidth || 35) / 2;
  const py = pY + 375 + (pHeight || 21) / 2;
  const pCol = Math.floor(px / 50);
  const pRow = Math.floor(py / 50);
  
  const mazeStartCol = 3;
  const mazeEndCol = SEWER_ROOM_WIDTH - 4;

  if (solved && solved[0]) {
    // Keep maze area solved appearance
    for (let r = 0; r < SEWER_ROOM_HEIGHT; r++) {
      for (let c = mazeStartCol; c <= mazeEndCol; c++) {
        room[r][c].layers[0].colorIndex = 2; // All green when solved
      }
    }
    return;
  }

  // Terminal interaction (no tile, just left side area)
  const termX = 2 * 50 + 25;
  const termY = midRow * 50 + 25;
  const nearLeftTerminalArea = px < 3 * 50 && Math.abs(py - termY) < 100;
  
  if (nearLeftTerminalArea) {
    if (!sewerPrompt) sewerPrompt = createPrompt();
    if (!sewerPrompt.isActive) sewerPrompt.update(true);
    else sewerPrompt.update(true);
    sewerPrompt.draw("Press E to scan path", [0, 255, 255], 80, true);
    
    if (keyPressedOnce(69)) {
      // Start scanning animation from left to right
      mazeScanProgress.set(linkKey, mazeStartCol);
      mazeFlashTimers.set(linkKey, 180); // 3 seconds total display time
      const count = puzzleInteractionCount.get(linkKey) || 0;
      puzzleInteractionCount.set(linkKey, count + 1);
    }
  } else if (sewerPrompt && (puzzleInteractionCount.get(linkKey) > 0 || !nearLeftTerminalArea)) {
    sewerPrompt.update(false);
    sewerPrompt.draw("", [0, 255, 255], 80, true);
  }

  // Handle scanning animation progress
  let scanCol = mazeScanProgress.get(linkKey) || -1;
  let timer = mazeFlashTimers.get(linkKey) || 0;
  
  // Advance scan column every 4 frames for smooth sweep
  if (scanCol >= mazeStartCol && scanCol <= mazeEndCol) {
    if (frameCount % 4 === 0) {
      mazeScanProgress.set(linkKey, scanCol + 1);
    }
  }
  
  // Timer countdown
  if (timer > 0) {
    mazeFlashTimers.set(linkKey, timer - 1);
  } else {
    // Reset scan when timer expires
    mazeScanProgress.set(linkKey, -1);
  }

  // Get or create alpha map for smooth transitions
  let alphaMap = mazeTileAlpha.get(linkKey);
  if (!alphaMap) {
    alphaMap = new Map();
    mazeTileAlpha.set(linkKey, alphaMap);
  }

  // Update maze tile visuals with smooth alpha transitions
  for (let r = 0; r < SEWER_ROOM_HEIGHT; r++) {
    for (let c = mazeStartCol; c <= mazeEndCol; c++) {
      const key = `${r},${c}`;
      const isSafe = path.has(key);
      let currentAlpha = alphaMap.get(key) || 0;
      
      // Determine target alpha based on scan progress and timer
      let targetAlpha = 0;
      if (timer > 0 && isSafe && c <= scanCol) {
        targetAlpha = 1;
      }
      
      // Smooth lerp transition
      currentAlpha = currentAlpha + (targetAlpha - currentAlpha) * 0.15;
      alphaMap.set(key, currentAlpha);
      
      // Set color index based on alpha (0 = dark, 2 = green/safe)
      if (currentAlpha > 0.5) {
        room[r][c].layers[0].colorIndex = 2; // Green highlight
      } else {
        room[r][c].layers[0].colorIndex = 1; // Dark (inactive plate color)
      }
    }
  }

  // Collision detection with unsafe tiles
  if (pCol >= mazeStartCol && pCol <= mazeEndCol) {
    if (!path.has(`${pRow},${pCol}`)) {
      // Teleport back to start of room
      pX = sewerExitA.x - 600 - pWidth / 2;
      pY = sewerExitA.y - 375 - pHeight / 2;
      messages.push(new Message("Security Breach! Resetting...", 600, 375));
    } else if (pCol === mazeEndCol) {
      // Reached the end
      puzzleSolved.set(linkKey, [true, true]);
      messages.push(new Message("Path Secure!", 600, 375));
    }
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
    const roomCount = sewerRooms.size;
    let roomType = "empty";
    if (roomCount === 0) roomType = "puzzle1";
    else if (roomCount === 1) roomType = "puzzle2";
    
    sewerRooms.set(firstKey, generateSewerRoom(roomType, firstKey));
    if (roomType !== "empty") puzzleSolved.set(firstKey, [false, false]);
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
      // Don't force update(false) here if the puzzle logic is using the prompt
      // The updateSewerPuzzle function handles its own prompt logic
      // But we need to make sure we don't clear it if it's active
    }
  } else {
    const nearbySewer = findNearbySewerCap(pX, pY);
    if (nearbySewer) {
      if (!sewerPrompt) sewerPrompt = createPrompt();
      handleInteractionPrompt(sewerPrompt, nearbySewer.x, nearbySewer.y, 80, "Press E to enter sewer", true);
      if (keyPressedOnce(69)) {
        enterSewer(nearbySewer.row, nearbySewer.col);
      }
    } else if (sewerPrompt && sewerPrompt.isActive) {
      sewerPrompt.update(false);
      sewerPrompt.draw("", [255, 150, 0], 80, true);
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
