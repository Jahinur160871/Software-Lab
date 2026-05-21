import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const Checkout = () => {
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const directProduct = location.state?.product;

  const getProducts = () => {
    if (directProduct) {
      return [{ productId: directProduct._id, quantity: 1, price: directProduct.price }];
    }
    return cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
  };

  const getTotal = () => {
    if (directProduct) return directProduct.price;
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/orders', {
        products: getProducts(),
        deliveryAddress: address,
        contactNumber
      });
      localStorage.removeItem('cart');
      alert('Order placed successfully!');
      navigate('/my-orders');
    } catch (error) {
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Checkout</h2>
        <h3>Total Amount: ৳{getTotal()}</h3>
        <textarea
          placeholder="Delivery Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows="3"
          required
        />
        <input
          type="tel"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;