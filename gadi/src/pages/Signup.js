import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

// Constants for dropdown options
const AGE_GROUPS = ['Under-16', 'Under-18', 'Adult'];
const SPORTS = [
  'Athletics',
  'Swimming',
  'Cricket',
  'Basketball',
  'Football',
  'Tennis',
  'Boxing',
  'Wrestling',
  'Gymnastics',
  'Volleyball'
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age_group: '',
    sport: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();
      localStorage.setItem('token', idToken);

      // Prepare user data for backend
      const registerData = { ...formData, id: firebaseUser.uid };
      delete registerData.confirmPassword;

      // Create user in Firestore via backend
      const response = await axios.post('http://localhost:5000/api/user', registerData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.data.success) {
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (name, label, type = 'text', required = false) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={formData[name]}
          onChange={handleChange}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>
  );

  const renderSelectField = (name, label, options, required = false) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">
        <select
          id={name}
          name={name}
          required={required}
          value={formData[name]}
          onChange={handleChange}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join GADI to learn about anti-doping in sports
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Required Fields */}
            {renderInputField('name', 'Full Name', 'text', true)}
            {renderInputField('email', 'Email Address', 'email', true)}
            {renderInputField('password', 'Password', 'password', true)}
            {renderInputField('confirmPassword', 'Confirm Password', 'password', true)}
            {renderSelectField('age_group', 'Age Group', AGE_GROUPS, true)}
            {renderSelectField('sport', 'Sport', SPORTS, true)}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {isSubmitting ? 'Signing up...' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-500"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 