import { GlobalWorkerOptions } from 'pdfjs-dist';

// Dynamically resolve the worker path
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

// import worker from 'pdfjs-dist/build/pdf.worker.entry';

// if (typeof window !== 'undefined') {
//   GlobalWorkerOptions.workerSrc = worker;
// } 