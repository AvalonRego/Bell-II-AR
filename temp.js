import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);

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

// Function to toggle object visibility efficiently
function toggleObjectVisibility(objectName, isVisible) {
    scene.traverse((child) => {
        if (child.isMesh) {
            // Clean the object name to match against UI names
            let cleanedName = child.name.replace(/\d+/g, '').replace(/__+/g, '_').replace(/_$/, '');
            if (cleanedName === objectName) {
                child.visible = isVisible;
            }
        }
    });
}

// Load GLTF model with DRACO support
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@0.155.0/examples/jsm/libs/draco/');
loader.setDRACOLoader(dracoLoader);

loader.load('public/BelleIIModel.gltf', (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.001, 0.001, 0.001);
    scene.add(model);

    // Collect unique names for UI component list
    const uniqueNames = new Set();
    model.traverse((child) => {
        if (child.isMesh) {
            let cleanedName = child.name.replace(/\d+/g, '').replace(/__+/g, '_').replace(/_$/, '');
            uniqueNames.add(cleanedName);
        }
    });

    // UI: Searchable Dropdown for Components
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

    // Populate component list with checkboxes
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

// Optimized Raycasting - Only considers meshes
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Pre-filter scene to only check meshes
    const objects = [];
    scene.traverse((child) => {
        if (child.isMesh) objects.push(child);
    });
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        selectedObjects.forEach(obj => obj.material.emissive.set(0x000000));
        selectedObjects.clear();
        selectedObjects.add(clickedObject);
        if (clickedObject.material.emissive) clickedObject.material.emissive.set(0xff0000);
        
        let description = descriptions[Object.keys(descriptions).find(key => clickedObject.name.includes(key))] || 'No description available.';
        document.getElementById('infoText').textContent = `Selected: ${clickedObject.name}. ${description}`;
        document.getElementById('infoBox').style.display = 'block';
    } else {
        selectedObjects.forEach(obj => obj.material.emissive.set(0x000000));
        selectedObjects.clear();
        document.getElementById('infoBox').style.display = 'none';
    }
});

// Handle screen resizing
function resizeRenderer() {
    const width = window.innerWidth;
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', resizeRenderer);
resizeRenderer();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
