// animate.js
import { renderer } from './renderer.js';
import { scene } from './scene.js';
import { camera } from './camera.js';
import { controls } from './controls.js';
export function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}