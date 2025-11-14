import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { loadModel, setScene, setCamera } from './modelLoader.js';

// Scene setup
const scene = new THREE.Scene();

// Initialize model loader with scene
setScene(scene);
scene.background = null; // Transparent background

// ============================================
// CAMERA CONFIGURATION - Easy to modify!
// ============================================
// Adjust these values to reposition your camera:
const cameraConfig = {
  // Camera position - where the camera is located in 3D space
  // X: left (-) to right (+)
  // Y: down (-) to up (+)
  // Z: back (-) to front (+)
  position: {
    x: 0.0,    // Horizontal position (left/right)
    y: 2.0,    // Vertical position (up/down) - higher = looking down more
    z: 6.8     // Distance from model (forward/back) - higher = further away
  },
  
  // Where the camera is looking at (target point)
  // Usually keep this at [0, 0, 0] to look at the model center
  target: {
    x: 0,    // Horizontal target
    y: 2.0,    // Vertical target (0 = model center)
    z: 0     // Depth target
  },
  
  // Camera field of view (how wide the view is)
  // Lower = zoomed in (like a telephoto lens)
  // Higher = wider view (like a wide-angle lens)
  fov: 55,  // Field of view in degrees (typical: 35-75)
  
  // Camera near and far clipping planes
  near: 0.1,  // Objects closer than this won't render
  far: 1000   // Objects farther than this won't render
};

// Create the camera with the configuration
const camera = new THREE.PerspectiveCamera(
  cameraConfig.fov,
  window.innerWidth / window.innerHeight,
  cameraConfig.near,
  cameraConfig.far
);

// Set camera position
camera.position.set(
  cameraConfig.position.x,
  cameraConfig.position.y,
  cameraConfig.position.z
);

// Make camera look at the target point
camera.lookAt(
  cameraConfig.target.x,
  cameraConfig.target.y,
  cameraConfig.target.z
);

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

// Set the target point for orbit controls (where camera orbits around)
controls.target.set(
  cameraConfig.target.x,
  cameraConfig.target.y,
  cameraConfig.target.z
);
controls.update();

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

// Toggle button for Axes Helper
const axesToggle = document.createElement('button');
axesToggle.textContent = 'Hide Axes';
axesToggle.style.cssText = `
  position: fixed;
  top: 120px;
  left: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  z-index: 1001;
  font-family: monospace;
`;
let axesVisible = true;
axesToggle.addEventListener('click', () => {
  axesVisible = !axesVisible;
  axesHelper.visible = axesVisible;
  axesToggle.textContent = axesVisible ? 'Hide Axes' : 'Show Axes';
});
document.body.appendChild(axesToggle);

// ============================================
// STATS HUD (Performance Monitor)
// ============================================
// Create Stats.js performance monitor
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.dom.style.position = 'absolute';
stats.dom.style.top = '0px';
stats.dom.style.left = '0px';
stats.dom.style.zIndex = '1000';
document.body.appendChild(stats.dom);

// Toggle button for Stats
const statsToggle = document.createElement('button');
statsToggle.textContent = 'Hide Stats';
statsToggle.style.cssText = `
  position: fixed;
  top: 80px;
  left: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  z-index: 1001;
  font-family: monospace;
`;
let statsVisible = true;
statsToggle.addEventListener('click', () => {
  statsVisible = !statsVisible;
  stats.dom.style.display = statsVisible ? 'block' : 'none';
  statsToggle.textContent = statsVisible ? 'Hide Stats' : 'Show Stats';
});
document.body.appendChild(statsToggle);

// Load the airwrap model
// Use import.meta.env.BASE_URL to get the base path for GitHub Pages
const basePath = import.meta.env.BASE_URL;
loadModel(`${basePath}models/test-models-air.glb`, {
  position: [0, 0, 0],
  scale: 1,
  useCamera: false // Don't use camera from GLB - use our configured camera instead
}).then((result) => {
  console.log('Airwrap model loaded successfully!', result.model);
  
  // Ensure camera is positioned correctly after model loads
  camera.position.set(
    cameraConfig.position.x,
    cameraConfig.position.y,
    cameraConfig.position.z
  );
  controls.target.set(
    cameraConfig.target.x,
    cameraConfig.target.y,
    cameraConfig.target.z
  );
  camera.fov = cameraConfig.fov;
  camera.updateProjectionMatrix();
  controls.update();
  
  if (result.cameras.length > 0) {
    console.log(`Found ${result.cameras.length} camera(s) in GLB (not using them)`);
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
  
  // Update stats (FPS counter)
  stats.update();
  
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
