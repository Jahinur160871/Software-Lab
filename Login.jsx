import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {

      await login(formData.email, formData.password);

      navigate('/');

    } catch (error) {

      setMessage(
        error?.response?.data?.message || 'Unable to login'
      );

    }
  };

  return (
    <div className="container">

      <form onSubmit={submitHandler}>

        <h2>Login</h2>

        {message && (
          <p className="error">{message}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Sign In
        </button>

        <p>
          Create new account?{' '}
          <Link to="/register">
            Register
          </Link>
        </p>

      </form>

    </div>
  );
}

export default Login;