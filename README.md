# Three.js Base Template

A clean, easy-to-use Vite + Three.js starter template with model loading utilities and basic controls.

## Features

- ⚡ **Vite** for fast development
- 🎨 **Three.js** scene setup with lighting and helpers
- 🎮 **OrbitControls** for easy camera navigation
- 📦 **Easy model loading** with GLTF/GLB support
- 🎯 **DRACO compression** support for optimized models
- 🌓 **Shadows** enabled by default
- 📐 **Grid and axes helpers** for reference

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the dev server at `http://localhost:3000`

### Build

```bash
npm run build
```

## Adding Models

1. Place your `.glb` or `.gltf` model files in the `/public/models/` directory
2. Import and use the `loadModel` function in your code:

```javascript
import { loadModel } from './modelLoader.js';

// Simple usage
loadModel('/models/my-model.glb');

// With options
loadModel('/models/my-model.glb', {
  position: [0, 0, 0],      // [x, y, z] or Vector3
  scale: 1,                 // number (uniform) or [x, y, z] or Vector3
  rotation: [0, 0, 0],      // [x, y, z] in radians or Euler
  shadows: true             // enable/disable shadows (default: true)
});
```

### Load Multiple Models

```javascript
import { loadModels } from './modelLoader.js';

loadModels([
  { path: '/models/model1.glb', options: { position: [-2, 0, 0] } },
  { path: '/models/model2.glb', options: { position: [2, 0, 0], scale: 1.5 } }
]);
```

## Controls

- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out

## Project Structure

```
three-base/
├── public/
│   └── models/          # Place your 3D models here
├── src/
│   ├── main.js          # Main Three.js scene setup
│   ├── modelLoader.js   # Model loading utilities
│   └── example.js       # Usage examples
├── index.html
├── package.json
└── vite.config.js
```

## Customization

### Scene Background

Edit `src/main.js`:
```javascript
scene.background = new THREE.Color(0x1a1a1a); // Change color
// or use a texture
scene.background = new THREE.TextureLoader().load('/path/to/texture.jpg');
```

### Lighting

Adjust lights in `src/main.js`:
```javascript
// Ambient light intensity
ambientLight.intensity = 0.5;

// Directional light position and intensity
directionalLight.position.set(10, 10, 5);
directionalLight.intensity = 0.8;
```

### Camera Position

```javascript
camera.position.set(5, 5, 5); // [x, y, z]
```

## Tips

- Use `.glb` format for better performance (single binary file)
- Compress models with DRACO for smaller file sizes
- Check browser console for loading progress and errors
- Models are automatically added to the scene with shadows enabled

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [GLTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)
- [Vite Documentation](https://vitejs.dev/)

Happy coding! 🚀
# wrapup
