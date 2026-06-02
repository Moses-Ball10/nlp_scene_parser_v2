# SpriteStack Studio

A professional sprite stacking and pixel art editor for Windows, combining the capabilities of **SpriteStack Studio** and **Aseprite**.

## Features

### Pixel Art Editor (Aseprite-like)

- **Drawing Tools**: Pencil, Eraser, Fill Bucket, Eyedropper, Line, Rectangle, Circle (outlined & filled)
- **Brush System**: Adjustable brush size (1-64px)
- **Layer System**: Add, remove, duplicate, merge, reorder layers with opacity and visibility controls
- **Animation Timeline**: Frame-by-frame animation with playback, FPS control, and frame management
- **Color Palette**: HSV color picker, hex/RGB input, preset palettes (DB32, PICO-8, Endesga 32)
- **Symmetry Drawing**: Mirror X/Y for symmetrical sprite creation
- **Undo/Redo**: Full undo/redo stack (100 levels)
- **Grid Overlay**: Toggleable pixel grid
- **Zoom & Pan**: Mouse wheel zoom, middle-click pan

### Sprite Stacking (SpriteStack-like)

- **Real-time 3D Preview**: See your stacked layers rendered in 3D with rotation and tilt
- **Primitive Stack Generation**: Create constrained primitive stacks (Cube, Pyramid, Prism, Cylinder)
- **Multiple Render Modes**:
  - **Stack**: Classic sprite stacking with perspective squish
  - **Voxel**: Isometric voxel-style rendering
  - **Billboard**: Simple stacked billboard view
- **Auto-Rotation**: Automatic rotation animation for previewing all angles
- **Layer Spacing Control**: Adjust the vertical gap between stacked layers
- **Shadows & Outlines**: Optional shadow and outline rendering
- **Rotation Sheet Export**: Export rendered sprites at multiple angles as a sprite sheet
- **Auto-Generate Stack**: Automatically create stack layers from a base sprite
- **Import Layer Strips**: Import horizontal strip images and split into stack layers
- **Texture Mapping from PNG**: Import a texture PNG and map it across stack layers

### AI-Assisted Offline Tools (Local FastAPI)

- **AI Scene Construction**: Text/voice prompt parsing to place scene objects with normalized positioning
- **Voice Prompt Input**: Microphone capture with local transcription pipeline
- **AI Assist Sprite Drawing**: Prompt-to-sprite generation inserted as a new canvas layer
- **Keyframe Prediction**: Intermediate frame generation with confidence-gated fallback interpolation

### Export Options

- **Single Frame PNG**: Export current frame as PNG
- **Layer PNGs**: Export all layers as separate files
- **Sprite Sheets**: Horizontal or grid sprite sheet export
- **Animated GIF**: Export animation frames as GIF
- **Animated PNG (APNG)**: Export animation as APNG
- **3D Rotation Sheet**: Export 3D stack rendered at multiple angles
- **3D Rotation GIF**: Animated GIF of the rotating 3D stack
- **Layer Strip**: Horizontal strip of all layers (for game engines)
- **OBJ/MTL Export**: Export current visible stack as `OBJ + MTL + atlas PNG` for Blender/Unity

### Import Options

- Single images (as layer)
- Sprite sheets (split to frames or layers)
- Folders of images (as layers or frames)

### Project System

- Save/Load `.sss` project files (ZIP-based, contains JSON metadata + PNG layers)
- Preserves all layers, frames, visibility, opacity, and settings

## Installation

### Requirements

- Python 3.8+
- Windows 10/11

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py
```

### Dependencies

- **PyQt5** - GUI framework
- **PyOpenGL** - 3D rendering support
- **Pillow** - Image processing and GIF/APNG export
- **NumPy** - Numerical operations

## Keyboard Shortcuts

### Tools

| Key | Tool        |
| --- | ----------- |
| B   | Pencil      |
| E   | Eraser      |
| G   | Fill Bucket |
| I   | Eyedropper  |
| L   | Line        |
| R   | Rectangle   |
| C   | Circle      |
| S   | Select      |

### File

| Shortcut     | Action           |
| ------------ | ---------------- |
| Ctrl+N       | New Project      |
| Ctrl+O       | Open Project     |
| Ctrl+S       | Save Project     |
| Ctrl+Shift+S | Save As          |
| Ctrl+E       | Export           |
| Ctrl+I       | Import           |
| Ctrl+Shift+E | Quick Export PNG |

### Edit

| Shortcut | Action      |
| -------- | ----------- |
| Ctrl+Z   | Undo        |
| Ctrl+Y   | Redo        |
| Delete   | Clear Selection / Layer |

### View

| Shortcut            | Action      |
| ------------------- | ----------- |
| Ctrl++              | Zoom In     |
| Ctrl+-              | Zoom Out    |
| Ctrl+0              | Fit Canvas  |
| Ctrl+G              | Toggle Grid |
| Mouse Wheel         | Zoom        |
| Middle Click + Drag | Pan         |

### Animation

| Shortcut | Action          |
| -------- | --------------- |
| F5       | Add Frame       |
| F6       | Duplicate Frame |
| F7       | Delete Frame    |
| Space    | Play/Pause      |

### Layers

| Shortcut     | Action          |
| ------------ | --------------- |
| Ctrl+Shift+N | New Layer       |
| Ctrl+Shift+D | Duplicate Layer |
| Ctrl+Shift+M | Merge Down      |

### 3D Preview

| Input       | Action |
| ----------- | ------ |
| Left Drag   | Rotate |
| Middle Drag | Pan    |
| Scroll      | Zoom   |

## Workflow: Creating a Sprite Stack

1. **Create a new project** (Ctrl+N) - Set size (e.g., 32x32) and number of layers (e.g., 16)
2. **Draw from bottom up** - Start with the base layer (Layer 1) and draw the bottom of your object
3. **Work upward** - Select each subsequent layer and draw the next "slice" of your object
4. **Preview in 3D** - Switch to the "3D Preview" tab to see your stack rendered in real-time
5. **Adjust settings** - Change layer spacing, render mode, enable auto-rotation
6. **Export** - Export as rotation sheet, GIF, or layer strip for your game engine

## License

MIT License
