import * as THREE from 'three';
import { scene } from './scene.js';

// Ambient light should remain the same
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Increase intensity for directional light and ensure it has a better position
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Increase intensity from 0.6 to 1
directionalLight.position.set(5, 10, 7.5); // Keep this position or adjust as needed
scene.add(directionalLight);
