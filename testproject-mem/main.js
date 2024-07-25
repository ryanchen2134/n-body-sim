//npm run dev

import './style.css'
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { initialize, n, readData } from './shmReader';

//Initialization Scene
var scene = new THREE.Scene();

//"near" and "far" are the range of the camera's view or View Frustrum

//Set Initial Camera
var aspectRatio = window.innerWidth / window.innerHeight;
const d = 3; //dimensions
var frustumSize = 100; //100 verticle units
var camera = new THREE.OrthographicCamera(
  frustumSize * aspectRatio / -2,
  frustumSize * aspectRatio / 2,
  frustumSize / 2,
  frustumSize / -2,
  //notice: live updates should be followed by camera.updateProjectionMatrix()
);  
camera.position.set(0, 0, 1000); 
//position does not matter as much in orthographic camera
//only relative direction (functionally infinite distance)
//Should be used only for centering objects in the scene
camera.lookAt(0, 0, 0); //this mattersl

//Intialize and Attach Renderer to DOM element
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//Intialize and Attach Controls to Camera (Translation and Zoom)
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.05; // Damping factor for smooth motion
controls.screenSpacePanning = true; // Enable panning in screen space
controls.minZoom = 0.5; // Set minimum zoom level
controls.maxZoom = 10; // Set maximum zoom level



//Draw XY Grid
const gridSize=1000
const gridDiv=100
const gridHelper = new THREE.GridHelper(gridSize,gridDiv); //size, divisions- being divisions over the entire size (100/1000) = 10 unit width squares
gridHelper.rotation.x = Math.PI / 2 ;
scene.add(gridHelper);
//Dont need if MeshBasicMaterial is used AOT MeshStandardMaterial
// const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
// scene.add(ambientLight);



const geometry = new THREE.SphereGeometry(1); //need to investigate radius
const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
initialize(); //n (objects) is now defined
const masses = [];
for (let i = 0; i < n; i++) {
  masses.push( new THREE.Mesh(geometry, material));
  scene.add(masses[i]);
} 



//geometric center- doesnt matter if we go 4d, as we are looking at the 3d projection
//and because of this linear independence, the 4th dimention is automatically orthogonal
//thus we can pretend it doesnt exist.
//Also, the geometric center of the 2d projection relative to the camera postions is the same as the 3d projection
//^ that line might not make sense. - Either way, this GC can be used, even though we have orthogonal projection calculations for resizing
var dataFrame = readData();
var frame = dataFrame[0];
var position = dataFrame[1][1];
var GC = new THREE.Vector3(
  0,
  0,
  0);

//still need to watch out for possible additional dimensions encoded in the list
// position format: {x0, y0, z0, x1, y1, z1, x2, y2, z2, ...}
// input can also be{x0, y0, z0, w0, x1, y1, z1, w1, x2, y2, z2, w2, ...}
// => updateGC =>
// THREE.Vector3
function updateGC(){
    //i: the three dimensions
    //n: number of objects
    for(let dim = 0; dim < d; dim++){
      let temp = 0;
      for(let i = 0; i < n; i++){
        temp += position[i * d + dim];
      }
      GC[dim] = temp
    }
  
}
updateGC();

//pos format: {x0, y0, z0, x1, y1, z1, x2, y2, z2, ...}







//follow will be watched by autoresize and autotranspose (camera)
var followGC = true; 

//is to be updated after user uses orbit controls.
//Initiated to be top-down birds-eye view
var relativeCamera = new THREE.Vector3(
  0,
  0,
  1000);

function recalibrateRelativeCamera(){
  //update relativeCamera
  relativeCamera = camera.position.clone().sub(GC);
}
//in relation to relative view
function updateCameraPosition(){
  //update camera position
  camera.position.set(GC[0]+relativeCamera[0], GC[1]+relativeCamera[1], GC[2]+relativeCamera[2]);
}

//this is to be called repeatedly if followGC is true
updateCameraPosition();
//In the resize function, we also need to consider the near/far bounds 


//from shmReader.js

console.log("initialized");
animate();








//Event Listener
window.addEventListener('resize', () => {
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera.left = frustumSize * aspectRatio / -2;
  camera.right = frustumSize * aspectRatio / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//Functions
function animate() {
  requestAnimationFrame(animate);

  controls.update(); //apparently this is not required.

  //update the GC
  if(followGC){
    autoCameraPosition();
    autoCameraFrustumResize();
  }
  updateSidebar();

  //recursive infite loop- could blow up stack- might use infite while(true) loop instead.
  renderer.render(scene, camera);
}


function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function updateSidebar(){
  var sidebarF = document.getElementById('sidebar-cfrust');
  sidebarF.textContent= `Camera Frustum: ${round(camera.left,1)}, ${round(camera.right,1)}, ${round(camera.top,1)}, ${round(camera.bottom,1)}`;
  var sidebarP = document.getElementById('sidebar-cpos');
  sidebarP.textContent= `Camera Position: ${round(camera.position.x,1)}, ${round(camera.position.y, 1)}, ${round(camera.position.z, 1)}`;
  var sidebarZ = document.getElementById('sidebar-czoom');
  sidebarZ.textContent= `Camera Zoom: ${round(camera.zoom, 1)}`;
  var sidebarGrid = document.getElementById('sidebar-gridspacing');
  sidebarGrid.textContent= `Grid Spacing: ${gridSize / gridDiv}`;
  var sidebarFrame = document.getElementById('sidebar-framenumber');
  sidebarFrame.textContent= `Frame Number: ${frame}`;
}

function updateCameraFrustum(){
  //update frustrumSize before calling this function
  camera.left = frustumSize * aspectRatio / -2;
  camera.right = frustumSize * aspectRatio / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();
}

function calculateRotationMatrixXY(){
  const cameraPosition = camera.position.clone();
  const translatedGC = GC.sub(cameraPosition);
  const thetaY = Math.atan2(translatedGC.x, translatedGC.z);
  const thetaX = Math.atan2(translatedGC.y, translatedGC.z);
  return rotationMatrixXY(-thetaX,-thetaY);
// Step 2: Calculate the angles for rotation


}
// Multiplied Rotation matricies about the x and y axis
function rotationMatrixXY(angleX,angleY) {
  return [
    [Math.cos(angleY)                    , 0                , Math.sin(angleY)],
    [Math.sin(angleX)*Math.sin(angleY)   , Math.cos(angleX) , -Math.sin(angleX)*Math.cos(angleY)],
    [-Math.sin(angleY)*Math.cos(angleX)  , Math.sin(angleX) , Math.cos(angleX)*Math.cos(angleY)]
  ];
}

// Function to apply a rotation matrix to a vector
function matrixTimesVector(matrix, vector) {
  return {
    x: matrix[0][0] * vector.x + matrix[0][1] * vector.y + matrix[0][2] * vector.z,
    y: matrix[1][0] * vector.x + matrix[1][1] * vector.y + matrix[1][2] * vector.z,
    z: matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * vector.z
  };
}

//only runs if followGC is true
function autoCameraPosition(){
  updateGC();
  updateCameraPosition();
}

function autoCameraFrustumResize(){
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
  for (let i = 0; i < n; i++) { //where n is the objects, and 
    const transformed = matrixTimesVector(rotationMatrix, new THREE.Vector3(position[i * d], position[i * d + 1], position[i * d+ 2]));
    max.max(transformed);
    min.min(transformed);
  }
 
  frustumSize= 1.25*  Math.max((max.x - min.x) / aspectRatio, max.y - min.y);
  camera.near= min.z * 0.8;
  camera.far= max.z * 0.8;
  updateCameraFrustum();
}
