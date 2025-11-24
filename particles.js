
// Particle system
let particles = [];

class Particle {
  constructor(x, y, color, duration, speed, layer = 0) {
    this.x = x;
    this.y = y;
    this.layer = layer; // Which layer to render on (0-4)
    this.color = color; // [R, G, B]
    this.duration = duration; // frames
    this.maxDuration = duration;
    this.speed = speed;
    
    // Random direction for burst effect
    this.angle = random(0, TWO_PI);
    this.vx = cos(this.angle) * speed;
    this.vy = sin(this.angle) * speed;
    
    // Random size variation
    this.size = random(3, 8);
    
    // Fade out effect
    this.alpha = 255;
  }
  
  update() {
    // Move particle
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply friction/slowdown
    this.vx *= 0.95;
    this.vy *= 0.95;
    
    // Decrease duration and fade out
    this.duration--;
    this.alpha = map(this.duration, 0, this.maxDuration, 0, 255);
  }
  
  draw() {
    push();
    fill(this.color[0], this.color[1], this.color[2], this.alpha);
    noStroke();
    rect(this.x, this.y, this.size, this.size);
    pop();
  }
  
  isDead() {
    return this.duration <= 0;
  }
}

// Main particle burst function
function particle(x, y, color, duration, speed, layer = 0) {
  // Create 10-15 particles per burst
  const particleCount = Math.floor(random(10, 15));
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(x, y, color, duration, speed, layer));
  }
}


