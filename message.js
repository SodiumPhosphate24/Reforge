
class Message {
  constructor(type, message) {
    this.message = message;
    if (type == "quest") {
      this.x = 600;
      this.y = -200;
      this.vel = 25;
      this.lifespan = 300;
      this.type = type;
      this.scale = 0; // Start small for scale animation
      this.shake = 0; // For shake effect
    }
    else if (type == "dialogue") {
      this.index = 0;
      this.x = 600;
      this.y = 500;
      this.type = type;
      this.alpha = 0; // Fade in effect
      this.slideY = 100; // Slide up animation
      this.boxScale = 0; // Box scale animation
    }
  }
}

function messageDisplay() {
  textAlign(CENTER, CENTER);
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].type == "quest") {
      // Animate scale in
      if (messages[i].scale < 1) {
        messages[i].scale = lerp(messages[i].scale, 1, 0.15);
      }
      
      // Epic shake effect when appearing
      if (messages[i].vel > 15) {
        messages[i].shake = sin(frameCount * 0.5) * 8;
      } else if (messages[i].vel > 5) {
        messages[i].shake = sin(frameCount * 0.5) * 4;
      } else {
        messages[i].shake = sin(frameCount * 0.3) * 2;
      }
      
      push();
      translate(messages[i].x + messages[i].shake, messages[i].y);
      scale(messages[i].scale);
      
      // Glow effect
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = 'rgba(100, 255, 255, ' + (messages[i].lifespan / 300) + ')';
      
      fill(100, 255, 255, messages[i].lifespan);
      textSize(60);
      textFont(Silkscreen);
      text(messages[i].message, 0, 0);
      
      // Reset shadow
      drawingContext.shadowBlur = 0;
      pop();
      
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
    else if (messages[i].type == "dialogue") {
      var displayMessage = messages[i].message[messages[i].index].split(": ")[1];
      var person = messages[i].message[messages[i].index].split(": ")[0];
      
      // Animate alpha (fade in)
      if (messages[i].alpha < 255) {
        messages[i].alpha = lerp(messages[i].alpha, 255, 0.1);
      }
      
      // Animate slide up
      if (messages[i].slideY > 0) {
        messages[i].slideY = lerp(messages[i].slideY, 0, 0.15);
      }
      
      // Animate box scale
      if (messages[i].boxScale < 1) {
        messages[i].boxScale = lerp(messages[i].boxScale, 1, 0.2);
      }
      
      push();
      translate(0, messages[i].slideY);
      
      rectMode(CENTER);
      
      // Draw shadow for depth
      fill(0, 0, 0, messages[i].alpha * 0.3);
      rect(messages[i].x + 5, messages[i].y + 5, 1000 * messages[i].boxScale, 200 * messages[i].boxScale, 5);
      
      // Draw main box with scale animation
      fill(0, 0, 0, messages[i].alpha * 0.78);
      rect(messages[i].x, messages[i].y, 1000 * messages[i].boxScale, 200 * messages[i].boxScale, 5);
      
      // Draw accent border
      strokeWeight(3);
      stroke(100, 255, 255, messages[i].alpha * 0.8);
      noFill();
      rect(messages[i].x, messages[i].y, 1000 * messages[i].boxScale, 200 * messages[i].boxScale, 5);
      noStroke();
      
      // Text with fade in
      fill(100, 255, 255, messages[i].alpha);
      textFont(Silkscreen);
      textSize(20);
      text(person, messages[i].x, messages[i].y - 75);
      
      fill(255, 255, 255, messages[i].alpha);
      text(displayMessage, messages[i].x, messages[i].y);
      
      rectMode(CORNER);
      pop();
      
      if (keyPressedOnce(90)) {
        messages[i].index++;
        if (messages[i].index >= messages[i].message.length) {
          messages.splice(i, 1);
          i--;
        } else {
          // Reset animations for next message
          messages[i].slideY = 30;
          messages[i].alpha = 0;
        }
      }
    }
  }
}
