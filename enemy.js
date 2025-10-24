
class Enemy {
  constructor(type) {
    this.x = 100 + pX;
    this.y = 100 + pY;
    this.aggro = false;
    this.vx = 0; // velocity x
    this.vy = 0; // velocity y
    this.aggroRange = 500;
    this.deaggroRange = 700; // de-aggro at longer distance
    this.path = []; // pathfinding waypoints
    this.pathUpdateTimer = 0;
    this.pathUpdateInterval = 15; // recalculate path every 15 frames
    
    if (type == "zombie") {
      this.type = "zombie";
      this.health = 3;
      this.speed = 2;
      this.acceleration = 0.15; // how quickly it changes direction
    }
  }

  update() {
    const distToPlayer = distance(this.x, this.y, pX + 600, pY + 340);
    
    // Aggro/De-aggro logic
    if (!this.aggro && distToPlayer < this.aggroRange) {
      this.aggro = true;
      this.path = []; // Clear path on new aggro
    } else if (this.aggro && distToPlayer > this.deaggroRange) {
      this.aggro = false;
      this.path = [];
      // Gradually slow down when de-aggroing
      this.vx *= 0.9;
      this.vy *= 0.9;
    }
    
    if (this.aggro) {
      // Update pathfinding periodically
      this.pathUpdateTimer++;
      if (this.pathUpdateTimer >= this.pathUpdateInterval || this.path.length === 0) {
        this.pathUpdateTimer = 0;
        this.path = this.findPath(pX + 600, pY + 340);
      }
      
      // Follow the path
      let targetX = pX + 600;
      let targetY = pY + 340;
      
      if (this.path.length > 0) {
        // Get next waypoint
        const nextWaypoint = this.path[0];
        targetX = nextWaypoint.x;
        targetY = nextWaypoint.y;
        
        // Check if we reached the waypoint
        const distToWaypoint = distance(this.x + 10, this.y + 10, targetX, targetY);
        if (distToWaypoint < 25) {
          this.path.shift(); // Remove reached waypoint
        }
      }
      
      // Calculate desired direction toward target
      this.angle = atan2(targetY - (this.y + 10), targetX - (this.x + 10));
      
      // Target velocity based on desired direction
      const targetVx = this.speed * cos(this.angle);
      const targetVy = this.speed * sin(this.angle);
      
      // Smoothly interpolate current velocity toward target
      this.vx = lerp(this.vx, targetVx, this.acceleration);
      this.vy = lerp(this.vy, targetVy, this.acceleration);
      
      // Store previous position for collision resolution
      const prevX = this.x;
      const prevY = this.y;
      
      // Try to move both axes first
      this.x += this.vx;
      this.y += this.vy;
      
      // Check for wall collisions and resolve with sliding
      if (this.checkWallCollision()) {
        // Revert to previous position
        this.x = prevX;
        this.y = prevY;
        
        // Try moving only along X axis (slide horizontally)
        this.x += this.vx;
        const canMoveX = !this.checkWallCollision();
        
        // Revert X and try moving only along Y axis (slide vertically)
        this.x = prevX;
        this.y += this.vy;
        const canMoveY = !this.checkWallCollision();
        
        // Apply whichever direction(s) work
        if (canMoveX && canMoveY) {
          // Both axes work independently, use both
          this.x += this.vx;
        } else if (canMoveX) {
          // Only X works, slide along wall horizontally
          this.x += this.vx;
          this.vy *= 0.7; // Dampen blocked axis
        } else if (canMoveY) {
          // Only Y works, slide along wall vertically
          this.vx *= 0.7; // Dampen blocked axis
        } else {
          // Neither works, we're stuck in a corner
          this.x = prevX;
          this.y = prevY;
          this.vx *= 0.3;
          this.vy *= 0.3;
          // Force path recalculation when stuck
          this.pathUpdateTimer = this.pathUpdateInterval;
        }
      }
    } else {
      // Apply friction when not aggroed
      this.vx *= 0.95;
      this.vy *= 0.95;
      
      // Move with remaining velocity
      if (Math.abs(this.vx) > 0.01 || Math.abs(this.vy) > 0.01) {
        const prevX = this.x;
        const prevY = this.y;
        
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.checkWallCollision()) {
          this.x = prevX;
          this.y = prevY;
          this.vx = 0;
          this.vy = 0;
        }
      }
    }
  }

  // A* pathfinding implementation
  findPath(targetX, targetY) {
    // Convert positions to grid coordinates
    const startCol = Math.floor((this.x + 10) / 50);
    const startRow = Math.floor((this.y + 10) / 50);
    const endCol = Math.floor(targetX / 50);
    const endRow = Math.floor(targetY / 50);
    
    // Check if start or end is out of bounds
    if (startRow < 0 || startCol < 0 || startRow >= gameWorld.length || 
        startCol >= gameWorld[0]?.length || endRow < 0 || endCol < 0 || 
        endRow >= gameWorld.length || endCol >= gameWorld[0]?.length) {
      return [];
    }
    
    // Check if there's a clear line of sight
    if (this.hasLineOfSight(targetX, targetY)) {
      return [{ x: targetX, y: targetY }];
    }
    
    const openSet = [];
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = `${startRow},${startCol}`;
    const endKey = `${endRow},${endCol}`;
    
    openSet.push({ row: startRow, col: startCol, key: startKey });
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startRow, startCol, endRow, endCol));
    
    const maxIterations = 500; // Prevent infinite loops
    let iterations = 0;
    
    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      
      // Find node with lowest fScore
      openSet.sort((a, b) => fScore.get(a.key) - fScore.get(b.key));
      const current = openSet.shift();
      
      if (current.key === endKey) {
        return this.reconstructPath(cameFrom, current);
      }
      
      closedSet.add(current.key);
      
      // Check all neighbors
      const neighbors = [
        { row: current.row - 1, col: current.col }, // up
        { row: current.row + 1, col: current.col }, // down
        { row: current.row, col: current.col - 1 }, // left
        { row: current.row, col: current.col + 1 }, // right
        { row: current.row - 1, col: current.col - 1 }, // up-left
        { row: current.row - 1, col: current.col + 1 }, // up-right
        { row: current.row + 1, col: current.col - 1 }, // down-left
        { row: current.row + 1, col: current.col + 1 }  // down-right
      ];
      
      for (const neighbor of neighbors) {
        const nKey = `${neighbor.row},${neighbor.col}`;
        
        if (closedSet.has(nKey)) continue;
        if (this.isTileWall(neighbor.row, neighbor.col)) continue;
        
        // Check diagonal movement for corner cutting
        const isDiagonal = neighbor.row !== current.row && neighbor.col !== current.col;
        if (isDiagonal) {
          // Block diagonal if either adjacent cell is a wall
          if (this.isTileWall(current.row, neighbor.col) || 
              this.isTileWall(neighbor.row, current.col)) {
            continue;
          }
        }
        
        const moveCost = isDiagonal ? 1.414 : 1; // diagonal costs more
        const tentativeGScore = gScore.get(current.key) + moveCost;
        
        if (!gScore.has(nKey) || tentativeGScore < gScore.get(nKey)) {
          cameFrom.set(nKey, current);
          gScore.set(nKey, tentativeGScore);
          fScore.set(nKey, tentativeGScore + this.heuristic(neighbor.row, neighbor.col, endRow, endCol));
          
          if (!openSet.some(n => n.key === nKey)) {
            openSet.push({ ...neighbor, key: nKey });
          }
        }
      }
    }
    
    // No path found, return empty array
    return [];
  }
  
  heuristic(row1, col1, row2, col2) {
    // Euclidean distance
    return Math.sqrt((row2 - row1) ** 2 + (col2 - col1) ** 2);
  }
  
  reconstructPath(cameFrom, current) {
    const path = [];
    let node = current;
    
    while (cameFrom.has(node.key)) {
      // Convert grid position to world position (center of tile)
      path.unshift({ 
        x: node.col * 50 + 25, 
        y: node.row * 50 + 25 
      });
      node = cameFrom.get(node.key);
    }
    
    return path;
  }
  
  isTileWall(row, col) {
    if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row]?.length) {
      return true;
    }
    
    const cell = gameWorld[row][col];
    if (!cell) return false;
    
    if ('layers' in cell) {
      for (let L = 0; L < 3; L++) {
        const t = cell.layers[L];
        if (t && tileWalls[t.type] === 1) return true;
      }
    } else {
      if (tileWalls[cell.type] === 1) return true;
    }
    
    return false;
  }
  
  hasLineOfSight(targetX, targetY) {
    const startX = this.x + 10;
    const startY = this.y + 10;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(dist / 10); // Check every 10 pixels
    
    for (let i = 1; i <= steps; i++) {
      const checkX = startX + (dx * i / steps);
      const checkY = startY + (dy * i / steps);
      const col = Math.floor(checkX / 50);
      const row = Math.floor(checkY / 50);
      
      if (this.isTileWall(row, col)) {
        return false;
      }
    }
    
    return true;
  }

  checkWallCollision() {
    const w = 20, h = 20; // enemy size
    const left = this.x;
    const top = this.y;
    const right = left + w;
    const bottom = top + h;

    const leftTile = Math.floor(left / 50);
    const rightTile = Math.floor(right / 50);
    const topTile = Math.floor(top / 50);
    const bottomTile = Math.floor(bottom / 50);

    for (let row = topTile; row <= bottomTile; row++) {
      for (let col = leftTile; col <= rightTile; col++) {
        if (row < 0 || col < 0 || row >= gameWorld.length || col >= gameWorld[row].length) continue;

        const cell = gameWorld[row][col];

        if (cell && 'layers' in cell) {
          for (let L = 0; L < 3; L++) {
            const t = cell.layers[L];
            if (!t) continue;
            if (tileWalls[t.type] == 1) {
              const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
              if (left < tR && right > tL && top < tB && bottom > tT) return true;
            }
          }
        } else if (cell) { // legacy
          if (tileWalls[cell.type] == 1) {
            const tL = col * 50, tT = row * 50, tR = tL + 50, tB = tT + 50;
            if (left < tR && right > tL && top < tB && bottom > tT) return true;
          }
        }
      }
    }
    return false;
  }

  takeDamage(dmg) {
    this.health -= dmg;
  }

  isDead() {
    return this.health <= 0;
  }

  hitsPlayer() {
    return checkCollision(this.x, this.y, pX + 600, pY + 340, 20, 20, 35, 25);
  }
}

function drawEnemies() {
  let count = 0;
  for (let i = 0; i < enemies.length; i++) {
    enemies[count].update();
    
    // Visual indicator for aggro state
    if (enemies[count].aggro) {
      fill(255, 0, 0);
    } else {
      fill(150, 0, 0);
    }
    
    rect(enemies[count].x, enemies[count].y, 20, 20);
    
    if (enemies[count].hitsPlayer()) {
      if (enemies[count].type == "zombie") {
        players[activePlayer].health -= 2;
        healthPoints = players[activePlayer].health;
        healthPoints = constrain(healthPoints, players[activePlayer].maxHealth);
      }
    }
    if (enemies[count].isDead()) {
      enemies.splice(count, 1);
      count--;
    }
    count++;
  }
}
