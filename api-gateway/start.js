const fs = require('fs');
const path = require('path');

// Essayer dist/src/index.js d'abord (structure normale)
const distSrc = path.join(__dirname, 'dist', 'src', 'index.js');
// Sinon essayer dist/index.js (si Railway compile différemment)
const distRoot = path.join(__dirname, 'dist', 'index.js');

let entryPoint;
if (fs.existsSync(distSrc)) {
  entryPoint = distSrc;
} else if (fs.existsSync(distRoot)) {
  entryPoint = distRoot;
} else {
  console.error('Error: Neither dist/src/index.js nor dist/index.js found!');
  console.error('Current directory:', __dirname);
  console.error('Files in dist:', fs.existsSync(path.join(__dirname, 'dist')) 
    ? fs.readdirSync(path.join(__dirname, 'dist'))
    : 'dist directory does not exist');
  process.exit(1);
}

// Charger tsconfig-paths pour résoudre les alias
require('tsconfig-paths/register');

// Lancer l'application
require(entryPoint);
