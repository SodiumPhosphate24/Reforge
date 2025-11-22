
// Waypoint navigation system
let waypoints = []; // 2D array to store waypoint positions [x, y]
let currentWaypointIndex = 0;
let WaypointImg;

// Initialize waypoints with player starting position for testing
function initializeWaypoints() {
  waypoints = [[pX, pY]]; // Start with player's current position
  currentWaypointIndex = 0;
}

// Add a new waypoint to the array
function addWaypoint(x, y) {
  waypoints.push([x, y]);
}

// Draw the waypoint indicator arrow
function drawWaypointIndicator() {
  if (waypoints.length === 0 || currentWaypointIndex >= waypoints.length) return;
  
  const waypoint = waypoints[currentWaypointIndex];
  const waypointX = waypoint[0];
  const waypointY = waypoint[1];
  
  // Calculate waypoint position in screen space
  const waypointScreenX = waypointX + camX + 600;
  const waypointScreenY = waypointY + camY + 375;
  
  // Player position in screen space (center of screen)
  const playerScreenX = width / 2;
  const playerScreenY = height / 2;
  
  // Calculate angle from player to waypoint
  const angle = atan2(waypointScreenY - playerScreenY, waypointScreenX - playerScreenX);
  
  // Determine indicator position
  let indicatorX, indicatorY;
  
  // Check if waypoint is on screen
  const isOnScreen = waypointScreenX >= 0 && waypointScreenX <= width &&
                     waypointScreenY >= 0 && waypointScreenY <= height;
  
  if (isOnScreen) {
    // Point directly at the waypoint
    indicatorX = waypointScreenX;
    indicatorY = waypointScreenY;
  } else {
    // Constrain to screen borders while maintaining direction
    const margin = 40; // Keep indicator away from edge
    
    // Calculate intersection with screen boundaries
    const dx = waypointScreenX - playerScreenX;
    const dy = waypointScreenY - playerScreenY;
    
    // Find which border the line intersects first
    let t = Infinity;
    
    // Check left/right borders
    if (dx !== 0) {
      const tLeft = (margin - playerScreenX) / dx;
      const tRight = (width - margin - playerScreenX) / dx;
      if (dx > 0 && tRight > 0) t = min(t, tRight);
      if (dx < 0 && tLeft > 0) t = min(t, tLeft);
    }
    
    // Check top/bottom borders
    if (dy !== 0) {
      const tTop = (margin - playerScreenY) / dy;
      const tBottom = (height - margin - playerScreenY) / dy;
      if (dy > 0 && tBottom > 0) t = min(t, tBottom);
      if (dy < 0 && tTop > 0) t = min(t, tTop);
    }
    
    // Calculate constrained position
    indicatorX = playerScreenX + dx * t;
    indicatorY = playerScreenY + dy * t;
    
    // Final constraint to ensure it stays on screen
    indicatorX = constrain(indicatorX, margin, width - margin);
    indicatorY = constrain(indicatorY, margin, height - margin);
  }
  
  // Draw the waypoint indicator arrow
  push();
  translate(indicatorX, indicatorY);
  rotate(angle + HALF_PI); // Add HALF_PI because arrow points down by default
  imageMode(CENTER);
  
  // Add pulsing effect
  const pulseSize = 30 + sin(frameCount / 10) * 5;
  
  if (WaypointImg) {
    image(WaypointImg, 0, 0, pulseSize, pulseSize);
  } else {
    // Fallback if image not loaded
    fill(255, 200, 0);
    triangle(0, -pulseSize/2, -pulseSize/3, pulseSize/2, pulseSize/3, pulseSize/2);
  }
  
  imageMode(CORNER);
  pop();
  
  // Check if player reached the waypoint
  const distanceToWaypoint = dist(pX, pY, waypointX, waypointY);
  if (distanceToWaypoint < 50) {
    // Move to next waypoint
    currentWaypointIndex++;
  }
}

// Reset waypoint progression
function resetWaypoints() {
  currentWaypointIndex = 0;
}
