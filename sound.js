function playPickupSound() {
  if (!pickupSound) return;
  try {
    pickupSound.stop();
    pickupSound.play();
  } catch (e) {}
}