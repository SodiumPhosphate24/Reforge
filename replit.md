# Overview

This is a 2D top-down action game built with p5.js called "Reforge". Players control engineer robots that can craft new robots, weapons, and items while fighting zombies in a tile-based world. The game features a crafting system, inventory management, multiple playable characters, enemy AI with pathfinding, a particle system, NPCs with dialogue, and a built-in level editor.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Rendering Engine**: p5.js canvas-based rendering
- **World Rendering**: Multi-layer tile system (4 layers: 2 background, 2 foreground) with 50x50 pixel tiles
- **Camera System**: Follows active player with smooth tracking using lerp interpolation
- **Asset Management**: Image preloading system for tiles, characters, items, bullets, and UI elements
- **Tile Variants**: Support for randomized tile variations to add visual variety
- **Roof Rendering**: Special handling for walkthrough tiles that fade when player is underneath

**UI System**:
- **Inventory Hotbar**: 8-slot inventory with visual selection frame and item preview
- **Health Display**: Visual health bar for active player
- **Crafting Menu**: Tab-based interface for Robots, Weapons, and Items with ingredient requirements
- **Message System**: Animated quest notifications and NPC dialogue bubbles with slide/fade animations
- **NPC Interaction Prompts**: Screen-fixed UI showing interaction availability

**Animation System**:
- **Smooth Transitions**: Lerp-based animations for UI elements, camera movement, and indicators
- **Particle Effects**: Burst particles for visual feedback on damage/events
- **Player Switching**: Visual indicator with fade effects when switching between robot characters

## Game Systems

**Player Management**:
- **Multi-Character System**: Players can craft and switch between multiple robot characters (Q key)
- **Character Stats**: Each robot has unique width, height, speed, health, and damage values
- **Inventory Per Character**: Each robot maintains its own 8-slot inventory
- **Laser Energy**: Shared energy system for special weapons

**Combat System**:
- **Projectile-Based**: Bullets spawn from gun barrel position with collision detection
- **Enemy Types**: Zombie enemies with health, aggro range, and pathfinding AI
- **Damage Calculation**: Weapons have different damage values and bullet types (common, uncommon, rare, legendary, explosive)
- **Gun Mechanics**: Aim follows mouse cursor with recoil system

**Enemy AI**:
- **Aggro System**: Enemies activate when player enters aggro range (500 units)
- **Pathfinding**: A* pathfinding algorithm recalculated every 15-30 frames depending on distance
- **Deaggro Logic**: Enemies stop chasing at longer distance (700 units) with smooth deceleration
- **Velocity-Based Movement**: Acceleration/deceleration for realistic movement
- **Enemy Types**: harpy (melee), cyclops (tank), greg (ranged), boss (multi-phase)

**Boss System**:
- **Boss Enemy Type**: Special enemy with "boss" type using OGBuschy.png image
- **Multi-Phase Combat**: 3 combat phases triggered at health thresholds (66% and 33%)
- **Phase-Specific Attacks**: 
  - Phase 1: Single shots, occasional charge attacks
  - Phase 2: Burst fire (3 shots), faster charges, spray attacks, spawns 2 minions
  - Phase 3: Rapid burst fire (5 shots), frequent charges, spray attacks, spawns up to 6 minions
- **Boss Bar UI**: Dedicated health bar at top of screen with phase indicators (I, II, III)
- **Visual Effects**: Pulsing aura (orange/red/purple based on phase), shake effects, flash transitions
- **activeBoss Variable**: Global reference to current boss enemy for UI rendering

**Crafting System**:
- **Recipe-Based**: Recipes define required ingredients and output items
- **Categories**: Robots, Weapons, Items
- **Unlocking**: Progressive unlock system for advanced recipes
- **Crate Interaction**: Workbench tiles trigger crafting menu

**World Editor**:
- **Multi-Layer Editing**: 4-layer tile placement (2 behind player, 2 in front)
- **Tile Rotation**: 0/90/180/270 degree rotation support
- **Crate Inventory System**: Place crates and assign custom item contents
- **Sewer Linking Mode**: Press L to toggle sewer linking mode, click two sewer caps (tile 44) to link them
- **Minimap**: Cached minimap view for world navigation
- **Export/Import**: Clipboard-based world string for saving/loading levels

**Sewer System** (sewer.js):
- **Linked Sewer Caps**: Pairs of sewer cap tiles (index 44) can be linked together in editor mode
- **Sewer Room**: 24x15 tile room with stone brick walls (tile 26) and white tile floor (tile 39)
- **Entry/Exit**: Press E near a linked sewer to enter; exit from either side to teleport to entry or linked sewer
- **World Save/Load**: Sewer links are saved with the world data using ~ separator

**Collision Detection**:
- **Tile-Based**: Wall types (walkable, solid, roof/walkthrough)
- **AABB Collision**: Axis-aligned bounding box checks for player, enemies, bullets
- **Raycast**: Used for bullet spawning to prevent shooting through walls

**Item System**:
- **Item Types**: Weapons (guns), consumables (batteries, CPUs), materials (rocks, cheese, soda)
- **Dropped Items**: World items with pickup radius and visual indicators
- **Rarity System**: Common, uncommon, rare, legendary tiers

## Data Management

**World Representation**:
- **Format**: 2D array of tile objects, each storing tile type and rotation per layer
- **Serialization**: String-based format for export/import ("world.txt")
- **Crate Inventories**: Map structure storing items by grid coordinates ("row,col" key)

**State Management**:
- **Global Variables**: Player position (pX, pY), velocity, camera position, active player index
- **Array-Based Collections**: enemies[], bullets[], messages[], droppedItems[], players[], NonPlayerCharacters[]
- **Player State**: Health, inventory, frozen status, laser energy per character

**Configuration**:
- **Item Constructors**: Array defining all available items with stats and images
- **Crafting Recipes**: Array of recipe objects with ingredients and outputs
- **Tile Configuration**: Parallel arrays for tile images and wall properties

# External Dependencies

## JavaScript Libraries

**p5.js (v1.6.0)**: Core rendering and game loop framework
- Canvas management and drawing API
- Image loading and display
- Input handling (keyboard, mouse)
- Math utilities (lerp, constrain, distance)

**p5.sound.js (v1.4.0)**: Audio playback (included but not actively used in visible code)

## Asset Requirements

**Image Assets**:
- Character sprites (Buschy robot, enemies)
- Tile graphics (13+ tile types with variants)
- Item images (bullets, guns, consumables, materials)
- UI elements (inventory hotbar, health bar, frames, indicators)
- Custom cursor image

**Font Assets**:
- Silkscreen font for UI text

## Browser APIs

**Clipboard API**: Used for world export/import (Ctrl+C in editor mode)

**Canvas API**: Via p5.js for all rendering operations

**Local Storage**: Not currently implemented but world data could benefit from persistence

## No Backend/Database

This is a fully client-side application with no server communication. All game state is maintained in-memory with optional clipboard-based persistence for level data.