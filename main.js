import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a1a');
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
let keyModel;

// --- Camera Positions ---
const defaultPosition = new THREE.Vector3(1, 3, 40);
const registerAdmPosition = new THREE.Vector3(50, 5, 1); // Adm Camera Position
const registerUserPosition = new THREE.Vector3(-50, 5, 1); //User Camera Position
const topViewPosition = new THREE.Vector3(4, 17, 3.0);
const openingLockerPosition = new THREE.Vector3(1, 5, 2);
let targetPosition = defaultPosition.clone(); // The camera will constantly chase this vector

camera.position.copy(defaultPosition);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// Animation Variables
const clock = new THREE.Clock();
let mixer;
let lockerAction; 

// Loader
new GLTFLoader().load('locker.glb', (gltf) => {
    scene.add(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);
    const clip = THREE.AnimationClip.findByName(gltf.animations, 'OpenLocker');

    if (clip) {
        lockerAction = mixer.clipAction(clip);
        lockerAction.setLoop(THREE.LoopOnce);
        lockerAction.clampWhenFinished = true;
    }
});

new GLTFLoader().load('key.glb', (gltf) => {
    keyModel = gltf.scene
// Position, scale, and rotate the key so it's visible
    keyModel.position.set(0, 2, 2);  // X, Y, Z coordinates
    keyModel.scale.set(0.2, 0.2, 0.2); // Shrink it if the asset is too massive
    keyModel.rotation.set(0, Math.PI / 4, 0); // Rotate 45 degrees on Y axis
    
    scene.add(keyModel);
    
    // Note: If the key has its own animations, you would set up 
    // a separate AnimationMixer here, just like you did for the locker.
});

// UI Event Listeners
const btnEnter = document.getElementById('btn-enter');
const btnRegister = document.getElementById('btn-register');
const btnExit = document.getElementById('btn-exit');

btnEnter.addEventListener('click', () => {
    if (lockerAction) {
        lockerAction.paused = false;
        lockerAction.timeScale = 1; 
        lockerAction.play();
        
        btnEnter.style.display = 'none';
        btnRegister.style.display = 'none';
        btnExit.style.display = 'block';
    }
});

btnExit.addEventListener('click', () => {
    // Reset camera position back to default when exiting
    targetPosition.copy(defaultPosition);

    if (lockerAction) {
        lockerAction.paused = false;
        lockerAction.timeScale = -1; 
        lockerAction.play();

        btnExit.style.display = 'none';
        btnEnter.style.display = 'block';
        btnRegister.style.display = 'block';
    }
});

btnRegister.addEventListener('click', () => {
    // Move camera to the registration viewpoint
    targetPosition.copy(openingLockerPosition);
    
    // Optional UI toggles for the register state
    btnEnter.style.display = 'none';
    btnRegister.style.display = 'none';
    btnExit.style.display = 'block';
});

// Resize & Animation Loop
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    
    // Smoothly interpolate the camera position toward the target position
    // 0.05 controls the speed/smoothing. Lower = slower and smoother.
    camera.position.lerp(targetPosition, 0.05);
    
    // Optional: Keep the camera focused on the center of the scene while moving
    camera.lookAt(0, 2, 0); 

    renderer.render(scene, camera);
}
animate();