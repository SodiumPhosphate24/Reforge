var triggerState = 0;
var wayPointList = [[100, 100], [24900, 24900]];
var triggerList = {
  Prometheus: {
    talkToPrometheus: false,
    dropppedStarterGun: false,
    openedFirstCrate: false,
  },
  Crafting: {
    craftedFirstRobot: false,
  },
  Objective: {
    fixLeaks: false,
    unlockBoilerRoom: false,
    fixBoiler: false
  },
  Pickup: {
    pickedUpWrench: false
  }
};

function handleTriggers(trigger) {
  if (trigger == "LockOpened") {
    messages.push(new Message("quest", "Boiler Room Unlocked!"));
    console.log("Lock opened with code 1855!");
    // Add your unlock logic here (open door, change waypoint, etc.)
    return;
  }

  if (trigger == "Prometheus") {
    if (triggerList.Prometheus.talkToPrometheus == false) {
      triggerList.Prometheus.talkToPrometheus = true;
      //droppedItems.push(new DroppedItem(new Item("gun", "glock", 1), 13300, 12800));
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
      currentWaypointIndex = 1;
      unlockRecipe("SPUD");
      return;
    }
  }
  if (trigger == "Crafting") {
    if (triggerList.Crafting.craftedFirstRobot == false) {
      triggerList.Crafting.craftedFirstRobot = true;
      messages.push(new Message("dialogue", ["Prometheus IV: Excellent. Your first creation.", "Prometheus IV: T-This is a SPUD. A Steam Powered Utility Droid.", "Prometheus IV: It was one of your most famous steam inven-ntions", "Prometheus IV: It can serve as a mobility robot.", "Prometheus IV: You can send it to the factory to find the wrench to fix the leaks.", "Prometheus IV: Press and hold Q to switch to your SPUD, using your arrow keys to navigate."], "Prometheus", true)); // Pass true for isTriggered
      currentWaypointIndex = 2;
      return;
    }
  }
  if (trigger == "Objective") {
    if (triggerList.Objective.fixLeaks == false) {
      triggerList.Objective.fixLeaks = true;
      messages.push(new Message("dialogue", ["Prometheus IV: Head to the boiler room to [I don't know]"], "Prometheus", true));
      currentWaypointIndex = 4;
      return;
    }
    if (triggerList.Objective.unlockBoilerRoom == false) {
      triggerList.Objective.unlockBoilerRoom = true;
      messages.push(new Message("quest", "Boiler Room Unlocked!", "quest"));
      console.log("Lock opened with code 1855!");
      messages.push(new Message("dialogue", ["Prometheus IV: Now fix the boiler"], "Prometheus", true));
      return;
    }
    if (triggerList.Objective.fixBoiler == false) {
      triggerList.Objective.fixBoiler = true;
      messages.push(new Message("dialogue", ["Prometheus IV: You did it!"], "Prometheus", true));
      return;
    }
  }
  if (trigger == "Pickup") {
    if (triggerList.Pickup.pickedUpWrench == false && searchInventory("old wrench")) {
      triggerList.Pickup.pickedUpWrench = true;
      messages.push(new Message("dialogue", ["Prometheus IV: Exc-xcellent. You fo...ound the wrench.", "Prometheus IV: Pass the item to yo-urself by pressing and holding R.", "Prometheus IV: N-ow, go fix the l-leaks."], "Prometheus", true)); // Pass true for isTriggered
      currentWaypointIndex = 3;
      return;
    }
  }
}

function wayPoints() {
  var currentWayPoint = wayPointList[triggerState];
  var rotation = atan2(currentWayPoint[1] - pY, currentWayPoint[0] - pX);
}