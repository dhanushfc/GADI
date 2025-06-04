import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        // Fetch all badges
        const badgesRes = await axios.get('http://localhost:5000/api/badges', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBadges(badgesRes.data);
        // Fetch user profile to get acquired badges
        const userRes = await axios.get(`http://localhost:5000/api/user/profile/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserBadges(userRes.data.badges || []);
      } catch (err) {
        setBadges([]);
        setUserBadges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Badges</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {badges.map((badge) => {
              const acquired = userBadges.includes(badge.badge_id);
              // Choose an icon based on badge title
              let icon = '🏅';
              if (badge.title.toLowerCase().includes('champ')) icon = '🏆';
              else if (badge.title.toLowerCase().includes('quiz')) icon = '🧠';
              else if (badge.title.toLowerCase().includes('streak')) icon = '🔥';
              return (
                <div
                  key={badge.badge_id}
                  className={`rounded-lg shadow p-4 flex flex-col items-center border-2 ${acquired ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white opacity-60'}`}
                >
                  <div className={`w-20 h-20 mb-3 flex items-center justify-center text-5xl ${acquired ? '' : 'grayscale'}`}>{icon}</div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">{badge.title}</h2>
                  <p className="text-gray-600 text-sm mb-2 text-center">{badge.description}</p>
                  <span className="text-xs text-gray-500">Unlock: {badge.unlock_criteria}</span>
                  {acquired && (
                    <span className="mt-2 px-2 py-1 bg-green-500 text-white text-xs rounded">Acquired</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Badges; 