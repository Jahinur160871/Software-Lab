import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId);
    updateCart(newCart);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    const newCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    updateCart(newCart);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="container">
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Shopping Cart</h2>
      {cart.map((item) => (
        <div key={item.productId} className="cart-item">
          <h3>{item.title}</h3>
          <p>Price: ৳{item.price}</p>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
            min="1"
          />
          <p>Total: ৳{item.price * item.quantity}</p>
          <button onClick={() => removeFromCart(item.productId)}>Remove</button>
        </div>
      ))}
      <h3>Grand Total: ৳{getTotal()}</h3>
      <button onClick={handleCheckout}>Proceed to Checkout</button>
    </div>
  );
};

export default Cart;