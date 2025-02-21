import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0); // Bright background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.005;
controls.maxDistance = 50;

// Raycaster for object selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObjects = new Set();

// Object descriptions
const descriptions = {
    'BKLM': 'This part is part of the BKLM mechanism.',
    'Mesh001': 'This is the main structure of the model.',
    'Mesh023': 'This part connects various components.',
    'physical_B4C': 'This is a physical component made of B4C.',
    'ForwardEndplate': 'This is the forward end plate.',
    'ECL': 'This part is an essential component of the ECL system.',
};

// Function to count selectable objects
function countSelectableObjects() {
    let selectableObjectCount = 0;
    scene.traverse((child) => {
        if (child.isMesh) {
            selectableObjectCount++;
        }
    });
    console.log(`Total selectable objects: ${selectableObjectCount}`);
}

// Load GLTF model with DRACO support
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@0.155.0/examples/jsm/libs/draco/');
loader.setDRACOLoader(dracoLoader);

loader.load('public/BelleIIModel.gltf', (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.001, 0.001, 0.001);
    model.position.set(0, 0, 0);
    scene.add(model);

    countSelectableObjects();

    // Add the toggle button at the top of the component list
    const sidebar = document.getElementById('sidebar');
    const componentList = document.getElementById('componentList');
    const toggleAllButton = document.createElement('button');
    toggleAllButton.textContent = 'Toggle All';
    toggleAllButton.style.display = 'block';
    toggleAllButton.style.marginBottom = '10px';
    toggleAllButton.addEventListener('click', () => {
        const allChecked = [...componentList.querySelectorAll('input[type=checkbox]')].every(cb => cb.checked);
        const newState = !allChecked;

        componentList.querySelectorAll('input[type=checkbox]').forEach(cb => {
            cb.checked = newState;
            cb.dispatchEvent(new Event('change')); // Trigger the change event
        });
    });
    sidebar.insertBefore(toggleAllButton, componentList);

    const uniqueNames = new Set();

    model.traverse((child) => {
        if (child.isMesh) {
            let cleanedName = child.name.replace(/\d+/g, ''); // Remove all numbers
            cleanedName = cleanedName.replace(/__+/g, '_'); // Remove duplicate underscores
            cleanedName = cleanedName.replace(/_$/, ''); // Remove trailing underscore if any
            uniqueNames.add(cleanedName);
        }
    });

    function sortComponentsByDistance(model) {
        let components = [];
        model.traverse((child) => {
            if (child.isMesh) {
                let distance = child.position.length(); // Distance from origin
                let cleanedName = child.name.replace(/\d+/g, ''); // Remove numbers
                cleanedName = cleanedName.replace(/__+/g, '_'); // Remove extra underscores
                cleanedName = cleanedName.replace(/_$/, ''); // Remove trailing underscores
                components.push({ name: cleanedName, distance });
            }
        });
        
        components.sort((a, b) => b.distance - a.distance); // Sort in descending order
        return components.map(c => c.name);
    }
    uniqueNames.forEach(name => {
        const listItem = document.createElement('li');
        listItem.textContent = name;
    
        const toggleCheckbox = document.createElement('input');
        toggleCheckbox.type = 'checkbox';
        toggleCheckbox.checked = true;
        toggleCheckbox.addEventListener('change', (event) => {
            toggleObjectVisibility(name, event.target.checked);
        });
    
        listItem.appendChild(toggleCheckbox);
        componentList.appendChild(listItem);
    });
    

}, undefined, (error) => {
    console.error('An error occurred while loading the model', error);
});

// Function to highlight all parts of the selected component
function highlightObjectByName(baseName) {
    scene.traverse((child) => {
        if (child.isMesh && child.name.replace(/\d+/g, '') === baseName) {
            if (child.material && "emissive" in child.material) {
                child.material.emissive.set(0xff0000);
            }
        }
    });
}



// Reference to the info box
const infoBox = document.getElementById('infoBox');
const infoText = document.getElementById('infoText');

function resizeRenderer() {
    const width = window.innerWidth;
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// Resize when the window or viewport changes
window.addEventListener('resize', resizeRenderer);
window.addEventListener('orientationchange', resizeRenderer);
window.addEventListener('scroll', resizeRenderer);
resizeRenderer();

function closeInfoBox() {
    infoBox.style.display = 'none';
    selectedObjects.forEach((obj) => {
        if (obj.material && "emissive" in obj.material) {
            obj.material.emissive.set(0x000000);
        }
    });
    selectedObjects.clear();
}

// Attach function to global scope
window.closeInfoBox = closeInfoBox;

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        if (selectedObjects.has(clickedObject)) {
            selectedObjects.delete(clickedObject);
            if (clickedObject.material && "emissive" in clickedObject.material) {
                clickedObject.material.emissive.set(0x000000);
            }
            infoBox.style.display = 'none';
        } else {
            selectedObjects.forEach((obj) => {
                if (obj.material && "emissive" in obj.material) {
                    obj.material.emissive.set(0x000000);
                }
            });
            selectedObjects.clear();

            selectedObjects.add(clickedObject);
            if (clickedObject.material && "emissive" in clickedObject.material) {
                clickedObject.material.emissive.set(0xff0000);
            }

            let description = 'No description available.';
            for (const key of Object.keys(descriptions)) {
                if (clickedObject.name.includes(key)) {
                    description = descriptions[key];
                    break;
                }
            }

            infoText.textContent = `Selected: ${clickedObject.name}. ${description}`;
            infoBox.style.display = 'block';
        }
    } else {
        selectedObjects.forEach((obj) => {
            if (obj.material && "emissive" in obj.material) {
                obj.material.emissive.set(0x000000);
            }
        });
        selectedObjects.clear();
        infoBox.style.display = 'none';
    }

    console.log(`Selected objects count: ${selectedObjects.size}`);
});

function toggleObjectVisibility(objectName, isVisible) {
    scene.traverse((child) => {
        if (child.isMesh) {
            let cleanedName = child.name.replace(/\d+/g, ''); // Remove numbers
            cleanedName = cleanedName.replace(/__+/g, '_'); // Remove extra underscores
            cleanedName = cleanedName.replace(/_$/, ''); // Remove trailing underscores
            
            if (cleanedName === objectName) {
                child.visible = isVisible;
            }
        }
    });
}


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
