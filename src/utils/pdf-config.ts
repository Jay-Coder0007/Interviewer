import { GlobalWorkerOptions } from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.entry';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = worker;
} 