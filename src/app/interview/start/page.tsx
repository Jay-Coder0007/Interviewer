'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateInterviewQuestions } from '@/utils/gemini';

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
}

export default function InterviewStart() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const generateQuestions = async () => {
      try {
        const resumeData = localStorage.getItem('resumeData');
        const jobRole = localStorage.getItem('jobRole');

        if (!resumeData || !jobRole) {
          throw new Error('Resume data not found');
        }

        // Add introduction question as the first question
        const introQuestion = {
          id: 0,
          question: "Please introduce yourself and briefly describe your background.",
          category: "Introduction",
          difficulty: "Easy"
        };

        const parsedResumeData = JSON.parse(resumeData);
        const generatedQuestions = await generateInterviewQuestions(parsedResumeData, jobRole);
        setQuestions([introQuestion, ...generatedQuestions]);
      } catch (err) {
        console.error('Error generating questions:', err);
        setError('Failed to generate interview questions');
      } finally {
        setIsLoading(false);
      }
    };

    generateQuestions();
  }, [router]);

  const handleNextQuestion = () => {
    // Save current answer
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: answer
    };
    setAnswers(newAnswers);
    
    if (isLastQuestion) {
      // Save all data and navigate to report
      localStorage.setItem('interviewAnswers', JSON.stringify(newAnswers));
      localStorage.setItem('interviewQuestions', JSON.stringify(questions));
      router.push('/interview/report');
    } else {
      // Clear text area for next question
      setAnswer('');
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-12">
          {/* Animated morphing blob */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 animate-gradient-x">
              <div className="w-full h-full animate-morph bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 animate-gradient-x">
                <div className="absolute inset-1 bg-black rounded-[inherit]"></div>
              </div>
            </div>
            {/* Floating icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-2">
                <svg className="w-6 h-6 mx-auto text-white animate-bounce-fade" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <svg className="w-6 h-6 mx-auto text-white animate-bounce-fade [animation-delay:200ms]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Text content */}
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
              Preparing Your Interview
            </h2>
            <div className="space-y-2">
              <p className="text-gray-400 animate-bounce-fade [animation-delay:400ms]">
                Generating personalized questions...
              </p>
              <p className="text-sm text-gray-500 animate-bounce-fade [animation-delay:600ms]">
                This may take a moment
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-xl">{error}</p>
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-purple-400">{currentQuestion.category}</span>
            <span className={`text-sm px-3 py-1 rounded-full ${
              currentQuestion.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
              currentQuestion.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {currentQuestion.difficulty}
            </span>
          </div>
          <p className="text-xl font-medium text-gray-100 mb-6">
            {currentQuestion.question}
          </p>
          
          {/* Answer Text Area */}
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-48 px-4 py-3 rounded-lg bg-white/5 border border-white/10 
                focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 
                transition-all duration-200 text-white placeholder-gray-500"
            />
            
            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                disabled={!answer.trim()}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center space-x-2
                  ${answer.trim() 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cursor-pointer' 
                    : 'bg-gray-600 cursor-not-allowed'
                  } transition-all duration-300`}
              >
                <span>{isLastQuestion ? 'Finish Interview' : 'Next Question'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 