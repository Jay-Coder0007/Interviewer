'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseResumeWithGemini } from '@/utils/gemini';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500 flex items-center gap-2">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {message}
  </div>
);

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB");
      return;
    }
    
    setFile(file);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        resolve(text);
      };
      
      reader.onerror = (error) => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobRole) return;

    try {
      setIsLoading(true);
      setError(null);

      const fileText = await extractTextFromFile(file);
      const resumeData = await parseResumeWithGemini(fileText);

      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      localStorage.setItem('jobRole', jobRole);

      router.push('/interview/preview');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error processing resume. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Upload Your Resume
          </h1>
          <p className="text-gray-400">
            Let's personalize your interview experience based on your background
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Role Input */}
          <div className="space-y-2">
            <label htmlFor="jobRole" className="block text-sm font-medium text-gray-300">
              Desired Job Role
            </label>
            <input
              type="text"
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition-all duration-200"
              placeholder="e.g., Frontend Developer, Product Manager"
              required
            />
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center ${
              dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500'
            } transition-all duration-200`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="resume"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <label
              htmlFor="resume"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <div className="rounded-full bg-white/5 p-4">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              
              <div className="space-y-2">
                <p className="text-base font-medium">
                  {file ? file.name : 'Drop your resume here, or click to select'}
                </p>
                <p className="text-sm text-gray-400">
                  Supports PDF files up to 10MB
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            disabled={!file || !jobRole || isLoading}
            className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 
              ${file && jobRole && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cursor-pointer'
                : 'bg-gray-600 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Resume...
              </div>
            ) : (
              'Start Interview'
            )}
          </button>

          {/* Error Message */}
          {error && <ErrorMessage message={error} />}
        </form>

        {/* Instructions */}
        <div className="mt-12 p-6 rounded-lg bg-white/5 space-y-4">
          <h3 className="text-lg font-semibold text-purple-400">
            How it works:
          </h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Upload your resume in PDF format</li>
            <li>Enter your desired job role</li>
            <li>Our AI will analyze your background</li>
            <li>Get personalized interview questions</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 