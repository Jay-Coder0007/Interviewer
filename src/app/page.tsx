import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&q=80"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      {/* Navbar */}
      <nav className="absolute top-0 w-full p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            AI Interview Pro
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#about" className="hover:text-purple-400 transition-colors">About</a>
            <a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="space-y-8 text-center max-w-4xl mx-auto pt-20">
          <h1 className="text-5xl md:text-7xl font-bold animate-fade-in">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Master Your Interviews
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 animate-slide-up max-w-2xl mx-auto">
            Practice with our AI-powered interview simulator and get personalized feedback in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-slide-up">
            <Link 
              href="/interview"
              className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Start Interview Now
              <svg 
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button className="px-8 py-4 rounded-lg border-2 border-purple-500 hover:bg-purple-500/20 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-gray-400">Users Trained</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-bold text-pink-400 mb-2">95%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-bold text-red-400 mb-2">200+</div>
              <div className="text-gray-400">Interview Topics</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-20">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 text-left">
              <Image
                src="https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&q=80"
                alt="AI Analysis"
                width={800}
                height={600}
                className="rounded-lg mb-6 w-full object-cover h-48"
              />
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-400">
                Get detailed feedback on your responses, body language, and speaking patterns in real-time.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 text-left">
              <Image
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"
                alt="Personalized Learning"
                width={800}
                height={600}
                className="rounded-lg mb-6 w-full object-cover h-48"
              />
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Personalized Learning
              </h3>
              <p className="text-gray-400">
                Adaptive question selection based on your performance and industry focus.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
