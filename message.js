// Wraps multiline text
function wrapText(text, maxChars) {
  if (!text || text.length <= maxChars) {
    return [text];
  }
  
  var words = text.split(' ');
  var lines = [];
  var currentLine = '';
  
  for (var i = 0; i < words.length; i++) {
    var testLine = currentLine + (currentLine ? ' ' : '') + words[i];
    
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      // If a word is too long, split it
      if (currentLine === '') {
        lines.push(words[i].substring(0, maxChars));
        words[i] = words[i].substring(maxChars);
        i--;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [text];
}

class Message {
  constructor(type, message, triggerID = "none", isTriggered = false) {
    this.message = message;
    this.id = triggerID;
    this.isTriggered = isTriggered;
    if (type == "quest") {
      this.x = 600;
      this.y = -100;
      this.targetY = 150;
      this.type = type;
      this.scale = 0.3;
      this.targetScale = 2.0; 
      this.alpha = 255;
      this.phase = "animate"; 
      this.phaseTimer = 0;
    }
    else if (type == "dialogue") {
      this.index = 0;
      this.x = 600;
      this.y = 500;
      this.type = type;
      this.alpha = 0;
      this.slideY = 100; 
      this.boxScale = 0; 
      this.closing = false; 
    }
  }
}

// Draws all messages
function messageDisplay() {
  textAlign(CENTER, CENTER);
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].type == "quest") {
      messages[i].phaseTimer++;

      if (messages[i].phase === "animate") {
        const totalFrames = 70;
        const progress = min(messages[i].phaseTimer / totalFrames, 1);

        messages[i].y = lerp(messages[i].y, messages[i].targetY, 0.12);

        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - pow(-2 * progress + 2, 3) / 2;

        messages[i].scale = 0.3 + (messages[i].targetScale - 0.3) * eased;

        if (messages[i].phaseTimer >= totalFrames) {
          messages[i].phase = "display";
          messages[i].phaseTimer = 0;
          messages[i].scale = messages[i].targetScale;
        }
      }

      else if (messages[i].phase === "display") {
        if (messages[i].phaseTimer > 120) {
          messages[i].phase = "fade";
          messages[i].phaseTimer = 0;
        }
      }

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

      // Glow effect
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = 'rgba(255, 150, 0, 0.6)';

      fill(255, 150, 0, messages[i].alpha);
      textSize(50);
      textFont(Silkscreen);
      text(messages[i].message, 0, 0);
      
      drawingContext.shadowBlur = 0;
      pop();
    }
    else if (messages[i].type == "dialogue") {
      // Bounds check
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
      
      // Handle lock code
      if (messages[i].id === "Lock" && lockCodeActive) {
        const codeDisplay = lockCodeInput.padEnd(4, "_");
        displayMessage = "Enter Code: " + codeDisplay;
      }
      
      var maxCharsPerLine = 65;
      var wrappedLines = wrapText(displayMessage, maxCharsPerLine);

      if (!messages[i].closing && messages[i].alpha < 255) {
        messages[i].alpha = lerp(messages[i].alpha, 255, 0.1);
      }

      if (!messages[i].closing && messages[i].slideY > 0) {
        messages[i].slideY = lerp(messages[i].slideY, 0, 0.15);
      }

      if (!messages[i].closing && messages[i].boxScale < 1) {
        messages[i].boxScale = lerp(messages[i].boxScale, 1, 0.2);
      }

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
      
      var boxHeight = 200;

      fill(0, 0, 0, messages[i].alpha * 0.3);
      rect(messages[i].x + 5, messages[i].y + 5, 1000 * messages[i].boxScale, boxHeight * messages[i].boxScale, 5);

      // Message box
      fill(0, 0, 0, messages[i].alpha * 0.78);
      rect(messages[i].x, messages[i].y, 1000 * messages[i].boxScale, boxHeight * messages[i].boxScale, 5);

      // Accent border
      strokeWeight(3);
      stroke(255, 150, 0, messages[i].alpha * 0.8);
      noFill();
      rect(messages[i].x, messages[i].y, 1000 * messages[i].boxScale, boxHeight * messages[i].boxScale, 5);
      noStroke();

      // Text
      fill(255, 150, 0, messages[i].alpha);
      textFont(Silkscreen);
      textSize(20);
      text(person, messages[i].x, messages[i].y - 75);

      textSize(18);
      var lineHeight = 30;
      var startY = messages[i].y - 40;
      
      // Force white text for ending dialogue to be visible on black
      if (messages[i].id === "Ending") {
        fill(255);
      } else {
        fill(255, 255, 255, messages[i].alpha);
      }
      
      for (var lineIdx = 0; lineIdx < wrappedLines.length; lineIdx++) {
        text(wrappedLines[lineIdx], messages[i].x, startY + (lineIdx * lineHeight));
      }

      // "Press Z" or code input instructions
      const pulseAlpha = 180 + sin(frameCount / 15) * 75;
      fill(200, 200, 200, messages[i].alpha * (pulseAlpha / 255));
      textSize(14);
      
      if (messages[i].id === "Lock" && lockCodeActive) {
        text("Enter 4-digit code (Backspace to delete, Enter to submit)", messages[i].x, messages[i].y + 80);
      } else {
        text("Press Z", messages[i].x + 420, messages[i].y + 80);
      }

      rectMode(CORNER);
      pop();

      if (!messages[i].closing && keyPressedOnce(90)) {
        if (messages[i].id === "Lock" && lockCodeActive) {
          return;
        }
        messages[i].index++;
        if (messages[i].index >= messages[i].message.length) {
          messages[i].closing = true;
          handleTriggers(messages[i].id);
          
          if (messages[i].id === "Lock") {
            lockCodeActive = false;
            lockCodeInput = "";
          }
        } else {
          messages[i].slideY = 30;
          messages[i].alpha = 0;
        }
      }
    }
  }
}