import * as THREE from 'three';

// Set up the camera position for better view of the model
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);  // This should be an appropriate distance for your model
camera.lookAt(0, 0, 0);         // Ensure the camera is looking at the center of the scene or model
