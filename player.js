var activePlayer = 0;
var players = [];
var indicatorAlpha = 0; // Fade in/out alpha for indicator
var indicatorTargetX = 0; // Target position for smooth transition
var indicatorTargetY = 0;
var indicatorCurrentX = 0; // Current position for smooth transition
var indicatorCurrentY = 0;
var isTransitioning = false; // Track if switching between players
var transitionFrames = 0; // Count frames since transition started

class Player {
  constructor(x, y, w, h, speed, health, damage, picture) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.health = health;
    this.damage = damage;
    this.picture = picture;
  }
  getImage() {
    return picture;
  }
}
function switchPlayer(newPlayer) {
  activePlayer = newPlayer;
  pX = players[activePlayer].x;
  pY = players[activePlayer].y;
  pSpeed = players[activePlayer].speed;
  healthPoints = players[activePlayer].health;
  playerDamage = players[activePlayer].damage;
  PlayerImage = players[activePlayer].picture;
  pWidth = players[activePlayer].w;
  pHeight = players[activePlayer].h;

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
function drawPlayers() {
  // Draw active player shadow
  fill(0, 0, 0, 80 - sin(frameCount / 25) * 10);
  ellipse(pX + 600 + pWidth / 2, pY + 375 + pHeight, pWidth, pHeight * 0.6);

  // Draw active player at centered position with 35px visual buffer above hitbox
  // The image is drawn 35px higher than the hitbox position
  image(PlayerImage, pX + 600, pY + 375 - 35, pWidth, pHeight + 35);

  // Draw other players at their world positions with same visual buffer
  for (let i = 0; i < players.length; i++) {
    if (i !== activePlayer) {
      // Draw shadow for this player
      fill(0, 0, 0, 80 - sin(frameCount / 25) * 10);
      ellipse(players[i].x + 600 + players[i].w / 2, players[i].y + 375 + players[i].h, players[i].w, players[i].h * 0.6);

      // Draw player image
      image(players[i].picture, players[i].x + 600, players[i].y + 375 - 35, players[i].w, players[i].h + 35);
    }
  }

  // Draw indicator above active player
  drawIndicator();
}

function drawIndicator() {
  // Update target position to follow active player
  indicatorTargetX = pX + 600 + pWidth / 2;
  indicatorTargetY = pY + 375 - 50;

  // Use slower lerp during transitions, normal speed otherwise
  let xLerpSpeed = 0.3;
  let yLerpSpeed = 0.7;
  
  if (isTransitioning) {
    transitionFrames++;
    xLerpSpeed = 0.05; // Much slower during transition
    yLerpSpeed = 0.05;
    
    // End transition after indicator gets close enough (or after max frames)
    const distance = dist(indicatorCurrentX, indicatorCurrentY, indicatorTargetX, indicatorTargetY);
    if (distance < 5 || transitionFrames > 120) {
      isTransitioning = false;
    }
  }

  // Smooth transition to target position
  indicatorCurrentX = lerp(indicatorCurrentX, indicatorTargetX, xLerpSpeed);
  indicatorCurrentY = lerp(indicatorCurrentY, indicatorTargetY, yLerpSpeed);

  // Fade in indicator
  indicatorAlpha = lerp(indicatorAlpha, 180, 0.1); // Max alpha of 180 for subtle effect

  // Sin wave hover motion (4px range - more confined)
  const hoverOffset = sin(frameCount / 20) * 4;

  // Calculate angle from indicator to player (point is at bottom center of image)
  const playerCenterX = pX + 600 + pWidth / 2;
  const playerCenterY = pY + 375 + pHeight / 2;
  const angle = atan2(playerCenterY - (indicatorCurrentY + hoverOffset), playerCenterX - indicatorCurrentX) + PI;

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