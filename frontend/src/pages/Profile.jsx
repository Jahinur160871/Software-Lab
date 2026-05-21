import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { name, email };
      if (password) updateData.password = password;
      await api.put('/auth/profile', updateData);
      await checkAuth();
      setMessage('Profile updated successfully!');
      setPassword('');
    } catch (error) {
      setMessage('Update failed');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>My Profile</h2>
        {message && <p className="success">{message}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password (leave blank to keep same)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;