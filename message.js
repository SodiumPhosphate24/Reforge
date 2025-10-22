class Message {
  constructor(type, message) {
    this.message = message;
    if (type == "quest") {
      this.x = 600;
      this.y = -100; // Start above screen
      this.targetY = 150; // Final resting position
      this.type = type;
      this.scale = 0.3; // Start small
      this.targetScale = 1; // Grow to normal size
      this.alpha = 255; // Start fully visible
      this.lifespan = 300; // Total frames to live
      this.phase = "slide"; // "slide", "display", "fade"
      this.phaseTimer = 0;
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
      messages[i].phaseTimer++;
      
      // Phase 1: Slide down and grow (0-40 frames)
      if (messages[i].phase === "slide") {
        // Smooth slide down
        messages[i].y = lerp(messages[i].y, messages[i].targetY, 0.12);
        
        // Eased scale up (ease-in-out using sine)
        // Progress from 0 to 1 over 40 frames
        const progress = min(messages[i].phaseTimer / 40, 1);
        // Apply ease-in-out: slow start, fast middle, slow end
        const easedProgress = (1 - cos(progress * PI)) / 2;
        messages[i].scale = 0.3 + (messages[i].targetScale - 0.3) * easedProgress;
        
        // Transition to display phase after settling
        if (messages[i].phaseTimer > 40 && abs(messages[i].y - messages[i].targetY) < 2) {
          messages[i].phase = "display";
          messages[i].phaseTimer = 0;
        }
      }
      
      // Phase 2: Display (hold for 120 frames)
      else if (messages[i].phase === "display") {
        if (messages[i].phaseTimer > 120) {
          messages[i].phase = "fade";
          messages[i].phaseTimer = 0;
        }
      }
      
      // Phase 3: Fade out (60 frames)
      else if (messages[i].phase === "fade") {
        // Gradual fade out
        messages[i].alpha = lerp(messages[i].alpha, 0, 0.05);
        
        // Remove when fully transparent
        if (messages[i].alpha < 5) {
          messages.splice(i, 1);
          i--;
          continue;
        }
      }

      // Draw the message
      push();
      translate(messages[i].x, messages[i].y);
      scale(messages[i].scale);

      // Subtle glow effect
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = 'rgba(100, 255, 255, 0.6)';

      fill(100, 255, 255, messages[i].alpha);
      textSize(50);
      textFont(Silkscreen);
      text(messages[i].message, 0, 0);

      // Reset shadow
      drawingContext.shadowBlur = 0;
      pop();
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