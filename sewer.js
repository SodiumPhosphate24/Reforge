var sewerLinks = new Map();
var sewerFirstInPair = new Map(); // Tracks which sewer is "first" (left exit) in each pair
var pendingSewerLink = null;
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
  const midRow = Math.floor(SEWER_ROOM_HEIGHT / 2);
  
  for (let r = 0; r < SEWER_ROOM_HEIGHT; r++) {
    const row = [];
    for (let c = 0; c < SEWER_ROOM_WIDTH; c++) {
      const isBorder = r === 0 || r === SEWER_ROOM_HEIGHT - 1 || c === 0 || c === SEWER_ROOM_WIDTH - 1;
      
      // Create openings on left and right walls at the middle row
      const isLeftOpening = c === 0 && (r === midRow || r === midRow - 1 || r === midRow + 1);
      const isRightOpening = c === SEWER_ROOM_WIDTH - 1 && (r === midRow || r === midRow - 1 || r === midRow + 1);
      
      let tileType;
      if (isLeftOpening || isRightOpening) {
        tileType = SEWER_CENTER_TILE; // Opening uses floor tile
      } else if (isBorder) {
        tileType = SEWER_BORDER_TILE;
      } else {
        tileType = SEWER_CENTER_TILE;
      }
      
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
  
  // Exit positions are in the openings
  sewerExitA = { x: 1 * 50 + 25, y: midRow * 50 + 25 };
  sewerExitB = { x: (SEWER_ROOM_WIDTH - 2) * 50 + 25, y: midRow * 50 + 25 };
}

function getSewerLinkKey(row, col) {
  return `${row},${col}`;
}

function linkSewers(row1, col1, row2, col2) {
  const key1 = getSewerLinkKey(row1, col1);
  const key2 = getSewerLinkKey(row2, col2);
  
  // Remove old links if they exist
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
  
  // key1 is "first" (left exit), key2 is "second" (right exit)
  sewerFirstInPair.set(key1, true);
  sewerFirstInPair.set(key2, false);
  
  console.log(`Linked sewers: (${row1},${col1}) [LEFT] <-> (${row2},${col2}) [RIGHT]`);
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
  
  // Store first and second sewers for consistent exit behavior
  currentSewerLink = {
    first: enteredFromFirst ? { row: sewerRow, col: sewerCol } : linkedSewer,
    second: enteredFromFirst ? linkedSewer : { row: sewerRow, col: sewerCol },
    enteredFromFirst: enteredFromFirst
  };
  
  initSewerRoom();
  
  savedWorldState = {
    world: gameWorld,
    playerX: pX,
    playerY: pY
  };
  
  gameWorld = sewerRoom;
  
  // Spawn on left if entered from first sewer, right if entered from second
  if (enteredFromFirst) {
    pX = sewerExitA.x - 600 - pWidth / 2;
    pY = sewerExitA.y - 375 - pHeight / 2;
  } else {
    pX = sewerExitB.x - 600 - pWidth / 2;
    pY = sewerExitB.y - 375 - pHeight / 2;
  }
  
  inSewer = true;
  console.log("Entered sewer system from", enteredFromFirst ? "first (left)" : "second (right)");
  return true;
}

function exitSewer(exitSide) {
  if (!inSewer || !savedWorldState || !currentSewerLink) return false;
  
  gameWorld = savedWorldState.world;
  
  // Left exit (A) always goes to first sewer, right exit (B) always goes to second sewer
  let exitCoords;
  if (exitSide === 'A') {
    exitCoords = currentSewerLink.first;
  } else {
    exitCoords = currentSewerLink.second;
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
  const midRow = Math.floor(SEWER_ROOM_HEIGHT / 2);
  const midY = midRow * 50 + 25;
  
  // Exit when player reaches the doorway tiles (first/last column, near middle row)
  const nearMiddleY = Math.abs(playerCenterY - midY) < 75;
  
  if (playerCenterX < 50 && nearMiddleY) {
    exitSewer('A'); // Left doorway = first sewer
  } else if (playerCenterX > (SEWER_ROOM_WIDTH - 1) * 50 && nearMiddleY) {
    exitSewer('B'); // Right doorway = second sewer
  }
}

function drawSewerPrompt() {
  if (inSewer) {
    // No prompt needed - just walk through the openings to exit
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

function handleSewerEditorMode() {
  if (!editorMode) return;
  
  if (keyPressedOnce(76)) {
    const nearbySewer = findNearbySewerCap(pX, pY, 80, false);
    
    if (nearbySewer && !nearbySewer.linked) {
      if (!pendingSewerLink) {
        pendingSewerLink = { row: nearbySewer.row, col: nearbySewer.col };
        console.log(`First sewer marked at (${nearbySewer.row}, ${nearbySewer.col}) - go to another sewer and press L`);
      } else if (pendingSewerLink.row !== nearbySewer.row || pendingSewerLink.col !== nearbySewer.col) {
        linkSewers(pendingSewerLink.row, pendingSewerLink.col, nearbySewer.row, nearbySewer.col);
        pendingSewerLink = null;
      }
    } else if (!nearbySewer) {
      if (pendingSewerLink) {
        pendingSewerLink = null;
        console.log("Sewer linking cancelled");
      }
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
    text(`Sewer at (${pendingSewerLink.row}, ${pendingSewerLink.col}) marked - Press L near another sewer to link`, width / 2, 70);
    
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
      // Always put the "first" key before the colon
      const isFirst = sewerFirstInPair.get(key) === true;
      if (isFirst) {
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
      // key1 is first (left), key2 is second (right)
      sewerFirstInPair.set(key1, true);
      sewerFirstInPair.set(key2, false);
    }
  }
  console.log(`Loaded ${sewerLinks.size / 2} sewer link pairs`);
}
