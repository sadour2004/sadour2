import React from 'react';
import Login from '../components/Login';
import axios from 'axios';

export default function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const serverIP = window.location.protocol + '//' + window.location.hostname;
    axios.post(`${serverIP}:5000/api/auth/login`, { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/dashboard';
      })
      .catch(err => {
        console.error('Login error:', err);
        setError('Invalid credentials');
      });
  };

  return <Login />;
} 