
class NPC {
  constructor(x, y, message) {
    this.x = x;
    this.y = y;
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
  for (let i = 0; i < NonPlayerCharacters.length; i++) {
    NonPlayerCharacters[i].update();
    fill(255, 255, 0);
    rect(NonPlayerCharacters[i].x, NonPlayerCharacters[i].y, 20, 20);
  }
}
