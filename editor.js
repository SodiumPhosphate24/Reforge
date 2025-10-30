// ============== EDITOR (3-LAYER SUPPORT) ==============
var selectedTileType = 0;    // current tile type
// Use global maxTileTypes from your main script; fallback to tileImgs length if missing:
function __getMaxTileTypes() {
  if (typeof maxTileTypes !== "undefined") return maxTileTypes;
  if (typeof tileImgs !== "undefined" && tileImgs) return tileImgs.length;
  return 0;
}
var tileRotation = 0;        // 0, 90, 180, 270
var editorLayer = 0;         // 0 & 1 behind; 2 in front
const EDIT_TILE_SIZE = 50;

// Disable context menu so right-click can erase while editing
if (typeof window !== "undefined") {
  window.oncontextmenu = function(e) {
    if (editorMode) { e.preventDefault(); return false; }
  };
}

let editingNPC = null;
let npcDialogueInput = null;
let npcNameInput = null;
let editingCrate = null;
let crateInventoryUI = null;

function editor() {
  // Show UI elements if in editor mode
  if (editorMode) {
    drawEditorUI();
    handleEditorClick();
    handleEditorKeyPress();
  }
}

function toggleEditorMode() {
  editorMode = !editorMode;
  console.log("Editor mode:", editorMode ? "ON" : "OFF");
  if (!editorMode) {
    closeNPCEditor();
    closeCrateEditor();
  }
}

function drawEditorUI() {
  // Border
  stroke(255, 255, 0);
  strokeWeight(8);
  noFill();
  rect(4, 4, width - 8, height - 8);

  // Header text
  fill(255, 255, 0);
  noStroke();
  textSize(18);
  textAlign(CENTER);
  text("EDITOR MODE - Press Shift+E to exit", width / 2, 25);
  text("Left-click: place | Right-click: erase | Alt+Click: pick | R: rotate | 1/2/3: layer", width / 2, 45);
  text(
    "Layer: " + editorLayer +
    " | Current tile: " + selectedTileType +
    " | Rotation: " + tileRotation + "°  | Scroll / , . to change tile",
    width / 2, 65
  );

  drawTilePreview();
}

function drawTilePreview() {
  if (!(gameWorld && gameWorld.length > 0)) return;

  // World coords from mouse
  var worldX = mouseX - camX;
  var worldY = mouseY - camY;

  // Grid cell
  var gridCol = Math.floor(worldX / EDIT_TILE_SIZE);
  var gridRow = Math.floor(worldY / EDIT_TILE_SIZE);

  // In-bounds?
  if (gridRow < 0 || gridRow >= gameWorld.length) return;
  if (gridCol < 0 || gridCol >= gameWorld[gridRow].length) return;

  var snapX = gridCol * EDIT_TILE_SIZE;
  var snapY = gridRow * EDIT_TILE_SIZE;

  push();
  translate(camX, camY);

  // Semi-transparent preview of selected tile in current layer
  if (tileImgs && tileImgs[selectedTileType]) {
    tint(255, 150);
    push();
    translate(snapX + 25, snapY + 25);
    rotate(radians(tileRotation));
    image(tileImgs[selectedTileType], -25, -25, 50, 50);
    pop();
    noTint();
  }

  // Grid cell outline
  noFill();
  stroke(255, 255, 0, 200);
  strokeWeight(2);
  rect(snapX, snapY, EDIT_TILE_SIZE, EDIT_TILE_SIZE);

  // Small badge with current layer
  noStroke();
  fill(0, 0, 0, 160);
  rect(snapX + 2, snapY + 2, 16, 16, 3);
  fill(255, 255, 0);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(String(editorLayer), snapX + 10, snapY + 10);

  pop();
}

function handleEditorClick() {
  if (!(editorMode && gameWorld && gameWorld.length > 0)) return;

  // Check if clicking on existing NPC
  for (let i = 0; i < NonPlayerCharacters.length; i++) {
    let npc = NonPlayerCharacters[i];
    if (mouseX > npc.x - 600 - pX && mouseX < npc.x - 600 - pX + 50 &&
        mouseY > npc.y - 375 - pY && mouseY < npc.y - 375 - pY + 50) {
      editingNPC = npc;
      showNPCEditor(npc);
      return;
    }
  }

  // Check if clicking on existing Crate
  for (let i = 0; i < tiles.length; i++) {
    let tile = tiles[i];
    if (tile.type === "crate") {
      if (mouseX > tile.x - 600 - pX && mouseX < tile.x - 600 - pX + 50 &&
          mouseY > tile.y - 375 - pY && mouseY < tile.y - 375 - pY + 50) {
        editingCrate = tile;
        showCrateEditor(tile);
        return;
      }
    }
  }

  var worldX = mouseX - camX;
  var worldY = mouseY - camY;

  var gridCol = Math.floor(worldX / EDIT_TILE_SIZE);
  var gridRow = Math.floor(worldY / EDIT_TILE_SIZE);

  if (gridRow < 0 || gridRow >= gameWorld.length) return;
  if (gridCol < 0 || gridCol >= gameWorld[gridRow].length) return;

  // Alt + Left click = eyedropper from current layer
  if (keyIsDown(18) && mouseButton === LEFT) { // 18 is Alt in p5
    if (typeof getTile === 'function') {
      const t = getTile(gridRow, gridCol, editorLayer);
      if (t) {
        selectedTileType = t.type;
        tileRotation = t.rotation || 0;
        console.log("Picked tile", selectedTileType, "rot", tileRotation, "from layer", editorLayer);
      }
    }
    return;
  }

  // Right click = erase current layer
  if (mouseButton === RIGHT) {
    if (typeof clearTile === 'function') {
      clearTile(gridRow, gridCol, editorLayer);
      console.log("Erased at row", gridRow, "col", gridCol, "layer", editorLayer);
    } else {
      // Fallback if helpers missing (legacy)
      gameWorld[gridRow][gridCol] = undefined;
    }
    return;
  }

  // Left click = paint current layer
  if (mouseButton === LEFT) {
    if (typeof setTile === 'function') {
      setTile(gridRow, gridCol, editorLayer, selectedTileType, tileRotation);
    } else {
      // Fallback if helpers missing (legacy)
      gameWorld[gridRow][gridCol] = { type: selectedTileType, rotation: tileRotation };
    }
    console.log("Placed type", selectedTileType, "rot", tileRotation, "at", gridRow, gridCol, "layer", editorLayer);
  }
}

function handleEditorKeyPress() {
  // Toggle editor mode with Shift+E
  if (keyCode == 69 && keyIsDown(SHIFT)) { // E
    toggleEditorMode();
  }

  if (!editorMode) return;

  // Layer selection: 1 / 2 / 3
  if (key === '1') { editorLayer = 0; console.log("Layer -> 0"); }
  if (key === '2') { editorLayer = 1; console.log("Layer -> 1"); }
  if (key === '3') { editorLayer = 2; console.log("Layer -> 2"); }

  // Tile switching with comma and period keys
  if (keyCode == 188) { // ,
    const m = __getMaxTileTypes();
    if (m > 0) selectedTileType = (selectedTileType - 1 + m) % m;
    console.log("Changed to tile type:", selectedTileType);
  }
  if (keyCode == 190) { // .
    const m = __getMaxTileTypes();
    if (m > 0) selectedTileType = (selectedTileType + 1) % m;
    console.log("Changed to tile type:", selectedTileType);
  }

  // R to rotate
  if (keyCode == 82) { // R
    tileRotation = (tileRotation + 90) % 360;
    console.log("Rotated tile to:", tileRotation + "°");
  }
}

function handleEditorMouseWheel(event) {
  if (!editorMode) return false;

  const m = __getMaxTileTypes();
  if (m > 0) {
    if (event.delta > 0) {
      selectedTileType = (selectedTileType + 1) % m;
    } else {
      selectedTileType = (selectedTileType - 1 + m) % m;
    }
  }
  console.log("Mouse wheel changed to tile type:", selectedTileType);
  return true; // consume wheel in editor mode
}

function showNPCEditor(npc) {
  // Close any existing editor
  if (npcDialogueInput) {
    npcDialogueInput.remove();
    npcNameInput.remove();
  }
  closeCrateEditor();

  // Create input fields
  npcNameInput = createInput(npc.name || '');
  npcNameInput.position(20, 20);
  npcNameInput.size(200);
  npcNameInput.attribute('placeholder', 'NPC Name');

  npcDialogueInput = createInput(npc.dialogue || '');
  npcDialogueInput.position(20, 50);
  npcDialogueInput.size(400);
  npcDialogueInput.attribute('placeholder', 'NPC Dialogue');

  // Update NPC on input change
  npcNameInput.input(() => {
    npc.name = npcNameInput.value();
  });

  npcDialogueInput.input(() => {
    npc.dialogue = npcDialogueInput.value();
  });
}

function closeNPCEditor() {
  if (npcDialogueInput) {
    npcDialogueInput.remove();
    npcDialogueInput = null;
  }
  if (npcNameInput) {
    npcNameInput.remove();
    npcNameInput = null;
  }
  editingNPC = null;
}

function showCrateEditor(crate) {
  // Close any existing editor
  closeNPCEditor();
  closeCrateEditor();

  // Initialize crate inventory if it doesn't exist
  if (!crate.inventory) {
    crate.inventory = [];
  }

  editingCrate = crate;

  // Create UI container
  crateInventoryUI = createDiv('');
  crateInventoryUI.position(20, 20);
  crateInventoryUI.style('background-color', 'rgba(0, 0, 0, 0.8)');
  crateInventoryUI.style('padding', '10px');
  crateInventoryUI.style('border-radius', '5px');
  crateInventoryUI.style('color', 'white');
  crateInventoryUI.style('font-family', 'Arial');
  crateInventoryUI.style('max-width', '400px');

  let title = createDiv('Crate Inventory Editor');
  title.style('font-size', '16px');
  title.style('font-weight', 'bold');
  title.style('margin-bottom', '10px');
  title.parent(crateInventoryUI);

  // Display current items
  updateCrateInventoryDisplay();

  // Add item button
  let addButton = createButton('+ Add Item');
  addButton.style('margin-top', '10px');
  addButton.parent(crateInventoryUI);
  addButton.mousePressed(() => {
    crate.inventory.push({ type: 'consumable', name: 'cheese', amount: 1 });
    updateCrateInventoryDisplay();
  });

  // Close button
  let closeButton = createButton('Close');
  closeButton.style('margin-top', '10px');
  closeButton.style('margin-left', '10px');
  closeButton.parent(crateInventoryUI);
  closeButton.mousePressed(closeCrateEditor);
}

function updateCrateInventoryDisplay() {
  if (!crateInventoryUI || !editingCrate) return;

  // Remove old item displays
  let children = crateInventoryUI.elt.children;
  while (children.length > 1) {
    children[children.length - 1].remove();
  }

  // Display each item
  for (let i = 0; i < editingCrate.inventory.length; i++) {
    let itemDiv = createDiv('');
    itemDiv.style('margin', '5px 0');
    itemDiv.style('padding', '5px');
    itemDiv.style('background-color', 'rgba(255, 255, 255, 0.1)');
    itemDiv.style('border-radius', '3px');
    itemDiv.parent(crateInventoryUI);

    // Item type selector
    let typeSelect = createSelect();
    typeSelect.option('consumable');
    typeSelect.option('gun');
    typeSelect.option('material');
    typeSelect.option('projectile');
    typeSelect.selected(editingCrate.inventory[i].type);
    typeSelect.parent(itemDiv);
    typeSelect.changed(() => {
      editingCrate.inventory[i].type = typeSelect.value();
      // Reset name when type changes
      if (typeSelect.value() === 'consumable') editingCrate.inventory[i].name = 'cheese';
      else if (typeSelect.value() === 'gun') editingCrate.inventory[i].name = 'glock';
      else if (typeSelect.value() === 'material') editingCrate.inventory[i].name = 'common card';
      else if (typeSelect.value() === 'projectile') editingCrate.inventory[i].name = 'grenade';
      updateCrateInventoryDisplay();
    });

    // Item name selector
    let nameSelect = createSelect();
    let itemType = editingCrate.inventory[i].type;
    if (itemType === 'consumable') {
      nameSelect.option('cheese');
      nameSelect.option('soda');
      nameSelect.option('common battery');
      nameSelect.option('rare battery');
      nameSelect.option('legendary battery');
    } else if (itemType === 'gun') {
      nameSelect.option('glock');
      nameSelect.option('western');
      nameSelect.option('rare pistol');
    } else if (itemType === 'material') {
      nameSelect.option('common card');
      nameSelect.option('rare card');
      nameSelect.option('legendary card');
    } else if (itemType === 'projectile') {
      nameSelect.option('grenade');
      nameSelect.option('rock');
    }
    nameSelect.selected(editingCrate.inventory[i].name);
    nameSelect.parent(itemDiv);
    nameSelect.changed(() => {
      editingCrate.inventory[i].name = nameSelect.value();
    });

    // Amount input
    let amountInput = createInput(editingCrate.inventory[i].amount.toString());
    amountInput.size(40);
    amountInput.attribute('type', 'number');
    amountInput.attribute('min', '1');
    amountInput.parent(itemDiv);
    amountInput.input(() => {
      editingCrate.inventory[i].amount = parseInt(amountInput.value()) || 1;
    });

    // Delete button
    let deleteBtn = createButton('✕');
    deleteBtn.style('margin-left', '10px');
    deleteBtn.parent(itemDiv);
    deleteBtn.mousePressed(() => {
      editingCrate.inventory.splice(i, 1);
      updateCrateInventoryDisplay();
    });
  }

  // Re-add buttons at the end
  let addButton = createButton('+ Add Item');
  addButton.style('margin-top', '10px');
  addButton.parent(crateInventoryUI);
  addButton.mousePressed(() => {
    editingCrate.inventory.push({ type: 'consumable', name: 'cheese', amount: 1 });
    updateCrateInventoryDisplay();
  });

  let closeButton = createButton('Close');
  closeButton.style('margin-top', '10px');
  closeButton.style('margin-left', '10px');
  closeButton.parent(crateInventoryUI);
  closeButton.mousePressed(closeCrateEditor);
}

function closeCrateEditor() {
  if (crateInventoryUI) {
    crateInventoryUI.remove();
    crateInventoryUI = null;
  }
  editingCrate = null;
}
// ============== END EDITOR (3-LAYER SUPPORT) ==============