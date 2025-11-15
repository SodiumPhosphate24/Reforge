
// Menu state management
let gameState = "menu"; // "menu" or "playing"
let menuFadeAlpha = 255;
let gameplayFadeAlpha = 0;
let transitionSpeed = 5;

function drawMenuScreen() {
  background(20, 20, 30);
  
  // Title with glow effect
  push();
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = 'rgba(100, 255, 255, 0.8)';
  
  fill(100, 255, 255);
  textFont(Silkscreen);
  textSize(120);
  textAlign(CENTER, CENTER);
  text("REFORGE", width / 2, height / 2 - 100);
  
  drawingContext.shadowBlur = 0;
  pop();
  
  // Play button
  const buttonWidth = 300;
  const buttonHeight = 80;
  const buttonX = width / 2 - buttonWidth / 2;
  const buttonY = height / 2 + 50;
  
  // Check if mouse is hovering over button
  const isHovering = mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                     mouseY >= buttonY && mouseY <= buttonY + buttonHeight;
  
  // Button background
  push();
  if (isHovering) {
    fill(100, 255, 255, 200);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(100, 255, 255, 0.6)';
  } else {
    fill(100, 255, 255, 150);
  }
  
  rectMode(CORNER);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
  
  drawingContext.shadowBlur = 0;
  pop();
  
  // Button text
  fill(20, 20, 30);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("PLAY", width / 2, buttonY + buttonHeight / 2);
  
  // Subtitle
  fill(150, 150, 150);
  textSize(20);
  text("Click to begin your journey", width / 2, height - 100);
  
  // Check for click on play button
  if (isHovering && mouseIsPressed && mouseButton === LEFT) {
    startGameTransition();
  }
}

function startGameTransition() {
  gameState = "transitioning";
  // Start the tutorial when transition begins
  if (typeof startTutorial === 'function') {
    console.log("Starting tutorial from menu...");
    startTutorial();
  }
}

function updateTransition() {
  // Fade out menu
  menuFadeAlpha = max(0, menuFadeAlpha - transitionSpeed);
  
  // Fade in gameplay after menu is mostly gone
  if (menuFadeAlpha < 100) {
    gameplayFadeAlpha = min(255, gameplayFadeAlpha + transitionSpeed);
  }
  
  // Once transition is complete, switch to playing state
  if (menuFadeAlpha === 0 && gameplayFadeAlpha === 255) {
    gameState = "playing";
  }
}

function drawTransitionOverlay() {
  if (gameState === "transitioning") {
    // Draw menu overlay fading out
    if (menuFadeAlpha > 0) {
      push();
      fill(20, 20, 30, menuFadeAlpha);
      rectMode(CORNER);
      noStroke();
      rect(0, 0, width, height);
      
      // Title fading out
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = 'rgba(100, 255, 255, 0.8)';
      fill(100, 255, 255, menuFadeAlpha);
      textFont(Silkscreen);
      textSize(120);
      textAlign(CENTER, CENTER);
      text("REFORGE", width / 2, height / 2 - 100);
      drawingContext.shadowBlur = 0;
      pop();
    }
    
    // Draw black overlay fading in then out for smooth transition
    if (gameplayFadeAlpha < 255) {
      push();
      fill(0, 0, 0, 255 - gameplayFadeAlpha);
      rectMode(CORNER);
      noStroke();
      rect(0, 0, width, height);
      pop();
    }
    
    updateTransition();
  }
}
