var triggerState = 0;
var triggerList = {
  Prometheus: {
    talkToPrometheus: false,
    openedFirstCrate: false
  },
  Hephaestus: {
    talkToHephaestus: false,
    givenSprayer: false
  },
  Crafting: {
    craftedFirstRobot: false,
    trainBuilt: false
  },
  LockOpened: {
    unlockedBoilerRoom: false
  },
  Objective: {
    fixLeaks: false,
    fixBoiler: false,
    freeDaedalus: false
  },
  Pickup: {
    pickedUpWrench: false
  },
  Softlock: {
    softlockMessage: false
  },
  Labyrinth: {
    labyrinthTalk: false,
    trainTalk: false,
    movedToTrain: false,
    wallBreached: false,
    puzzles: [false, false, false, false],
    isFightingBoss: false
  }
};

//Check trigger name and handle accordingly
function handleTriggers(trigger, ID = -1) {
  if (trigger == "LockOpened") {
    //update lock trigger
    triggerList.LockOpened.unlockedBoilerRoom = true;
    updateCurrentObjective();
    //console.log("Lock opened with code 1855!");
    return;
  }

  if (trigger == "Prometheus") {
    //update dialogue
    if (triggerList.Prometheus.talkToPrometheus == false) {
      triggerList.Prometheus.talkToPrometheus = true;
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
      updateCurrentObjective();
      //Prometheus describes how to make bots, so the recipes are unlocked
      unlockRecipe("SPUD");
      unlockRecipe("SCAMPER");
      unlockRecipe("STUR-D");
      return;
    }
  }
  if (trigger == "Hephaestus") {
    if (triggerList.Hephaestus.talkToHephaestus == false) {
      triggerList.Hephaestus.talkToHephaestus = true;
      droppedItems.push(new DroppedItem(new Item("sprayer", "steam sprayer", 1), 23075, 22675));
      NonPlayerCharacters[1].message = ["Hephaestus: ..."];
      messages.push(new Message("dialogue", ["Hephaestus: Take this. This is a steam sprayer. It takes some of your steam reserves to operate, but it can be used to short circuit enemy robots", "Hephaestus: I hope it will help you survive out there", "Hephaestus: And you should probably grab some supplies from the storage room here"], "Hephaestus", true));
      unlockRecipe("steam sprayer");
      unlockRecipe("steam spreader");
      unlockRecipe("steam pulser");
      updateCurrentObjective();
      return;
    }
    if (triggerList.Hephaestus.givenSprayer == false) {
      triggerList.Hephaestus.givenSprayer = true;
      messages.push(new Message("dialogue", ["Prometheus IV: I can sense Daedalus' presence. I'll reroute you to his location"], "Prometheus", true));
      currentWaypointIndex = 6;
      updateCurrentObjective();
      return;
    }
  }
  if (trigger == "Crafting") {
    if (triggerList.Crafting.craftedFirstRobot == false) {
      triggerList.Crafting.craftedFirstRobot = true;
      messages.push(new Message("dialogue", ["Prometheus IV: Excellent. Your first creation.", "Prometheus IV: T-This is a SPUD. A Steam Powered Utility Droid.", "Prometheus IV: It was one of your most famous steam inven-ntions", "Prometheus IV: It can serve as a mobility robot.", "Prometheus IV: You can send it to the factory to find the wrench to fix the leaks.", "Prometheus IV: Press and hold Q to switch to your SPUD, using your arrow keys to navigate."], "Prometheus", true)); // Pass true for isTriggered
      currentWaypointIndex = 2;
      updateCurrentObjective();
      return;
    }
  }
  if (trigger == "Objective") {
    if (triggerList.Objective.fixLeaks == false) {
      triggerList.Objective.fixLeaks = true;
      if (triggerList.LockOpened.unlockedBoilerRoom) {
        messages.push(new Message("dialogue", ["Prometheus IV: Head to the boiler room to fix the boiler", "Prometheus IV: You will need to find a special cartridge to power it again. I'd look around the factory, where the wrench was"], "Prometheus", true));
      }
      else {
        messages.push(new Message("dialogue", ["Prometheus IV: Now you need to fix the boiler. You'll need to find a special cartridge to power it again. I'd look around the factory, where the wrench was", "Prometheus IV: The door is locked, try looking around for the code..."], "Prometheus", true));
      }
      currentWaypointIndex = 4;
      updateCurrentObjective();
      return;
    }
    if (triggerList.Objective.fixBoiler == false) {
      triggerList.Objective.fixBoiler = true;
      messages.push(new Message("quest", "Lvl 1 Completed"))
      messages.push(new Message("dialogue", ["Prometheus IV: You did it!", "Prometheus IV: The boiler is running again. The bunker is safe for now.", "Prometheus IV: No time to celebrate. You might not be alone", "Prometheus IV: My systems are detecting human activity in a region to the southeast", "Prometheus IV: The last traces are in AEGIS, a worn out military bunker. Couldn't hurt to check it out", "Prometheus IV: I'll reroute you to the area"], "Prometheus", true));
      currentWaypointIndex = 5;
      updateCurrentObjective();
      return;
    }
  }
  if (trigger == "Pickup") {
    if (triggerList.Pickup.pickedUpWrench == false && searchInventory("old wrench")) {
      triggerList.Pickup.pickedUpWrench = true;
      messages.push(new Message("dialogue", ["Prometheus IV: Exc-xcellent. You fo...ound the wrench.", "Prometheus IV: Pass the item to yo-urself by pressing and holding R.", "Prometheus IV: N-ow, go fix the l-leaks."], "Prometheus", true)); // Pass true for isTriggered
      currentWaypointIndex = 3;
      updateCurrentObjective();
      return;
    }
  }
  if (trigger == "Crash") {
    triggerList.Labyrinth.wallBreached = true;
    messages.push(new Message("quest", "Lvl 3 Completed"));
    console.log("Train Crashed");
    clearTile(10, 80, 2);
    clearTile(10, 80, 1);
    clearTile(11, 80, 2);
    clearTile(12, 80, 2);
  }
  if (trigger == "Softlock") {
    if (triggerList.Softlock.softlockMessage == false) {
      triggerList.Softlock.softlockMessage = true;
      softlockPreventionOn = false;
    }
  }
  if (trigger == "Softlock Message") {
    softlockPreventionOn = false;
  }

  // Group discussion completion when any of the three NPCs finish the reunion dialogue
  if ((trigger == "Hephaestus" || trigger == "Atlas" || trigger == "Daedalus") && triggerList.Hephaestus.givenSprayer) {
    const daedalus = NonPlayerCharacters.find(npc => npc.id === "Daedalus");
    if (daedalus && daedalus.teleported && !groupDiscussionComplete) {
      groupDiscussionComplete = true;
      currentWaypointIndex = 7;
      updateCurrentObjective();
      return;
    }
  }
  if ((trigger == "Hephaestus" || trigger == "Atlas" || trigger == "Daedalus") && groupDiscussionComplete && !triggerList.Labyrinth.labyrinthTalk) {
    triggerList.Labyrinth.labyrinthTalk = true;
    unlockRecipe("ARGO");
    currentwaypointIndex = 8;
    updateCurrentObjective();
    return;
  }
  if ((trigger == "Hephaestus" || trigger == "Atlas" || trigger == "Daedalus") && groupDiscussionComplete && triggerList.Labyrinth.movedToTrain && !triggerList.Labyrinth.trainTalk) {
    triggerList.Labyrinth.trainTalk = true;
    currentwaypointIndex = 9;
    updateCurrentObjective();
    return;
  }

  if (trigger === "Ending") {
    if (typeof endingPhase !== 'undefined') {
      endingPhase = 4;
    }
  }
}

function softlockPrevention() {
  if (!softlockPreventionOn) {
    //check if player is low on steam, and also possesses no cartridges early on in the game. This would softlock the player, so as a fix, prometheus gives the player a cartridge to help
    if (!searchInventory("common cartridge") && !searchInventory("rare cartridge") && !searchInventory("legendary cartridge") && healthPoints < 5 && !triggerList.Softlock.softlockMessage) {
      if (triggerList.Objective.fixBoiler) {
        softlockPreventionOn = true;
        messages.push(new Message("dialogue", ["Prometheus IV: You're running low on steam. You need steam to function", "Prometheus IV: You can find steam cartridges in crates, or by defeating enemies", "Prometheus IV: Now that you've fixed the boiler, it will produce a cartridge every so often", "Prometheus IV: Why don't you go grab one and pass it to yourself"], "Softlock", true));
      }
      else {
        softlockPreventionOn = true;
        messages.push(new Message("dialogue", ["Prometheus IV: You're running low on steam. You need steam to function", "Prometheus IV: I'll send you a cartridge to save you"], "Prometheus", true));
        for (let j = 0; j < 8; j++) {
          if (inventoryList[j] == null) {
            inventoryList[j] = new Item("consumable", "common cartridge", 1);
            itemLabelAlpha = 1.5;
            return;
          }
        }
        const dropX = pX + 600 + pWidth / 2 - 15;
        const dropY = pY + 375 + pHeight / 2 - 15;
        droppedItems.push(new DroppedItem(new Item("consumable", "common cartridge", 1), dropX, dropY))
        return;
      }
    }
  }
}

var currentObjective = "Talk to Prometheus IV";

function updateCurrentObjective() {
  if (!triggerList.Prometheus.talkToPrometheus) {
    currentObjective = "Talk to Prometheus IV";
  } else if (!triggerList.Crafting.craftedFirstRobot) {
    currentObjective = "Create a SPUD at the workbench";
  } else if (!triggerList.Pickup.pickedUpWrench) {
    currentObjective = "Send the SPUD to find the Old Wrench in the factory";
  } else if (!triggerList.Objective.fixLeaks) {
    currentObjective = "Repair the steam leaks with the wrench";
  } else if (!triggerList.LockOpened.unlockedBoilerRoom) {
    currentObjective = "Find the code and unlock the boiler room";
  } else if (!triggerList.Objective.fixBoiler) {
    currentObjective = "Find and repair the boiler with a \"boiler cartridge\"";
  } else if (!triggerList.Hephaestus.talkToHephaestus) {
    currentObjective = "Investigate activity in the military base AEGIS";
  } else if (!triggerList.Objective.freeDaedalus) {
    currentObjective = "Reach Daedalus' location";
  } else if (!groupDiscussionComplete) {
    currentObjective = "Reunite with Hephaestus and Atlas";
  } else if (!triggerList.Labyrinth.labyrinthTalk) {
    currentObjective = "Reach Khronos' Labyrinth";
  } else if (!triggerList.Labyrinth.trainTalk) {
    currentObjective = "Reach the train station";
  } else if (!triggerList.Crafting.trainBuilt) {
    currentObjective = "Find materials to build a train";
  } else if (!triggerList.Labyrinth.wallBreached) {
    currentObjective = "Breach the Labyrinth's wall";
  } else {
    currentObjective = "Confront Khronos";
  }
}
