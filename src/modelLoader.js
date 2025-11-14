import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Model loader setup
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
gltfLoader.setDRACOLoader(dracoLoader);

// Scene and camera references
let sceneRef = null;
let cameraRef = null;
let controlsRef = null;

// Initialize scene reference (called from main.js after scene is created)
export function setScene(scene) {
  sceneRef = scene;
}

// Initialize camera and controls references
export function setCamera(camera, controls) {
  cameraRef = camera;
  controlsRef = controls;
}

/**
 * Easy function to load GLTF/GLB models
 * @param {string} path - Path to model file (relative to /public)
 * @param {Object} options - Optional configuration
 * @param {THREE.Vector3|Array} options.position - Position [x, y, z] or Vector3
 * @param {THREE.Vector3|Array|number} options.scale - Scale [x, y, z], Vector3, or uniform scale number
 * @param {THREE.Euler|Array} options.rotation - Rotation [x, y, z] in radians or Euler
 * @param {boolean} options.shadows - Enable shadows (default: true)
 * @param {boolean} options.useCamera - Use camera from GLB if available (default: false)
 * @returns {Promise<{model: THREE.Group, cameras: Array, animations: THREE.AnimationClip[]}>} The loaded model and metadata
 */
export async function loadModel(path, options = {}) {
  return new Promise((resolve, reject) => {
    // Log the path being loaded for debugging
    console.log('ModelLoader: Attempting to load from path:', path);
    
    gltfLoader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        
        // Apply position
        if (options.position) {
          if (Array.isArray(options.position)) {
            model.position.set(...options.position);
          } else {
            model.position.copy(options.position);
          }
        }
        
        // Apply scale
        if (options.scale !== undefined) {
          if (typeof options.scale === 'number') {
            model.scale.setScalar(options.scale);
          } else if (Array.isArray(options.scale)) {
            model.scale.set(...options.scale);
          } else {
            model.scale.copy(options.scale);
          }
        }
        
        // Apply rotation
        if (options.rotation) {
          if (Array.isArray(options.rotation)) {
            model.rotation.set(...options.rotation);
          } else {
            model.rotation.copy(options.rotation);
          }
        }
        
        // Enable shadows (default: true)
        const enableShadows = options.shadows !== false;
        if (enableShadows) {
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
        }
        
        if (!sceneRef) {
          reject(new Error('Scene not initialized. Make sure main.js has set up the scene.'));
          return;
        }
        
        sceneRef.add(model);
        
        // Handle cameras from GLB
        const cameras = gltf.cameras || [];
        if (options.useCamera && cameras.length > 0 && cameraRef) {
          // Find camera nodes in the scene
          // In GLTF, cameras can be:
          // 1. Direct camera objects in the scene
          // 2. Nodes that have cameras attached (via parser)
          // 3. Nodes with camera references
          const cameraNodes = [];
          const cameraObjects = [];
          
          model.traverse((node) => {
            // Check if this node is a camera
            if (node.isCamera) {
              cameraObjects.push(node);
              cameraNodes.push(node);
            }
            
            // Check if node has a camera attached (GLTFLoader attaches cameras to nodes)
            if (node.children) {
              node.children.forEach(child => {
                if (child.isCamera && !cameraObjects.includes(child)) {
                  cameraObjects.push(child);
                  cameraNodes.push(node); // Use parent node for transform
                }
              });
            }
          });
          
          // Also check for camera nodes by common names
          const namedCameraNode = model.getObjectByName('Camera') || 
                                 model.getObjectByName('Main Camera') ||
                                 model.getObjectByName('camera') ||
                                 model.getObjectByName('MainCamera') ||
                                 model.children.find(child => 
                                   child.name && child.name.toLowerCase().includes('camera')
                                 );
          
          if (namedCameraNode && !cameraNodes.includes(namedCameraNode)) {
            cameraNodes.push(namedCameraNode);
          }
          
          // Use the first camera found
          let cameraToUse = null;
          let transformNode = null;
          
          if (cameraObjects.length > 0) {
            // Use the first camera object
            cameraToUse = cameraObjects[0];
            transformNode = cameraToUse.parent || cameraToUse;
          } else if (cameraNodes.length > 0) {
            // Use the first camera node
            transformNode = cameraNodes[0];
            // Check if the node itself is a camera
            if (transformNode.isCamera) {
              cameraToUse = transformNode;
            }
          }
          
          if (transformNode) {
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            
            transformNode.getWorldPosition(worldPos);
            transformNode.getWorldQuaternion(worldQuat);
            
            // Copy position and rotation
            cameraRef.position.copy(worldPos);
            cameraRef.rotation.copy(worldQuat.toEuler(new THREE.Euler()));
            
            // Copy camera properties if we found a camera object
            if (cameraToUse && cameraToUse.isPerspectiveCamera) {
              cameraRef.fov = cameraToUse.fov;
              cameraRef.aspect = window.innerWidth / window.innerHeight;
              cameraRef.near = cameraToUse.near;
              cameraRef.far = cameraToUse.far;
            } else if (cameras[0] && cameras[0].isPerspectiveCamera) {
              // Fallback to camera definition
              cameraRef.fov = cameras[0].fov;
              cameraRef.aspect = window.innerWidth / window.innerHeight;
              cameraRef.near = cameras[0].near;
              cameraRef.far = cameras[0].far;
            }
            
            cameraRef.updateProjectionMatrix();
            
            if (controlsRef) {
              controlsRef.update();
            }
            console.log('📷 Using camera from GLB:', transformNode.name || 'Unnamed camera');
          } else {
            // If no camera node found, try to use the first camera definition
            const glbCamera = cameras[0];
            if (glbCamera && glbCamera.isPerspectiveCamera) {
              cameraRef.fov = glbCamera.fov;
              cameraRef.aspect = window.innerWidth / window.innerHeight;
              cameraRef.near = glbCamera.near;
              cameraRef.far = glbCamera.far;
              cameraRef.updateProjectionMatrix();
              console.log('📷 Using camera properties from GLB (no transform found)');
            }
          }
        }
        
        console.log(`✅ Model loaded: ${path}`, model);
        console.log(`📷 Cameras found: ${cameras.length}`);
        console.log(`🎬 Animations found: ${gltf.animations?.length || 0}`);
        
        resolve({
          model,
          cameras,
          animations: gltf.animations || []
        });
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading ${path}: ${percent.toFixed(0)}%`);
        }
      },
      (error) => {
        console.error(`❌ Error loading model ${path}:`, error);
        reject(error);
      }
    );
  });
}

/**
 * Load multiple models at once
 * @param {Array} models - Array of { path, options } objects
 * @returns {Promise<Array>} Array of loaded models
 */
export async function loadModels(models) {
  return Promise.all(models.map(({ path, options }) => loadModel(path, options)));
}
