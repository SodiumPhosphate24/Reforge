// Menu state management
var gameState = "menu"; // "menu", "playing", "credits", or "settings"
let menuFadeAlpha = 255;
let gameplayFadeAlpha = 0;
let transitionSpeed = 5;
let menuAnimationTime = 0;
let ReforgeLogo;

// Menu options
let menuOptions = ["Play", "Continue", "Credits", "Settings"];
let selectedMenuOption = 0;
let menuOptionHoverAlpha = [0, 0, 0, 0];
let lastMenuKeyPress = 0;
let menuKeyDelay = 150; // Delay between key presses in ms

// New variables for menu animation
let menuOptionSlideProgress = [0, 0, 0, 0];
let menuOptionTargetSlide = [0, 0, 0, 0]; // 0 for off-screen right, 1 for on-screen
let menuOptionXOffset = 500; // Starting X offset for animation
let menuAnimationDelay = 10; // Frames delay between each option
let menuAnimationTimer = 0; // Timer for staggered animation

function drawMenuScreen() {
  // Handle keyboard navigation
  handleMenuKeyboard();

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
  
  // Increment animation timer for staggered menu options
  menuAnimationTimer++;

  // Draw REFORGE logo with floating animation
  push();
  imageMode(CENTER);

  let logoWidth = ReforgeLogo.width;
  let logoHeight = ReforgeLogo.height;
  let logoScale = (width * 0.4) / max(logoWidth, logoHeight);
  let displayWidth = logoWidth * logoScale;
  let displayHeight = logoHeight * logoScale;

  // Sin wave float animation
  const floatOffset = sin(frameCount / 30) * 8;

  image(ReforgeLogo, width / 2, 180 + floatOffset, displayWidth, displayHeight);
  pop();

  // Draw menu options on right side
  const menuX = width - 250;
  const menuStartY = 350;
  const menuSpacing = 60;

  textFont(Silkscreen);
  textAlign(LEFT, CENTER);

  for (let i = 0; i < menuOptions.length; i++) {
    const optionY = menuStartY + i * menuSpacing;

    // Update slide progress towards target with staggered delay
    if (gameState === "menu") {
      // Entrance: top to bottom (0, 1, 2, 3)
      const delayFrames = i * menuAnimationDelay;
      if (menuAnimationTimer >= delayFrames) {
        menuOptionTargetSlide[i] = 1; // Target on-screen
      }
    } else if (gameState === "credits" || gameState === "settings") {
      // Exit: top to bottom (0, 1, 2, 3)
      const delayFrames = i * menuAnimationDelay;
      if (menuAnimationTimer >= delayFrames) {
        menuOptionTargetSlide[i] = 0; // Target off-screen right
      }
    }
    
    menuOptionSlideProgress[i] = lerp(menuOptionSlideProgress[i], menuOptionTargetSlide[i], 0.15);

    // Calculate current X position with slide animation
    const currentMenuX = lerp(menuX + menuOptionXOffset, menuX, menuOptionSlideProgress[i]);

    // Measure text width for this option
    textSize(28);
    const optionTextWidth = textWidth(menuOptions[i]);
    const arrowWidth = 30; // Space for arrow
    const totalWidth = optionTextWidth + arrowWidth + 10; // 10px padding
    const optionHeight = 50;

    // Smooth hover animation - animate selected option
    if (selectedMenuOption === i) {
      menuOptionHoverAlpha[i] = lerp(menuOptionHoverAlpha[i], 255, 0.15);
    } else {
      menuOptionHoverAlpha[i] = lerp(menuOptionHoverAlpha[i], 0, 0.1);
    }

    // Draw faint white selection background (fit to text width)
    if (selectedMenuOption === i) {
      fill(255, 255, 255, 30 + menuOptionHoverAlpha[i] * 0.2);
      noStroke();
      rect(currentMenuX - arrowWidth - 10, optionY - 25, totalWidth + 20, 50, 5);
    }

    // Draw arrow indicator on the left side for selected option
    if (selectedMenuOption === i) {
      push();
      fill(255, 255, 255, 150 + menuOptionHoverAlpha[i] * 0.4);
      textSize(28);
      textAlign(LEFT, CENTER);
      text(">", currentMenuX - arrowWidth, optionY);
      pop();
    }

    // Draw option text
    textSize(28);
    fill(255, 255, 255, 200 + menuOptionHoverAlpha[i] * 0.2);
    text(menuOptions[i], currentMenuX, optionY);
  }
}

function handleMenuKeyboard() {
  const currentTime = millis();

  // Prevent key repeat spam
  if (currentTime - lastMenuKeyPress < menuKeyDelay) {
    return;
  }

  // Navigate with arrow keys
  if (keyIsDown(UP_ARROW)) {
    selectedMenuOption = (selectedMenuOption - 1 + menuOptions.length) % menuOptions.length;
    lastMenuKeyPress = currentTime;
  }

  if (keyIsDown(DOWN_ARROW)) {
    selectedMenuOption = (selectedMenuOption + 1) % menuOptions.length;
    lastMenuKeyPress = currentTime;
  }

  // Select with Enter
  if (keyIsDown(ENTER)) {
    handleMenuClick(selectedMenuOption);
    lastMenuKeyPress = currentTime;
  }
}

function handleMenuClick(optionIndex) {
  if (optionIndex === 0) { // Play
    startGameTransition();
  } else if (optionIndex === 1) { // Continue
    // TODO: Implement continue functionality
    startGameTransition();
  } else if (optionIndex === 2) { // Credits
    gameState = "credits";
    // Reset animation progress and timer when entering credits
    menuAnimationTimer = 0;
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionTargetSlide[i] = 0; // Slide out
    }
  } else if (optionIndex === 3) { // Settings
    gameState = "settings";
    // Reset animation progress and timer when entering settings
    menuAnimationTimer = 0;
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionTargetSlide[i] = 0; // Slide out
    }
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

function drawCreditsScreen() {
  background(20, 20, 30);

  // Title
  push();
  fill(100, 255, 255);
  textFont(Silkscreen);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("CREDITS", width / 2, 200);

  // Placeholder text
  textSize(24);
  fill(255, 255, 255, 200);
  text("Coming Soon", width / 2, height / 2);

  // Back instruction
  textSize(18);
  fill(100, 255, 255, 180);
  text("Press ESC to return to menu", width / 2, height - 100);
  pop();

  // Handle ESC to return to menu
  if (keyPressedOnce(ESCAPE)) {
    gameState = "menu";
    // Reset menu animation for re-entry
    menuAnimationTimer = 0;
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionSlideProgress[i] = 0;
      menuOptionTargetSlide[i] = 0;
    }
  }
}

function drawSettingsScreen() {
  background(20, 20, 30);

  // Title
  push();
  fill(100, 255, 255);
  textFont(Silkscreen);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("SETTINGS", width / 2, 200);

  // Placeholder text
  textSize(24);
  fill(255, 255, 255, 200);
  text("Coming Soon", width / 2, height / 2);

  // Back instruction
  textSize(18);
  fill(100, 255, 255, 180);
  text("Press ESC to return to menu", width / 2, height - 100);
  pop();

  // Handle ESC to return to menu
  if (keyPressedOnce(ESCAPE)) {
    gameState = "menu";
    // Reset menu animation for re-entry
    menuAnimationTimer = 0;
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionSlideProgress[i] = 0;
      menuOptionTargetSlide[i] = 0;
    }
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

      // Sin wave float animation
      const floatOffset = sin(frameCount / 30) * 8;

      tint(255, logoAlpha);
      image(ReforgeLogo, width / 2, 180 + floatOffset, displayWidth, displayHeight);
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