'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResumeData } from '@/utils/gemini'; // Import the type

export default function ResumePreview() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobRole, setJobRole] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      console.log('\n=== PREVIEW PAGE: LOADING DATA ===');
      const storedResumeData = localStorage.getItem('resumeData');
      const storedJobRole = localStorage.getItem('jobRole');
      
      console.log('Stored job role:', storedJobRole);
      console.log('Stored resume data:', storedResumeData);

      if (!storedResumeData || !storedJobRole) {
        console.log('No data found in localStorage');
        throw new Error('Resume data not found. Please upload your resume first.');
      }

      const parsedData = JSON.parse(storedResumeData) as ResumeData;
      
      // Validate the parsed data structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Invalid resume data format');
      }

      // Validate required fields
      if (!parsedData.fullName || typeof parsedData.fullName !== 'string') {
        throw new Error('Name is required in resume data');
      }

      console.log('Successfully parsed stored data:', JSON.stringify(parsedData, null, 2));
      console.log('================\n');

      setResumeData(parsedData);
      setJobRole(storedJobRole);
    } catch (err) {
      console.error('\n=== ERROR IN PREVIEW PAGE ===\n', err, '\n================\n');
      const errorMessage = err instanceof Error ? err.message : 'Failed to load resume data';
      setError(errorMessage);
      // Don't redirect immediately, let user see the error
      // router.push('/interview');
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl">Loading resume data...</span>
        </div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-xl">{error || 'Failed to load resume data'}</p>
          <button
            onClick={() => router.push('/interview')}
            className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get initial for avatar
  const initial = resumeData.fullName.trim().charAt(0) || '?';

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Fixed Header with Start Interview Button */}
      <div className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Resume Preview
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/interview/voice')}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-semibold 
                hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105
                flex items-center space-x-2 shadow-lg shadow-red-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Voice Interview</span>
            </button>
            
            <button
              onClick={() => router.push('/interview/start')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105
                flex items-center space-x-2 shadow-lg shadow-purple-500/20"
            >
              <span>Text Interview</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Basic Info & Skills */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">{initial}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{resumeData.fullName}</h2>
                <p className="text-purple-400 mb-1">{jobRole}</p>
                <p className="text-gray-400 text-sm">{resumeData.email}</p>
                <p className="text-gray-400 text-sm">{resumeData.phone}</p>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm hover:bg-purple-500/30 transition-colors duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Middle & Right Columns - Experience, Projects, Education */}
          <div className="md:col-span-2 space-y-6">
            {/* Experience Section */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Experience
              </h3>
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-purple-500/30 hover:border-purple-500 transition-colors duration-300">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                    <h4 className="text-lg font-semibold text-purple-300">{exp.position}</h4>
                    <p className="text-pink-400">{exp.company}</p>
                    <p className="text-sm text-gray-400 mb-2">{exp.duration}</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx} className="text-sm">{resp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Projects
              </h3>
              <div className="grid gap-4">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300">
                    <h4 className="text-lg font-semibold text-purple-300 mb-2">{project.name}</h4>
                    <p className="text-gray-300 text-sm mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 bg-pink-500/20 rounded text-pink-300 text-xs hover:bg-pink-500/30 transition-colors duration-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                Education
              </h3>
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="hover:bg-white/20 p-4 rounded-lg transition-colors duration-300">
                    <h4 className="text-lg font-semibold text-purple-300">{edu.degree}</h4>
                    <p className="text-pink-400">{edu.institution}</p>
                    <p className="text-sm text-gray-400">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 