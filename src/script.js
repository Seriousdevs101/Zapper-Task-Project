
import * as THREE from 'three';
import * as ZapparThree from '@zappar/zappar-threejs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import ZapparSharing from '@zappar/sharing';
import * as dat from 'lil-gui';


/**
 * Scene
 */
// Basic Scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);


// Check for browser compatibility
if (ZapparThree.browserIncompatible()) {
 
  ZapparThree.browserIncompatibleUI();

  throw new Error('Unsupported browser');
}

// loading Manager
const manager = new ZapparThree.LoadingManager();



/**
 * Sizes
 */
// window size
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});



/**
 * Debug
 */

const gui = new dat.GUI({width:300})


/**
 * Camera
 */
// Zappar Camera
const camera = new ZapparThree.Camera(
    {
        rearCameraSource:'csO9c0YpAf274OuCPUA53CNE0YHlIr2yXCi+SqfBZZ8=',
        userCameraSource: 'RKxXByjnabbADGQNNZqLVLdmXlS0YkETYCIbg+XxnvM='
    }
);
scene.background = camera.backgroundTexture;



// User permission to acess Camera
ZapparThree.permissionRequestUI().then((granted) => {

  if (granted) camera.start(true); 
  else ZapparThree.permissionDeniedUI();
});


// Webgl Context to process Image
ZapparThree.glContextSet(renderer.getContext());


// Set up a face tracker
const faceTracker = new ZapparThree.FaceTrackerLoader(manager).load();

// Alighning THe Tracker with the Camera
const faceTrackerGroup = new ZapparThree.FaceAnchorGroup(camera, faceTracker);
faceTrackerGroup.visible = false;

// THe object
const mask = new ZapparThree.HeadMaskMeshLoader().load();
faceTrackerGroup.add(mask);

// Adding THe face tracker to the scene
scene.add(faceTrackerGroup);




// Loading The 3D model 
const gltfLoader = new GLTFLoader(manager);

const micSrc = new URL('../static/models/micro.glb', import.meta.url).href;
gltfLoader.load(micSrc, (gltf) => {
  // Position the loaded content to overlay user's face
  gltf.scene.position.set(0.3, -1.3, 0);
  gltf.scene.scale.set(1.1, 1.1, 1.1);

  // Add the scene to the tracker group
  faceTrackerGroup.add(gltf.scene);
}, undefined, () => {
  console.log('An error ocurred loading the GLTF model');
});


// adding a UI slider to scale to scale the model
// debug tweeks

gui.add(mask.position, 'z', -30, 30, 0.01)




// Get canvas from dom
const canvas = document.querySelector('canvas');

// Convert canvas data to url

const url = canvas.toDataURL('image/jpeg', 0.8);

ZapparSharing({
  data: url,
  fileNamePrepend: 'Zappar',
  shareUrl: 'www.zappar.com',
  shareTitle: 'Hello World!',
  shareText: 'Hello World!',
  onSave: () => {
    console.log('Image was saved');
  },
  onShare: () => {
    console.log('Share button was pressed');
  },
  onClose: () => {
    console.log('Dialog was closed');
  },
}, {}, {
  SAVE: 'SAVE',
  SHARE: 'SHARE',
  NowOpenFilesAppToShare: 'Now open files app to share',
  TapAndHoldToSave: 'Tap and hold the image<br/>to save to your Photos app',
});





// Hide the 3D content when the face is out of view
faceTrackerGroup.faceTracker.onVisible.bind(() =>
 { 
    faceTrackerGroup.visible = true; 
});

faceTrackerGroup.faceTracker.onNotVisible.bind(() =>
 { 
    faceTrackerGroup.visible = false; 
});


// Add Ligtening
const directionalLight = new THREE.DirectionalLight('white', 1);
directionalLight.position.set(2, 5, 2);
directionalLight.lookAt(0, 0, 0);
scene.add(directionalLight);

// Ambient Light
const ambeintLight = new THREE.AmbientLight('white', 0.8);
scene.add(ambeintLight);


/**
 * Animation
 */
const clock = new THREE.Clock()

// Rendering The Scene
const tick = () =>
 {

    const elapsedTime = clock.getElapsedTime()

  // Update The Camera At each Frame
  camera.updateFrame(renderer);

  // Update the head mask at each Frame
  mask.updateFromFaceAnchorGroup(faceTrackerGroup);

  // Render The Scene
  renderer.render(scene, camera);

  // update the renderer on each frame
  requestAnimationFrame(tick);
}

// Start things off
tick();