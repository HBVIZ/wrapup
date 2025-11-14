import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
    x: 0,    // Horizontal position (left/right)
    y: 2,    // Vertical position (up/down) - higher = looking down more
    z: 5     // Distance from model (forward/back) - higher = further away
  },
  
  // Where the camera is looking at (target point)
  // Usually keep this at [0, 0, 0] to look at the model center
  target: {
    x: 0,    // Horizontal target
    y: 0,    // Vertical target (0 = model center)
    z: 0     // Depth target
  },
  
  // Camera field of view (how wide the view is)
  // Lower = zoomed in (like a telephoto lens)
  // Higher = wider view (like a wide-angle lens)
  fov: 50,  // Field of view in degrees (typical: 35-75)
  
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

// ============================================
// CAMERA HUD (Heads-Up Display)
// ============================================
function createCameraHUD() {
  const hud = document.createElement('div');
  hud.id = 'camera-hud';
  hud.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    z-index: 1000;
    min-width: 280px;
    max-height: 80vh;
    overflow-y: auto;
  `;
  
  hud.innerHTML = `
    <h3 style="margin: 0 0 15px 0; font-size: 14px; border-bottom: 1px solid #444; padding-bottom: 8px;">
      📷 Camera Controls
    </h3>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #aaa;">
        Position X (Left/Right):
      </label>
      <input type="range" id="cam-x" min="-20" max="20" step="0.1" value="${cameraConfig.position.x}" 
        style="width: 100%; margin-bottom: 5px;">
      <span id="cam-x-value" style="font-size: 10px; color: #0f0;">${cameraConfig.position.x.toFixed(1)}</span>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #aaa;">
        Position Y (Up/Down):
      </label>
      <input type="range" id="cam-y" min="-10" max="10" step="0.1" value="${cameraConfig.position.y}" 
        style="width: 100%; margin-bottom: 5px;">
      <span id="cam-y-value" style="font-size: 10px; color: #0f0;">${cameraConfig.position.y.toFixed(1)}</span>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #aaa;">
        Position Z (Distance):
      </label>
      <input type="range" id="cam-z" min="1" max="20" step="0.1" value="${cameraConfig.position.z}" 
        style="width: 100%; margin-bottom: 5px;">
      <span id="cam-z-value" style="font-size: 10px; color: #0f0;">${cameraConfig.position.z.toFixed(1)}</span>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #aaa;">
        Target Y (Look Height):
      </label>
      <input type="range" id="target-y" min="-5" max="5" step="0.1" value="${cameraConfig.target.y}" 
        style="width: 100%; margin-bottom: 5px;">
      <span id="target-y-value" style="font-size: 10px; color: #0f0;">${cameraConfig.target.y.toFixed(1)}</span>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #aaa;">
        Field of View (Zoom):
      </label>
      <input type="range" id="cam-fov" min="20" max="100" step="1" value="${cameraConfig.fov}" 
        style="width: 100%; margin-bottom: 5px;">
      <span id="cam-fov-value" style="font-size: 10px; color: #0f0;">${cameraConfig.fov}°</span>
    </div>
    
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #444;">
      <div style="font-size: 10px; color: #888; margin-bottom: 8px;">Current Position:</div>
      <div id="current-pos" style="font-size: 10px; color: #0ff; font-family: monospace;">
        X: ${camera.position.x.toFixed(2)}<br>
        Y: ${camera.position.y.toFixed(2)}<br>
        Z: ${camera.position.z.toFixed(2)}
      </div>
    </div>
    
    <button id="reset-camera" style="
      margin-top: 15px;
      width: 100%;
      padding: 8px;
      background: #333;
      color: white;
      border: 1px solid #555;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    ">Reset to Default</button>
    
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #444;">
      <div style="font-size: 9px; color: #666; line-height: 1.4;">
        💡 Tip: Adjust sliders to reposition camera in real-time. 
        Copy the values to cameraConfig in main.js to save them.
      </div>
    </div>
  `;
  
  document.body.appendChild(hud);
  
  // Add event listeners
  const camX = document.getElementById('cam-x');
  const camY = document.getElementById('cam-y');
  const camZ = document.getElementById('cam-z');
  const targetY = document.getElementById('target-y');
  const camFov = document.getElementById('cam-fov');
  const resetBtn = document.getElementById('reset-camera');
  
  function updateCamera() {
    camera.position.set(
      parseFloat(camX.value),
      parseFloat(camY.value),
      parseFloat(camZ.value)
    );
    controls.target.set(
      cameraConfig.target.x,
      parseFloat(targetY.value),
      cameraConfig.target.z
    );
    camera.fov = parseFloat(camFov.value);
    camera.updateProjectionMatrix();
    controls.update();
    
    // Update display values
    document.getElementById('cam-x-value').textContent = parseFloat(camX.value).toFixed(1);
    document.getElementById('cam-y-value').textContent = parseFloat(camY.value).toFixed(1);
    document.getElementById('cam-z-value').textContent = parseFloat(camZ.value).toFixed(1);
    document.getElementById('target-y-value').textContent = parseFloat(targetY.value).toFixed(1);
    document.getElementById('cam-fov-value').textContent = parseFloat(camFov.value) + '°';
    
    // Update current position
    const posEl = document.getElementById('current-pos');
    posEl.innerHTML = `
      X: ${camera.position.x.toFixed(2)}<br>
      Y: ${camera.position.y.toFixed(2)}<br>
      Z: ${camera.position.z.toFixed(2)}
    `;
  }
  
  camX.addEventListener('input', updateCamera);
  camY.addEventListener('input', updateCamera);
  camZ.addEventListener('input', updateCamera);
  targetY.addEventListener('input', updateCamera);
  camFov.addEventListener('input', updateCamera);
  
  resetBtn.addEventListener('click', () => {
    camX.value = cameraConfig.position.x;
    camY.value = cameraConfig.position.y;
    camZ.value = cameraConfig.position.z;
    targetY.value = cameraConfig.target.y;
    camFov.value = cameraConfig.fov;
    updateCamera();
  });
  
  // Update current position display in animation loop
  return () => {
    const posEl = document.getElementById('current-pos');
    if (posEl) {
      posEl.innerHTML = `
        X: ${camera.position.x.toFixed(2)}<br>
        Y: ${camera.position.y.toFixed(2)}<br>
        Z: ${camera.position.z.toFixed(2)}
      `;
    }
  };
}

// Create the HUD
const updateHUD = createCameraHUD();

// Load the airwrap model
// Use import.meta.env.BASE_URL to get the base path for GitHub Pages
const basePath = import.meta.env.BASE_URL;
loadModel(`${basePath}models/test-models-air.glb`, {
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
  
  // Update HUD display
  if (updateHUD) updateHUD();
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
