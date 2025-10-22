class Message {
  constructor(type, message) {
    this.message = message;
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
    }
  }
}

function messageDisplay() {
  textAlign(CENTER, CENTER);
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].type == "quest") {
      messages[i].phaseTimer++;
      
      // Phase 1: Simultaneous slide and grow with three-stage recoil (0-90 frames)
      if (messages[i].phase === "animate") {
        const totalFrames = 90;
        const progress = min(messages[i].phaseTimer / totalFrames, 1);
        
        // Smooth slide down throughout animation
        messages[i].y = lerp(messages[i].y, messages[i].targetY, 0.12);
        
        // Three-stage growth: grow to overshoot -> shrink to undershoot -> settle to final
        let scaleProgress;
        
        if (progress < 0.5) {
          // Stage 1 (0-0.5): Grow to overshoot (exceeds final size)
          const t = progress / 0.5;
          // Ease in-out to 1.15 (15% overshoot)
          const eased = t < 0.5
            ? 4 * t * t * t
            : 1 - pow(-2 * t + 2, 3) / 2;
          scaleProgress = eased * 1.15;
        } else if (progress < 0.75) {
          // Stage 2 (0.5-0.75): Shrink to undershoot (smaller than final)
          const t = (progress - 0.5) / 0.25;
          // Smooth transition from 1.15 to 0.90 (10% undershoot)
          const eased = t < 0.5
            ? 4 * t * t * t
            : 1 - pow(-2 * t + 2, 3) / 2;
          scaleProgress = 1.15 - (0.25 * eased);
        } else {
          // Stage 3 (0.75-1.0): Grow to final size (1.0)
          const t = (progress - 0.75) / 0.25;
          // Smooth ease to final
          const eased = t < 0.5
            ? 4 * t * t * t
            : 1 - pow(-2 * t + 2, 3) / 2;
          scaleProgress = 0.90 + (0.10 * eased);
        }
        
        messages[i].scale = 0.3 + (messages[i].targetScale - 0.3) * scaleProgress;
        
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