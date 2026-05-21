import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BecomeSeller = () => {
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/become-seller', {
        businessName,
        businessDescription,
        businessCategory,
        phoneNumber
      });
      await checkAuth();
      setMessage('Seller request submitted! Awaiting admin approval.');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setMessage('Failed to submit request');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Become a Seller</h2>
        {message && <p className="success">{message}</p>}
        <input
          type="text"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
        <textarea
          placeholder="Business Description"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          rows="3"
          required
        />
        <input
          type="text"
          placeholder="Business Category (e.g., Food, Clothing)"
          value={businessCategory}
          onChange={(e) => setBusinessCategory(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default BecomeSeller;