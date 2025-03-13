import { loadModel } from './modelLoader.js';
import { setupUI } from './ui.js';
import { setupRaycaster } from './raycaster.js';
import { controls } from './controls.js';
import { scene, renderer, camera } from './scene.js';
import { updateZoomLimits } from './controls.js';  // Ensure this function is imported

const descriptions = {
    'BKLM': 'This part is part of the BKLM mechanism.',
    'Mesh001': 'This is the main structure of the model.',
    'Mesh023': 'This part connects various components.',
    'physical_B4C': 'This is a physical component made of B4C.',
    'ForwardEndplate': 'This is the forward end plate.',
    'ECL': 'This part is an essential component of the ECL system.',
};

// Load the model
// main.js

// Load the model
loadModel((model) => {
    setupUI(model);
    setupRaycaster(descriptions);

    // Call updateZoomLimits immediately after loading the model
    updateZoomLimits();  // This will initialize the zoom limits from the start
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

