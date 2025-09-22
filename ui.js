function drawUI(){
  var inventory = 1;
  for(let i = 0; i < 8; i++){
    fill(100, 100, 100);
    strokeWeight(5);
    strokeColor(0, 0, 0);
    rect(400+(i*50), 650, 50, 50)
  }
  rect(400+(inventory*50), 650, 50, 50);
}