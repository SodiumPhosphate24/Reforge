
// Raycasting-based lighting system
let lightingCanvas;
let rayCount = 120; // Number of rays to cast (more = smoother but slower)
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

  // Calculate max light distance to reach edge of screen from player
  const distToLeft = playerScreenX;
  const distToRight = width - playerScreenX;
  const distToTop = playerScreenY;
  const distToBottom = height - playerScreenY;
  const maxLightDistance = Math.max(
    Math.sqrt(distToLeft * distToLeft + distToTop * distToTop),
    Math.sqrt(distToRight * distToRight + distToTop * distToTop),
    Math.sqrt(distToLeft * distToLeft + distToBottom * distToBottom),
    Math.sqrt(distToRight * distToRight + distToBottom * distToBottom)
  ) + 100; // Add padding

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
  let lastValidX = startX + dx * maxDistance;
  let lastValidY = startY + dy * maxDistance;
  
  while (distance < maxDistance) {
    distance += step;
    const checkX = startX + dx * distance;
    const checkY = startY + dy * distance;
    
    // Check if this point hits a wall
    if (checkLightRayCollision(checkX, checkY)) {
      // Return the position AFTER the wall (where shadow starts)
      // Continue one more step past the collision point
      return { 
        x: checkX + dx * step, 
        y: checkY + dy * step 
      };
    }
  }
  
  // No collision, return max distance point
  return {
    x: lastValidX,
    y: lastValidY
  };
}

function checkLightRayCollision(worldX, worldY) {
  // Convert world coordinates to tile coordinates
  const col = Math.floor((worldX + 600) / 50);
  const row = Math.floor((worldY + 375) / 50);
  
  // Check bounds
  if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row].length) {
    return false; // Don't block at edges, let light reach edge of scene
  }
  
  const cell = gameWorld[row][col];
  if (!cell) return false;
  
  // Check all layers for solid walls (not roofs)
  if ('layers' in cell) {
    for (let L = 0; L < 5; L++) {
      const tile = cell.layers[L];
      if (!tile) continue;
      
      // Only block light on solid walls (type 1), not roofs (type 2) or walkable (type 0)
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
