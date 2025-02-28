const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Updated path for newer versions of pdfjs-dist
// const workerPath = path.join(
//   path.dirname(require.resolve('pdfjs-dist/package.json')),
//   'build',
//   'pdf.worker.min.js'
// );
import { GlobalWorkerOptions } from "pdfjs-dist";

// Dynamically resolve the worker path
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const destinationPath = path.join(__dirname, '../public/pdf.worker.min.js');

try {
  fs.copyFileSync(workerPath, destinationPath);
  console.log('PDF.js worker copied successfully to public directory');
} catch (error) {
  console.error('Error copying PDF.js worker:', error);
  process.exit(1);
} 