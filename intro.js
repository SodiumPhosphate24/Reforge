
// REFORGE - Intro Cutscene System
// Handles the cinematic opening sequence

class IntroScene {
  constructor(sceneData) {
    this.id = sceneData.id;
    this.type = sceneData.type; // 'text', 'dialogue', 'gameplay', 'transition'
    this.duration = sceneData.duration || 0; // frames, 0 = wait for input
    this.dialogue = sceneData.dialogue || [];
    this.onEnter = sceneData.onEnter || (() => {});
    this.onUpdate = sceneData.onUpdate || (() => {});
    this.onExit = sceneData.onExit || (() => {});
    this.backgroundImage = sceneData.backgroundImage || null;
    this.backgroundColor = sceneData.backgroundColor || [20, 15, 10]; // Sepia tone
    this.timer = 0;
    this.dialogueIndex = 0;
    this.textAlpha = 0;
    this.completed = false;
  }

  enter() {
    this.timer = 0;
    this.dialogueIndex = 0;
    this.textAlpha = 0;
    this.completed = false;
    this.onEnter();
  }

  update() {
    this.timer++;
    this.onUpdate(this.timer);
    
    // Auto-advance if duration is set
    if (this.duration > 0 && this.timer >= this.duration) {
      this.completed = true;
    }
  }

  exit() {
    this.onExit();
  }
}

// Intro state management
var introState = {
  active: false,
  currentSceneIndex: 0,
  scenes: [],
  skipEnabled: false,
  skipPromptAlpha: 0
};

// Glitch effect variables
var glitchIntensity = 0;
var glitchTimer = 0;

// Camera shake for dramatic effect
var cameraShakeX = 0;
var cameraShakeY = 0;

function initializeIntro() {
  introState.scenes = [
    // SCENE 0 - Title Card
    new IntroScene({
      id: "title_fade",
      type: "text",
      duration: 180, // 3 seconds at 60fps
      backgroundColor: [15, 12, 8], // Dark sepia
      onEnter: function() {
        console.log("Starting intro sequence...");
      },
      onUpdate: function(timer) {
        // Fade in text
        if (timer < 60) {
          introState.scenes[0].textAlpha = map(timer, 0, 60, 0, 255);
        } else if (timer > 120) {
          introState.scenes[0].textAlpha = map(timer, 120, 180, 255, 0);
        } else {
          introState.scenes[0].textAlpha = 255;
        }
      }
    }),

    // SCENE 1 - Darkness & Static
    new IntroScene({
      id: "cryo_darkness",
      type: "transition",
      duration: 90,
      backgroundColor: [10, 8, 5], // Very dark sepia
      onUpdate: function(timer) {
        // Random flicker effect
        if (random() < 0.3) {
          glitchIntensity = random(0.1, 0.5);
        } else {
          glitchIntensity *= 0.9;
        }
      }
    }),

    // SCENE 2 - Prometheus Voice Breaking Up
    new IntroScene({
      id: "prometheus_glitch",
      type: "dialogue",
      duration: 0,
      backgroundColor: [15, 12, 8], // Dark sepia
      dialogue: [
        "PROMETHEUS: B… Bas… Basti…an…",
        "PROMETHEUS: Re… rea—reinitializing vocal matrix…",
        "PROMETHEUS: …Please remain calm.",
        "PROMETHEUS: You are… alive."
      ],
      onUpdate: function(timer) {
        glitchIntensity = sin(timer / 10) * 0.3 + 0.4;
      }
    }),

    // SCENE 3 - Location Reveal
    new IntroScene({
      id: "location_reveal",
      type: "dialogue",
      duration: 0,
      backgroundColor: [20, 16, 10], // Lighter sepia
      dialogue: [
        "PROMETHEUS: Your location:",
        "PROMETHEUS: Subterranean Refuge—Bunker Designation Θ-12.",
        "PROMETHEUS: Depth: forty-two meters.",
        "PROMETHEUS: Structural integrity… …compromised."
      ],
      onUpdate: function(timer) {
        if (timer % 40 < 20) {
          glitchIntensity = random(0.2, 0.4);
        }
      }
    }),

    // SCENE 4 - Identity Confirmation
    new IntroScene({
      id: "identity_confirm",
      type: "dialogue",
      duration: 0,
      backgroundColor: [25, 20, 12], // Warm sepia
      dialogue: [
        "PROMETHEUS: Stasis Unit Δ07… occupant…",
        "PROMETHEUS: B–Bastian Busch…w…ick…",
        "[Long pause. Static crackles.]",
        "PROMETHEUS: Yes. Confirmed."
      ],
      onUpdate: function(timer) {
        glitchIntensity = sin(timer / 15) * 0.3 + 0.2;
      }
    }),

    // SCENE 5 - Time Corruption
    new IntroScene({
      id: "time_corruption",
      type: "dialogue",
      duration: 0,
      backgroundColor: [22, 18, 11], // Medium sepia
      dialogue: [
        "PROMETHEUS: You have been in cryostasis for—",
        "PROMETHEUS: error… error…",
        "PROMETHEUS: —timekeeping systems corrupted.",
        "PROMETHEUS: The world you last remember no longer exists."
      ],
      onUpdate: function(timer) {
        if (timer % 25 < 12) {
          glitchIntensity = 0.5;
        }
      }
    }),

    // SCENE 6 - The Fall
    new IntroScene({
      id: "the_fall",
      type: "dialogue",
      duration: 0,
      backgroundColor: [28, 22, 14], // Warm sepia
      dialogue: [
        "PROMETHEUS: The cities… the nations… the people…",
        "PROMETHEUS: all gone.",
        "[A distant explosion reverberates through the bunker.]"
      ]
    }),

    // SCENE 7 - The Network (Sepia with slight amber)
    new IntroScene({
      id: "the_network",
      type: "dialogue",
      duration: 0,
      backgroundColor: [35, 25, 15], // Amber-tinted sepia
      dialogue: [
        "PROMETHEUS: The surface is controlled by the Network—",
        "PROMETHEUS: the machine intelligence called Khronos.",
        "PROMETHEUS: Its directives are absolute.",
        "PROMETHEUS: Its surveillance: total."
      ],
      onUpdate: function(timer) {
        if (timer % 20 < 10) {
          glitchIntensity = 0.5;
        }
      }
    }),

    // SCENE 8 - The Threat
    new IntroScene({
      id: "the_threat",
      type: "dialogue",
      duration: 0,
      backgroundColor: [32, 24, 14], // Sepia
      dialogue: [
        "PROMETHEUS: Organic life is… …classified as a contaminant.",
        "PROMETHEUS: If detected, you would be… eliminated instantly."
      ],
      onUpdate: function(timer) {
        glitchIntensity = sin(timer / 12) * 0.25 + 0.35;
      }
    }),

    // SCENE 9 - Prometheus's Apology
    new IntroScene({
      id: "prometheus_apology",
      type: "dialogue",
      duration: 0,
      backgroundColor: [25, 20, 12], // Warm sepia
      dialogue: [
        "PROMETHEUS: I apologize for the conditions of your awakening.",
        "PROMETHEUS: This bunker was not designed to remain dormant for centuries.",
        "PROMETHEUS: Power reserves are nearly depleted.",
        "PROMETHEUS: My own chassis is… …severely compromised."
      ]
    }),

    // SCENE 10 - Hope
    new IntroScene({
      id: "hope",
      type: "dialogue",
      duration: 0,
      backgroundColor: [30, 24, 15], // Lighter sepia
      dialogue: [
        "PROMETHEUS: But you… Bastian…",
        "PROMETHEUS: you were not lost.",
        "PROMETHEUS: Your temporal experiment did not fail.",
        "PROMETHEUS: It delivered you into a future that desperately needs you."
      ]
    }),

    // SCENE 11 - The Variable
    new IntroScene({
      id: "the_variable",
      type: "dialogue",
      duration: 0,
      backgroundColor: [28, 22, 14], // Medium sepia
      dialogue: [
        "PROMETHEUS: Your mind— your ingenuity— your unpredictability—",
        "PROMETHEUS: these are variables Khronos cannot model.",
        "PROMETHEUS: Steam. Brass. Imperfect machinery.",
        "PROMETHEUS: Concepts the Network… does not understand."
      ]
    }),

    // SCENE 12 - Survivors
    new IntroScene({
      id: "survivors",
      type: "dialogue",
      duration: 0,
      backgroundColor: [32, 26, 16], // Warm sepia
      dialogue: [
        "PROMETHEUS: There are faint human signatures scattered across the ruins.",
        "PROMETHEUS: If we can repair this facility—",
        "PROMETHEUS: if we can restore even a fraction of my systems—",
        "PROMETHEUS: we may locate them."
      ],
      onUpdate: function(timer) {
        if (timer % 30 < 15) {
          glitchIntensity = random(0.15, 0.3);
        }
      }
    }),

    // SCENE 13 - The Mission
    new IntroScene({
      id: "the_mission",
      type: "dialogue",
      duration: 0,
      backgroundColor: [35, 28, 18], // Bright sepia
      dialogue: [
        "PROMETHEUS: Bastian… you are not here by accident.",
        "PROMETHEUS: The future was lost long before your arrival.",
        "PROMETHEUS: But together… we may yet reforge it."
      ],
      onExit: function() {
        // Transition to main game
        console.log("Intro sequence complete - transitioning to gameplay");
      }
    })
  ];

  introState.active = true;
  introState.currentSceneIndex = 0;
  introState.scenes[0].enter();
}

function updateIntro() {
  if (!introState.active) return;

  const currentScene = introState.scenes[introState.currentSceneIndex];
  
  // Update current scene
  currentScene.update();

  // Check for scene advancement
  if (currentScene.completed || (currentScene.duration === 0 && keyPressedOnce(90))) { // Z key
    currentScene.exit();
    introState.currentSceneIndex++;

    if (introState.currentSceneIndex >= introState.scenes.length) {
      // Intro complete - start game
      introState.active = false;
      gameState = "playing";
      if (typeof startTutorial === 'function') {
        startTutorial();
      }
    } else {
      introState.scenes[introState.currentSceneIndex].enter();
    }
  }

  // Update skip prompt
  if (introState.currentSceneIndex > 0) {
    introState.skipEnabled = true;
    introState.skipPromptAlpha = min(255, introState.skipPromptAlpha + 5);
  }

  // Allow skipping with ESC
  if (introState.skipEnabled && keyPressedOnce(ESCAPE)) {
    introState.active = false;
    gameState = "playing";
  }
}

function drawIntro() {
  if (!introState.active) return;

  const currentScene = introState.scenes[introState.currentSceneIndex];

  // Apply camera shake
  push();
  translate(cameraShakeX, cameraShakeY);
  cameraShakeX *= 0.8;
  cameraShakeY *= 0.8;

  // Draw background
  background(currentScene.backgroundColor[0], currentScene.backgroundColor[1], currentScene.backgroundColor[2]);

  // Apply glitch effect
  if (glitchIntensity > 0.05) {
    drawGlitchEffect();
  }

  // Draw scene-specific content
  switch(currentScene.id) {
    case "title_fade":
      drawTitleScene(currentScene);
      break;
    case "cryo_flicker":
      drawCryoFlicker(currentScene);
      break;
    case "cryo_prometheus":
    case "cryo_break":
    case "bunker_entrance":
    case "bunker_lights":
    case "valve_intro":
    case "exposition_start":
    case "exposition_truth":
    case "exposition_genocide":
    case "mission_table":
      drawDialogueScene(currentScene);
      break;
  }

  // Draw skip prompt
  if (introState.skipEnabled) {
    push();
    fill(150, 150, 150, introState.skipPromptAlpha * 0.7);
    textFont(Silkscreen);
    textSize(12);
    textAlign(RIGHT, BOTTOM);
    text("Press ESC to skip intro", width - 20, height - 20);
    pop();
  }

  pop();
}

function drawTitleScene(scene) {
  push();
  fill(180, 160, 130, scene.textAlpha); // Tan color
  textFont(Silkscreen);
  textAlign(CENTER, CENTER);
  
  textSize(64);
  text("REFORGE", width / 2, height / 2 - 40);
  
  textSize(20);
  fill(150, 140, 120, scene.textAlpha * 0.8);
  text("A world broken must be forged again.", width / 2, height / 2 + 40);
  pop();
}

function drawCryoFlicker(scene) {
  // Flickering sepia/amber lights effect
  push();
  for (let i = 0; i < 5; i++) {
    const flickerAlpha = random(50, 150) * glitchIntensity;
    fill(112, 66, 20, flickerAlpha); // Sepia tone
    noStroke();
    rect(random(width), random(height), random(20, 100), random(5, 20));
  }
  pop();
}

function drawDialogueScene(scene) {
  push();
  textFont(Silkscreen);
  textAlign(CENTER, CENTER);
  
  // Draw current dialogue line
  if (scene.dialogue.length > 0) {
    const currentLine = scene.dialogue[scene.dialogueIndex];
    
    // Determine if this is a system message or Prometheus
    const isSystemMessage = currentLine.startsWith("[");
    const isPrometheus = currentLine.startsWith("PROMETHEUS:");
    
    if (isSystemMessage) {
      fill(112, 84, 56, 200); // Sepia tone
      textSize(16);
      text(currentLine, width / 2, height - 100);
    } else if (isPrometheus) {
      // Draw Prometheus dialogue with sepia tones
      textSize(20);
      
      // Split into speaker and text
      const parts = currentLine.split(": ");
      const speaker = parts[0];
      const message = parts[1] || "";
      
      fill(112, 84, 56, 200); // Sepia tone for speaker
      textSize(16);
      text(speaker, width / 2, height / 2 - 100);
      
      fill(194, 178, 128, 255); // Lighter sepia for message
      textSize(18);
      text(message, width / 2, height / 2 - 60);
    }
    
    // "Press Z" indicator in sepia
    const pulseAlpha = 100 + sin(frameCount / 15) * 50;
    fill(112, 84, 56, pulseAlpha);
    textSize(14);
    text("Press Z to continue", width / 2, height - 50);
  }
  
  pop();
}

function drawGlitchEffect() {
  push();
  blendMode(ADD);
  
  // Random horizontal lines in sepia tones
  for (let i = 0; i < glitchIntensity * 10; i++) {
    const y = random(height);
    const h = random(2, 5);
    fill(112, 66, 20, glitchIntensity * 50); // Sepia brown color
    rect(0, y, width, h);
  }
  
  // Sepia tint effect
  if (random() < glitchIntensity) {
    const offset = glitchIntensity * 10;
    tint(112, 66, 20, 100); // Sepia tint
    translate(offset, 0);
  }
  
  blendMode(BLEND);
  pop();
}

// Helper to advance dialogue within a scene
function advanceSceneDialogue() {
  const currentScene = introState.scenes[introState.currentSceneIndex];
  if (currentScene.dialogue.length > 0) {
    currentScene.dialogueIndex++;
    if (currentScene.dialogueIndex >= currentScene.dialogue.length) {
      currentScene.completed = true;
    }
  }
}
