
// Particle system
let particles = [];

class Particle {
  constructor(x, y, color, duration, speed) {
    this.x = x;
    this.y = y;
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
function particle(x, y, color, duration, speed) {
  // Create 10-15 particles per burst
  const particleCount = Math.floor(random(10, 15));
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(x, y, color, duration, speed));
  }
}

// Update and draw all particles
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}
