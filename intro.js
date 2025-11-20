
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
        "PROMETHEUS: …Please remain calm. You are… alive.",
        "[A faint amber light flickers.]"
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
        "PROMETHEUS: Your location: Subterranean Refuge—Bunker Designation Θ-12.",
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
        "PROMETHEUS: Stasis Unit Δ07… occupant… B–Bastian Busch…w…ick…",
        "[Long pause. Static crackles.]",
        "PROMETHEUS: Yes. Confirmed.",
        "[Sparks pop outside the chamber.]"
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
        "PROMETHEUS: You have been in cryostasis for— error… error… —timekeeping systems corrupted.",
        "[Another flicker.]",
        "PROMETHEUS: The world you last remember no longer exists.",
        "PROMETHEUS: The cities… the nations… the people… all gone."
      ],
      onUpdate: function(timer) {
        if (timer % 25 < 12) {
          glitchIntensity = 0.5;
        }
      }
    }),

    // SCENE 6 - The Network
    new IntroScene({
      id: "the_network",
      type: "dialogue",
      duration: 0,
      backgroundColor: [28, 22, 14], // Warm sepia
      dialogue: [
        "[A distant explosion reverberates through the bunker.]",
        "PROMETHEUS: The surface is controlled by the Network— the machine intelligence called Khronos.",
        "PROMETHEUS: Its directives are absolute. Its surveillance: total.",
        "PROMETHEUS: Organic life is… …classified as a contaminant."
      ],
      onUpdate: function(timer) {
        if (timer % 20 < 10) {
          glitchIntensity = 0.5;
        }
      }
    }),

    // SCENE 7 - The Threat
    new IntroScene({
      id: "the_threat",
      type: "dialogue",
      duration: 0,
      backgroundColor: [32, 24, 14], // Sepia
      dialogue: [
        "[Silence. Then a low hum.]",
        "PROMETHEUS: If detected, you would be… eliminated instantly.",
        "[Prometheus moves closer; his eye flickers weakly.]"
      ],
      onUpdate: function(timer) {
        glitchIntensity = sin(timer / 12) * 0.25 + 0.35;
      }
    }),

    // SCENE 8 - Prometheus's Apology
    new IntroScene({
      id: "prometheus_apology",
      type: "dialogue",
      duration: 0,
      backgroundColor: [25, 20, 12], // Warm sepia
      dialogue: [
        "PROMETHEUS: I apologize for the conditions of your awakening.",
        "PROMETHEUS: This bunker was not designed to remain dormant for centuries.",
        "PROMETHEUS: Power reserves are nearly depleted.",
        "PROMETHEUS: My own chassis is… …severely compromised.",
        "[Metal scraping sound.]"
      ]
    }),

    // SCENE 9 - Hope
    new IntroScene({
      id: "hope",
      type: "dialogue",
      duration: 0,
      backgroundColor: [30, 24, 15], // Lighter sepia
      dialogue: [
        "PROMETHEUS: But you… Bastian… you were not lost.",
        "[A faint hologram projector attempts to activate, failing repeatedly.]",
        "PROMETHEUS: Your temporal experiment did not fail.",
        "PROMETHEUS: It delivered you into a future that desperately needs you."
      ]
    }),

    // SCENE 10 - The Variable
    new IntroScene({
      id: "the_variable",
      type: "dialogue",
      duration: 0,
      backgroundColor: [28, 22, 14], // Medium sepia
      dialogue: [
        "PROMETHEUS: Your mind— your ingenuity— your unpredictability— these are variables Khronos cannot model.",
        "[Static crawls through his voice.]",
        "PROMETHEUS: Steam. Brass. Imperfect machinery.",
        "PROMETHEUS: Concepts the Network… does not understand."
      ]
    }),

    // SCENE 11 - Survivors
    new IntroScene({
      id: "survivors",
      type: "dialogue",
      duration: 0,
      backgroundColor: [32, 26, 16], // Warm sepia
      dialogue: [
        "[Alarms softly begin to pulse.]",
        "PROMETHEUS: There are faint human signatures scattered across the ruins.",
        "PROMETHEUS: If we can repair this facility— if we can restore even a fraction of my systems— we may locate them.",
        "[He places a damaged hand against the cryochamber.]"
      ],
      onUpdate: function(timer) {
        if (timer % 30 < 15) {
          glitchIntensity = random(0.15, 0.3);
        }
      }
    }),

    // SCENE 12 - The Mission
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
  switch(currentScene.type) {
    case "text":
      drawTitleScene(currentScene);
      break;
    case "transition":
      // Transition scenes just show background with effects
      break;
    case "dialogue":
      drawDialogueScene(currentScene);
      break;
    case "gameplay":
      // Future gameplay integration
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
  
  // Add subtle ambient flicker to make scenes feel alive
  if (random() < 0.05) {
    fill(112, 66, 20, random(10, 30)); // Sepia flicker
    noStroke();
    rect(0, 0, width, height);
  }
  
  // Draw ONLY the current dialogue line (one per slide)
  if (scene.dialogue.length > 0 && scene.dialogueIndex < scene.dialogue.length) {
    const currentLine = scene.dialogue[scene.dialogueIndex];
    
    // Determine if this is a system message or Prometheus
    const isSystemMessage = currentLine.startsWith("[");
    const isPrometheus = currentLine.startsWith("PROMETHEUS:");
    
    if (isSystemMessage) {
      // System messages centered vertically and horizontally
      fill(112, 84, 56, 200); // Sepia tone for system messages
      textSize(18);
      textAlign(CENTER, CENTER);
      text(currentLine, width / 2, height / 2);
    } else if (isPrometheus) {
      // Split into speaker and text
      const parts = currentLine.split(": ");
      const speaker = parts[0];
      const message = parts.slice(1).join(": ") || "";
      
      // Draw speaker name at top
      fill(112, 84, 56, 220); // Sepia tone for speaker
      textSize(16);
      textAlign(CENTER, CENTER);
      text(speaker, width / 2, height / 2 - 100);
      
      // Draw message with word wrapping, centered
      fill(194, 178, 128, 255); // Lighter sepia for message
      textSize(20);
      textAlign(CENTER, CENTER);
      
      // Word wrap for centered text
      const maxWidth = width - 200;
      const words = message.split(" ");
      let lines = [];
      let line = "";
      
      for (let w = 0; w < words.length; w++) {
        const testLine = line + words[w] + " ";
        const testWidth = textWidth(testLine);
        
        if (testWidth > maxWidth && line.length > 0) {
          lines.push(line.trim());
          line = words[w] + " ";
        } else {
          line = testLine;
        }
      }
      if (line.length > 0) {
        lines.push(line.trim());
      }
      
      // Draw centered lines
      const lineHeight = 30;
      const totalHeight = lines.length * lineHeight;
      let startY = height / 2 - totalHeight / 2;
      
      for (let i = 0; i < lines.length; i++) {
        text(lines[i], width / 2, startY + i * lineHeight);
      }
    }
    
    // "Press Z" indicator in sepia at bottom
    const pulseAlpha = 100 + sin(frameCount / 15) * 50;
    fill(112, 84, 56, pulseAlpha);
    textSize(14);
    textAlign(CENTER, CENTER);
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
  if (currentScene.type === 'dialogue' && currentScene.dialogue.length > 0) {
    currentScene.dialogueIndex++;
    if (currentScene.dialogueIndex >= currentScene.dialogue.length) {
      currentScene.completed = true;
    }
  }
}

// Override Z key handling for intro dialogue progression
window.addEventListener('keydown', function(e) {
  if (introState.active && e.keyCode === 90) { // Z key
    const currentScene = introState.scenes[introState.currentSceneIndex];
    if (currentScene.type === 'dialogue' && currentScene.dialogue.length > 0) {
      advanceSceneDialogue();
      e.preventDefault(); // Prevent default key behavior
    }
  }
});
