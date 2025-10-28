
class NPC {
  constructor(x, y, name, message) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.message = message;
  }

  update() {
    const distToPlayer = distance(this.x, this.y, pX + 600, pY + 340);
    if (distToPlayer < 120 && keyPressedOnce(69)) {
      // Check if there's already a dialogue message active
      const hasActiveDialogue = messages.some(msg => msg.type === "dialogue");
      if (!hasActiveDialogue) {
        messages.push(new Message("dialogue", this.message));
      }
    }
  }

}

let nearestNPC = null; // Store for screen-fixed rendering
let npcPromptAlpha = 0; // Fade animation

function drawNPCs() {
  nearestNPC = null;
  let nearestDistance = Infinity;
  
  for (let i = 0; i < NonPlayerCharacters.length; i++) {
    NonPlayerCharacters[i].update();
    fill(255, 255, 0);
    rect(NonPlayerCharacters[i].x, NonPlayerCharacters[i].y, 20, 20);
    
    // Check if this is the nearest interactable NPC
    const distToPlayer = distance(NonPlayerCharacters[i].x, NonPlayerCharacters[i].y, pX + 600, pY + 340);
    if (distToPlayer < 120 && distToPlayer < nearestDistance) {
      nearestDistance = distToPlayer;
      nearestNPC = NonPlayerCharacters[i];
    }
    
    // Close dialogue if player walks away from all NPCs
    const hasActiveDialogue = messages.some(msg => msg.type === "dialogue");
    if (hasActiveDialogue) {
      let nearAnyNPC = false;
      for (let j = 0; j < NonPlayerCharacters.length; j++) {
        const dist = distance(NonPlayerCharacters[j].x, NonPlayerCharacters[j].y, pX + 600, pY + 340);
        if (dist < 120) {
          nearAnyNPC = true;
          break;
        }
      }
      if (!nearAnyNPC) {
        // Remove all dialogue messages
        for (let k = messages.length - 1; k >= 0; k--) {
          if (messages[k].type === "dialogue") {
            messages.splice(k, 1);
          }
        }
      }
    }
  }
}

function drawNPCPromptIfNeeded() {
  // Fade in/out based on whether NPC is near
  if (nearestNPC) {
    npcPromptAlpha = lerp(npcPromptAlpha, 255, 0.2);
  } else {
    npcPromptAlpha = lerp(npcPromptAlpha, 0, 0.2);
  }
  
  if (npcPromptAlpha > 5 && nearestNPC) {
    push();
    fill(100, 255, 255, npcPromptAlpha * 0.78);
    textSize(20);
    textFont(Silkscreen);
    textAlign(CENTER, CENTER);
    
    const promptText = "Press E to talk to " + nearestNPC.name;
    
    // Background for text
    const promptWidth = textWidth(promptText);
    fill(0, 0, 0, npcPromptAlpha * 0.6);
    rect(600 - promptWidth / 2 - 10, 30, promptWidth + 20, 35, 5);
    
    // Text
    fill(100, 255, 255, npcPromptAlpha);
    text(promptText, 600, 47);
    
    pop();
  }
}
