'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateInterviewReport } from '@/utils/gemini';

interface InterviewReport {
  score: number;
  recommendation: string;
  strengths: string[];
  areasToImprove: string[];
  technicalAssessment: string;
  communicationSkills: string;
  overallFeedback: string;
  shouldHire: boolean;
}

export default function InterviewReport() {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const generateReport = async () => {
      try {
        const answers = localStorage.getItem('interviewAnswers');
        const questions = localStorage.getItem('interviewQuestions');
        const jobRole = localStorage.getItem('jobRole');
        const resumeData = localStorage.getItem('resumeData');

        if (!answers || !questions || !jobRole || !resumeData) {
          throw new Error('Interview data not found');
        }

        const report = await generateInterviewReport(
          JSON.parse(questions),
          JSON.parse(answers),
          jobRole,
          JSON.parse(resumeData)
        );
        setReport(report);
      } catch (err) {
        console.error('Error generating report:', err);
        setError('Failed to generate interview report');
      } finally {
        setIsLoading(false);
      }
    };

    generateReport();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="text-xl">Analyzing your interview responses...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-xl">{error}</p>
          <button
            onClick={() => router.push('/interview')}
            className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Score */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Interview Analysis Report
          </h1>
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4B5563"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray={`${report.score}, 100`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{report.score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hiring Recommendation */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${report.shouldHire ? 'bg-green-500' : 'bg-red-500'}`}></span>
            Recommendation
          </h2>
          <p className="text-gray-300">{report.recommendation}</p>
        </div>

        {/* Strengths */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Strengths</h2>
          <ul className="space-y-2">
            {report.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Areas to Improve</h2>
          <ul className="space-y-2">
            {report.areasToImprove.map((area, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-gray-300">{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Assessment */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Technical Assessment</h2>
          <p className="text-gray-300">{report.technicalAssessment}</p>
        </div>

        {/* Communication Skills */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">Communication Skills</h2>
          <p className="text-gray-300">{report.communicationSkills}</p>
        </div>

        {/* Overall Feedback */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-pink-400">Overall Feedback</h2>
          <p className="text-gray-300">{report.overallFeedback}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-6">
          <button
            onClick={() => router.push('/interview')}
            className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            Start New Interview
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
} 