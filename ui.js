function drawUI() {
  var inventory = 1;
  for (let i = 0; i < 8; i++) {
    fill(100, 100, 100, 10);
    strokeWeight(5);
    stroke(0, 0, 0);
    rect(400 + (i * 50), 650, 50, 50);
  }
  stroke(200, 200, 200);
  rect(400 + ((inventory-1) * 50), 650, 50, 50);
  noStroke();
}