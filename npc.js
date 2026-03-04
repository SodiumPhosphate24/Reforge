var canFreeDaedalus = false;
var groupDiscussionComplete = false;
var groupHasRelocated = false;

class NPC {
  constructor(x, y, name, message, image = null, triggerID, scale = 1) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.message = message;
    this.image = image;
    this.scale = scale;
    this.baseWidth = 35;
    this.width = this.baseWidth * this.scale;
    this.id = triggerID;

    if (this.image) {
      const aspectRatio = this.image.height / this.image.width;
      this.height = this.width * aspectRatio;
    } else {
      this.height = 25 * this.scale;
    }
  }

  update() {
    this.width = this.baseWidth * this.scale;
    if (this.image) {
      const aspectRatio = this.image.height / this.image.width;
      this.height = this.width * aspectRatio;
    } else {
      this.height = 25 * this.scale;
    }

    const distToPlayer = distance(this.x, this.y, pX + 600, pY + 340);
    if (distToPlayer < 120 && keyPressedOnce(69)) {
      const heldItem = inventoryList[inventorySlot - 1];
      const isHoldingCrowbar = heldItem && heldItem.name.toLowerCase().includes("crowbar");
      if (isHoldingCrowbar && this.name.toLowerCase() === "crate") {
        if (typeof clearTile === 'function') {
          clearTile(464, 169, 1);
          this.scale = 1.4;
          this.name = "Daedalus";
          this.hasTalkedAfterRescue = false;
          messages.push(new Message("quest", "Lvl 2 Completed"));
          this.message = [
            "Daedalus: Finally, some fresh air. Thank you.",
            "Daedalus: Hm? A robo—GET BACK! YOU'LL NEVER TAKE ME ALIVE!",
            "PROMETHEUS IV: Daedalus. We are with Hephaestus. No time to explain.",
            "Daedalus: ...Sorry. I've learned not to trust machines. You're different—steam-powered, too. I didn't think anyone still built like this.",
            "Daedalus: We need to move. Hephaestus and Atlas are still waiting."
          ];
          console.log("Cleared crate and freed Daedalus");
          triggerList.Objective.freeDaedalus = true;
          
          return;
        }
      }

      const hasActiveDialogue = messages.some(msg => msg.type === "dialogue");
      if (!hasActiveDialogue) {
        if (this.id === "Lock") {
          lockCodeActive = true;
          lockCodeInput = "";
        }

        if (this.id === "Daedalus" && !this.hasTalkedAfterRescue) {
          this.hasTalkedAfterRescue = true;
          currentWaypointIndex = 5;
        }

        messages.push(new Message("dialogue", this.message, this.id));
      }
    }
  }
}

let nearestNPC = null;
let interactionPrompt = null;

function drawNPCs() {
  if (!interactionPrompt) interactionPrompt = createPrompt();

  nearestNPC = null;
  let nearestDistance = Infinity;

  for (let i = 0; i < NonPlayerCharacters.length; i++) {
    NonPlayerCharacters[i].update();

    if (NonPlayerCharacters[i].image) {
      image(NonPlayerCharacters[i].image,
        NonPlayerCharacters[i].x,
        NonPlayerCharacters[i].y,
        NonPlayerCharacters[i].width,
        NonPlayerCharacters[i].height);
    } else {
      fill(255, 255, 0);
      rect(NonPlayerCharacters[i].x, NonPlayerCharacters[i].y, 20, 20);
    }

    const distToPlayer = distance(NonPlayerCharacters[i].x, NonPlayerCharacters[i].y, pX + 600, pY + 340);

    if (distToPlayer < 120 && distToPlayer < nearestDistance) {
      nearestDistance = distToPlayer;
      nearestNPC = NonPlayerCharacters[i];
    }
  }

  // Handle Daedalus teleportation to AEGIS
  const daedalus = NonPlayerCharacters.find(npc => npc.id === "Daedalus");
  if (daedalus && daedalus.scale >= 1 && daedalus.hasTalkedAfterRescue && !daedalus.teleported) {
    const distToPlayer = distance(daedalus.x, daedalus.y, pX + 600, pY + 340);
    if (distToPlayer > 1000) {
      daedalus.x = 23100;
      daedalus.y = 22650;
      daedalus.teleported = true;

      var groupTalk = [
        "Hephaestus: Daedalus, we saw them take you.",
        "Atlas: We thought you died.",
        "Daedalus: I thought I was dead. But they need me alive.",
        "Hephaestus: For what?",
        "Daedalus: To bring me back to him.",
        "Atlas: Khronos.",
        "Hephaestus: Why would he need you?",
        "Daedalus: Because he's breaking. Systems collapsing. He believes I can fix him.",
        "Atlas: Fix the thing that burned the world?",
        "Daedalus: He was meant to save it. We built him to protect humanity.",
        "Hephaestus: And now he keeps you alive.",
        "Daedalus: He's trying to take me to the Labyrinth. The compact I designed for him.",
        "Atlas: Then you're the only one who knows the way in.",
        "Daedalus: I know what I made. Not what it is now.",
        "Hephaestus: The defenses could be anything.",
        "Atlas: We can't go in blind.",
        "Hephaestus: We need to scout the Labyrinth first.",
        "Atlas: And we don't go alone.",
        "Hephaestus: Stranger— guiding the machine...",
        "Atlas: You've survived a lot. Alone.",
        "Hephaestus: Come with us. See what waits in the Labyrinth.",
        "Daedalus: Meet us there. We'll be ready."
      ];

      const hephaestusNPC = NonPlayerCharacters.find(npc => npc.id === "Hephaestus");
      const atlasNPC = NonPlayerCharacters.find(npc => npc.id === "Atlas");
      if (hephaestusNPC) hephaestusNPC.message = groupTalk;
      if (atlasNPC) atlasNPC.message = groupTalk;
      if (daedalus) daedalus.message = groupTalk;
    }
  }

  // Handle group relocation to Labyrinth
  if (!groupHasRelocated && groupDiscussionComplete) {
    const hephaestus = NonPlayerCharacters.find(npc => npc.id === "Hephaestus");
    const atlas = NonPlayerCharacters.find(npc => npc.id === "Atlas");
    const daedalus = NonPlayerCharacters.find(npc => npc.id === "Daedalus");

    if (hephaestus && atlas && daedalus) {
      const distToHephaestus = distance(hephaestus.x, hephaestus.y, pX + 600, pY + 340);
      const distToAtlas = distance(atlas.x, atlas.y, pX + 600, pY + 340);
      const distToDaedalus = distance(daedalus.x, daedalus.y, pX + 600, pY + 340);

      if (distToHephaestus > 1000 && distToAtlas > 1000 && distToDaedalus > 1000) {
        hephaestus.x = 4370;
        hephaestus.y = 1015;
        atlas.x = 4470;
        atlas.y = 1015;
        daedalus.x = 4420;
        daedalus.y = 915;

        groupHasRelocated = true;
        console.log("Hephaestus, Atlas, and Daedalus have moved to the Labyrinth entrance.");

        const labyrinthDialogue = ["Hephaestus: Here it is... the Labyrinth.", "Atlas: Well, we knew it wouldn't be as easy as walking in.", "Daedalus: He built a wall around it. Defending the entrance. We need to breach it somehow.", "Hephaestus: The old rail system runs through here, maybe we can redirect a train to collapse the wall.", "Daedalus: But the train station has been abandoned for years, and locomotive technology is long gone. We'd have to build a new train", "Hephaestus: It's our best chance. We should head over to the old train station in the city to the east. There should be parts we can use to build a new train."];
        hephaestus.message = labyrinthDialogue;
        atlas.message = labyrinthDialogue;
        daedalus.message = labyrinthDialogue;
      }
    }
  }

  // Handle train station relocation
  if (triggerList.Labyrinth.labyrinthTalk) {
    const hephaestus = NonPlayerCharacters.find(npc => npc.id === "Hephaestus");
    const atlas = NonPlayerCharacters.find(npc => npc.id === "Atlas");
    const daedalus = NonPlayerCharacters.find(npc => npc.id === "Daedalus");
    const distToHephaestus = distance(hephaestus.x, hephaestus.y, pX + 600, pY + 340);
    if (distToHephaestus > 1000) {
      hephaestus.x = 13750;
      hephaestus.y = 825;
      atlas.x = 13700;
      atlas.y = 925;
      daedalus.x = 13800;
      daedalus.y = 925;

      const trainDialogue = ["Hephaestus: Here it is... the train station.", "Atlas: Blah blah blah, make a train to breach the wall", "Daedalus: Blah blah blah, find the materials around in the city"];
      hephaestus.message = trainDialogue;
      atlas.message = trainDialogue;
      daedalus.message = trainDialogue;
    }
  }
}

// Draws interaction prompt for NPCs
function drawNPCPromptIfNeeded() {
  if (nearestNPC && !craftingMenuOpen) {
    const nameLower = nearestNPC.name.toLowerCase();
    const isReadable = nameLower.includes("book") || nameLower.includes("journal") || nameLower.includes("sign");
    const isLock = nameLower.includes("lock");

    const heldItem = inventoryList[inventorySlot - 1];
    const isHoldingCrowbar = heldItem && heldItem.name.toLowerCase().includes("crowbar");

    let promptText = `Press E to talk to ${nearestNPC.name}`;

    if (isHoldingCrowbar && nameLower == "crate") {
      promptText = `Press E to open crate`;
      canFreeDaedalus = true;
    } else if (isReadable) {
      promptText = `Press E to read ${nearestNPC.name}`;
    } else if (isLock) {
      promptText = `Press E to open ${nearestNPC.name}`;
    }

    handleInteractionPrompt(
      interactionPrompt,
      nearestNPC.x,
      nearestNPC.y,
      120,
      promptText,
      !messages.some(msg => msg.type === "dialogue")
    );
  } else if (interactionPrompt) {
    interactionPrompt.update(false);
    interactionPrompt.draw("", [255, 150, 0], 80, true);
  }
}
