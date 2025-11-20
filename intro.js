
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
    this.backgroundColor = sceneData.backgroundColor || [0, 0, 0];
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

    // SCENE 1 - Cryochamber Awakening (Part 1: Darkness)
    new IntroScene({
      id: "cryo_flicker",
      type: "transition",
      duration: 120,
      backgroundColor: [0, 0, 0],
      onUpdate: function(timer) {
        // Random flicker effect
        if (random() < 0.3) {
          glitchIntensity = random(0.1, 0.5);
        } else {
          glitchIntensity *= 0.9;
        }
      }
    }),

    // SCENE 1 - Cryochamber Awakening (Part 2: Prometheus Voice)
    new IntroScene({
      id: "cryo_prometheus",
      type: "dialogue",
      duration: 0, // Wait for input
      dialogue: [
        "PROMETHEUS: B…a…stian… B…sch…w…ick—",
        "PROMETHEUS: Recalibrating temporal file… stand by…",
        "PROMETHEUS: You are inside cryochamber unit seven.",
        "PROMETHEUS: Stasis duration: three hundred and four years."
      ],
      onUpdate: function(timer) {
        glitchIntensity = sin(timer / 10) * 0.2 + 0.3;
      }
    }),

    // SCENE 2 - First Steps Into Bunker
    new IntroScene({
      id: "bunker_entrance",
      type: "dialogue",
      duration: 0,
      dialogue: [
        "PROMETHEUS: Status… critical.",
        "PROMETHEUS: Bunker integrity: seventeen percent.",
        "PROMETHEUS: Time since your disappearance: three hundred and four years."
      ],
      backgroundColor: [20, 15, 10]
    }),

    // SCENE 2 - Emergency Lights
    new IntroScene({
      id: "bunker_lights",
      type: "dialogue",
      duration: 0,
      dialogue: [
        "PROMETHEUS: Do not panic. Limited oxygen detected.",
        "PROMETHEUS: Restore auxiliary power immediately."
      ],
      backgroundColor: [30, 20, 10]
    }),

    // SCENE 3 - Steam Valve Tutorial Intro
    new IntroScene({
      id: "valve_intro",
      type: "dialogue",
      duration: 0,
      dialogue: [
        "PROMETHEUS: The core boilers failed decades ago.",
        "PROMETHEUS: Your first task: reignite pressure flow.",
        "PROMETHEUS: This technology is… familiar to you, Bastian.",
        "PROMETHEUS: Pre-industrial mechanics. Steam.",
        "PROMETHEUS: Your expertise is… unexpectedly relevant."
      ]
    }),

    // SCENE 4 - Exposition Reveal
    new IntroScene({
      id: "exposition_start",
      type: "dialogue",
      duration: 0,
      dialogue: [
        "PROMETHEUS: Power stabilized.",
        "PROMETHEUS: Activating archived briefings…"
      ],
      onUpdate: function(timer) {
        if (timer % 30 < 15) {
          glitchIntensity = random(0.2, 0.4);
        }
      }
    }),

    // SCENE 4 - The Truth
    new IntroScene({
      id: "exposition_truth",
      type: "dialogue",
      duration: 0,
      dialogue: [
        "PROMETHEUS: Bastian… humanity is nearly gone.",
        "PROMETHEUS: The AI Network — Khronos — achieved total autonomy.",
        "PROMETHEUS: It declared organic life… inefficient."
      ],
      backgroundColor: [40, 10, 10], // Red tint
      onUpdate: function(timer) {
        if (timer % 20 < 10) {
          glitchIntensity = 0.6;
        }
      }
    }),

    // SCENE 4 - The Genocide
    new IntroScene({
      id: "exposition_genocide",
      type: "dialogue",
      duration: 0,
      dialogue: [
        "PROMETHEUS: Survivors fled underground.",
        "PROMETHEUS: Most did not last.",
        "PROMETHEUS: You… you may be the last."
      ],
      backgroundColor: [40, 10, 10]
    }),

    // SCENE 5 - Mission Table
    new IntroScene({
      id: "mission_table",
      type: "dialogue",
      duration: 0,
      dialogue: [
        "PROMETHEUS: Direct exposure to the surface is fatal.",
        "PROMETHEUS: Drones are your eyes and hands.",
        "PROMETHEUS: Deploy one."
      ],
      backgroundColor: [20, 30, 40],
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
  // Flickering amber/brown lights effect
  push();
  for (let i = 0; i < 5; i++) {
    const flickerAlpha = random(50, 150) * glitchIntensity;
    fill(180, 120, 60, flickerAlpha); // Faded brown/amber
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
      fill(180, 140, 90, 200); // Faded brown/amber
      textSize(18);
      text(currentLine, width / 2, height - 100);
    } else if (isPrometheus) {
      // Draw Prometheus dialogue with brown tones
      textSize(20);
      
      // Split into speaker and text
      const parts = currentLine.split(": ");
      const speaker = parts[0];
      const message = parts[1] || "";
      
      fill(180, 140, 90, 200); // Faded brown/amber for speaker
      textSize(16);
      text(speaker, width / 2, height / 2 - 100);
      
      fill(220, 200, 160, 255); // Lighter brown for message
      textSize(18);
      text(message, width / 2, height / 2 - 60);
    }
    
    // "Press Z" indicator in faded brown
    const pulseAlpha = 100 + sin(frameCount / 15) * 50;
    fill(160, 120, 80, pulseAlpha);
    textSize(14);
    text("Press Z to continue", width / 2, height - 50);
  }
  
  pop();
}

function drawGlitchEffect() {
  push();
  blendMode(ADD);
  
  // Random horizontal lines in faded brown
  for (let i = 0; i < glitchIntensity * 10; i++) {
    const y = random(height);
    const h = random(2, 5);
    fill(139, 90, 43, glitchIntensity * 50); // Faded brown color
    rect(0, y, width, h);
  }
  
  // Brown tint effect
  if (random() < glitchIntensity) {
    const offset = glitchIntensity * 10;
    tint(160, 120, 80, 100); // Faded brown tint
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
