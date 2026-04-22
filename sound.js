function playAdvanceDialogueSfx() {
  if (!AdvanceDialogueSfx) return;
  AdvanceDialogueSfx.play();
}

function playAlarmSfx() {
  if (!AlarmSfx) return;
  if (!AlarmSfx.isPlaying()) AlarmSfx.loop();
}

function stopAlarmSfx() {
  if (AlarmSfx && AlarmSfx.isPlaying()) AlarmSfx.stop();
}

function setAlarmVolumeByProximity() {
  if (!AlarmSfx || !AlarmSfx.isPlaying()) return;
  const playerX = pX + 600;
  const playerY = pY + 375;
  const bunkerX = 12000;
  const bunkerY = 12500;
  const d = dist(playerX, playerY, bunkerX, bunkerY);
  const maxDist = 3000;
  const t = constrain(1 - d / maxDist, 0, 1);
  AlarmSfx.setVolume(lerp(alarmBaseVolume, alarmMaxVolume, t));
}

function updateAlarmSfx() {
  if (typeof triggerList !== "undefined" && triggerList.Objective && triggerList.Objective.fixBoiler) {
    stopAlarmSfx();
    return;
  }
  if (gameState === "playing") {
    playAlarmSfx();
    setAlarmVolumeByProximity();
  } else {
    stopAlarmSfx();
  }
}

function playCraftItemSfx() {
  if (!CraftItemSfx) return;
  CraftItemSfx.play();
}

function playCrateDestroyedSfx() {
  if (!CrateDestroyedSfx) return;
  CrateDestroyedSfx.play();
}

function playMenuSelectSfx() {
  if (!MenuSelectSfx) return;
  MenuSelectSfx.play();
}

function playMenuSwitchSfx() {
  if (!MenuSwitchSfx) return;
  MenuSwitchSfx.play();
}