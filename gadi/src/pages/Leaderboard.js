import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUserId(user?.id);
        const res = await axios.get('http://localhost:5000/api/user/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Error loading leaderboard.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Leaderboard</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Points</th>
                  <th className="px-4 py-2 text-left">Level</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} className={user.id === currentUserId ? 'bg-green-100 font-bold' : ''}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.points}</td>
                    <td className="px-4 py-2">{user.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-gray-400 mt-4">No users found.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 