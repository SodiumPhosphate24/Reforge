class Message {
  constructor(type, message) {
    if (type == "quest") {
      this.x = 600;
      this.y = -200;
      this.message = message;
    }
    else if (type == "dialogue") {

    }
  }
}