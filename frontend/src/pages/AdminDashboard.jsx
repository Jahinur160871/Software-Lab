import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    fetchPendingSellers();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      const response = await api.get('/admin/pending-sellers');
      setPendingSellers(response.data);
    } catch (error) {
      console.error('Error fetching pending sellers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const approveSeller = async (userId, approved) => {
    try {
      await api.put(`/admin/approve-seller/${userId}`, { approved });
      fetchPendingSellers();
    } catch (error) {
      console.error('Error approving seller:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/admin/user/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <div className="admin-tabs">
        <button onClick={() => setActiveTab('stats')}>Stats</button>
        <button onClick={() => setActiveTab('sellers')}>Pending Sellers ({pendingSellers.length})</button>
        <button onClick={() => setActiveTab('users')}>Users</button>
      </div>

      {activeTab === 'stats' && (
        <div>
          <h3>Statistics</h3>
          <p>Total Users: {stats.totalUsers}</p>
          <p>Total Products: {stats.totalProducts}</p>
          <p>Total Orders: {stats.totalOrders}</p>
          <p>Pending Sellers: {stats.pendingSellers}</p>
          <p>Total Revenue: ৳{stats.totalRevenue}</p>
        </div>
      )}

      {activeTab === 'sellers' && (
        <div>
          <h3>Pending Seller Requests</h3>
          {pendingSellers.map((seller) => (
            <div key={seller._id}>
              <p><strong>{seller.name}</strong> - {seller.email}</p>
              <p>Business: {seller.sellerDetails?.businessName}</p>
              <button onClick={() => approveSeller(seller._id, true)}>Approve</button>
              <button onClick={() => approveSeller(seller._id, false)}>Reject</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3>All Users</h3>
          {users.map((user) => (
            <div key={user._id}>
              <p>{user.name} - {user.email} - {user.role}</p>
              <button onClick={() => deleteUser(user._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;