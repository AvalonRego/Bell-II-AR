// controls.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { camera } from './scene.js';
import { renderer } from './scene.js';

// Orbit controls setup
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.005; // Minimum zoom distance, will be updated dynamically
controls.maxDistance = 50; // Initial max distance

// Function to update both min and max zoom distance based on visible objects
// Accept componentDistances as an argument to update zoom limits dynamically
// controls.js

// Function to update both min and max zoom distance based on visible objects
export function updateZoomLimits(componentDistances) {
    if (!componentDistances || componentDistances.length === 0) return;

    // Filter visible components
    const visibleComponents = componentDistances.filter(component => component.object.visible);

    // If no visible components, set minDistance to 0.005 as default
    if (visibleComponents.length === 0) {
        controls.minDistance = 0.005;
    } else {
        // Get the largest distance among visible components
        const largestDistance = Math.max(...visibleComponents.map(component => component.distance));
        controls.minDistance = largestDistance/700; // Set minDistance to largest visible distance
    }

    console.log('Updated Min Distance:', controls.minDistance);
}


// Function to ensure the camera is not zooming through the object
export function updateZoomOnVisibilityChange(componentDistances) {
    updateZoomLimits(componentDistances);  // Recalculate zoom limits when visibility changes
}