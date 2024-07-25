import { Vector3 } from 'three';

//The other way to do this is to project the GMC (and all other vectors) on the parallel planes of the camera vectors.

// Camera position
const cameraPosition = new Vector3();
// GMC position
const GMCPosition = new Vector3();

// Step 1: Translate the GMC position relative to the camera
//assuming operator overload implemented, other
const translatedGMC = GMCPosition.sub(cameraPosition);

// Step 2: Calculate the angles for rotation
const thetaY = Math.atan2(translatedGMC.x, translatedGMC.z);
const thetaX = Math.atan2(translatedGMC.y, translatedGMC.z);

// Apply combined rotation matrix to the translated GMC position
const finalRotatedGMC = matrixTimesVector(rotationMatrixXY(-thetaX,-thetaY), translatedGMC);

console.log(finalRotatedGMC); // Should be aligned with the z-axis (0, 0, z)

// Apply combined rotation matrix to other points in the scene
const combinedRotationMatrix = rotationMatrixXY(-thetaX, -thetaY);

function transformPoint(point) {
  const translatedPoint = point.sub(cameraPosition);
  return matrixTimesVector(combinedRotationMatrix, translatedPoint);
}

// Example usage: Transform another object
const objectPosition = { x: objX, y: objY, z: objZ };
const transformedObjectPosition = transformPoint(objectPosition);

console.log(transformedObjectPosition); // Transformed position relative to the new coordinate system


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