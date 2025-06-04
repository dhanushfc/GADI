import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Modules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState({ completed_modules: [] });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    console.log('User for modules:', parsedUser);

    const fetchModulesAndProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch modules
        const modulesRes = await axios.get('http://localhost:5000/api/modules', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModules(modulesRes.data);
        console.log('Modules:', modulesRes.data);
        // Fetch user module progress
        const progressRes = await axios.get(
          `http://localhost:5000/api/modules/progress/${parsedUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserProgress(progressRes.data);
        console.log('User progress:', progressRes.data);
        setError('');
      } catch (err) {
        setModules([]);
        setUserProgress({ completed_modules: [] });
        setError(
          err.response?.data?.error || err.message || 'Error loading modules or progress.'
        );
        console.error('Modules page error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModulesAndProgress();
  }, [navigate]);

  const getModuleStatus = (moduleId) => {
    if (userProgress.completed_modules && userProgress.completed_modules.includes(moduleId)) {
      return 'completed';
    }
    // You can add logic for 'continue' if you track in-progress modules
    return 'start';
  };

  // Sort modules: incomplete first, completed last
  const sortedModules = [...modules].sort((a, b) => {
    const aCompleted = userProgress.completed_modules && userProgress.completed_modules.includes(a.id);
    const bCompleted = userProgress.completed_modules && userProgress.completed_modules.includes(b.id);
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - copy from Dashboard for consistency */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-green-700">GADI</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/modules" className="border-green-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                  }}
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
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Modules</h1>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center text-gray-500">Loading modules...</div>
        ) : (
          <div className="space-y-6">
            {sortedModules.map((module) => {
              const status = getModuleStatus(module.id);
              // Check if quiz is completed for this module
              let quizCompleted = false;
              if (userProgress.quiz_scores && Array.isArray(userProgress.quiz_scores)) {
                quizCompleted = userProgress.quiz_scores.some(qs => qs.quiz_id === module.quiz_id && qs.passed);
              }
              return (
                <div
                  key={module.id}
                  className={`flex items-center justify-between p-6 rounded-lg shadow ${status === 'completed' ? 'bg-green-100' : 'bg-white'}`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Simple icon based on module title */}
                    <div className="text-4xl">
                      {module.icon || (module.title.toLowerCase().includes('anti-doping') ? '🛡️' : module.title.toLowerCase().includes('substances') ? '💊' : module.title.toLowerCase().includes('testing') ? '🏆' : '📄')}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{module.title}</h2>
                      <p className="text-gray-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Link
                      to={status === 'completed' ? '#' : `/modules/${module.id}`}
                      className={`px-6 py-2 rounded-md font-semibold text-white ${status === 'completed' ? 'bg-green-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                      tabIndex={status === 'completed' ? -1 : 0}
                      aria-disabled={status === 'completed'}
                      onClick={e => { if (status === 'completed') e.preventDefault(); }}
                    >
                      {status === 'completed' ? 'COMPLETED' : status === 'continue' ? 'CONTINUE' : 'START'}
                    </Link>
                    {module.quiz_id && (
                      quizCompleted ? (
                        <span className="mt-2 px-4 py-2 bg-blue-300 text-white rounded-md text-sm font-medium cursor-not-allowed">Quiz Completed</span>
                      ) : (
                        <Link
                          to={`/quiz/${module.quiz_id}`}
                          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                        >
                          Take Quiz
                        </Link>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modules; 