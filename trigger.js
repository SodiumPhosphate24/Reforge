var triggerState = 0;
var triggerList = {
  Promethus : {
    talkToPrometheus: false,
    dropppedStarterGun: false,
    openedFirstCrate: false,
  }
};

function handleTriggers(trigger){
  if (trigger == "Prometheus"){
    if (triggerList.Promethus.talkToPrometheus == false){
      triggerList.Promethus.talkToPrometheus = true;
      droppedItems.push(new DroppedItem(new Item("gun", "glock", 1), 13350, 12750));
      triggerList.Promethus.dropppedStarterGun = true;
    }
  }
}