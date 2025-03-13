// modelLoader.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { scene } from './scene.js';
import { updateZoomOnVisibilityChange } from './controls.js'; // Import the zoom update function

// Load GLTF model with DRACO support
export function loadModel(callback) {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.155.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load('public/BelleIIModel.gltf', (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.001, 0.001, 0.001);
        scene.add(model);

        // Call the callback with the model
        if (callback) callback(model);
    }, undefined, (error) => {
        console.error('An error occurred while loading the model', error);
    });
}

// Function to toggle object visibility efficiently
// modelLoader.js
// modelLoader.js

export function toggleObjectVisibility(objectName, isVisible, componentDistances) {
    scene.traverse((child) => {
        if (child.isMesh) {
            let cleanedName = child.name.replace(/\d+/g, '').replace(/__+/g, '_').replace(/_$/, '');
            if (cleanedName === objectName) {
                child.visible = isVisible; // Toggle visibility of the object
            }
        }
    });

    // After visibility change, update zoom limits dynamically
    updateZoomOnVisibilityChange(componentDistances);  // Trigger zoom adjustment based on visible components
}





