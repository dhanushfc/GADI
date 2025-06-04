import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMedal, FaChartLine, FaUserShield, FaCheckCircle, FaTrophy, FaUsers } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const images = [
    {
      src: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
      alt: 'Athletes in action',
    },
    {
      src: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
      alt: 'Team huddle',
    },
    {
      src: 'https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80',
      alt: 'Runner at the starting line',
    },
  ];

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };
  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <FaTrophy className="inline-block text-green-600" /> GADI
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-green-700 border border-green-700 rounded hover:bg-green-700 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto mt-16 px-4 text-center">
        <h2 className="text-5xl font-extrabold text-green-800 mb-4 drop-shadow-lg">Welcome to GADI</h2>
        <p className="text-2xl text-gray-700 mb-8 font-medium">
          Gamification of Anti-Doping Information (GADI) is your interactive platform to learn, compete, and champion clean sport.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 border-2 border-green-600 text-green-700 text-lg font-semibold rounded-lg shadow-lg hover:bg-green-50 transition-colors"
          >
            Already a Member?
          </button>
        </div>
        {/* Single Image Carousel */}
        <div className="relative max-w-xl mx-auto mb-8">
          <img
            src={images[current].src}
            alt={images[current].alt}
            className="rounded-2xl shadow-xl w-full h-[260px] object-cover"
          />
          {/* Left Arrow */}
          <button
            aria-label="Previous image"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-green-100 rounded-full p-2 shadow-md"
            style={{ transform: 'translateY(-50%)' }}
          >
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          {/* Right Arrow */}
          <button
            aria-label="Next image"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-green-100 rounded-full p-2 shadow-md"
            style={{ transform: 'translateY(-50%)' }}
          >
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          {/* Dots */}
          <div className="flex justify-center mt-3 gap-2">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-3 h-3 rounded-full ${idx === current ? 'bg-green-600' : 'bg-green-200'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center text-green-800 mb-10">Why Choose GADI?</h3>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <FaUserShield className="text-4xl text-green-600 mb-4" />
            <h4 className="font-semibold text-xl mb-2">Interactive Learning</h4>
            <p className="text-gray-600 text-center">Engage with modules, quizzes, and real-life scenarios to master anti-doping knowledge.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <FaChartLine className="text-4xl text-green-600 mb-4" />
            <h4 className="font-semibold text-xl mb-2">Track Your Progress</h4>
            <p className="text-gray-600 text-center">Earn points, badges, and climb the leaderboard as you learn and complete challenges.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <FaMedal className="text-4xl text-green-600 mb-4" />
            <h4 className="font-semibold text-xl mb-2">Champion Clean Sport</h4>
            <p className="text-gray-600 text-center">Stay updated on banned substances and become an ambassador for fair play.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center text-green-800 mb-10">How GADI Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-4xl text-green-600 mb-2" />
            <h5 className="font-semibold text-lg mb-1">Sign Up</h5>
            <p className="text-gray-600 text-center">Create your free account and join the GADI community.</p>
          </div>
          <div className="flex flex-col items-center">
            <FaUsers className="text-4xl text-green-600 mb-2" />
            <h5 className="font-semibold text-lg mb-1">Learn & Compete</h5>
            <p className="text-gray-600 text-center">Complete modules, take quizzes, and earn rewards as you progress.</p>
          </div>
          <div className="flex flex-col items-center">
            <FaTrophy className="text-4xl text-green-600 mb-2" />
            <h5 className="font-semibold text-lg mb-1">Become a Champion</h5>
            <p className="text-gray-600 text-center">Showcase your achievements and inspire others to play clean.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-green-50 py-12">
        <h3 className="text-3xl font-bold text-center text-green-800 mb-10">What Our Users Say</h3>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-700 italic mb-4">“GADI made learning about anti-doping fun and rewarding. I love the quizzes and the leaderboard!”</p>
            <div className="flex items-center gap-3">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-10 h-10 rounded-full" />
              <span className="font-semibold text-green-700">Rahul, Athlete</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-700 italic mb-4">“The modules are super interactive and easy to follow. I feel more confident about the rules now.”</p>
            <div className="flex items-center gap-3">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-10 h-10 rounded-full" />
              <span className="font-semibold text-green-700">Priya, Student</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h3 className="text-3xl font-bold text-green-800 mb-4">Ready to get started?</h3>
        <p className="text-lg text-gray-700 mb-8">Join GADI today and become a champion for clean sport!</p>
        <button
          onClick={() => navigate('/signup')}
          className="px-10 py-4 bg-green-700 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-green-800 transition-colors"
        >
          Sign Up Now
        </button>
      </section>
    </div>
  );
};

export default Home; 