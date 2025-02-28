import { GlobalWorkerOptions } from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'development') {
    // Use unpkg CDN in development
    GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js';
  } else {
    // Use local worker in production
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
} 