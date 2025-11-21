var triggerState = 0;
var wayPointList = [[100, 100], [24900, 24900]];
var triggerList = {
  Prometheus : {
    talkToPrometheus: false,
    dropppedStarterGun: false,
    openedFirstCrate: false,
  }, 
  Crafting : {
    craftedFirstRobot: false,
  }, 
  Objective : {
    fixedBunker: false,
  }
};

function handleTriggers(trigger){
  if (trigger == "Prometheus"){
    if (triggerList.Prometheus.talkToPrometheus == false){
      triggerList.Prometheus.talkToPrometheus = true;
      droppedItems.push(new DroppedItem(new Item("gun", "glock", 1), 13300, 12800));
      triggerList.Prometheus.dropppedStarterGun = true;
      NonPlayerCharacters[0].message = [
        "Prometheus IV: Good. You adapt quickly.",
        "Prometheus IV: Those components… should be sufficient to construct your first autonomous unit.",
        "Prometheus IV: The workbench— there— it still functions. B–Barely.",
        "Prometheus IV: You can forge new machines… allies… from salvaged materials.",
        "Prometheus IV: Unlike Khronos's drones… yours will be… …free-willed. Unpredictable.",
        "Prometheus IV: Send them into the ruins. They must scavenge… explore… …survive.",
        "Prometheus IV: The surface is… unforgiving. But together… we may yet reclaim it."
      ];
      triggerState++;
      return;
    }
  }
  if (trigger == "Crafting"){
    if(triggerList.Crafting.craftedFirstRobot == false){
      triggerList.Crafting.craftedFirstRobot = true;
    }
  }
}

function wayPoints(){
  var currentWayPoint = wayPointList[triggerState];
  var rotation = atan2(currentWayPoint[1] - pY, currentWayPoint[0] - pX);
}