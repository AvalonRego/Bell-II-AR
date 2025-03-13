import { camera } from './scene.js';
import { renderer } from './scene.js';

export function resizeRenderer() {
    const width = window.innerWidth;
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', resizeRenderer);
resizeRenderer();
