import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeModule, setActiveModule] = useState({
    title: 'Banned Substances',
    points: 80,
  });
  const [quizProgress, setQuizProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch user profile for badges
        const userRes = await axios.get(`http://localhost:5000/api/user/profile/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserBadges(userRes.data.badges || []);
        // Fetch all badges
        const badgesRes = await axios.get('http://localhost:5000/api/badges', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllBadges(badgesRes.data);
        // Fetch user progress
        const progressRes = await axios.get(
          `http://localhost:5000/api/user/progress/${parsedUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Fetch all quizzes
        const quizzesRes = await axios.get(
          'http://localhost:5000/api/quizzes',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Calculate completed quizzes (unique, passed only)
        let completed = 0;
        if (Array.isArray(progressRes.data.quiz_scores)) {
          const uniquePassed = new Set(progressRes.data.quiz_scores.filter(qs => qs.passed).map(qs => qs.quiz_id));
          completed = uniquePassed.size;
        } else if (typeof progressRes.data.quiz_scores === 'object') {
          completed = Object.keys(progressRes.data.quiz_scores).length;
        }
        const total = quizzesRes.data.length;
        setQuizProgress({ completed, total });
      } catch (err) {
        setQuizProgress({ completed: 0, total: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const progressPercent = quizProgress.total
    ? Math.min(100, (quizProgress.completed / quizProgress.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-green-700">GADI</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/dashboard" className="border-green-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/modules" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Modules
                </Link>
                <Link to="/badges" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Badges
                </Link>
                <Link to="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Quests
                </Link>
                <Link to="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Leaderboard
                </Link>
                <Link to="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Analytics
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 sm:px-0">
          <h1 className="text-4xl font-bold text-gray-900">Welcome, {user.name}</h1>
        </div>

        {/* Active Module Card */}
        <div className="mt-8">
          <div className="bg-green-600 rounded-lg shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium">Complete your next module!</p>
                <h2 className="text-3xl font-bold mt-2">{activeModule.title}</h2>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 flex items-center space-x-2">
                <span className="text-green-600 font-bold text-2xl">{activeModule.points}</span>
                <span className="text-green-600 font-medium">PTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quests Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quests</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">Complete a quiz</h4>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 rounded-full h-2"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {loading
                    ? 'Loading...'
                    : `${quizProgress.completed} / ${quizProgress.total} Quizzes Completed`}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Doping Rules Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Your Badges</h2>
          <div className="flex flex-wrap gap-4">
            {allBadges.filter(badge => userBadges.includes(badge.badge_id)).map(badge => {
              let icon = '🏅';
              if (badge.title.toLowerCase().includes('champ')) icon = '🏆';
              else if (badge.title.toLowerCase().includes('quiz')) icon = '🧠';
              else if (badge.title.toLowerCase().includes('streak')) icon = '🔥';
              return (
                <div key={badge.badge_id} className="flex flex-col items-center p-2 bg-white rounded shadow min-w-[100px]">
                  <div className="text-4xl mb-1">{icon}</div>
                  <div className="text-xs text-gray-700 text-center font-semibold">{badge.title}</div>
                </div>
              );
            })}
            {userBadges.length === 0 && <div className="text-gray-400">No badges yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 