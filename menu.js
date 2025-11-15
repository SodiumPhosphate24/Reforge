
// Menu state management
var gameState = "menu"; // "menu" or "playing"
let menuFadeAlpha = 255;
let gameplayFadeAlpha = 0;
let transitionSpeed = 5;
let menuAnimationTime = 0;
let logoHoverScale = 1;
let logoIdleFloat = 0;
let logoClickScale = 1;
let logoGlowAlpha = 0; // Fade-in glow
let ReforgeLogo;

function drawMenuScreen() {
  background(20, 20, 30);

  menuAnimationTime += 0.016; // Approximate 60fps
  
  // Idle floating animation
  logoIdleFloat = sin(menuAnimationTime * 2) * 8;

  push();
  imageMode(CENTER);
  
  // Calculate logo dimensions and position
  let logoBaseSize = min(width * 0.6, height * 0.6);
  let logoX = width / 2;
  let logoY = height / 2 + logoIdleFloat;
  
  // Calculate actual dimensions based on image aspect ratio
  let logoWidth = ReforgeLogo.width;
  let logoHeight = ReforgeLogo.height;
  let logoScale = logoBaseSize / max(logoWidth, logoHeight);
  let displayWidth = logoWidth * logoScale;
  let displayHeight = logoHeight * logoScale;

  // Check if mouse is hovering over the logo
  const isHoveringLogo = mouseX >= logoX - displayWidth / 2 && mouseX <= logoX + displayWidth / 2 &&
                         mouseY >= logoY - displayHeight / 2 && mouseY <= logoY + displayHeight / 2;

  // Smooth hover scale animation
  if (isHoveringLogo) {
    logoHoverScale = lerp(logoHoverScale, 1.1, 0.15);
    logoGlowAlpha = lerp(logoGlowAlpha, 0.4, 0.1); // Fade in to subtle opacity
  } else {
    logoHoverScale = lerp(logoHoverScale, 1, 0.15);
    logoGlowAlpha = lerp(logoGlowAlpha, 0, 0.08); // Fade out
  }
  
  // Smooth click animation
  logoClickScale = lerp(logoClickScale, 1, 0.2);

  // Apply transformations
  translate(logoX, logoY);
  scale(logoHoverScale * logoClickScale);
  
  // Add subtle white glow effect when hovering
  if (logoGlowAlpha > 0.01) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = `rgba(255, 255, 255, ${logoGlowAlpha})`;
  }
  
  image(ReforgeLogo, 0, 0, displayWidth, displayHeight);
  
  // Reset shadow
  drawingContext.shadowBlur = 0;
  
  pop();

  // Check for click on REFORGE logo
  if (isHoveringLogo && mouseIsPressed && mouseButton === LEFT) {
    logoClickScale = 0.9; // Shrink on click
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

  // Logo grows and fades during first 30% of transition (faster)
  if (transitionProgress < 0.3) {
    titleTransitionScale = 1 + (transitionProgress / 0.3) * 2;
  } else {
    titleTransitionScale = 3;
  }

  // Black screen appears after logo fades (0.0-0.3)
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
      pop();
    }

    // Only show logo before black screen appears (before 30% progress)
    if (transitionProgress < 0.3) {
      push();
      imageMode(CENTER);
      
      // Logo growing and fading out
      const logoAlpha = menuFadeAlpha * (1 - transitionProgress / 0.3);
      const logoFloat = sin(menuAnimationTime * 2) * 10 * (1 - transitionProgress / 0.3);
      
      let logoBaseSize = min(width * 0.6, height * 0.6);
      let logoWidth = ReforgeLogo.width;
      let logoHeight = ReforgeLogo.height;
      let logoScale = logoBaseSize / max(logoWidth, logoHeight);
      let displayWidth = logoWidth * logoScale;
      let displayHeight = logoHeight * logoScale;

      translate(width / 2, height / 2 + logoFloat);
      scale(titleTransitionScale);
      
      drawingContext.shadowBlur = 30 * (1 - transitionProgress / 0.3);
      drawingContext.shadowColor = `rgba(255, 255, 255, ${0.4 * (1 - transitionProgress / 0.3)})`;
      
      tint(255, logoAlpha);
      image(ReforgeLogo, 0, 0, displayWidth, displayHeight);
      noTint();
      
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
