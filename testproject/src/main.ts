//npm run dev

import './style.css'
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

//follow will be watched by autoresize and autotranspose (camera)
var FOLLOWGC : boolean = true; 
var relativeCamera :THREE.Vector3 = new THREE.Vector3(
  0,
  0,
  1000);

var scene : THREE.Scene = new THREE.Scene();

//"near" and "far" are the range of the camera's view or View Frustrum
var aspectRatio : number= window.innerWidth / window.innerHeight;

var FRUSTUMSIZE : number= 100; //100 verticle units
var camera : THREE.OrthographicCamera = new THREE.OrthographicCamera(
  FRUSTUMSIZE * aspectRatio / -2,
  FRUSTUMSIZE * aspectRatio / 2,
  FRUSTUMSIZE / 2,
  FRUSTUMSIZE / -2,
  //notice: live updates should be followed by camera.updateProjectionMatrix()
);  
camera.position.set(0, 0, 1000); 
//position does not matter as much in orthographic camera
//only relative direction (functionally infinite distance)
//Should be used only for centering objects in the scene

camera.lookAt(0, 0, 0);

const canvas = document.querySelector('#bg') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found #1 (Main)');
}

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.05; // Damping factor for smooth motion
controls.screenSpacePanning = true; // Enable panning in screen space
controls.minZoom = 0.5; // Set minimum zoom level
controls.maxZoom = 10; // Set maximum zoom level


let OBJECTS: THREE.Mesh[] = [];
const geometry = new THREE.SphereGeometry(1);
const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

const D:number = 3;

for(let i= 0; i< 3; i++){
  OBJECTS.push(new THREE.Mesh(geometry, material));
  scene.add(OBJECTS[i]);
}
OBJECTS[0].position.set(0,0,0);
OBJECTS[1].position.set(0,20,200);
OBJECTS[2].position.set(20,0,0);

var GC: THREE.Vector3 = new THREE.Vector3(0,0,0);

updateGC();


const GRIDSIZE: number=1000
const GRIDDIV: number=100
// const gridHelper = new THREE.GridHelper(gridSize,gridDiv); //size, divisions- being divisions over the entire size (100/1000) = 10 unit width squares
var gridHelper = new THREE.GridHelper(1000,100); //this didnt work previously
gridHelper.rotation.x = Math.PI / 2 ;

function UpdateGrid(): void{
  //information from constructor: https://github.com/mrdoob/three.js/blob/master/src/helpers/GridHelper.js
  gridHelper.dispose();
  gridHelper = new THREE.GridHelper(GRIDSIZE, GRIDDIV); //must be done - due to the nature of how grids work (by drawing tons of verices- this is done in the constructor.)
}

scene.add(gridHelper);
//Dont need if MeshBasicMaterial is used AOT MeshStandardMaterial
// const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
// scene.add(ambientLight);


function animate() :void {
  requestAnimationFrame(animate);


  controls.update(); //apparently this is not required.
  if(FOLLOWGC){
    autoCameraPosition();
    autoCameraFrustumResize();
  }
  updateSidebar();

  //recursive infite loop
  renderer.render(scene, camera);
}

//
animate();


window.addEventListener('resize', () => {
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera.left = FRUSTUMSIZE * aspectRatio / -2;
  camera.right = FRUSTUMSIZE * aspectRatio / 2;
  camera.top = FRUSTUMSIZE / 2;
  camera.bottom = FRUSTUMSIZE / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function roundToString(value:number, decimals:number) : String{
  return value.toPrecision(decimals);
}

function updateSidebar(): void{
  var sidebarF = document.getElementById('sidebar-cfrust');
  var sidebarP = document.getElementById('sidebar-cpos');
  var sidebarZ = document.getElementById('sidebar-czoom');
  var sidebarGrid = document.getElementById('sidebar-gridspacing');
  var sidebarFrame = document.getElementById('sidebar-framenumber');

  if (!sidebarF || !sidebarP || !sidebarZ || !sidebarGrid || !sidebarFrame) {
    throw new Error('Canvas element not found #2');
  }

  sidebarF.textContent= `Camera Frustum: ${roundToString(camera.left,1)}, ${roundToString(camera.right,1)}, ${roundToString(camera.top,1)}, ${roundToString(camera.bottom,1)}`;
  sidebarP.textContent= `Camera Position: ${roundToString(camera.position.x,1)}, ${roundToString(camera.position.y, 1)}, ${roundToString(camera.position.z, 1)}`;
  sidebarZ.textContent= `Camera Zoom: ${roundToString(camera.zoom, 1)}`;
  sidebarGrid.textContent= `Grid Spacing: ${GRIDSIZE / GRIDDIV}`;
  sidebarFrame.textContent= `Frame Number: N/A`;   // to be later changed
}

function updateCameraFrustum(): void{
  //update frustrumSize before calling this function
  camera.left = FRUSTUMSIZE * aspectRatio / -2;
  camera.right = FRUSTUMSIZE * aspectRatio / 2;
  camera.top = FRUSTUMSIZE / 2;
  camera.bottom = FRUSTUMSIZE / -2;
  camera.updateProjectionMatrix();
}

function calculateRotationMatrixXY() : number[][] {
  const cameraPosition = camera.position.clone();
  const translatedGC = GC.sub(cameraPosition);
  const thetaY = Math.atan2(translatedGC.x, translatedGC.z);
  const thetaX = Math.atan2(translatedGC.y, translatedGC.z);
  return rotationMatrixXY(-thetaX,-thetaY);
// Step 2: Calculate the angles for rotation


}
// Multiplied Rotation matricies about the x and y axis
function rotationMatrixXY(angleX:number,angleY:number): number[][] {
  return [
    [Math.cos(angleY)                    , 0                , Math.sin(angleY)],
    [Math.sin(angleX)*Math.sin(angleY)   , Math.cos(angleX) , -Math.sin(angleX)*Math.cos(angleY)],
    [-Math.sin(angleY)*Math.cos(angleX)  , Math.sin(angleX) , Math.cos(angleX)*Math.cos(angleY)]
  ];
}

// Function to apply a rotation matrix to a vector
function matrixTimesVector(matrix: number[][], vector: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(
    matrix[0][0] * vector.x + matrix[0][1] * vector.y + matrix[0][2] * vector.z,
    matrix[1][0] * vector.x + matrix[1][1] * vector.y + matrix[1][2] * vector.z,
    matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * vector.z
  );
}

//only runs if followGC is true
function autoCameraPosition(): void{
  updateGC();
  updateCameraPosition();
}

function autoCameraFrustumResize(): void {
  // 1. Update GC - function
  // 2. Update Camera Position - function
  // 3. Recalibrate relativeCamera - function
  // 4. Update Camera Frustrum - need to calculate new frustrum:
  // 4a. Calculate new rotation matrix - function
  // 4b. find max/min x,y,z of all objects by multiplying with rotation matrix.
  //       Depending on the max/min, update the frustum size, whichever is larger
  //       note that width/length should be /aspectratio.
  // 4C- Update Camera Frustrum
  const rotationMatrix = calculateRotationMatrixXY();
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  for (let n = 0; n < OBJECTS.length; n++) { //where n is the objects, and 
    const transformed = matrixTimesVector(rotationMatrix, new THREE.Vector3(OBJECTS[n].position.x, OBJECTS[n].position.y, OBJECTS[n].position.z));
    max.max(transformed);
    min.min(transformed);
  }
 
  FRUSTUMSIZE= 1.25*  Math.max((max.x - min.x) / aspectRatio, max.y - min.y);
  camera.near= min.z * 0.8;
  camera.far= max.z * 0.8;
  updateCameraFrustum();
}
function recalibrateRelativeCamera(): void {
  //update relativeCamera to be implemented for orbital camera controls
  relativeCamera = camera.position.clone().sub(GC);
}
//in relation to relative view
function updateCameraPosition(): void{
  //update camera position
  camera.position.set(GC[0]+relativeCamera[0], GC[1]+relativeCamera[1], GC[2]+relativeCamera[2]);
}
function updateGC(): void{
  let temp = new THREE.Vector3(0,0,0);
  for (let n = 0; n < OBJECTS.length; n++){
    temp.add(OBJECTS[n].position);
  }
  temp.divideScalar(OBJECTS.length);
  GC = temp;
}