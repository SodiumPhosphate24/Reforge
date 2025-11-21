
// Raycasting lighting system
// Casts rays from player to determine visible tiles

const LIGHTING_CONFIG = {
  viewDistance: 400, // Maximum visibility distance in pixels
  rayCount: 360, // Number of rays to cast (more = smoother but slower)
  darknessTint: [0, 0, 0, 180], // RGBA for darkness overlay
};

// Store which tiles are visible
let visibleTiles = new Set();

// Cast rays from player to determine visibility
function updateLighting() {
  visibleTiles.clear();
  
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  
  const angleStep = (Math.PI * 2) / LIGHTING_CONFIG.rayCount;
  
  // Cast rays in all directions
  for (let i = 0; i < LIGHTING_CONFIG.rayCount; i++) {
    const angle = i * angleStep;
    castRay(playerCenterX, playerCenterY, angle);
  }
  
  // Add tiles immediately around player as visible
  const playerGridX = Math.floor(playerCenterX / 50);
  const playerGridY = Math.floor(playerCenterY / 50);
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tileKey = (playerGridY + dy) + "," + (playerGridX + dx);
      visibleTiles.add(tileKey);
    }
  }
}

// Cast a single ray from player position in given direction
function castRay(startX, startY, angle) {
  const stepSize = 5; // Distance to step along ray
  const maxSteps = LIGHTING_CONFIG.viewDistance / stepSize;
  
  const dx = Math.cos(angle) * stepSize;
  const dy = Math.sin(angle) * stepSize;
  
  let x = startX;
  let y = startY;
  
  for (let step = 0; step < maxSteps; step++) {
    x += dx;
    y += dy;
    
    const gridX = Math.floor(x / 50);
    const gridY = Math.floor(y / 50);
    
    // Check bounds
    if (gridY < 0 || gridY >= gameWorld.length || 
        gridX < 0 || gridX >= gameWorld[0].length) {
      break;
    }
    
    // Mark this tile as visible
    const tileKey = gridY + "," + gridX;
    visibleTiles.add(tileKey);
    
    // Check if ray hits a wall (stop ray)
    if (rayHitsWall(gridY, gridX)) {
      break;
    }
  }
}

// Check if a tile blocks vision (solid walls)
function rayHitsWall(row, col) {
  const cell = gameWorld[row][col];
  if (!cell) return false;
  
  // Check all layers for solid walls (tileWalls === 1)
  if ('layers' in cell) {
    for (let L = 0; L < 5; L++) {
      const tile = cell.layers[L];
      if (tile && tileWalls[tile.type] === 1) {
        return true;
      }
    }
  } else {
    if (tileWalls[cell.type] === 1) {
      return true;
    }
  }
  
  return false;
}

// Draw darkness overlay on tiles not in line of sight
function drawLighting() {
  if (!gameWorld || gameWorld.length === 0) return;
  
  // Calculate viewport bounds
  const topLeft = coordsToGrid(-camX, -camY);
  const bottomRight = coordsToGrid(-camX + width, -camY + height);
  
  const startRow = Math.max(0, topLeft.row - 1);
  const endRow = Math.min(gameWorld.length - 1, bottomRight.row + 1);
  const startCol = Math.max(0, topLeft.col - 1);
  const endCol = Math.min(gameWorld[0].length - 1, bottomRight.col + 1);
  
  noStroke();
  fill(LIGHTING_CONFIG.darknessTint[0], LIGHTING_CONFIG.darknessTint[1], 
       LIGHTING_CONFIG.darknessTint[2], LIGHTING_CONFIG.darknessTint[3]);
  
  // Draw darkness on non-visible tiles
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const tileKey = row + "," + col;
      
      // Skip if tile is visible
      if (visibleTiles.has(tileKey)) continue;
      
      // Check if any layer has a roof tile (don't darken roofs)
      const cell = gameWorld[row][col];
      let hasRoof = false;
      
      if (cell) {
        if ('layers' in cell) {
          for (let L = 0; L < 5; L++) {
            const tile = cell.layers[L];
            if (tile && tileWalls[tile.type] === 2) {
              hasRoof = true;
              break;
            }
          }
        } else {
          if (tileWalls[cell.type] === 2) {
            hasRoof = true;
          }
        }
      }
      
      // Don't darken roof tiles
      if (hasRoof) continue;
      
      // Draw darkness rectangle
      rect(col * 50, row * 50, 50, 50);
    }
  }
}
