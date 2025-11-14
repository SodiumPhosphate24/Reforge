# Overview

This is a 2D top-down action game built with p5.js featuring robots, enemies, crafting, and exploration. Players control engineer robots that can be crafted and switched between, each with different stats. The game includes combat with zombies, a comprehensive crafting system for creating robots and weapons, an inventory system, and a tile-based world editor. The aesthetic is high-tech with bright blue UI elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (November 14, 2025)
- Added layer 4 support for rendering tiles above the player
- Updated roof tile system: only layers 2, 3, and 4 trigger roof fading (layers 0 and 1 do not)
- Editor now supports layer 4 selection with key '5'
- Updated world serialization to support 5 layers

# System Architecture

## Core Game Loop
- **p5.js Framework**: Uses p5.js for rendering, input handling, and game loop management
- **Entity-Component Pattern**: Separate classes for Player, Enemy, Bullet, Particle, NPC, and Message entities
- **Camera System**: Follows active player with constrained boundaries based on world size

## World System
- **Tile-Based World**: 50x50 pixel tiles stored in 2D array (`gameWorld`)
- **Multi-Layer Rendering**: 5 layers (0-3 behind player, 4 in front) for depth
- **Layer Behavior**: Layers 0-1 render under player without roof effects; layers 2-4 render with roof fading when player is underneath
- **Tile Properties**: Each tile has walkthrough/wall/roof properties defined in `tileWalls` array
- **World Persistence**: World saved/loaded from `world.txt` as comma-separated string format
- **Procedural Variants**: Support for multiple tile variants (e.g., concrete has 4 variations)

## Player System
- **Multi-Robot Control**: Array of player robots with different stats (speed, health, damage, size)
- **Active Player Pattern**: One active player at a time, switchable with 'Q' key
- **Player States**: Position, velocity, inventory (8 slots), laser energy, frozen state
- **Smooth Transitions**: Visual indicators and camera transitions when switching players

## Combat System
- **Bullet Physics**: Projectiles spawn from gun barrel with raycast validation to prevent wall clipping
- **Enemy AI**: Pathfinding-based zombie AI with aggro/de-aggro system
- **Collision Detection**: Tile-based and entity-based collision using bounding boxes
- **Damage System**: Bullets deal damage on enemy collision, enemies can damage players

## Crafting System
- **Recipe-Based**: Recipes define ingredients and outputs for robots, weapons, and items
- **Categories**: Organized into tabs (Robots, Weapons, Items)
- **Unlock Progression**: Recipes can be locked/unlocked
- **UI State Management**: Modal crafting menu with fade/slide/scale animations

## Inventory & Items
- **8-Slot Hotbar**: Number keys 1-8 for quick access
- **Item Types**: Consumables, materials, weapons, projectiles
- **Dropped Items**: Physics-based item drops with pickup radius
- **Crate Storage**: Crates store items using Map with "row,col" keys

## Level Editor
- **5-Layer Editing**: Toggle layers 0-4 with keys 1-5 (layer 4 renders above player)
- **Tile Placement**: Left-click place, right-click erase
- **Rotation Support**: Tiles can be rotated 0/90/180/270 degrees
- **Crate Inventory Editor**: Special mode for adding items to crates
- **Copy/Export**: Ctrl+C copies world and crate data to clipboard
- **Minimap**: Cached minimap view showing highest visible layer for navigation

## UI System
- **Component-Based**: Separate functions for inventory, health, energy, buffs
- **Animation System**: Smooth transitions using lerp, alpha fading, and scaling
- **Message Queue**: Quest and dialogue messages with different display styles
- **NPC Interaction**: Proximity-based dialogue with 'E' key
- **Visual Feedback**: Item labels, player indicators, damage particles

## Particle System
- **Burst Effects**: Particles spawn with random angles for impact feedback
- **Physics**: Velocity-based movement with friction/slowdown
- **Fade Out**: Alpha decreases over lifetime
- **Size Variation**: Random size for visual variety

## Asset Management
- **Preload Pattern**: All images loaded in `preload()` before game starts
- **Image Arrays**: Organized by type (bullets, guns, tiles, items, etc.)
- **Tile Variants**: Support for multiple variations loaded dynamically

# External Dependencies

## Libraries
- **p5.js (v1.6.0)**: Core game framework for rendering and input
- **p5.sound.js (v1.4.0)**: Audio support (currently loaded but not actively used)

## Asset Structure
- **Images**: Character sprites, tiles, items, weapons, UI elements
- **Fonts**: Silkscreen font for UI text
- **World Data**: `world.txt` stores serialized world state

## Browser APIs
- **Clipboard API**: Used for copying world data (Ctrl+C in editor)
- **Context Menu**: Disabled during editor mode for right-click erase

## File Organization
- `script.js`: Main game initialization, asset loading, world parsing
- `player.js`: Player class and switching logic
- `enemy.js`: Enemy AI and pathfinding
- `bullet.js`: Projectile physics and collision
- `controls.js`: Input handling and player movement
- `ui.js`: UI rendering (inventory, health, energy)
- `crafting.js`: Recipe definitions and crafting menu
- `editor.js`: Level editor functionality
- `message.js`: Message display system for quests/dialogue
- `npc.js`: NPC interaction system
- `particles.js`: Particle effects
- `index.html`: Entry point, script loading order