class Enemy{
  constructor(x, y, type){
    this.x = x;
    this.y = y;
    this.type = type;
  }
  draw(){
    fill(255, 0, 0);
    rect(this.x, this.y, 50, 50);
  }  
}