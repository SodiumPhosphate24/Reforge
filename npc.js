class NPC {
  constructor(x, y, name, message, image = null, triggerID, scale = 1) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.message = message;
    this.image = image;
    this.scale = scale;
    this.baseWidth = 35;
    this.width = this.baseWidth * this.scale;
    this.id = triggerID;

    // Calculate height based on image aspect ratio
    if (this.image) {
      const aspectRatio = this.image.height / this.image.width;
      this.height = this.width * aspectRatio;
    } else {
      this.height = 25 * this.scale; // Default square for NPCs without images
    }
  }

  update() {
    const distToPlayer = distance(this.x, this.y, pX + 600, pY + 340);
    if (distToPlayer < 120 && keyPressedOnce(69)) {
      // Check if there's already a dialogue message active
      const hasActiveDialogue = messages.some(msg => msg.type === "dialogue");
      if (!hasActiveDialogue) {
        // Special handling for Lock NPC
        if (this.id === "Lock") {
          lockCodeActive = true;
          lockCodeInput = "";
        }
        messages.push(new Message("dialogue", this.message, this.id));
      }
    }
  }

}

let nearestNPC = null; // Store for screen-fixed rendering
let interactionPrompt = null; // Reusable prompt object

function drawNPCs() {
  if (!interactionPrompt) interactionPrompt = createPrompt();
  
  nearestNPC = null;
  let nearestDistance = Infinity;

  for (let i = 0; i < NonPlayerCharacters.length; i++) {
    NonPlayerCharacters[i].update();

    // Draw NPC image if available, otherwise draw yellow rectangle
    if (NonPlayerCharacters[i].image) {
      image(NonPlayerCharacters[i].image,
            NonPlayerCharacters[i].x,
            NonPlayerCharacters[i].y,
            NonPlayerCharacters[i].width,
            NonPlayerCharacters[i].height);
    } else {
      fill(255, 255, 0);
      rect(NonPlayerCharacters[i].x, NonPlayerCharacters[i].y, 20, 20);
    }

    // Check if this is the nearest interactable NPC
    const distToPlayer = distance(NonPlayerCharacters[i].x, NonPlayerCharacters[i].y, pX + 600, pY + 340);
    if (distToPlayer < 120 && distToPlayer < nearestDistance) {
      nearestDistance = distToPlayer;
      nearestNPC = NonPlayerCharacters[i];
    }
  }
}

function drawNPCPromptIfNeeded() {
  if (nearestNPC && !craftingMenuOpen) {
    handleInteractionPrompt(
      interactionPrompt, 
      nearestNPC.x, 
      nearestNPC.y, 
      120, 
      `Press E to talk to ${nearestNPC.name}`,
      !messages.some(msg => msg.type === "dialogue")
    );
  } else if (interactionPrompt) {
    interactionPrompt.update(false);
    interactionPrompt.draw("");
  }
}
        const dist = distance(NonPlayerCharacters[j].x, NonPlayerCharacters[j].y, pX + 600, pY + 340);
        if (dist < 120) {
          nearAnyNPC = true;
          break;
        }
      }
      if (!nearAnyNPC) {
        // Only close NPC-initiated dialogue, not trigger-based dialogue
        for (let k = messages.length - 1; k >= 0; k--) {
          if (messages[k].type === "dialogue" && !messages[k].isTriggered) {
            messages[k].closing = true;
          }
        }
      }
    }
  }
}

function drawNPCPromptIfNeeded() {
  // Fade in/out and scale based on whether NPC is near
  if (nearestNPC) {
    npcPromptAlpha = lerp(npcPromptAlpha, 255, 0.2);
    npcPromptScale = lerp(npcPromptScale, 1, 0.2);
    npcPromptGrowScale = lerp(npcPromptGrowScale, 1, 0.15);
  } else {
    npcPromptAlpha = lerp(npcPromptAlpha, 0, 0.15);
    npcPromptScale = lerp(npcPromptScale, 0, 0.15);
    npcPromptGrowScale = lerp(npcPromptGrowScale, 0.5, 0.15);
  }

  if (npcPromptAlpha > 5) {
    push();
    translate(600, 47);
    scale(npcPromptScale * npcPromptGrowScale);
    translate(-600, -47);

    fill(255, 150, 0, npcPromptAlpha * 0.78);
    textSize(20);
    textFont(Silkscreen);
    textAlign(CENTER, CENTER);

    let promptText = "";
    if (nearestNPC) {
      const nameLower = nearestNPC.name.toLowerCase();
      const isReadable = nameLower.includes("book") || nameLower.includes("journal") || nameLower.includes("sign");
      const isLock = nameLower.includes("lock");
      
      if (isReadable) {
        promptText = "Press E to read " + nearestNPC.name;
      } else if (isLock) {
        promptText = "Press E to Open " + nearestNPC.name;
      } else {
        promptText = "Press E to talk to " + nearestNPC.name;
      }
    }

    // Background for text
    const promptWidth = textWidth(promptText);
    fill(0, 0, 0, npcPromptAlpha * 0.6);
    rect(600 - promptWidth / 2 - 10, 30, promptWidth + 20, 35, 5);

    // Text
    fill(255, 150, 0, npcPromptAlpha);
    text(promptText, 600, 47);

    pop();
  }
}