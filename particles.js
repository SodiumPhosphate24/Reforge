let particles = [];

class Particle {
  constructor(x, y, color, duration, speed, layer = 0) {
    this.x = x;
    this.y = y;
    this.color = color; // [R, G, B]
    this.duration = duration;
    this.maxDuration = duration;
    this.speed = speed;
    this.layer = layer; 
    
    // Direction for burst
    this.angle = random(0, TWO_PI);
    this.vx = cos(this.angle) * speed;
    this.vy = sin(this.angle) * speed;
    
    this.size = random(3, 8);
    
    // Fade
    this.alpha = 255;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    this.vx *= 0.95;
    this.vy *= 0.95;
    
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

// Burst function
function particle(x, y, color, duration, speed, layer = 0) {
  const particleCount = Math.floor(random(10, 15));
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(x, y, color, duration, speed, layer));
  }
}