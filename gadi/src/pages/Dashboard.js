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
  const [userQuests, setUserQuests] = useState([]);
  const [quests, setQuests] = useState([]);

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
        setUserQuests(userRes.data.user_quests || []);
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
        // Fetch all quests
        const questsRes = await axios.get('http://localhost:5000/api/quests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuests(questsRes.data);
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

  // Merge user progress into active quests
  const questsWithUserProgress = quests.map(q => {
    if (q.status === 'Active') {
      const uq = userQuests.find(uq => uq.quest_id === q.quest_id);
      if (uq) return { ...q, ...uq };
    }
    return q;
  });
  const groupedQuests = {
    Active: questsWithUserProgress.filter(q => q.status === 'Active'),
    Upcoming: questsWithUserProgress.filter(q => q.status === 'upcoming'),
    Expired: questsWithUserProgress.filter(q => q.status === 'expired'),
  };

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
                <Link to="/quests" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Quests
                </Link>
                <Link to="/leaderboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Leaderboard
                </Link>
                <Link to="/analytics" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Quests</h3>
            {Object.entries(groupedQuests).map(([status, quests]) => (
              quests.length > 0 && (
                <div key={status} className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">{status} Quests</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {quests.map(quest => {
                      let icon = '';
                      if (quest.badge_reward === 'badge_001') icon = '🏆';
                      else if (quest.badge_reward === 'badge_002') icon = '🧠';
                      else if (quest.badge_reward === 'badge_003') icon = '🔥';
                      return (
                        <div key={quest.quest_id} className={`rounded-lg shadow p-4 flex flex-col border-2 ${quest.completed ? 'border-green-500 bg-green-50' : status === 'Active' ? 'border-green-300 bg-white' : status === 'upcoming' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-gray-100 opacity-60'}`}>
                          <div className="flex items-center mb-2">
                            <span className="text-lg font-bold text-gray-900 flex-1">{quest.title}</span>
                            {icon && <span className="ml-2 text-2xl">{icon}</span>}
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{quest.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <span className="mr-2">Type: {quest.type}</span>
                            <span className="mr-2">Points: <span className="font-bold text-green-700">+{quest.reward_points}</span></span>
                            {quest.badge_reward && <span>Badge: {quest.badge_reward}</span>}
                          </div>
                          {quest.status === 'Active' && quest.progress !== undefined && (
                            <span className="text-xs text-blue-600 font-semibold">Progress: {quest.progress}{quest.quest_id === 'quest_003' ? '/5' : ''}</span>
                          )}
                          <span className={`text-xs font-semibold ${quest.completed ? 'text-green-600' : 'text-gray-500'}`}>{quest.status === 'Active' ? (quest.completed ? 'Completed' : 'In Progress') : quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
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