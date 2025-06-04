import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/modules/${moduleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModule(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Error loading module.');
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [moduleId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading module...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!module) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Navigation - copy from Dashboard for consistency */}
      <nav className="bg-white shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-green-700">GADI</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</a>
                <a href="/modules" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Modules</a>
                <a href="/badges" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Badges</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6">{module.title}</h1>
        <p className="mb-4 text-gray-700">{module.description}</p>
        {/* Module Content */}
        {module.content_type === 'video' && module.content_url && (
          <div className="mb-4">
            <video controls className="w-full rounded">
              <source src={module.content_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="text-sm text-gray-500 mt-2">Video content</div>
          </div>
        )}
        {module.content_type === 'text' && module.content_url && (
          <div className="mb-4">
            <a href={module.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF/Text Content</a>
            <div className="text-sm text-gray-500 mt-2">Text/PDF content</div>
          </div>
        )}
        {module.content_type === 'interactive' && module.content_url && (
          <div className="mb-4">
            <a href={module.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open Interactive Content</a>
            <div className="text-sm text-gray-500 mt-2">Interactive content</div>
          </div>
        )}
        {module.content_type === 'infographic' && module.content_url && (
          <div className="mb-4">
            <a href={module.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Infographic</a>
            <div className="text-sm text-gray-500 mt-2">Infographic content</div>
          </div>
        )}
        <button onClick={() => navigate(-1)} className="mt-8 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">Back</button>
      </div>
    </div>
  );
};

export default ModuleDetail; 