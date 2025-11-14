// Example usage of the model loader
// Import this in main.js or use it as a reference

import { loadModel, loadModels } from './modelLoader.js';

// Example 1: Load a single model with default settings
// loadModel('/models/my-model.glb');

// Example 2: Load a model with position
// loadModel('/models/my-model.glb', {
//   position: [0, 0, 0]
// });

// Example 3: Load a model with all options
// loadModel('/models/my-model.glb', {
//   position: [2, 0, -3],
//   scale: 0.5, // uniform scale
//   rotation: [0, Math.PI / 4, 0], // 45 degrees on Y axis
//   shadows: true
// });

// Example 4: Load multiple models at once
// loadModels([
//   { path: '/models/model1.glb', options: { position: [-2, 0, 0] } },
//   { path: '/models/model2.glb', options: { position: [2, 0, 0], scale: 1.5 } },
//   { path: '/models/model3.glb', options: { position: [0, 2, 0] } }
// ]);

// Uncomment the examples above and add your model paths to use them!
