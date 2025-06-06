import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [badges, setBadges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchAnalytics = async () => {
      if (!isMounted) return;
      try {
        const token = localStorage.getItem('token');
        // User progress (current stats)
        const progressRes = await axios.get(`http://localhost:5000/api/user/progress/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgress(progressRes.data);
        // User badges (from profile)
        const profileRes = await axios.get(`http://localhost:5000/api/user/profile/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBadges(profileRes.data.badges || []);
        // User activity logs (historical)
        const logsRes = await axios.get(`http://localhost:5000/api/user-progress/user/${parsedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivityLogs(logsRes.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Error loading analytics.');
        setProgress(null);
        setActivityLogs([]);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { isMounted = false; };
  }, [navigate]);

  // Defensive: filter logs with valid created_at
  function getValidDate(log) {
    let dateVal = log.created_at;
    if (!dateVal) return null;
    if (typeof dateVal === 'object' && dateVal._seconds) {
      return new Date(dateVal._seconds * 1000);
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  }

  // Helper to ensure primitive string
  function safeString(val) {
    if (typeof val === 'string') return val;
    if (val instanceof Date) return val.toLocaleDateString();
    if (typeof val === 'number') return val.toString();
    return '';
  }
  // Helper to ensure primitive number
  function safeNumber(val) {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string' && !isNaN(Number(val))) return Number(val);
    return 0;
  }

  // --- useMemo for chart data ---
  const { safeLineLabels, safeLineData, safeBarLabels, safeBarData } = useMemo(() => {
    // Aggregate points by date
    const pointsByDate = {};
    activityLogs.forEach(log => {
      if ((log.activity_type === 'Module Viewed' || log.activity_type === 'Quiz Attempted') && getValidDate(log)) {
        const d = getValidDate(log);
        const dateStr = safeString(d ? d.toLocaleDateString() : '');
        pointsByDate[dateStr] = (pointsByDate[dateStr] || 0) + safeNumber(log.points_earned);
      }
    });
    // Cumulative points for line chart
    const sortedDates = Object.keys(pointsByDate).sort((a, b) => new Date(a) - new Date(b));
    let cumulative = 0;
    const lineLabels = sortedDates;
    const lineData = sortedDates.map(date => {
      cumulative += pointsByDate[date];
      return cumulative;
    });
    // Aggregate modules completed by date
    const moduleCountsByDate = {};
    activityLogs.forEach(log => {
      if (log.activity_type === 'Module Viewed' && getValidDate(log)) {
        const d = getValidDate(log);
        const dateStr = safeString(d ? d.toLocaleDateString() : '');
        moduleCountsByDate[dateStr] = (moduleCountsByDate[dateStr] || 0) + 1;
      }
    });
    const barLabels = Object.keys(moduleCountsByDate).sort((a, b) => new Date(a) - new Date(b));
    const barData = barLabels.map(date => moduleCountsByDate[date]);
    // Fallbacks
    return {
      safeLineLabels: lineLabels.length > 0 ? lineLabels : ['No Data'],
      safeLineData: lineData.length > 0 ? lineData : [0],
      safeBarLabels: barLabels.length > 0 ? barLabels : ['No Data'],
      safeBarData: barData.length > 0 ? barData : [0],
    };
  }, [activityLogs]);

  // Line chart: Points over time
  const pointsHistory = activityLogs
    .filter(log => (log.activity_type === 'Module Viewed' || log.activity_type === 'Quiz Attempted') && getValidDate(log))
    .sort((a, b) => getValidDate(a) - getValidDate(b));
  let cumulativePoints = 0;
  const lineLabels = pointsHistory.map(log => {
    const d = getValidDate(log);
    return safeString(d ? d.toLocaleDateString() : '');
  });
  const lineData = pointsHistory.map(log => {
    cumulativePoints += safeNumber(log.points_earned);
    return cumulativePoints;
  });

  // Bar chart: Modules completed over time
  const moduleLogs = activityLogs.filter(log => log.activity_type === 'Module Viewed' && getValidDate(log));
  const moduleCountsByDate = {};
  moduleLogs.forEach(log => {
    const d = getValidDate(log);
    if (!d) return;
    const dateStr = safeString(d.toLocaleDateString());
    moduleCountsByDate[dateStr] = safeNumber(moduleCountsByDate[dateStr]) + 1;
  });
  const barLabels = Object.keys(moduleCountsByDate).map(safeString);
  const barData = Object.values(moduleCountsByDate).map(safeNumber);

  // Suggestion for next level
  let nextLevelPoints = 0;
  let pointsToNext = 0;
  if (progress) {
    nextLevelPoints = progress.level * 100;
    pointsToNext = nextLevelPoints - progress.points;
  }

  // Debug: log chart data arrays before rendering
  console.log('safeLineLabels', safeLineLabels);
  console.log('safeLineData', safeLineData);
  console.log('safeBarLabels', safeBarLabels);
  console.log('safeBarData', safeBarData);

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
                <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                <Link to="/modules" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Modules</Link>
                <Link to="/badges" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Badges</Link>
                <Link to="/quests" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Quests</Link>
                <Link to="/leaderboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Leaderboard</Link>
                <Link to="/analytics" className="border-green-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Analytics</Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user?.email}</span>
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
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Analytics & Performance</h1>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        {loading ? (
          <div className="text-center text-gray-500">Loading analytics...</div>
        ) : progress && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-2 text-green-700">Your Progress</h2>
                <ul className="text-gray-700 space-y-2">
                  <li><span className="font-semibold">Points:</span> {progress.points}</li>
                  <li><span className="font-semibold">Level:</span> {progress.level}</li>
                  <li><span className="font-semibold">Completed Modules:</span> {progress.completed_modules?.length || 0}</li>
                  <li><span className="font-semibold">Quizzes Completed:</span> {Array.isArray(progress.quiz_scores) ? progress.quiz_scores.filter(qs => qs.passed).length : 0}</li>
                  <li><span className="font-semibold">Badges:</span> {badges.length}</li>
                </ul>
                <div className="mt-4 text-sm text-blue-700 font-semibold">
                  {pointsToNext > 0
                    ? `You need ${pointsToNext} more points to reach Level ${progress.level + 1}. Keep completing modules and quizzes!`
                    : `Congratulations! You've reached the next level.`}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-2 text-green-700">Points Over Time</h2>
                {(() => {
                  try {
                    return (
                      <Line
                        data={{
                          labels: safeLineLabels,
                          datasets: [
                            {
                              label: 'Points',
                              data: safeLineData,
                              fill: false,
                              borderColor: 'rgb(34,197,94)',
                              backgroundColor: 'rgba(34,197,94,0.2)',
                              tension: 0.3,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            title: { display: false },
                          },
                          scales: {
                            x: {
                              ticks: {
                                maxRotation: 45,
                                minRotation: 30,
                                autoSkip: true,
                                maxTicksLimit: 7,
                              },
                            },
                            y: { beginAtZero: true },
                          },
                        }}
                        height={220}
                      />
                    );
                  } catch (err) {
                    return <div className="text-red-600">Chart rendering error: {err.message}</div>;
                  }
                })()}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-10">
              <h2 className="text-xl font-bold mb-2 text-green-700">Modules Completed Over Time</h2>
              {(() => {
                try {
                  return (
                    <Bar
                      data={{
                        labels: safeBarLabels,
                        datasets: [
                          {
                            label: 'Modules Completed',
                            data: safeBarData,
                            backgroundColor: 'rgba(34,197,94,0.7)',
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                          title: { display: false },
                        },
                        scales: {
                          x: {
                            ticks: {
                              maxRotation: 45,
                              minRotation: 30,
                              autoSkip: true,
                              maxTicksLimit: 7,
                            },
                          },
                          y: { beginAtZero: true },
                        },
                      }}
                      height={220}
                    />
                  );
                } catch (err) {
                  return <div className="text-red-600">Chart rendering error: {err.message}</div>;
                }
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics; 