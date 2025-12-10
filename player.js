var activePlayer = 0;
var players = [];
var indicatorAlpha = 0; // Fade in/out alpha for indicator
var indicatorTargetX = 0; // Target position for smooth transition
var indicatorTargetY = 0;
var indicatorCurrentX = 0; // Current position for smooth transition
var indicatorCurrentY = 0;
var isTransitioning = false; // Track if switching between players
var transitionFrames = 0; // Count frames since transition started

// Player flip state
var playerFlipScale = 1; // Current flip scale (-1 for left, 1 for right)
var targetFlipScale = 1; // Target flip scale

// Player selection menu
var playerSelectionMenuOpen = false;
var playerSelectionMenuAlpha = 0;
var selectedPlayerIndex = 0;
var qKeyHeldFrames = 0;
var qKeyHoldThreshold = 10; // Frames to hold Q before menu opens

// Item transfer menu
var playerTransferMenuOpen = false;
var playerTransferMenuAlpha = 0;
var selectedTransferPlayerIndex = 0;

class Player {
  constructor(x, y, width, height, speed, health, damage, image, name = "Player") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.health = health;
    this.maxHealth = health;
    this.damage = damage;
    this.inventory = [null, null, null, null, null, null, null, null];
    this.image = image;
    this.name = name;
    this.frozen = false;
  }
  getImage() {
    return this.image;
  }
  takeDamage(damage) {
    this.health -= damage;
  }
  isDead() {
    if (this.health <= 0) {
      this.frozen = true;
    }
    else {
      this.frozen = false;
    }
  }
}
function switchPlayer(newPlayer) {
  activePlayer = newPlayer;
  pX = players[activePlayer].x;
  pY = players[activePlayer].y;
  pSpeed = players[activePlayer].speed;
  healthPoints = players[activePlayer].health;
  playerDamage = players[activePlayer].damage;
  PlayerImage = players[activePlayer].image;
  pWidth = players[activePlayer].width;
  pHeight = players[activePlayer].height;
  inventoryList = players[activePlayer].inventory;
  // Reset velocity to prevent collision errors
  pXVel = 0;
  pYVel = 0;

  // Update indicator target position
  indicatorTargetX = pX + 600 + pWidth / 2;
  indicatorTargetY = pY + 375 - 50; // 50px above player

  // Start transition mode for slower lerp
  isTransitioning = true;
  transitionFrames = 0;

  // Camera will smoothly pan to new player via controlCamera()
}
// Update player flip based on velocity
function updatePlayerFlip() {
  // Only flip if player is moving horizontally
  if (Math.abs(pXVel) > 0.1) {
    // Set target flip based on velocity direction
    targetFlipScale = pXVel > 0 ? 1 : -1;
  }

  // Smoothly lerp current flip to target
  playerFlipScale = lerp(playerFlipScale, targetFlipScale, 0.2);
}

function drawPlayers() {
  // Update flip direction
  updatePlayerFlip();

  // Draw other players at their world positions with same visual buffer
  for (let i = 0; i < players.length; i++) {
    // Safety check for undefined players during initialization
    if (!players[i]) continue;
    
    players[i].isDead();
    if (i !== activePlayer) {
      // Draw shadow for this player
      fill(0, 0, 0, 80 - sin(frameCount / 25) * 10);
      ellipse(players[i].x + 600 + players[i].width / 2, players[i].y + 375 + players[i].height, players[i].width, players[i].height * 0.6);

      // Emit steam particles for SPUD robots
      if (players[i].name === "SPUD") {
        const headX = players[i].x + 600 + players[i].width / 2;
        const headY = players[i].y + 375; // Top of robot
        
        // Spawn multiple steam particles per frame for density
        for (let s = 0; s < 3; s++) {
          if (random() < 0.5) { // 50% chance per particle slot
            // Random offset from head center for spread
            const offsetRadius = random(0, 8);
            const offsetAngle = random(0, TWO_PI);
            const spawnX = headX + cos(offsetAngle) * offsetRadius;
            const spawnY = (headY + sin(offsetAngle) * offsetRadius)-10;
            
            // Create upward steam particle with wider arc spread
            const steamParticle = new Particle(spawnX, spawnY, [220, 220, 230], 50, 1.2, 3);
            steamParticle.angle = radians(-90 + random(-30, 30)); // Wider spread (60° total)
            steamParticle.vx = cos(steamParticle.angle) * 1.2;
            steamParticle.vy = sin(steamParticle.angle) * 1.2;
            steamParticle.size = random(2, 6);
            particles.push(steamParticle);
          }
        }
      }

      // Draw player image with preserved aspect ratio
      const img = players[i].image;
      const aspectRatio = img.width / img.height;
      const drawWidth = players[i].width;
      const drawHeight = drawWidth / aspectRatio;
      image(img, players[i].x + 600, players[i].y + 375 - (drawHeight - players[i].height), drawWidth, drawHeight);
    }
  }



  // Draw active player shadow
  fill(0, 0, 0, 80 - sin(frameCount / 25) * 10);
  ellipse(pX + 600 + pWidth / 2, pY + 375 + pHeight, pWidth, pHeight * 0.6);

  // Emit steam particles for SPUD active player
  if (players[activePlayer] && players[activePlayer].name === "SPUD") {
    const headX = pX + 600 + pWidth / 2;
    const headY = pY + 375; // Top of robot
    
    // Spawn multiple steam particles per frame for density
    for (let s = 0; s < 3; s++) {
      if (random() < 0.5) { // 50% chance per particle slot
        // Random offset from head center for spread
        const offsetRadius = random(0, 8);
        const offsetAngle = random(0, TWO_PI);
        const spawnX = headX + cos(offsetAngle) * offsetRadius;
        const spawnY = headY + sin(offsetAngle) * offsetRadius;
        
        // Create upward steam particle with wider arc spread
        const steamParticle = new Particle(spawnX, spawnY, [220, 220, 230], 50, 1.2, 3);
        steamParticle.angle = radians(-90 + random(-30, 30)); // Wider spread (60° total)
        steamParticle.vx = cos(steamParticle.angle) * 1.2;
        steamParticle.vy = sin(steamParticle.angle) * 1.2;
        steamParticle.size = random(2, 6);
        particles.push(steamParticle);
      }
    }
  }

  // Draw active player with flip and preserved aspect ratio
  push();
  const img = PlayerImage;
  const aspectRatio = img.width / img.height;
  const drawWidth = pWidth;
  const drawHeight = drawWidth / aspectRatio;
  
  translate(pX + 600 + pWidth / 2, pY + 375 - (drawHeight - pHeight) / 2 + pHeight / 2);
  scale(playerFlipScale, 1);
  imageMode(CENTER);
  image(PlayerImage, 0, 0, drawWidth, drawHeight);
  imageMode(CORNER);
  pop();

  // Draw indicator above active player
  drawIndicator();
}

function drawIndicator() {
  // Update target position to follow active player
  indicatorTargetX = pX + 600 + pWidth / 2;
  indicatorTargetY = pY + 375 - 50;

  // Constant fast lerp speed
  const lerpSpeed = 0.25;

  // Smooth transition to target position
  indicatorCurrentX = lerp(indicatorCurrentX, indicatorTargetX, lerpSpeed);
  indicatorCurrentY = lerp(indicatorCurrentY, indicatorTargetY, lerpSpeed);

  // End transition after indicator gets close enough
  if (isTransitioning) {
    transitionFrames++;
    const distance = dist(indicatorCurrentX, indicatorCurrentY, indicatorTargetX, indicatorTargetY);
    if (distance < 5 || transitionFrames > 120) {
      isTransitioning = false;
    }
  }

  // Fade in indicator
  indicatorAlpha = lerp(indicatorAlpha, 180, 0.1); // Max alpha of 180 for subtle effect

  // Sin wave hover motion
  const hoverOffset = sin(frameCount / 20) * 4;

  // Calculate angle from indicator to player (point is at bottom center of image)
  // Only rotate if indicator is far enough from player to avoid snap
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  const distToPlayer = dist(indicatorCurrentX, indicatorCurrentY + hoverOffset, playerCenterX, playerCenterY);

  let angle;
  if (distToPlayer > 20) {
    angle = atan2(playerCenterY - (indicatorCurrentY + hoverOffset), playerCenterX - indicatorCurrentX) + PI;
  } else {
    angle = PI; // Keep pointing down when very close to player
  }

  // Draw indicator with fade, hover, and rotation
  push();
  tint(255, indicatorAlpha);
  translate(indicatorCurrentX, indicatorCurrentY + hoverOffset);
  rotate(angle + HALF_PI); // Add HALF_PI since point is at bottom center
  imageMode(CENTER);
  image(IndicatorImg, 0, 0, 30, 30);
  imageMode(CORNER);
  noTint();
  pop();
}

function drawPlayerSelectionMenu() {
  if (!playerSelectionMenuOpen && playerSelectionMenuAlpha < 5) return;
  
  // Animate menu appearance
  if (playerSelectionMenuOpen) {
    playerSelectionMenuAlpha = lerp(playerSelectionMenuAlpha, 255, 0.2);
  } else {
    playerSelectionMenuAlpha = lerp(playerSelectionMenuAlpha, 0, 0.2);
  }
  
  push();
  
  // Semi-transparent background
  fill(0, 0, 0, playerSelectionMenuAlpha * 0.7);
  rectMode(CENTER);
  rect(600, 375, 400, 80 + players.length * 60, 10);
  
  // Border
  strokeWeight(3);
  stroke(255, 150, 0, playerSelectionMenuAlpha * 0.8);
  noFill();
  rect(600, 375, 400, 80 + players.length * 60, 10);
  noStroke();
  rectMode(CORNER);
  
  // Title
  fill(255, 150, 0, playerSelectionMenuAlpha);
  textSize(24);
  textFont(Silkscreen);
  textAlign(CENTER, CENTER);
  text("SELECT ROBOT", 600, 315);
  
  // Player list
  textSize(18);
  const startY = 360;
  
  for (let i = 0; i < players.length; i++) {
    const yPos = startY + i * 50;
    
    // Highlight selected player
    if (i === selectedPlayerIndex) {
      fill(255, 150, 0, playerSelectionMenuAlpha * 0.4);
      rect(410, yPos - 20, 380, 40, 5);
    }
    
    // Player name
    fill(255, 255, 255, playerSelectionMenuAlpha);
    textAlign(LEFT, CENTER);
    text(players[i].name, 430, yPos);
    
    // Health bar
    const healthPercent = players[i].health / players[i].maxHealth;
    fill(50, 50, 50, playerSelectionMenuAlpha * 0.6);
    rect(630, yPos - 10, 150, 20, 3);
    
    if (healthPercent > 0.5) {
      fill(100, 255, 100, playerSelectionMenuAlpha);
    } else if (healthPercent > 0.25) {
      fill(255, 200, 0, playerSelectionMenuAlpha);
    } else {
      fill(255, 100, 100, playerSelectionMenuAlpha);
    }
    rect(630, yPos - 10, 150 * healthPercent, 20, 3);
    
    // Health text
    fill(255, 255, 255, playerSelectionMenuAlpha);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(Math.floor(players[i].health) + "/" + players[i].maxHealth, 705, yPos);
    textSize(18);
  }
  
  // Instructions
  fill(255, 150, 0, playerSelectionMenuAlpha * 0.9);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("UP/DOWN: Navigate | Release Q: Select", 600, startY + players.length * 50 + 20);
  
  pop();
}

function drawPlayerTransferMenu() {
  if (!playerTransferMenuOpen && playerTransferMenuAlpha < 5) return;
  
  // Animate menu appearance
  if (playerTransferMenuOpen) {
    playerTransferMenuAlpha = lerp(playerTransferMenuAlpha, 255, 0.2);
  } else {
    playerTransferMenuAlpha = lerp(playerTransferMenuAlpha, 0, 0.2);
  }
  
  push();
  
  // Semi-transparent background
  fill(0, 0, 0, playerTransferMenuAlpha * 0.7);
  rectMode(CENTER);
  rect(600, 375, 400, 80 + players.length * 60, 10);
  
  // Border
  strokeWeight(3);
  stroke(255, 150, 0, playerTransferMenuAlpha * 0.8);
  noFill();
  rect(600, 375, 400, 80 + players.length * 60, 10);
  noStroke();
  rectMode(CORNER);
  
  // Title
  fill(255, 150, 0, playerTransferMenuAlpha);
  textSize(24);
  textFont(Silkscreen);
  textAlign(CENTER, CENTER);
  text("TRANSFER ITEM TO...", 600, 315);
  
  // Player list (include all players)
  textSize(18);
  const startY = 360;
  
  for (let i = 0; i < players.length; i++) {
    const yPos = startY + i * 50;
    
    // Highlight selected player
    if (i === selectedTransferPlayerIndex) {
      fill(255, 150, 0, playerTransferMenuAlpha * 0.4);
      rect(410, yPos - 20, 380, 40, 5);
    }
    
    // Player name
    fill(255, 255, 255, playerTransferMenuAlpha);
    textAlign(LEFT, CENTER);
    text(players[i].name, 430, yPos);
    
    // Health bar
    const healthPercent = players[i].health / players[i].maxHealth;
    fill(50, 50, 50, playerTransferMenuAlpha * 0.6);
    rect(630, yPos - 10, 150, 20, 3);
    
    if (healthPercent > 0.5) {
      fill(100, 255, 100, playerTransferMenuAlpha);
    } else if (healthPercent > 0.25) {
      fill(255, 200, 0, playerTransferMenuAlpha);
    } else {
      fill(255, 100, 100, playerTransferMenuAlpha);
    }
    rect(630, yPos - 10, 150 * healthPercent, 20, 3);
    
    // Health text
    fill(255, 255, 255, playerTransferMenuAlpha);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(Math.floor(players[i].health) + "/" + players[i].maxHealth, 705, yPos);
    textSize(18);
  }
  
  // Instructions
  fill(255, 150, 0, playerTransferMenuAlpha * 0.9);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("UP/DOWN: Navigate | Release R: Transfer", 600, startY + players.length * 50 + 20);
  
  pop();
}