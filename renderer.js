// renderer.js
import * as THREE from 'three';
import { camera } from './camera.js';
import { scene } from './scene.js';
export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);