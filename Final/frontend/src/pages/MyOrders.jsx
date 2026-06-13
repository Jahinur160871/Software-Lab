import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h2>My Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ৳{order.totalAmount}</p>
          <p><strong>Address:</strong> {order.deliveryAddress}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          <h4>Products:</h4>
          {order.products.map((item, idx) => (
            <div key={idx}>
              {item.productId?.title} - {item.quantity} x ৳{item.price}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;