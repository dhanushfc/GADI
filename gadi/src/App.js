import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Quiz from './pages/Quiz';
import ModuleDetail from './pages/ModuleDetail';
import Badges from './pages/Badges';
import Quests from './pages/Quests';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/modules/:moduleId" element={<ModuleDetail />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
