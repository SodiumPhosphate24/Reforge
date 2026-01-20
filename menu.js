// Menu state management
var gameState = "menu"; // "menu", "playing", "credits", or "settings"
let menuFadeAlpha = 255;
let gameplayFadeAlpha = 0;
let transitionSpeed = 5;
let menuAnimationTime = 0;
let ReforgeLogo;

// Menu options
let menuOptions = ["Play", "Credits", "Settings"];
let selectedMenuOption = 0;
let menuOptionHoverAlpha = [0, 0, 0];
let lastMenuKeyPress = 0;
let menuKeyDelay = 150; // Delay between key presses in ms

// New variables for menu animation
let menuOptionSlideProgress = [0, 0, 0];
let menuOptionTargetSlide = [0, 0, 0]; // 0 for off-screen right, 1 for on-screen
let menuOptionXOffset = 500; // Starting X offset for animation
let menuAnimationDelay = 10; // Frames delay between each option
let menuAnimationTimer = 0; // Timer for staggered animation
let pendingStateChange = null; // Store next state to transition to after animation

// Selection effect variables
let selectionPulse = 0;
let selectionFlash = 0;
let selectionParticles = [];

function drawMenuScreen() {
  // Handle keyboard navigation
  handleMenuKeyboard();

  background(20, 20, 30);

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

  // Check if exit animation is complete
  if (pendingStateChange && gameState === "menu") {
    let allOptionsOut = true;
    for (let i = 0; i < menuOptions.length; i++) {
      if (menuOptionSlideProgress[i] > 0.01) {
        allOptionsOut = false;
        break;
      }
    }

    // Once all options are off-screen, change state
    if (allOptionsOut) {
      // Handle Play by starting game transition
      if (pendingStateChange === "play") {
        startGameTransition();
      } else {
        gameState = pendingStateChange;
      }
      pendingStateChange = null;
      menuAnimationTimer = 0;
    }
  }

  for (let i = 0; i < menuOptions.length; i++) {
    const optionY = menuStartY + i * menuSpacing;

    // Update slide progress towards target with staggered delay
    if (gameState === "menu" && !pendingStateChange) {
      // Entrance: top to bottom (0, 1, 2, 3)
      const delayFrames = i * menuAnimationDelay;
      if (menuAnimationTimer >= delayFrames) {
        menuOptionTargetSlide[i] = 1; // Target on-screen
      }
    } else if (pendingStateChange) {
      // Exit: top to bottom (0, 1, 2, 3)
      const delayFrames = i * menuAnimationDelay;
      if (menuAnimationTimer >= delayFrames) {
        menuOptionTargetSlide[i] = 0; // Target off-screen right
      }
    }

    menuOptionSlideProgress[i] = lerp(menuOptionSlideProgress[i], menuOptionTargetSlide[i], 0.1);

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
      menuOptionHoverAlpha[i] = lerp(menuOptionHoverAlpha[i], 255, 0.2);
    } else {
      menuOptionHoverAlpha[i] = lerp(menuOptionHoverAlpha[i], 0, 0.15);
    }

    // Draw selection effect for selected option
    if (selectedMenuOption === i) {
      selectionPulse = sin(frameCount / 10) * 5;
      
      // Outer glow
      fill(255, 200, 50, 20 + menuOptionHoverAlpha[i] * 0.1);
      rect(currentMenuX - arrowWidth - 15 - selectionPulse/2, optionY - 25 - selectionPulse/2, totalWidth + 30 + selectionPulse, 50 + selectionPulse, 8);
      
      // Main background
      fill(255, 255, 255, 40 + menuOptionHoverAlpha[i] * 0.2);
      noStroke();
      rect(currentMenuX - arrowWidth - 10, optionY - 25, totalWidth + 20, 50, 5);
      
      // Selection particles effect
      if (frameCount % 10 === 0) {
        selectionParticles.push({
          x: currentMenuX - arrowWidth + random(totalWidth),
          y: optionY + random(-20, 20),
          vx: random(-0.5, 0.5),
          vy: random(-1, -2),
          life: 255
        });
      }
    }

    // Update and draw selection particles
    for (let p = selectionParticles.length - 1; p >= 0; p--) {
      let part = selectionParticles[p];
      part.x += part.vx;
      part.y += part.vy;
      part.life -= 10;
      if (part.life <= 0) {
        selectionParticles.splice(p, 1);
        continue;
      }
      fill(255, 255, 200, part.life);
      noStroke();
      ellipse(part.x, part.y, 3, 3);
    }

    // Draw arrow indicator with bounce
    if (selectedMenuOption === i) {
      push();
      let arrowBounce = sin(frameCount / 8) * 5;
      fill(255, 255, 255, 180 + menuOptionHoverAlpha[i] * 0.3);
      textSize(28);
      textAlign(LEFT, CENTER);
      text(">", currentMenuX - arrowWidth + arrowBounce, optionY);
      pop();
    }

    // Draw option text with slight scale if selected
    push();
    textSize(28 + (selectedMenuOption === i ? 2 : 0));
    fill(255, 255, 255, 200 + menuOptionHoverAlpha[i] * 0.2);
    if (selectedMenuOption === i) fill(255, 255, 200, 255);
    text(menuOptions[i], currentMenuX, optionY);
    pop();
  }

  // Draw navigation instructions at the bottom
  push();
  textAlign(CENTER, CENTER);
  textSize(16);
  fill(255, 255, 255, 150);
  text("Navigate Up/Down •  ENTER Select", width / 2, height - 60);
  pop();
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
    // Start exit animation, will change state once complete
    pendingStateChange = "play";
    menuAnimationTimer = 0;
    // Set all targets to slide off-screen
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionTargetSlide[i] = 0;
    }
  } else if (optionIndex === 1) { // Credits
    // Start exit animation, will change state once complete
    pendingStateChange = "credits";
    menuAnimationTimer = 0;
    // Set all targets to slide off-screen
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionTargetSlide[i] = 0;
    }
  } else if (optionIndex === 2) { // Settings
    // Start exit animation, will change state once complete
    pendingStateChange = "settings";
    menuAnimationTimer = 0;
    // Set all targets to slide off-screen
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionTargetSlide[i] = 0;
    }
  }
}

function startGameTransition() {
  gameState = "transition";
  transitionProgress = 0;
}

let transitionProgress = 0;
let titleTransitionScale = 1;

function updateTransition() {
  if (gameState !== "transition") return;

  transitionProgress += 0.05; // Fade speed

  // When fully black (halfway through transition), start intro
  if (transitionProgress >= 0.5 && transitionProgress < 0.55) {
    if (typeof initializeIntro === 'function') {
      console.log("Starting intro sequence from menu...");
      initializeIntro();
    }
  }

  // Switch to intro state once fade completes
  if (transitionProgress >= 1.0) {
    gameState = "intro";
    transitionProgress = 0;
  }
}

function drawCreditsScreen() {
  // Draw titlescreen background
  if (titleScreenImg) {
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
  } else {
    background(20, 20, 30);
  }

  // Dark overlay for readability
  push();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  pop();

  // Title
  push();
  fill(255, 200, 80);
  textFont(Silkscreen);
  textSize(48);
  textAlign(CENTER, CENTER);
  // Glow effect for title
  for (let i = 0; i < 3; i++) {
    strokeWeight(8 - i * 2);
    stroke(255, 180, 50, 50);
    text("CREDITS", width / 2, 150);
  }
  noStroke();
  text("CREDITS", width / 2, 150);

  // Credits content
  textSize(24);
  fill(255, 255, 255, 220);
  
  let startY = 280;
  let spacing = 40;
  
  text("GAME DESIGN & PROGRAMMING", width / 2, startY);
  fill(255, 220, 100);
  text("The Reforge Programming Team", width / 2, startY + spacing);
  
  fill(255, 255, 255, 220);
  text("MUSIC", width / 2, startY + spacing * 3);
  fill(255, 220, 100);
  text("'Mysterious' by Infrared Scale", width / 2, startY + spacing * 4);
  textSize(14);
  fill(200, 200, 200, 200);
  text("Creative Commons Attribution license (reuse allowed)", width / 2, startY + spacing * 4.8);
  text("Source: https://www.youtube.com/watch?v=neXbwN3zJ5Q", width / 2, startY + spacing * 5.4);
  
  textSize(24);
  fill(255, 255, 255, 220);
  text("ART ASSETS", width / 2, startY + spacing * 7);
  fill(255, 220, 100);
  text("The Reforge Art Team", width / 2, startY + spacing * 8);

  // Back instruction
  textSize(18);
  fill(255, 255, 255, 150);
  text("Press ESC to return to menu", width / 2, height - 80);
  pop();

  // Handle ESC to return to menu
  if (keyPressedOnce(ESCAPE)) {
    gameState = "menu";
    // Reset menu animation for re-entry - start off-screen right
    menuAnimationTimer = 0;
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionSlideProgress[i] = 0; // Start off-screen
      menuOptionTargetSlide[i] = 0; // Will be set to 1 by animation logic
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
    // Reset menu animation for re-entry - start off-screen right
    menuAnimationTimer = 0;
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionSlideProgress[i] = 0; // Start off-screen
      menuOptionTargetSlide[i] = 0; // Will be set to 1 by animation logic
    }
  }
}

function drawTransitionOverlay() {
  if (gameState !== "transition") return;

  // Calculate fade alpha (fade out then stay black)
  let fadeAlpha = 0;
  if (transitionProgress < 0.5) {
    // Fade to black
    fadeAlpha = map(transitionProgress, 0, 0.5, 0, 255);
  } else {
    // Stay black
    fadeAlpha = 255;
  }

  // Draw black overlay
  push();
  fill(0, 0, 0, fadeAlpha);
  noStroke();
  rect(0, 0, width, height);
  pop();
}

// Helper function to transition to intro when starting from menu
function startGameFromMenu() {
  console.log("Starting game from menu");
  pendingStateChange = "intro";
  animateMenuOut();
}