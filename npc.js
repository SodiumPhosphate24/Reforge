
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
      messages.push(new Message("dialogue", this.message));
    }
  }

}

function drawNPCs() {
  let nearestNPC = null;
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
  }
  
  // Draw prompt for nearest NPC (after camera pop, so screen-fixed)
  if (nearestNPC) {
    push();
    fill(100, 255, 255, 200);
    textSize(20);
    textFont(Silkscreen);
    textAlign(CENTER, CENTER);
    
    const promptText = "Press E to talk to " + nearestNPC.name;
    
    // Background for text
    const promptWidth = textWidth(promptText);
    fill(0, 0, 0, 150);
    rect(600 - promptWidth / 2 - 10, 30, promptWidth + 20, 35, 5);
    
    // Text
    fill(100, 255, 255, 200);
    text(promptText, 600, 47);
    
    pop();
  }
}
