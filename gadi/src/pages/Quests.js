import React, { useEffect, useState } from 'react';
import axios from 'axios';

const badgeIcon = (badgeId) => {
  if (badgeId === 'badge_001') return '🏆';
  if (badgeId === 'badge_002') return '🧠';
  if (badgeId === 'badge_003') return '🔥';
  return '';
};

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [userQuests, setUserQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        // Fetch all quests
        const questsRes = await axios.get('http://localhost:5000/api/quests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuests(questsRes.data);
        // Fetch user profile for user_quests
        const userRes = await axios.get(`http://localhost:5000/api/user/profile/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserQuests(userRes.data.user_quests || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Error loading quests.');
        setQuests([]);
        setUserQuests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Merge user progress into active quests
  const questsWithUserProgress = quests.map(q => {
    if (q.status === 'Active') {
      const uq = userQuests.find(uq => uq.quest_id === q.quest_id);
      if (uq) return { ...q, ...uq };
    }
    return q;
  });

  const grouped = {
    Active: questsWithUserProgress.filter(q => q.status === 'Active'),
    Upcoming: questsWithUserProgress.filter(q => q.status === 'upcoming'),
    Expired: questsWithUserProgress.filter(q => q.status === 'expired'),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Quests</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            {Object.entries(grouped).map(([status, quests]) => (
              quests.length > 0 && (
                <div key={status} className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">{status} Quests</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {quests.map(quest => (
                      <div key={quest.quest_id} className={`rounded-lg shadow p-4 flex flex-col border-2 ${quest.completed ? 'border-green-500 bg-green-50' : status === 'Active' ? 'border-green-300 bg-white' : status === 'upcoming' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-gray-100 opacity-60'}`}>
                        <div className="flex items-center mb-2">
                          <span className="text-lg font-bold text-gray-900 flex-1">{quest.title}</span>
                          {quest.badge_reward && <span className="ml-2 text-2xl">{badgeIcon(quest.badge_reward)}</span>}
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
                    ))}
                  </div>
                </div>
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Quests; 