# Reforge - 2D Top-Down Action Game

## Overview

Reforge is a 2D top-down action game built with p5.js featuring robot characters, crafting systems, enemy combat, and world exploration. Players control engineer robots, craft new robot companions, gather resources from crates, and fight zombies in a tile-based world. The game includes a level editor for creating custom maps with multi-layer tile support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**
- **p5.js** - JavaScript creative coding library for rendering and game loop
- **p5.sound.js** - Audio playback addon
- Pure JavaScript (no framework) - All game logic implemented in vanilla JS
- HTML5 Canvas - Rendering surface provided by p5.js

**Rendering System**
- 2D sprite-based rendering using p5.js image functions
- Multi-layer tile system (4 layers: 2 background, 2 foreground)
- Camera system that follows the active player with world coordinates
- Particle system for visual effects (explosions, impacts)
- Alpha blending and fade effects for UI animations

**Module Structure**
The codebase is split into focused modules:
- `script.js` - Core game loop, asset loading, world rendering
- `player.js` - Player character management and switching
- `enemy.js` - Enemy AI with pathfinding
- `bullet.js` - Projectile physics and collision
- `controls.js` - Input handling (WASD movement, hotkeys)
- `ui.js` - HUD rendering (inventory, health, energy)
- `crafting.js` - Recipe system and crafting menu
- `message.js` - Quest notifications and NPC dialogue
- `npc.js` - Non-player character interactions
- `particles.js` - Visual effects system
- `editor.js` - In-game level editor with minimap

**Game State Management**
Global variables manage core game state:
- Player position (`pX`, `pY`) and velocity (`pXVel`, `pYVel`)
- Active player index and player array for character switching
- World grid (`gameWorld`) - 2D array of tile objects with rotation/layer data
- Entity arrays: `enemies`, `bullets`, `droppedItems`, `NonPlayerCharacters`, `messages`
- Crate inventories stored in Map structure keyed by "row,col"

### Asset Management

**Image Loading**
- All assets preloaded in `preload()` function before game starts
- Character sprites, tile textures, item icons, UI elements
- Tile variant system for visual variety (concrete has 4 variants)
- Items stored as image references in constructor arrays

**World Data**
- World stored as text file (`world.txt`) with custom serialization format
- Format: `layer,tileType,rotation/layer,tileType,rotation/...`
- Crate inventories serialized separately and embedded in world string
- Copy-paste workflow: Ctrl+C copies world to clipboard

### Game Systems

**Player System**
- Multiple playable robot characters with different stats (speed, health, damage)
- Character switching with Q key
- Each player maintains independent inventory (8 slots)
- Player construction via crafting recipes with stat templates

**Combat System**
- Projectile-based combat with bullet physics
- Raycast-based bullet spawning to prevent wall clipping
- Enemy pathfinding using A* algorithm with periodic updates
- Aggro/de-aggro ranges for performance optimization
- Damage system with health management

**Inventory & Items**
- 8-slot hotbar inventory per player
- Item constructors define: type, name, stats, image, dimensions
- Dropped items spawn as collectible entities in world
- Crates contain randomized loot pulled from item constructor pool
- Item pickup with E key proximity detection

**Crafting System**
- Recipe-based crafting with ingredient requirements
- Three categories: Robots, Weapons, Items
- Tabbed interface with unlock progression
- Crafting recipes can create new playable robot characters
- Workbench tiles trigger crafting menu

**Level Editor**
- Toggle with tilde key (`~`)
- 4-layer tile placement (background/foreground separation)
- Right-click to erase tiles
- Tile rotation in 90-degree increments
- Crate placement with item selection interface
- Minimap view for world navigation (M key toggles)
- Minimap caching for performance

**UI/UX Features**
- Animated inventory slot indicator
- Item label fade-in when changing slots
- Health and energy bars
- Message system with quest notifications and NPC dialogue
- Sliding/scaling animations for UI elements
- Custom cursor via CSS

### Physics & Collision

**Movement**
- Velocity-based movement with friction (0.8 multiplier)
- WASD controls with acceleration
- World boundary constraints
- Player frozen state for dead characters

**Collision Detection**
- Tile-based wall collision using tile type lookup
- Wall types: walkable (0), solid (1), roof/fade-through (2)
- Bounding box collision for bullets vs enemies
- Proximity-based interaction ranges for NPCs and item pickup

**Pathfinding**
- A* pathfinding for enemy navigation
- Grid-based with tile wall detection
- Periodic path updates (every 15-30 frames based on distance)
- Path smoothing via waypoint following

### Performance Optimizations

- Reduced pathfinding frequency for distant enemies
- Minimap rendering cache to avoid redrawing every frame
- Particle cleanup when particles expire
- Entity array management (remove dead entities)
- Conditional rendering based on camera bounds

### World Format

The game uses a custom text-based world format where each tile is represented as:
```
layer,tileType,rotation
```

Tiles are separated by `/` and rows by newlines. The format allows:
- 4 layers (0-3) for depth sorting
- 13+ tile types (grass, asphalt, brick, crates, etc.)
- 4 rotation states (0°, 90°, 180°, 270°)

Crate contents are serialized separately as item constructor references.

## External Dependencies

### JavaScript Libraries
- **p5.js v1.6.0** - Core rendering and game loop framework (CDN)
- **p5.sound.js v1.4.0** - Audio playback library (CDN)

### Assets
All assets are local files referenced from the project:
- Character sprites (PNG): Buschy (player), Enemy (zombie)
- Tile textures (PNG): Various environment tiles in `Tiles/` directory
- Item sprites (PNG): Guns, bullets, consumables in `Items/` subdirectories
- UI elements (PNG): Inventory bars, frames, indicators
- Font: Silkscreen (referenced but not shown in preload)

### Browser APIs
- Canvas API (via p5.js)
- Clipboard API for world data export (`navigator.clipboard.writeText`)
- LocalStorage (not currently implemented but referenced for potential save system)
- Context Menu prevention for right-click editor functionality

### File System
- `world.txt` - World data loaded via `loadStrings()` in p5.js
- No database or server-side persistence currently implemented
- All game state is runtime-only (resets on page reload)