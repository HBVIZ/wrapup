import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadModel, setScene, setCamera } from './modelLoader.js';

// Scene setup
const scene = new THREE.Scene();

// Initialize model loader with scene
setScene(scene);
scene.background = null; // Transparent background

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 5);

// Renderer
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  alpha: true // Enable transparency
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 100;

// Initialize model loader with camera and controls
setCamera(camera, controls);

// ============================================
// LIGHTING CONFIGURATION - Easy to modify!
// ============================================
const lightingConfig = {
  // Hemisphere light for atmospheric ambient lighting
  hemisphere: {
    skyColor: 0xffffff,      // Color from above
    groundColor: 0x888888,   // Color from below (lighter)
    intensity: 1.2           // Overall ambient intensity (increased for brightness)
  },
  
  // Soft directional lights from all axes
  directional: {
    enabled: true,
    intensity: 0.8,          // Soft intensity (increased for brightness)
    color: 0xffffff,         // Light color
    // Lights positioned from different directions
    positions: [
      { x: 5, y: 5, z: 5 },    // Top-right-front
      { x: -5, y: 5, z: -5 },  // Top-left-back
      { x: 5, y: -5, z: -5 },  // Bottom-right-back
      { x: -5, y: -5, z: 5 },  // Bottom-left-front
      { x: 0, y: 10, z: 0 },   // Top
      { x: 0, y: -10, z: 0 },  // Bottom
      { x: 10, y: 0, z: 0 },   // Right
      { x: -10, y: 0, z: 0 },  // Left
      { x: 0, y: 0, z: 10 },   // Front
      { x: 0, y: 0, z: -10 }   // Back
    ]
  },
  
  // Additional ambient fill light
  ambient: {
    enabled: true,
    color: 0xffffff,
    intensity: 0.8           // Soft fill light (increased for brightness)
  }
};

// ============================================
// SETUP LIGHTING
// ============================================

// Hemisphere light for soft atmospheric lighting
const hemisphereLight = new THREE.HemisphereLight(
  lightingConfig.hemisphere.skyColor,
  lightingConfig.hemisphere.groundColor,
  lightingConfig.hemisphere.intensity
);
scene.add(hemisphereLight);

// Ambient fill light
if (lightingConfig.ambient.enabled) {
  const ambientLight = new THREE.AmbientLight(
    lightingConfig.ambient.color,
    lightingConfig.ambient.intensity
  );
  scene.add(ambientLight);
}

// Soft directional lights from all axes
const directionalLights = [];
if (lightingConfig.directional.enabled) {
  lightingConfig.directional.positions.forEach((pos, index) => {
    const light = new THREE.DirectionalLight(
      lightingConfig.directional.color,
      lightingConfig.directional.intensity
    );
    light.position.set(pos.x, pos.y, pos.z);
    
    // Soft shadows (optional - can be disabled for better performance)
    // light.castShadow = true;
    // light.shadow.mapSize.width = 1024;
    // light.shadow.mapSize.height = 1024;
    // light.shadow.camera.near = 0.5;
    // light.shadow.camera.far = 50;
    // light.shadow.radius = 8; // Soft shadow blur
    
    scene.add(light);
    directionalLights.push(light);
  });
  console.log(`✨ Added ${directionalLights.length} soft directional lights`);
}

// Helper axes (grid removed for clean transparent scene)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Load the airwrap model
loadModel('/models/test-models-air.glb', {
  position: [0, 0, 0],
  scale: 1,
  useCamera: true // Use camera from GLB if available
}).then((result) => {
  console.log('Airwrap model loaded successfully!', result.model);
  if (result.cameras.length > 0) {
    console.log(`Found ${result.cameras.length} camera(s) in GLB`);
  }
  if (result.animations.length > 0) {
    console.log(`Found ${result.animations.length} animation(s) in GLB`);
  }
}).catch((error) => {
  console.error('Failed to load airwrap model:', error);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Export scene, camera, renderer for external use
export { scene, camera, renderer, controls };
