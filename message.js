class Message {
  constructor(type, message, triggerID) {
    this.message = message;
    this.id = triggerID;
    if (type == "quest") {
      this.x = 600;
      this.y = -100; // Start above screen
      this.targetY = 150; // Final resting position
      this.type = type;
      this.scale = 0.3; // Start small
      this.targetScale = 2.0; // Final size
      this.alpha = 255; // Start fully visible
      this.phase = "animate"; // "animate", "display", "fade"
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
      this.closing = false; // New property to manage closing animation
    }
  }
}

function messageDisplay() {
  textAlign(CENTER, CENTER);
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].type == "quest") {
      messages[i].phaseTimer++;

      // Phase 1: Simultaneous slide and smooth grow (0-70 frames)
      if (messages[i].phase === "animate") {
        const totalFrames = 70;
        const progress = min(messages[i].phaseTimer / totalFrames, 1);

        // Smooth slide down throughout animation
        messages[i].y = lerp(messages[i].y, messages[i].targetY, 0.12);

        // Smooth ease-in-out growth (slow -> fast -> slow)
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - pow(-2 * progress + 2, 3) / 2;

        messages[i].scale = 0.3 + (messages[i].targetScale - 0.3) * eased;

        // Transition to display phase
        if (messages[i].phaseTimer >= totalFrames) {
          messages[i].phase = "display";
          messages[i].phaseTimer = 0;
          messages[i].scale = messages[i].targetScale;
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
        messages[i].alpha = lerp(messages[i].alpha, 0, 0.05);

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
      // Bounds check to prevent crash when closing
      if (!messages[i].message || messages[i].message.length === 0) {
        messages.splice(i, 1);
        i--;
        continue;
      }
      
      if (messages[i].index >= messages[i].message.length) {
        messages[i].index = messages[i].message.length - 1;
      }
      
      // Additional safety check
      if (!messages[i].message[messages[i].index]) {
        messages[i].index = 0;
      }
      
      var displayMessage = messages[i].message[messages[i].index].split(": ")[1];
      var person = messages[i].message[messages[i].index].split(": ")[0];

      // Animate alpha (fade in)
      if (!messages[i].closing && messages[i].alpha < 255) {
        messages[i].alpha = lerp(messages[i].alpha, 255, 0.1);
      }

      // Animate slide up
      if (!messages[i].closing && messages[i].slideY > 0) {
        messages[i].slideY = lerp(messages[i].slideY, 0, 0.15);
      }

      // Animate box scale
      if (!messages[i].closing && messages[i].boxScale < 1) {
        messages[i].boxScale = lerp(messages[i].boxScale, 1, 0.2);
      }

      // Handle closing animation
      if (messages[i].closing) {
        messages[i].alpha = lerp(messages[i].alpha, 0, 0.15);
        messages[i].slideY = lerp(messages[i].slideY, 100, 0.15);
        messages[i].boxScale = lerp(messages[i].boxScale, 0, 0.2);

        if (messages[i].alpha < 5) {
          messages.splice(i, 1);
          i--;
          continue;
        }
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

      // "Press Z" indicator at bottom right with pulsing animation
      const pulseAlpha = 100 + sin(frameCount / 15) * 50;
      fill(150, 150, 150, messages[i].alpha * (pulseAlpha / 255));
      textSize(14);
      text("Press Z", messages[i].x + 420, messages[i].y + 80);

      rectMode(CORNER);
      pop();

      if (!messages[i].closing && keyPressedOnce(90)) {
        messages[i].index++;
        if (messages[i].index >= messages[i].message.length) {
          // Trigger closing animation
          messages[i].closing = true;
          handleTriggers(messages[i].id);
        } else {
          // Reset animations for next message
          messages[i].slideY = 30;
          messages[i].alpha = 0;
        }
      }
    }
  }
}