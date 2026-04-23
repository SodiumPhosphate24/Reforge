// Menu state management
var gameState = "menu"; //stores the state the user is in to apply controls menu, playing, credits, controls
var isPaused = false;
let menuFadeAlpha = 255;
let gameplayFadeAlpha = 0;
let transitionSpeed = 5;
let menuAnimationTime = 0;
let ReforgeLogo;

let creditsPage = 0;
const totalCreditsPages = 2;

let menuOptions = ["Play", "Controls", "Credits"];
let selectedMenuOption = 0;
let menuOptionHoverAlpha = [0, 0, 0];
let lastMenuKeyPress = 0;
let menuKeyDelay = 150; 

let menuOptionSlideProgress = [0, 0, 0];
let menuOptionTargetSlide = [0, 0, 0]; 
let menuOptionXOffset = 500; 
let menuAnimationDelay = 10; 
let menuAnimationTimer = 0; 
let pendingStateChange = null; 

let selectionPulse = 0;
let selectionFlash = 0;
let selectionParticles = [];

function drawMenuScreen() {
  handleMenuKeyboard();

  background(20, 20, 30);

  // titlescreen
  if (titleScreenImg) {
    push();
    imageMode(CENTER);

    // Calculate scaling 
    const imgAspect = titleScreenImg.width / titleScreenImg.height;
    const canvasAspect = width / height;

    let drawWidth, drawHeight;
    //determines whether width or height is bigger and scales appropriately
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

  menuAnimationTime += 0.016; 
  
  menuAnimationTimer++;

  // Draw REFORGE logo

  push();
  imageMode(CENTER);

  let logoWidth = ReforgeLogo.width;
  let logoHeight = ReforgeLogo.height;
  let logoScale = (width * 0.4) / max(logoWidth, logoHeight);
  let displayWidth = logoWidth * logoScale;
  let displayHeight = logoHeight * logoScale;

  // Sin wave float animation
  const floatOffset = sin(frameCount / 30) * 8;

  image(ReforgeLogo, width / 2, 370 + floatOffset, displayWidth, displayHeight);
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

    if (allOptionsOut) {
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

    if (gameState === "menu" && !pendingStateChange) {
      // Entrance: top to bottom (0, 1, 2, 3)
      const delayFrames = i * menuAnimationDelay;
      if (menuAnimationTimer >= delayFrames) {
        menuOptionTargetSlide[i] = 1; 
      }
    } else if (pendingStateChange) {
      // Exit: top to bottom (0, 1, 2, 3)
      const delayFrames = i * menuAnimationDelay;
      if (menuAnimationTimer >= delayFrames) {
        menuOptionTargetSlide[i] = 0; 
      }
    }

    menuOptionSlideProgress[i] = lerp(menuOptionSlideProgress[i], menuOptionTargetSlide[i], 0.1);

    // X position slide animation
    const currentMenuX = lerp(menuX + menuOptionXOffset, menuX, menuOptionSlideProgress[i]);

    textSize(28);
    const optionTextWidth = textWidth(menuOptions[i]);
    const arrowWidth = 30; // Space for arrow
    const totalWidth = optionTextWidth + arrowWidth + 10; // 10px padding
    const optionHeight = 50;

    // hover animation
    if (selectedMenuOption === i) {
      menuOptionHoverAlpha[i] = lerp(menuOptionHoverAlpha[i], 255, 0.2);
    } else {
      menuOptionHoverAlpha[i] = lerp(menuOptionHoverAlpha[i], 0, 0.15);
    }

    // selection effect for selected option
    if (selectedMenuOption === i) {
      selectionPulse = sin(frameCount / 10) * 5;

      // Outer glow
      fill(255, 200, 50, 20 + menuOptionHoverAlpha[i] * 0.1);
      rect(currentMenuX - arrowWidth - 15 - selectionPulse / 2, optionY - 25 - selectionPulse / 2, totalWidth + 30 + selectionPulse, 50 + selectionPulse, 8);

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

    // draw selection particles
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

    // Draw arrow indicator
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
    if (typeof playMenuSwitchSfx === "function") playMenuSwitchSfx();
  }

  if (keyIsDown(DOWN_ARROW)) {
    selectedMenuOption = (selectedMenuOption + 1) % menuOptions.length;
    lastMenuKeyPress = currentTime;
    if (typeof playMenuSwitchSfx === "function") playMenuSwitchSfx();
  }

  // Select with Enter
  if (keyIsDown(ENTER)) {
    handleMenuClick(selectedMenuOption);
    lastMenuKeyPress = currentTime;
    if (typeof playMenuSelectSfx === "function") playMenuSelectSfx();
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
  } else if (optionIndex === 1) { // Controls
    pendingStateChange = "controls";
    menuAnimationTimer = 0;
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionTargetSlide[i] = 0;
    }
  } else if (optionIndex === 2) { // Credits
    // Start exit animation, will change state once complete
    pendingStateChange = "credits";
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
    text("CREDITS", width / 2, 100);
  }
  noStroke();
  text("CREDITS", width / 2, 100);

  // Credits content
  textSize(24);
  fill(255, 255, 255, 220);

  let startY = 280;
  let spacing = 40;

  if (creditsPage === 0) {
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
  } else {
    fill(255, 255, 255, 220);
    text("LITERARY CITATIONS", width / 2, startY);
    fill(255, 220, 100);
    textSize(18);
    text("'Frankenstein; or, The Modern Prometheus' by Mary Shelley", width / 2, startY + spacing * 1.5);
    text("'Walden; or, Life in the Woods' by Henry David Thoreau", width / 2, startY + spacing * 2.5);

    fill(255, 255, 255, 200);
    textSize(14);
    text("(Used for atmosphere and narrative depth)", width / 2, startY + spacing * 3.5);
  }

  // Back instruction
  textSize(18);
  fill(255, 255, 255, 150);
  text("Press ESC to return to menu", width / 2, height - 80);

  // Page indicator and navigation hint
  textSize(14);
  text("Page " + (creditsPage + 1) + " of " + totalCreditsPages, width / 2, height - 120);
  text("Use LEFT / RIGHT arrows to flip pages", width / 2, height - 600);
  pop();

  // Handle navigation
  if (keyPressedOnce(LEFT_ARROW)) {
    creditsPage = (creditsPage - 1 + totalCreditsPages) % totalCreditsPages;
  }
  if (keyPressedOnce(RIGHT_ARROW)) {
    creditsPage = (creditsPage + 1) % totalCreditsPages;
  }

  // Handle ESC to return to menu
  if (keyPressedOnce(ESCAPE)) {
    gameState = "menu";
    creditsPage = 0; // Reset for next time
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
function drawControlsScreen() {
  background(20, 20, 30);
  if (titleScreenImg) {
    push();
    imageMode(CENTER);
    image(titleScreenImg, width / 2, height / 2, width, height);
    pop();
  }

  push();
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);

  fill(255, 200, 80);
  textFont(Silkscreen);
  textSize(40);
  textAlign(CENTER);
  text("CONTROLS", width / 2, 100);

  textSize(20);
  fill(255);
  let startY = 180;
  let spacing = 35;
  let leftX = width / 2 - 200;
  let rightX = width / 2 + 50;

  textAlign(LEFT);
  text("WASD", leftX, startY); text("- Move", rightX, startY);
  text("MOUSE", leftX, startY + spacing); text("- Aim / Shoot", rightX, startY + spacing);
  text("E", leftX, startY + spacing * 2); text("- Interact / Pickup", rightX, startY + spacing * 2);
  text("Q (Hold)", leftX, startY + spacing * 3); text("- Switch Robot", rightX, startY + spacing * 3);
  text("1-8", leftX, startY + spacing * 4); text("- Inventory Slots", rightX, startY + spacing * 4);
  text("X", leftX, startY + spacing * 5); text("- Drop Item", rightX, startY + spacing * 5);
  text("R (Hold)", leftX, startY + spacing * 6); text("- Transfer Item", rightX, startY + spacing * 6);
  text("ESC", leftX, startY + spacing * 7); text("- Pause Game", rightX, startY + spacing * 7);

  textAlign(CENTER);
  fill(255, 255, 255, 150);
  text("Press ESC to return", width / 2, height - 80);
  pop();

  if (keyPressedOnce(ESCAPE)) {
    gameState = "menu";
    menuAnimationTimer = 0;
    for (let i = 0; i < menuOptions.length; i++) {
      menuOptionSlideProgress[i] = 0;
      menuOptionTargetSlide[i] = 0;
    }
  }
}

function drawPauseMenu() {
  push();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  fill(255, 200, 80);
  textFont(Silkscreen);
  textSize(50);
  textAlign(CENTER);
  text("PAUSED", width / 2, height / 2 - 150);

  textSize(20);
  fill(255);
  text("CONTROLS", width / 2, height / 2 - 60);
  textSize(16);
  let startY = height / 2 - 20;
  let spacing = 25;
  text("WASD - Move | MOUSE - Aim/Shoot | E - Interact", width / 2, startY);
  text("Q (Hold) - Switch Robot | 1-8 - Slots | X - Drop", width / 2, startY + spacing);
  text("R (Hold) - Transfer | ESC - Resume", width / 2, startY + spacing * 2);

  textSize(24);
  fill(255, 255, 255, sin(frameCount / 10) * 100 + 155);
  text("Press ESC to Resume", width / 2, height / 2 + 120);
  pop();
}
