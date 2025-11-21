var triggerState = 0;
var triggerList = {
  Prometheus : {
    talkToPrometheus: false,
    fixedBunker: false,
    openedFirstCrate: false,
  }, 
  Crafting : {
    craftedFirstRobot: false,
  }
};

function handleTriggers(trigger){
  if (trigger == "Prometheus"){
    if (triggerList.Prometheus.talkToPrometheus == false){
      triggerList.Prometheus.talkToPrometheus = true;
      NonPlayerCharacters[0].message = [
        "Prometheus IV: Ba-Bastiann... Welcome Back",
        "Prometheus IV: I am Prometheus IV",
        "Prometheus IV: I am the final robot unyeilding to Khronos' will.",
        "Prometheus IV: You are one of the last human engineers alive",
        "Prometheus IV: That cr...ate over there",
        "Prometheus IV: Take this, and break the crate to drop its contents"
      ];
    }
    if (triggerList.Prometheus.fixedBunker == false){
      triggerList.Prometheus.fixedBunker = true;
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
      return;
    }
  }
  if (trigger == "Crafting"){
    if(triggerList.Crafting.craftedFirstRobot == false){
      triggerList.Crafting.craftedFirstRobot = true;
      return;
    }
  }
}