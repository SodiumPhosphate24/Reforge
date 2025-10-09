class Message {
  constructor(type, message) {
    if (type == "quest") {
      this.x = 600;
      this.y = -200;
      this.vel = 20;
      this.message = message;
    }
    else if (type == "dialogue") {

    }
  }
}

function messageDisplay(){
  for(let i = 0; i < messages.length; i++){
    fill(255);
    textSize(20);
    textFont(Silkscreen);
    text(messages[i].message, messages[i].x, messages[i].y);
    if(messages[i].vel > 0){
      messages[i].y += messages[i].vel;
      messages[i].vel -= 1;
    }
  }
}