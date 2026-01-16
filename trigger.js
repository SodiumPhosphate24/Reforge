var triggerState = 0;
var triggerList = {
  Prometheus: {
    talkToPrometheus: false,
    dropppedStarterGun: false,
    openedFirstCrate: false,
  },
  Hephaestus: {
    talkToHephaestus: false,
    givenGun: false
  },
  Crafting: {
    craftedFirstRobot: false,
  },
  LockOpened: {
    unlockedBoilerRoom: false
  },
  Objective: {
    fixLeaks: false,
    fixBoiler: false
  },
  Pickup: {
    pickedUpWrench: false
  },
  Softlock: {
    softlockMessage: false
  }
};

function handleTriggers(trigger) {
  if (trigger == "LockOpened") {
    triggerList.LockOpened.unlockedBoilerRoom = true;
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
  if (trigger == "Hephaestus") {
    if (triggerList.Hephaestus.talkToHephaestus == false) {
      triggerList.Hephaestus.talkToHephaestus = true;
      droppedItems.push(new DroppedItem(new Item("gun", "steam gun", 1), 23075, 22675));
      messages.push(new Message("dialogue", ["Hephaestus: Take this. This is a steam gun. It takes some of your steam reserves to fire, but it's powerful", "Hephaestus: I hope it will help you survive out there"], "Hephaestus", true));
      return;
    }
    if (triggerList.Hephaestus.givenGun == false){
      triggerList.Hephaestus.givenGun = true;
      messages.push(new Message("dialogue", ["Prometheus IV: I can sense Daedalus' presence. I'll reroute you to his location"], "Prometheus", true));
      currentWaypointIndex = 6;
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
      if(triggerList.LockOpened.unlockedBoilerRoom){
        messages.push(new Message("dialogue", ["Prometheus IV: Head to the boiler room to fix the boiler"], "Prometheus", true));
      }
      else{
        messages.push(new Message("dialogue", ["Prometheus IV: Now you need to fix the boiler", "Prometheus IV: The door is locked, try looking around the code"], "Prometheus", true));
      }
      currentWaypointIndex = 4;
      return;
    }
    if (triggerList.Objective.fixBoiler == false) {
      triggerList.Objective.fixBoiler = true;
      messages.push(new Message("dialogue", ["Prometheus IV: You did it!", "Prometheus IV: The boiler is running again. The bunker is safe for now.", "Prometheus IV: No time to celebrate. You might not be alone", "Prometheus IV: My systems are detecting human activity in a region to the southeast", "Prometheus IV: The last traces are in AEGIS, a worn out military bunker. Couldn't hurt to check it out", "Prometheus IV: I'll reroute you to the area"], "Prometheus", true));
      currentWaypointIndex = 5;
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
  if (trigger == "Softlock") {
    if (triggerList.Softlock.softlockMessage == false) {
      triggerList.Softlock.softlockMessage = true;
    }
  }
}

function softlockPrevention(){
  if(!softlockPreventionOn){
    if(!searchInventory("common cartridge") && !searchInventory("rare cartridge") && !searchInventory("legendary cartridge") && healthPoints < 5 && !triggerList.Softlock.softlockMessage){
      if (triggerList.Objective.fixBoiler){
        softlockPreventionOn = true;
        messages.push(new Message("dialogue", ["Prometheus IV: You're running low on steam. You need steam to function", "Prometheus IV: You can find steam cartridges in crates, or by defeating enemies", "Prometheus IV: Now that you've fixed the boiler, it will produce a cartridge every so often", "Prometheus IV: Why don't you go grab one and pass it to yourself"], "Softlock", true));
      }
      else {
        softlockPreventionOn = true;
        messages.push(new Message("dialogue", ["Prometheus IV: You're running low on steam. You need steam to function", "Prometheus IV: You can find steam cartridges in "], "Prometheus", true));
      }
    }
  }
}