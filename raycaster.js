// raycaster.js
import * as THREE from 'three';
import { scene } from './scene.js';
import { camera } from './scene.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObjects = new Set();

export function setupRaycaster(descriptions) {
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Pre-filter scene to only check visible meshes
        const objects = [];
        scene.traverse((child) => {
            if (child.isMesh && child.visible) objects.push(child); // Only consider visible meshes
        });
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            
            // Check if the clicked object is already selected
            if (selectedObjects.has(clickedObject)) {
                // Deselect the object if it was already selected
                selectedObjects.forEach(obj => obj.material.emissive.set(0x000000)); // Reset emissive color
                selectedObjects.clear(); // Clear selection
                document.getElementById('infoBox').style.display = 'none'; // Hide info box
            } else {
                // Deselect previous object
                selectedObjects.forEach(obj => obj.material.emissive.set(0x000000));
                selectedObjects.clear();
                
                // Select the new object
                selectedObjects.add(clickedObject);
                if (clickedObject.material.emissive) clickedObject.material.emissive.set(0xff0000); // Highlight in red
                
                let description = descriptions[Object.keys(descriptions).find(key => clickedObject.name.includes(key))] || 'No description available.';
                document.getElementById('infoText').textContent = `Selected: ${clickedObject.name}. ${description}`;
                document.getElementById('infoBox').style.display = 'block'; // Show info box
            }
        } else {
            // If no object was clicked, deselect all and hide info box
            selectedObjects.forEach(obj => obj.material.emissive.set(0x000000));
            selectedObjects.clear();
            document.getElementById('infoBox').style.display = 'none';
        }
    });
}
