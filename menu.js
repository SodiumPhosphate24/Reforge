
// Menu state management
var gameState = "menu"; // "menu" or "playing"
let menuFadeAlpha = 255;
let gameplayFadeAlpha = 0;
let transitionSpeed = 5;
let menuAnimationTime = 0;
let ReforgeLogo;

// Menu options
let menuOptions = ["Play", "Continue", "Credits", "Settings"];
let selectedMenuOption = 0;
let menuOptionHoverAlpha = [0, 0, 0, 0];

function drawMenuScreen() {
  background(20, 20, 30);
  
  // Draw titlescreen background
  if (titleScreenImg) {
    push();
    imageMode(CENTER);
    
    // Calculate scaling to cover the canvas while maintaining aspect ratio
    const imgAspect = titleScreenImg.width / titleScreenImg.height;
    const canvasAspect = width / height;
    
    let drawWidth, drawHeight;
    if (canvasAspect > imgAspect) {
      // Canvas is wider - fit to width
      drawWidth = width;
      drawHeight = width / imgAspect;
    } else {
      // Canvas is taller - fit to height
      drawHeight = height;
      drawWidth = height * imgAspect;
    }
    
    image(titleScreenImg, width / 2, height / 2, drawWidth, drawHeight);
    pop();
  }

  menuAnimationTime += 0.016; // Approximate 60fps
  
  // Draw REFORGE logo at top (non-interactive)
  push();
  imageMode(CENTER);
  
  let logoWidth = ReforgeLogo.width;
  let logoHeight = ReforgeLogo.height;
  let logoScale = (width * 0.4) / max(logoWidth, logoHeight);
  let displayWidth = logoWidth * logoScale;
  let displayHeight = logoHeight * logoScale;
  
  image(ReforgeLogo, width / 2, 80, displayWidth, displayHeight);
  pop();
  
  // Draw menu options on right side
  const menuX = width - 250;
  const menuStartY = 250;
  const menuSpacing = 60;
  
  textFont(Silkscreen);
  textAlign(LEFT, CENTER);
  
  for (let i = 0; i < menuOptions.length; i++) {
    const optionY = menuStartY + i * menuSpacing;
    const optionWidth = 200;
    const optionHeight = 50;
    
    // Check if mouse is hovering
    const isHovering = mouseX >= menuX && mouseX <= menuX + optionWidth &&
                       mouseY >= optionY - optionHeight / 2 && mouseY <= optionY + optionHeight / 2;
    
    // Smooth hover animation
    if (isHovering) {
      menuOptionHoverAlpha[i] = lerp(menuOptionHoverAlpha[i], 255, 0.15);
      selectedMenuOption = i;
    } else {
      menuOptionHoverAlpha[i] = lerp(menuOptionHoverAlpha[i], 0, 0.1);
    }
    
    // Draw selection indicator
    if (selectedMenuOption === i) {
      fill(100, 255, 255, 100 + menuOptionHoverAlpha[i] * 0.6);
      noStroke();
      rect(menuX - 20, optionY - 25, 220, 50, 5);
    }
    
    // Draw option text
    textSize(28);
    fill(255, 255, 255, 200 + menuOptionHoverAlpha[i] * 0.2);
    text(menuOptions[i], menuX, optionY);
    
    // Draw subtle glow on hover
    if (menuOptionHoverAlpha[i] > 10) {
      push();
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = `rgba(100, 255, 255, ${menuOptionHoverAlpha[i] / 255 * 0.5})`;
      text(menuOptions[i], menuX, optionY);
      drawingContext.shadowBlur = 0;
      pop();
    }
    
    // Check for click
    if (isHovering && mouseIsPressed && mouseButton === LEFT) {
      handleMenuClick(i);
    }
  }
}

function handleMenuClick(optionIndex) {
  if (optionIndex === 0) { // Play
    startGameTransition();
  } else if (optionIndex === 1) { // Continue
    // TODO: Implement continue functionality
    startGameTransition();
  } else if (optionIndex === 2) { // Credits
    // TODO: Implement credits screen
    console.log("Credits clicked");
  } else if (optionIndex === 3) { // Settings
    // TODO: Implement settings screen
    console.log("Settings clicked");
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

    // Keep titlescreen visible until black fade is complete
    if (titleScreenImg && transitionProgress < 0.3) {
      push();
      imageMode(CENTER);
      
      const imgAspect = titleScreenImg.width / titleScreenImg.height;
      const canvasAspect = width / height;
      
      let drawWidth, drawHeight;
      if (canvasAspect > imgAspect) {
        drawWidth = width;
        drawHeight = width / imgAspect;
      } else {
        drawHeight = height;
        drawWidth = height * imgAspect;
      }
      
      image(titleScreenImg, width / 2, height / 2, drawWidth, drawHeight);
      pop();
    }

    // Draw REFORGE title at top during transition (fade out with titlescreen)
    if (transitionProgress < 0.3) {
      push();
      imageMode(CENTER);
      
      const logoAlpha = 255 * (1 - transitionProgress / 0.3);
      
      let logoWidth = ReforgeLogo.width;
      let logoHeight = ReforgeLogo.height;
      let logoScale = (width * 0.4) / max(logoWidth, logoHeight);
      let displayWidth = logoWidth * logoScale;
      let displayHeight = logoHeight * logoScale;
      
      tint(255, logoAlpha);
      image(ReforgeLogo, width / 2, 80, displayWidth, displayHeight);
      noTint();
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
