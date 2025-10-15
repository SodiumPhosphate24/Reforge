
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
      this.bounceOffset = 0; // Bounce animation
      this.spawnedParticles = false; // Track if particles spawned
      this.impactGlow = 0; // Bright flash when landing
      this.hasLanded = false; // Track if animation has landed
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
      // Sharp scale-in animation with overshoot
      if (messages[i].scale < 1) {
        messages[i].scale = lerp(messages[i].scale, 1.3, 0.3);
        if (messages[i].scale > 1.25) {
          messages[i].scale = 1;
          messages[i].hasLanded = true;
          messages[i].impactGlow = 255; // Bright flash on landing
        }
      }
      
      // Bounce effect when appearing
      if (messages[i].vel > 10) {
        messages[i].bounceOffset = abs(sin(frameCount * 0.3)) * 15;
      } else if (messages[i].vel > 0) {
        messages[i].bounceOffset = abs(sin(frameCount * 0.3)) * 8;
      } else {
        messages[i].bounceOffset = 0;
      }
      
      // Spawn particle burst on first appearance
      if (!messages[i].spawnedParticles && messages[i].scale > 0.5) {
        particle(messages[i].x, messages[i].y, [100, 255, 255], 60, 5);
        particle(messages[i].x, messages[i].y, [255, 255, 255], 50, 4);
        messages[i].spawnedParticles = true;
      }
      
      // Fade the impact glow from bright to soft
      if (messages[i].impactGlow > 0) {
        messages[i].impactGlow = lerp(messages[i].impactGlow, 0, 0.08);
      }
      
      push();
      translate(messages[i].x, messages[i].y - messages[i].bounceOffset);
      scale(messages[i].scale);
      
      // Calculate glow intensity: bright impact fades to soft glow
      const baseGlow = messages[i].lifespan / 300;
      const glowIntensity = baseGlow * 0.5 + (messages[i].impactGlow / 255) * 0.8;
      
      // Sharp bright flash on impact
      if (messages[i].impactGlow > 200) {
        drawingContext.shadowBlur = 50;
        drawingContext.shadowColor = 'rgba(255, 255, 255, ' + (messages[i].impactGlow / 255) + ')';
        fill(255, 255, 255, messages[i].impactGlow);
        textSize(64);
        textFont(Silkscreen);
        text(messages[i].message, 0, 0);
      }
      
      // Enhanced glow effect
      drawingContext.shadowBlur = 30 + messages[i].impactGlow * 0.2;
      drawingContext.shadowColor = 'rgba(100, 255, 255, ' + glowIntensity + ')';
      
      // Outer glow
      fill(100, 255, 255, messages[i].lifespan * 0.3 + messages[i].impactGlow * 0.5);
      textSize(64);
      textFont(Silkscreen);
      text(messages[i].message, 0, 0);
      
      // Main text with impact brightness
      drawingContext.shadowBlur = 15 + messages[i].impactGlow * 0.15;
      fill(100, 255, 255, messages[i].lifespan + messages[i].impactGlow * 0.3);
      textSize(60);
      text(messages[i].message, 0, 0);
      
      // Bright inner highlight (stronger during impact)
      fill(255, 255, 255, messages[i].lifespan * 0.6 + messages[i].impactGlow * 0.4);
      textSize(60);
      text(messages[i].message, 0, -2);
      
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
