'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateInterviewQuestions } from '@/utils/gemini';

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
}

export default function VoiceInterview() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const router = useRouter();

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
      
      if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        setupRecognitionHandlers();
      }
    }

    return () => cleanup();
  }, []);

  // Setup recognition handlers
  const setupRecognitionHandlers = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => {
      setIsListening(false);
      // Automatically restart recognition if we're still in listening mode
      if (isListening) {
        recognitionRef.current.start();
      }
    };

    // Improve recognition speed and accuracy
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-IN'; // Set to Indian English
    recognitionRef.current.maxAlternatives = 1;

    // Reduced silence detection
    if ('speechSettings' in recognitionRef.current) {
      (recognitionRef.current as any).speechSettings = {
        silenceTimeout: 500, // Reduce silence timeout to 500ms
        continuous: true,
        sensitivity: 0.5, // Increase sensitivity
      };
    }

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setAnswer(prev => {
          const newAnswer = (prev + ' ' + finalTranscript.trim()).trim();
          return newAnswer;
        });
      }
      setTranscript(interimTranscript);
    };

    // Better error handling
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        alert('Please enable microphone access to use voice interview');
      } else if (event.error === 'network') {
        // Attempt to restart recognition on network errors
        setTimeout(() => {
          if (isListening) {
            recognitionRef.current.start();
          }
        }, 1000);
      }
    };
  };

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const resumeData = localStorage.getItem('resumeData');
        const jobRole = localStorage.getItem('jobRole');

        if (!resumeData || !jobRole) {
          throw new Error('Resume data not found');
        }

        const introQuestion = {
          id: 0,
          question: "Please introduce yourself and briefly describe your background.",
          category: "Introduction",
          difficulty: "Easy"
        };

        const parsedResumeData = JSON.parse(resumeData);
        const generatedQuestions = await generateInterviewQuestions(parsedResumeData, jobRole);
        setQuestions([introQuestion, ...generatedQuestions]);
        setIsLoading(false);
      } catch (err) {
        console.error('Error generating questions:', err);
        setError('Failed to generate interview questions');
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Handle question changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIndex]?.question) {
      speakQuestion(questions[currentQuestionIndex].question);
    }
  }, [currentQuestionIndex, questions]);

  const speakQuestion = (text: string) => {
    if (!speechSynthesisRef.current) return;

    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Adjust settings for more natural speech
    utterance.rate = 0.95; // Slightly faster but still natural
    utterance.pitch = 1.1; // Slightly higher pitch for Indian accent
    utterance.volume = 1;

    // Get available voices
    let voices = speechSynthesisRef.current.getVoices();
    
    // If voices array is empty, wait for voices to load
    if (voices.length === 0) {
      speechSynthesisRef.current.onvoiceschanged = () => {
        voices = speechSynthesisRef.current!.getVoices();
        setVoice();
      };
    } else {
      setVoice();
    }

    function setVoice() {
      // Try to find an Indian English voice
      const preferredVoice = voices.find(voice => 
        (voice.name.includes('Indian') || voice.lang === 'en-IN') &&
        !voice.name.includes('Neural2')  // Avoid robotic neural voices
      ) || 
      // Fallback to other natural English voices
      voices.find(voice => 
        (voice.name.includes('Natural') || 
         voice.name.includes('Premium') ||
         voice.name.includes('Enhanced'))
      ) ||
      // Final fallback to any English voice
      voices.find(voice => voice.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Using voice:', preferredVoice.name);
      }
    }

    // Improve speech patterns with SSML-like text modifications
    const processedText = text
      .replace(/([.!?]) /g, '$1, ') // Add slight pauses after punctuation
      .replace(/(\d+)/g, ' $1 '); // Add spaces around numbers for better pronunciation

    utterance.text = processedText;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Start listening immediately after speaking
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
      }
    };

    speechSynthesisRef.current.speak(utterance);
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop speaking if it's ongoing
      if (speechSynthesisRef.current && isSpeaking) {
        speechSynthesisRef.current.cancel();
      }
      recognitionRef.current.start();
    }
  };

  const handleNextQuestion = () => {
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: answer
    };
    setAnswers(newAnswers);
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (isLastQuestion) {
      localStorage.setItem('interviewAnswers', JSON.stringify(newAnswers));
      localStorage.setItem('interviewQuestions', JSON.stringify(questions));
      router.push('/interview/report');
    } else {
      setAnswer('');
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                  />
                </svg>
                <svg className="w-6 h-6 mx-auto text-white animate-bounce-fade [animation-delay:200ms]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Text content */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
              Preparing Your Interview
            </h2>
            <div className="space-y-2">
              <p className="text-gray-400 animate-bounce-fade [animation-delay:400ms]">
                Setting up personalized questions...
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
            <span className="text-sm text-purple-400">{currentQuestion?.category}</span>
            <span className={`text-sm px-3 py-1 rounded-full ${
              currentQuestion?.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
              currentQuestion?.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {currentQuestion?.difficulty}
            </span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xl font-medium text-gray-100">
              {currentQuestion?.question}
            </p>
            <button
              onClick={() => currentQuestion && speakQuestion(currentQuestion.question)}
              disabled={isSpeaking}
              className={`ml-4 p-2 rounded-full ${
                isSpeaking 
                  ? 'bg-purple-500/50 cursor-not-allowed' 
                  : 'bg-purple-500 hover:bg-purple-600'
              } transition-all duration-300`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 9.5l5-5v15l-5-5H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.5z" 
                />
              </svg>
            </button>
          </div>
          
          {/* Voice Controls and Answer Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={toggleListening}
                disabled={isSpeaking}
                className={`p-4 rounded-full ${
                  isListening 
                    ? 'bg-red-500 animate-pulse' 
                    : isSpeaking
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600'
                } transition-all duration-300`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isListening 
                      ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 9v6m4-6v6" 
                      : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    }
                  />
                </svg>
              </button>
            </div>

            {/* Show interim transcript while listening */}
            {isListening && transcript && (
              <div className="text-gray-400 italic mb-2">
                {transcript}...
              </div>
            )}

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer will appear here as you speak..."
              className="w-full h-48 px-4 py-3 rounded-lg bg-white/5 border border-white/10 
                focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 
                transition-all duration-200 text-white placeholder-gray-500"
              readOnly={isListening}
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