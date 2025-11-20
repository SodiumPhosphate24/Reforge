var triggerState = 0;
var triggerList = {
  Prometheus : {
    talkToPrometheus: false,
    dropppedStarterGun: false,
    openedFirstCrate: false,
  }
};

function handleTriggers(trigger){
  console.log("handling " + trigger);
  if (trigger == "Prometheus"){
    console.log("Current talkToPrometheus state: ", triggerList.Prometheus.talkToPrometheus);
    if (triggerList.Prometheus.talkToPrometheus == false){
      triggerList.Prometheus.talkToPrometheus = true;
      console.log("Talked to Prometheus");
      droppedItems.push(new DroppedItem(new Item("gun", "glock", 1), 13350, 12750));
      triggerList.Prometheus.dropppedStarterGun = true;
      NonPlayerCharacters[0].message = ["Prometheus IV: These supplies should be enough to create your first robot", "Prometheus IV: You can craft robots and other items at the workbench", "Prometheus IV: You will need to send your robots to explore the world and find more supplies"];
    }
  }
}