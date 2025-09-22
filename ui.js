var inventory = 1;
function drawUI() {
  for (let i = 0; i < 8; i++) {
    fill(100, 100, 100, 100);
    strokeWeight(5);
    stroke(0, 0, 0);
    rect(300 + (i * 75), 625, 75, 75);
  }
  stroke(200, 200, 200);
  rect(300 + ((inventory-1) * 75), 625, 75, 75);
  noStroke();
}