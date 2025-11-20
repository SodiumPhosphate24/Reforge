var triggerState = 0;
var triggerList = {
  Prometheus : {
    talkToPrometheus: false,
    dropppedStarterGun: false,
    openedFirstCrate: false,
  }
};

function handleTriggers(trigger){
  if (trigger == "Prometheus"){
    if (triggerList.Prometheus.talkToPrometheus == false){
      triggerList.Prometheus.talkToPrometheus = true;
      droppedItems.push(new DroppedItem(new Item("gun", "glock", 1), 13300, 12800));
      triggerList.Prometheus.dropppedStarterGun = true;
      NonPlayerCharacters[0].message = ["Prometheus IV: These supplies should be enough to create your first robot", "Prometheus IV: You can craft robots and other items at the workbench", "Prometheus IV: You will need to send your robots to explore the world and find more supplies"];
    }
  }
}