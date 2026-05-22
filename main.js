import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a1a');
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1, 3, 40);
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
    alert("Register Locker clicked!");
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
    renderer.render(scene, camera);
}
animate();