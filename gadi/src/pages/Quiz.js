import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/quizzes/by-quizid/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuiz(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Error loading quiz.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const payload = {
      userId: user.id,
      answers: quiz.questions.map(q => ({
        question_id: q.question_id,
        selected_option: answers[q.question_id] || ''
      }))
    };
    try {
      const res = await axios.post(`http://localhost:5000/api/quizzes/submit/${quiz.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error submitting quiz.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading quiz...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
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
        <h1 className="text-3xl font-bold mb-6">Quiz</h1>
        <h2 className="text-xl font-semibold mb-4">{quiz.title || quiz.quiz_id}</h2>
        {submitted && result ? (
          <div className="mb-6">
            <div className="text-lg font-bold mb-2">Your Score: {result.score}%</div>
            <div className={result.passed ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {result.passed ? 'Congratulations! You passed the quiz.' : 'You did not pass. Try again!'}
            </div>
            <div className="mt-4">
              <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">Back</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {quiz.questions && quiz.questions.length > 0 ? (
                quiz.questions.map((q, idx) => (
                  <div key={q.question_id} className="mb-6">
                    <div className="font-semibold mb-2">{idx + 1}. {q.question_text}</div>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center">
                          <input
                            type="radio"
                            name={`q_${q.question_id}`}
                            id={`q_${q.question_id}_opt_${i}`}
                            value={opt}
                            checked={answers[q.question_id] === opt}
                            onChange={() => handleChange(q.question_id, opt)}
                            className="mr-2"
                            required
                          />
                          <label htmlFor={`q_${q.question_id}_opt_${i}`}>{opt}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div>No questions found for this quiz.</div>
              )}
            </div>
            <button type="submit" className="mt-8 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Submit Quiz</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Quiz; 