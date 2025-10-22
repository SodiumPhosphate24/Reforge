class Message {
  constructor(type, message) {
    this.message = message;
    if (type == "quest") {
      this.x = 600;
      this.y = -100; // Start above screen
      this.targetY = 150; // Final resting position
      this.type = type;
      this.scale = 0.3; // Start small
      this.targetScale = 2.0; // Grow to larger size
      this.alpha = 255; // Start fully visible
      this.phase = "slide"; // "slide", "grow", "display", "fade"
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
      
      // Phase 1: Slide down smoothly (0-30 frames)
      if (messages[i].phase === "slide") {
        messages[i].y = lerp(messages[i].y, messages[i].targetY, 0.15);
        
        // Transition to grow phase when close to target
        if (messages[i].phaseTimer > 25 && abs(messages[i].y - messages[i].targetY) < 3) {
          messages[i].phase = "grow";
          messages[i].phaseTimer = 0;
        }
      }
      
      // Phase 2: Grow with ease in-out and two-stage recoil (0-80 frames)
      else if (messages[i].phase === "grow") {
        const totalGrowFrames = 80;
        const progress = min(messages[i].phaseTimer / totalGrowFrames, 1);
        
        let scaleProgress;
        
        if (progress < 0.7) {
          // First 70%: Ease in-out growth (slow -> fast -> slow)
          const t = progress / 0.7;
          // Cubic ease in-out
          scaleProgress = t < 0.5
            ? 4 * t * t * t
            : 1 - pow(-2 * t + 2, 3) / 2;
          scaleProgress *= 0.7; // Map to 0-0.7
        } else if (progress < 0.85) {
          // Next 15%: Overshoot (0.7 to 0.85)
          const t = (progress - 0.7) / 0.15;
          // Overshoot to 1.12
          scaleProgress = 0.7 + (0.42 + 0.12) * t;
        } else {
          // Final 15%: Undershoot then settle (0.85 to 1.0)
          const t = (progress - 0.85) / 0.15;
          if (t < 0.5) {
            // First half: drop to undershoot (1.12 to 0.94)
            const t2 = t / 0.5;
            scaleProgress = 1.12 - 0.18 * t2;
          } else {
            // Second half: settle to 1.0 (0.94 to 1.0)
            const t2 = (t - 0.5) / 0.5;
            scaleProgress = 0.94 + 0.06 * t2;
          }
        }
        
        messages[i].scale = 0.3 + (messages[i].targetScale - 0.3) * scaleProgress;
        
        // Transition to display phase
        if (messages[i].phaseTimer >= totalGrowFrames) {
          messages[i].phase = "display";
          messages[i].phaseTimer = 0;
          messages[i].scale = messages[i].targetScale; // Ensure final scale
        }
      }
      
      // Phase 3: Display (hold for 120 frames)
      else if (messages[i].phase === "display") {
        if (messages[i].phaseTimer > 120) {
          messages[i].phase = "fade";
          messages[i].phaseTimer = 0;
        }
      }
      
      // Phase 4: Fade out (60 frames)
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