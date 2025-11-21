
// Raycasting-based lighting system
let lightingCanvas;
let rayCount = 120; // Number of rays to cast (more = smoother but slower)
let maxLightDistance = 400; // Maximum distance light can reach
let darknessAlpha = 180; // How dark shadowed areas are (0-255)

function setupLighting() {
  lightingCanvas = createGraphics(width, height);
}

function drawLighting() {
  if (!lightingCanvas) {
    setupLighting();
  }

  // Clear lighting canvas
  lightingCanvas.clear();
  lightingCanvas.background(0, 0, 0, darknessAlpha);

  // Calculate player center in screen space
  const playerScreenX = pX + camX + 600 + pWidth / 2;
  const playerScreenY = pY + camY + 375 + pHeight / 2;

  // Draw lit area using raycasting
  lightingCanvas.erase();
  lightingCanvas.beginShape();
  
  for (let i = 0; i <= rayCount; i++) {
    const angle = (i / rayCount) * TWO_PI;
    const hit = castLightRay(pX + pWidth / 2, pY + pHeight / 2, angle, maxLightDistance);
    
    // Convert world coordinates to screen coordinates
    const screenX = hit.x + camX + 600;
    const screenY = hit.y + camY + 375;
    
    lightingCanvas.vertex(screenX, screenY);
  }
  
  lightingCanvas.endShape(CLOSE);
  lightingCanvas.noErase();

  // Draw the lighting overlay
  image(lightingCanvas, 0, 0);
}

function castLightRay(startX, startY, angle, maxDistance) {
  const dx = cos(angle);
  const dy = sin(angle);
  
  // Step along the ray
  const step = 5; // Pixels per step
  let distance = 0;
  
  while (distance < maxDistance) {
    distance += step;
    const checkX = startX + dx * distance;
    const checkY = startY + dy * distance;
    
    // Check if this point hits a wall
    if (checkLightRayCollision(checkX, checkY)) {
      return { x: checkX, y: checkY };
    }
  }
  
  // No collision, return max distance point
  return {
    x: startX + dx * maxDistance,
    y: startY + dy * maxDistance
  };
}

function checkLightRayCollision(worldX, worldY) {
  // Convert world coordinates to tile coordinates
  const col = Math.floor((worldX + 600) / 50);
  const row = Math.floor((worldY + 375) / 50);
  
  // Check bounds
  if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row].length) {
    return true; // Out of bounds counts as collision
  }
  
  const cell = gameWorld[row][col];
  if (!cell) return false;
  
  // Check all layers for solid walls (not roofs)
  if ('layers' in cell) {
    for (let L = 0; L < 5; L++) {
      const tile = cell.layers[L];
      if (!tile) continue;
      
      // Only block light on solid walls (type 1), not roofs (type 2)
      if (tileWalls[tile.type] === 1) {
        return true;
      }
    }
  } else {
    // Legacy single-layer format
    if (tileWalls[cell.type] === 1) {
      return true;
    }
  }
  
  return false;
}
