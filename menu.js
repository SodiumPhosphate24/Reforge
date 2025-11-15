
// Menu state management
var gameState = "menu"; // "menu" or "playing"
let menuFadeAlpha = 255;
let gameplayFadeAlpha = 0;
let transitionSpeed = 5;
let menuAnimationTime = 0;
let buttonHoverScale = 1;
let titlePulsePhase = 0;

function drawMenuScreen() {
  background(20, 20, 30);
  
  menuAnimationTime += 0.016; // Approximate 60fps
  
  // Title with animated glow and floating effect
  push();
  
  // Floating motion using sin wave
  const titleFloat = sin(menuAnimationTime * 2) * 10;
  
  // Pulsing glow effect
  const glowIntensity = 20 + sin(menuAnimationTime * 3) * 10;
  drawingContext.shadowBlur = glowIntensity;
  drawingContext.shadowColor = 'rgba(100, 255, 255, 0.8)';
  
  // Scale pulse
  const titleScale = 1 + sin(menuAnimationTime * 2.5) * 0.03;
  
  translate(width / 2, height / 2 - 100 + titleFloat);
  scale(titleScale);
  
  fill(100, 255, 255);
  textFont(Silkscreen);
  textSize(120);
  textAlign(CENTER, CENTER);
  text("REFORGE", 0, 0);
  
  drawingContext.shadowBlur = 0;
  pop();
  
  // Play button with smooth animations
  const buttonWidth = 300;
  const buttonHeight = 80;
  const buttonX = width / 2 - buttonWidth / 2;
  const buttonY = height / 2 + 50;
  
  // Check if mouse is hovering over button
  const isHovering = mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                     mouseY >= buttonY && mouseY <= buttonY + buttonHeight;
  
  // Smooth hover scale transition
  const targetScale = isHovering ? 1.1 : 1;
  buttonHoverScale = lerp(buttonHoverScale, targetScale, 0.15);
  
  // Gentle breathing animation when not hovered
  const breatheScale = isHovering ? 0 : sin(menuAnimationTime * 1.5) * 0.02;
  const finalScale = buttonHoverScale + breatheScale;
  
  // Button background with animations
  push();
  translate(width / 2, buttonY + buttonHeight / 2);
  scale(finalScale);
  
  if (isHovering) {
    // Pulsing glow on hover
    const hoverGlow = 15 + sin(menuAnimationTime * 5) * 5;
    drawingContext.shadowBlur = hoverGlow;
    drawingContext.shadowColor = 'rgba(100, 255, 255, 0.8)';
    fill(100, 255, 255, 220);
  } else {
    fill(100, 255, 255, 150);
  }
  
  rectMode(CENTER);
  rect(0, 0, buttonWidth, buttonHeight, 10);
  
  drawingContext.shadowBlur = 0;
  pop();
  
  // Button text
  push();
  translate(width / 2, buttonY + buttonHeight / 2);
  scale(finalScale);
  
  fill(20, 20, 30);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("PLAY", 0, 0);
  pop();
  
  // Subtitle with fade pulse
  const subtitleAlpha = 100 + sin(menuAnimationTime * 2) * 50;
  fill(150, 150, 150, subtitleAlpha);
  textSize(20);
  textAlign(CENTER, CENTER);
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

let transitionProgress = 0;
let titleTransitionScale = 1;

function updateTransition() {
  // Slower transition progress (0 to 1)
  transitionProgress = min(1, transitionProgress + 0.008);
  
  // Fade out menu with easing
  const fadeOutEase = pow(transitionProgress, 2);
  menuFadeAlpha = max(0, 255 * (1 - fadeOutEase));
  
  // Title grows and fades during first 30% of transition (faster)
  if (transitionProgress < 0.3) {
    titleTransitionScale = 1 + (transitionProgress / 0.3) * 2;
  } else {
    titleTransitionScale = 3;
  }
  
  // Black screen appears after title fades (0.0-0.3)
  // Then slowly fades to reveal game (0.3-1.0)
  if (transitionProgress < 0.3) {
    gameplayFadeAlpha = 255 * (transitionProgress / 0.3);
  } else {
    // Very slow fade from black to game
    const fadeInProgress = (transitionProgress - 0.3) / 0.7;
    gameplayFadeAlpha = 255 * (1 - fadeInProgress);
  }
  
  // Once transition is complete, switch to playing state
  if (transitionProgress >= 1) {
    gameState = "playing";
    transitionProgress = 0;
    titleTransitionScale = 1;
  }
}

function drawTransitionOverlay() {
  if (gameState === "transitioning") {
    menuAnimationTime += 0.016;
    
    // Draw menu overlay fading out with scale effect
    if (menuFadeAlpha > 0) {
      push();
      fill(20, 20, 30, menuFadeAlpha);
      rectMode(CORNER);
      noStroke();
      rect(0, 0, width, height);
      
      // Title growing and fading out
      const titleAlpha = menuFadeAlpha * (1 - transitionProgress * 0.5);
      const titleFloat = sin(menuAnimationTime * 2) * 10 * (1 - transitionProgress);
      
      translate(width / 2, height / 2 - 100 + titleFloat);
      scale(titleTransitionScale);
      
      drawingContext.shadowBlur = 30 * (1 - transitionProgress);
      drawingContext.shadowColor = `rgba(100, 255, 255, ${0.8 * (1 - transitionProgress)})`;
      fill(100, 255, 255, titleAlpha);
      textFont(Silkscreen);
      textSize(120);
      textAlign(CENTER, CENTER);
      text("REFORGE", 0, 0);
      drawingContext.shadowBlur = 0;
      pop();
    }
    
    // Draw black overlay with smooth fade
    if (gameplayFadeAlpha > 0) {
      push();
      fill(0, 0, 0, gameplayFadeAlpha);
      rectMode(CORNER);
      noStroke();
      rect(0, 0, width, height);
      pop();
    }
    
    updateTransition();
  }
}
