import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPendingSellers(),
      fetchStats(),
      fetchUsers()
    ]);
    setLoading(false);
  };

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
      fetchStats();
    } catch (error) {
      console.error('Error approving seller:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/user/${userId}`);
        fetchUsers();
        fetchStats();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back to Home Button */}
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Back to Home
      </button>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Manage your marketplace from one place</p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statContent}>
            <h3 style={styles.statValue}>{stats.totalUsers || 0}</h3>
            <p style={styles.statLabel}>Total Users</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div style={styles.statContent}>
            <h3 style={styles.statValue}>{stats.totalProducts || 0}</h3>
            <p style={styles.statLabel}>Total Products</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🛒</div>
          <div style={styles.statContent}>
            <h3 style={styles.statValue}>{stats.totalOrders || 0}</h3>
            <p style={styles.statLabel}>Total Orders</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statValue}>৳{stats.totalRevenue || 0}</h3>
            <p style={styles.statLabel}>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'stats' ? styles.tabButtonActive : {})
          }}
        >
          📊 Statistics
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'sellers' ? styles.tabButtonActive : {})
          }}
        >
          👨‍💼 Pending Sellers
          {pendingSellers.length > 0 && (
            <span style={styles.badge}>{pendingSellers.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'users' ? styles.tabButtonActive : {})
          }}
        >
          👥 All Users
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === 'stats' && (
          <div style={styles.statsDetails}>
            <div style={styles.detailCard}>
              <h4>Platform Overview</h4>
              <div style={styles.detailRow}>
                <span>Active Products:</span>
                <strong>{stats.totalProducts || 0}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>Completed Orders:</span>
                <strong>{stats.totalOrders || 0}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>Pending Sellers:</span>
                <strong>{pendingSellers.length}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>Total Revenue:</span>
                <strong style={{ color: '#ff6b35' }}>৳{stats.totalRevenue || 0}</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div>
            {pendingSellers.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>✅</span>
                <p>No pending seller requests</p>
              </div>
            ) : (
              <div style={styles.sellersGrid}>
                {pendingSellers.map((seller) => (
                  <div key={seller._id} style={styles.sellerCard}>
                    <div style={styles.sellerHeader}>
                      <span style={styles.sellerAvatar}>
                        {seller.name?.charAt(0) || '👤'}
                      </span>
                      <div>
                        <h4 style={styles.sellerName}>{seller.name}</h4>
                        <p style={styles.sellerEmail}>{seller.email}</p>
                      </div>
                    </div>
                    <div style={styles.sellerDetails}>
                      <div style={styles.detailItem}>
                        <span>🏪 Business:</span>
                        <strong>{seller.sellerDetails?.businessName}</strong>
                      </div>
                      <div style={styles.detailItem}>
                        <span>📂 Category:</span>
                        <strong>{seller.sellerDetails?.businessCategory}</strong>
                      </div>
                      <div style={styles.detailItem}>
                        <span>📞 Phone:</span>
                        <strong>{seller.sellerDetails?.phoneNumber}</strong>
                      </div>
                      <div style={styles.detailItem}>
                        <span>📝 Description:</span>
                        <p style={styles.description}>
                          {seller.sellerDetails?.businessDescription}
                        </p>
                      </div>
                    </div>
                    <div style={styles.sellerActions}>
                      <button
                        onClick={() => approveSeller(seller._id, true)}
                        style={styles.approveBtn}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => approveSeller(seller._id, false)}
                        style={styles.rejectBtn}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div style={styles.usersTable}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Seller Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={styles.tableRow}>
                    <td style={styles.userCell}>
                      <span style={styles.userAvatar}>
                        {user.name?.charAt(0) || '👤'}
                      </span>
                      <span>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span style={{
                        ...styles.roleBadge,
                        ...(user.role === 'student' ? styles.roleStudent : 
                           user.role === 'faculty' ? styles.roleFaculty : 
                           styles.roleStaff)
                      }}>
                        {user.role === 'student' ? '🎓 Student' : 
                         user.role === 'faculty' ? '👨‍🏫 Faculty' : 
                         '👔 Staff'}
                      </span>
                    </td>
                    <td>
                      {user.isSeller ? (
                        user.sellerApproved ? (
                          <span style={styles.approvedBadge}>✅ Approved</span>
                        ) : (
                          <span style={styles.pendingBadge}>⏳ Pending</span>
                        )
                      ) : (
                        <span style={styles.notSellerBadge}>❌ Not a Seller</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => deleteUser(user._id)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: '30px',
    left: '30px',
    backgroundColor: '#fff',
    color: '#ff6b35',
    border: '1px solid #ff6b35',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    zIndex: 10
  },
  header: {
    marginBottom: '30px',
    marginTop: '20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s'
  },
  statIcon: {
    fontSize: '40px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  tabNav: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '0'
  },
  tabButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.3s',
    position: 'relative',
    borderRadius: '8px 8px 0 0'
  },
  tabButtonActive: {
    color: '#ff6b35',
    backgroundColor: '#fff',
    borderBottom: '3px solid #ff6b35'
  },
  badge: {
    backgroundColor: '#ff6b35',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 8px',
    fontSize: '12px',
    marginLeft: '8px'
  },
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  statsDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  detailCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0'
  },
  sellersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px'
  },
  sellerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    transition: 'transform 0.3s'
  },
  sellerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px'
  },
  sellerAvatar: {
    width: '50px',
    height: '50px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  sellerName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  sellerEmail: {
    fontSize: '13px',
    color: '#666'
  },
  sellerDetails: {
    marginBottom: '15px'
  },
  detailItem: {
    marginBottom: '8px',
    fontSize: '14px'
  },
  description: {
    fontSize: '13px',
    color: '#666',
    marginTop: '4px',
    lineHeight: '1.5'
  },
  sellerActions: {
    display: 'flex',
    gap: '10px'
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background 0.3s'
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background 0.3s'
  },
  usersTable: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    textAlign: 'left',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0'
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0'
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  roleBadge: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  roleStudent: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2'
  },
  roleFaculty: {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2'
  },
  roleStaff: {
    backgroundColor: '#fff3e0',
    color: '#f57c00'
  },
  approvedBadge: {
    color: '#28a745',
    fontWeight: '500'
  },
  pendingBadge: {
    color: '#ff9800',
    fontWeight: '500'
  },
  notSellerBadge: {
    color: '#999',
    fontWeight: '500'
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  },
  loader: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #ff6b35',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#999'
  },
  emptyIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px'
  }
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  .seller-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  .table-row:hover {
    background-color: #f8f9fa;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;