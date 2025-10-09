class Message {
  constructor(type, message) {
    this.message = message;
    if (type == "quest") {
      this.x = 600;
      this.y = -200;
      this.vel = 25;
      this.lifespan = 300;
    }
    else if (type == "dialogue") {
      this.index = 0;
      this.x = 600;
      this.y = 500;
    }
  }
}

function messageDisplay() {
  textAlign(CENTER, CENTER);

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].type == "quest") {
      fill(100, 255, 255, messages[i].lifespan);
      textSize(60);
      textFont(Silkscreen);
      text(messages[i].message, messages[i].x, messages[i].y);
      messages[i].lifespan -= 2;
      if (messages[i].vel > 0) {
        messages[i].y += messages[i].vel;
        messages[i].vel -= 1;
      }
      if (messages[i].lifespan <= 0) {
        messages.splice(i, 1);
        i--;
      }
    }
    if (messages[i].type == "dialogue") {
      console.log("cheeseburger is big cool");
      rectMode(CENTER);
      fill(0, 0, 0, 200);
      rect(messages[i].x, messages[i].y, 1000, 200);
      fill(255);
      textFont(Silkscreen);
      textSize(20);
      text(messages[i].message[messages[i].index], messages[i].x, messages[i].y)
      rectMode(CORNER);
    }
  }
}