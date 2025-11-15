// Menu state management
var gameState = "menu"; // "menu" or "playing"
let menuFadeAlpha = 255;
let gameplayFadeAlpha = 0;
let transitionSpeed = 5;
let menuAnimationTime = 0;
let buttonHoverScale = 1;
let titlePulsePhase = 0;
let ReforgeLogo;

function drawMenuScreen() {
  background(20, 20, 30);

  menuAnimationTime += 0.016; // Approximate 60fps

  // Draw the REFORGE.png image as the only element
  push();
  imageMode(CENTER);
  // Center the image and adjust its size if necessary.
  // The size will depend on the actual image dimensions and desired display size.
  // For now, let's assume we want it to be a significant portion of the screen.
  // You might need to adjust these values based on the actual REFORGE.png.
  let logoSize = min(width * 0.8, height * 0.8);
  translate(width / 2, height / 2);
  scale(logoSize / ReforgeLogo.width); // Scale to fit
  image(ReforgeLogo, 0, 0);
  pop();

  // Check if mouse is hovering over the REFORGE logo and if it's clicked
  let logoX = width / 2;
  let logoY = height / 2;
  let logoWidth = ReforgeLogo.width * (logoSize / ReforgeLogo.width);
  let logoHeight = ReforgeLogo.height * (logoSize / ReforgeLogo.height);

  const isHoveringLogo = mouseX >= logoX - logoWidth / 2 && mouseX <= logoX + logoWidth / 2 &&
                         mouseY >= logoY - logoHeight / 2 && mouseY <= logoY + logoHeight / 2;

  // Check for click on REFORGE logo
  if (isHoveringLogo && mouseIsPressed && mouseButton === LEFT) {
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
      pop();
    }

    // Only show title before black screen appears (before 30% progress)
    if (transitionProgress < 0.3) {
      push();
      // Title growing and fading out
      const titleAlpha = menuFadeAlpha * (1 - transitionProgress / 0.3);
      const titleFloat = sin(menuAnimationTime * 2) * 10 * (1 - transitionProgress / 0.3);

      translate(width / 2, height / 2 - 100 + titleFloat);
      scale(titleTransitionScale);

      drawingContext.shadowBlur = 30 * (1 - transitionProgress / 0.3);
      drawingContext.shadowColor = `rgba(100, 255, 255, ${0.8 * (1 - transitionProgress / 0.3)})`;
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