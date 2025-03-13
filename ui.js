// setupUI.js
import { controls, updateZoomLimits } from './controls.js';  // Import controls and updateZoomLimits function
import { toggleObjectVisibility } from './modelLoader.js';
import { camera } from './scene.js';  // Import camera to calculate distances
import * as THREE from 'three';  // Import THREE for geometry manipulations


export function setupUI(model) {
    const componentList = document.getElementById('componentList');
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search Components';
    searchInput.style.marginBottom = '10px';

    // Search bar filters component list dynamically
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        componentList.querySelectorAll('li').forEach((li) => {
            li.style.display = li.textContent.toLowerCase().includes(query) ? 'block' : 'none';
        });
    });
    componentList.parentNode.insertBefore(searchInput, componentList);

    // Collect objects and their distances
    const componentDistances = [];
    const uniqueNames = new Set();

    model.traverse((child) => {
        if (child.isMesh) {
            let cleanedName = child.name.replace(/\d+/g, '').replace(/__+/g, '_').replace(/_$/, '');
            if (!uniqueNames.has(cleanedName)) {
                uniqueNames.add(cleanedName);

                // Get geometry attributes for distance calculation
                const geometry = child.geometry;
                geometry.computeBoundingBox();  // Ensure bounding box is up to date

                // Calculate the closest vertex to the camera using position attribute
                const positionAttribute = geometry.attributes.position;
                let minDistance = Infinity;

                // Loop through all vertices
                for (let i = 0; i < positionAttribute.count; i++) {
                    const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, i); // Get vertex position
                    const worldPosition = vertex.clone().applyMatrix4(child.matrixWorld); // Convert to world coordinates
                    const distance = worldPosition.distanceTo(camera.position); // Distance to camera
                    minDistance = Math.min(minDistance, distance);
                }

                // Add the component to the array with the closest distance to the camera
                componentDistances.push({ name: cleanedName, distance: minDistance, object: child });

                console.log(`Object ${cleanedName} Closest Distance: ${minDistance.toFixed(2)} units`);
            }
        }
    });

    // Sort the components by their closest distance from the camera (ascending order)
    componentDistances.sort((a, b) => b.distance - a.distance);

    console.log('Sorted Components by Closest Distance from Camera:');
    componentDistances.forEach((component, index) => {
        console.log(`${index + 1}. ${component.name}: ${component.distance.toFixed(2)} units`);
    });

    // Set the min zoom value to the largest component distance
    const largestDistance = componentDistances[0]?.distance || 0;
    controls.minDistance = largestDistance;  // Set to largest visible distance
    console.log(`Setting min zoom distance to: ${controls.minDistance}`);

    // Pass componentDistances to updateZoomLimits
    updateZoomLimits(componentDistances);

    // Add "Toggle All Components" checkbox at the top
    const toggleAllCheckbox = document.createElement('input');
    toggleAllCheckbox.type = 'checkbox';
    toggleAllCheckbox.checked = true;
    toggleAllCheckbox.addEventListener('change', (event) => {
        const isVisible = event.target.checked;
        componentDistances.forEach((component) => {
            toggleObjectVisibility(component.name, isVisible, componentDistances);
        });
    });

    const toggleAllLabel = document.createElement('label');
    toggleAllLabel.textContent = 'Toggle All Components';
    toggleAllLabel.appendChild(toggleAllCheckbox);
    componentList.appendChild(toggleAllLabel);

    // Populate the component list with checkboxes, sorted by distance
    componentDistances.forEach((component) => {
        const listItem = document.createElement('li');
        listItem.textContent = component.name;

        const toggleCheckbox = document.createElement('input');
        toggleCheckbox.type = 'checkbox';
        toggleCheckbox.checked = true;
        toggleCheckbox.addEventListener('change', (event) => {
            toggleObjectVisibility(component.name, event.target.checked, componentDistances);
        });

        listItem.appendChild(toggleCheckbox);
        componentList.appendChild(listItem);
    });
}

// ui.js (or your appropriate UI handling file)

export function closeInfoBox() {
    const infoBox = document.getElementById('infoBox');
    if (infoBox) {
        infoBox.style.display = 'none'; // Hide the info box
    }
}
