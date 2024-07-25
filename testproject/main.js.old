//npm run dev

import './style.css'
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

//follow will be watched by autoresize and autotranspose (camera)
var followGC = true; 
var relativeCamera = new THREE.Vector3(
  0,
  0,
  1000);

var scene = new THREE.Scene();

//"near" and "far" are the range of the camera's view or View Frustrum
var aspectRatio = window.innerWidth / window.innerHeight;

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

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.05; // Damping factor for smooth motion
controls.screenSpacePanning = true; // Enable panning in screen space
controls.minZoom = 0.5; // Set minimum zoom level
controls.maxZoom = 10; // Set maximum zoom level


let objects=[];
const geometry = new THREE.SphereGeometry(1);
const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });


for(let i= 0; i< 3; i++){
  objects.push(new THREE.Mesh(geometry, material));
  scene.add(objects[i]);
}
objects[0].position.set(0,0,0);
objects[1].position.set(0,20,200);
objects[2].position.set(20,0,0);

updateGC();


const gridSize=1000
const gridDiv=100
const gridHelper = new THREE.GridHelper(gridSize,gridDiv); //size, divisions- being divisions over the entire size (100/1000) = 10 unit width squares
gridHelper.rotation.x = Math.PI / 2 ;

scene.add(gridHelper);
//Dont need if MeshBasicMaterial is used AOT MeshStandardMaterial
// const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
// scene.add(ambientLight);

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
}
function animate() {
  requestAnimationFrame(animate);


  controls.update(); //apparently this is not required.
  if(followGC){
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
  camera.left = frustumSize * aspectRatio / -2;
  camera.right = frustumSize * aspectRatio / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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
  for (let i = 0; i < 3; i++) { //where n is the objects, and 
    const transformed = matrixTimesVector(rotationMatrix, new THREE.Vector3(position[i * d], position[i * d + 1], position[i * d+ 2]));
    max.max(transformed);
    min.min(transformed);
  }
 
  frustumSize= 1.25*  Math.max((max.x - min.x) / aspectRatio, max.y - min.y);
  camera.near= min.z * 0.8;
  camera.far= max.z * 0.8;
  updateCameraFrustum();
}
function recalibrateRelativeCamera(){
  //update relativeCamera
  relativeCamera = camera.position.clone().sub(GC);
}
//in relation to relative view
function updateCameraPosition(){
  //update camera position
  camera.position.set(GC[0]+relativeCamera[0], GC[1]+relativeCamera[1], GC[2]+relativeCamera[2]);
}
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