import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sellersPerformance, setSellersPerformance] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [showSuspendModal, setShowSuspendModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPendingSellers(),
      fetchStats(),
      fetchUsers(),
      fetchAllReviews(),
      fetchSellersPerformance()
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

  const fetchAllReviews = async () => {
    try {
      const ordersResponse = await api.get('/admin/all-orders');
      const allOrders = ordersResponse.data;
      const allReviews = allOrders
        .filter(order => order.rating && order.rating > 0)
        .map(order => ({
          id: order._id,
          productId: order.products[0]?.productId?._id,
          productName: order.products[0]?.productId?.title || 'Unknown Product',
          buyerName: order.buyerId?.name || 'Anonymous',
          buyerEmail: order.buyerId?.email || 'N/A',
          sellerId: order.products[0]?.sellerId?._id,
          sellerName: order.products[0]?.sellerId?.name || 'Unknown Seller',
          rating: order.rating,
          comment: order.ratingComment,
          createdAt: order.createdAt,
          orderId: order._id
        }));
      setReviews(allReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchSellersPerformance = async () => {
    try {
      const ordersResponse = await api.get('/admin/all-orders');
      const allOrders = ordersResponse.data;
      const usersResponse = await api.get('/admin/users');
      const allUsers = usersResponse.data;
      
      const sellers = allUsers.filter(user => user.isSeller && user.sellerApproved && !user.sellerSuspended);
      
      const performanceData = sellers.map(seller => {
        const sellerOrders = allOrders.filter(order => 
          order.products.some(p => p.sellerId?._id === seller._id || p.sellerId === seller._id)
        );
        
        const completedOrders = sellerOrders.filter(order => order.status === 'delivered');
        const cancelledOrders = sellerOrders.filter(order => order.status === 'cancelled');
        const pendingOrders = sellerOrders.filter(order => order.status === 'pending');
        
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        const sellerReviews = allOrders
          .filter(order => order.rating && order.products.some(p => p.sellerId?._id === seller._id || p.sellerId === seller._id))
          .map(order => ({ rating: order.rating, comment: order.ratingComment }));
        
        const avgRating = sellerReviews.length > 0 
          ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length 
          : 0;
        
        const totalProducts = sellerOrders.length > 0 
          ? [...new Set(sellerOrders.flatMap(order => order.products.map(p => p.productId?._id)))].length 
          : 0;
        
        return {
          ...seller,
          totalOrders: sellerOrders.length,
          completedOrders: completedOrders.length,
          cancelledOrders: cancelledOrders.length,
          pendingOrders: pendingOrders.length,
          totalRevenue,
          avgRating,
          totalReviews: sellerReviews.length,
          totalProducts,
          joinedDate: seller.createdAt
        };
      });
      
      performanceData.sort((a, b) => b.totalRevenue - a.totalRevenue);
      setSellersPerformance(performanceData);
    } catch (error) {
      console.error('Error fetching sellers performance:', error);
    }
  };

  const approveSeller = async (userId, approved) => {
    try {
      await api.put(`/admin/approve-seller/${userId}`, { approved });
      fetchPendingSellers();
      fetchStats();
      fetchUsers();
      fetchSellersPerformance();
    } catch (error) {
      console.error('Error approving seller:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/user/${userId}`);
        fetchUsers();
        fetchStats();
        fetchSellersPerformance();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const suspendSeller = async (sellerId, reason) => {
    if (!reason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }
    try {
      const response = await api.put(`/admin/suspend-seller/${sellerId}`, { 
        suspended: true, 
        reason: reason 
      });
      
      if (response.data.message) {
        alert('Seller has been suspended successfully');
        fetchUsers();
        fetchSellersPerformance();
        setShowSuspendModal(null);
        setSuspendReason('');
      }
    } catch (error) {
      console.error('Error suspending seller:', error);
      alert(error.response?.data?.message || 'Failed to suspend seller');
    }
  };

  const reinstateSeller = async (sellerId) => {
    if (window.confirm('Are you sure you want to reinstate this seller?')) {
      try {
        const response = await api.put(`/admin/reinstate-seller/${sellerId}`);
        if (response.data.message) {
          alert('Seller has been reinstated successfully');
          fetchUsers();
          fetchSellersPerformance();
        }
      } catch (error) {
        console.error('Error reinstating seller:', error);
        alert('Failed to reinstate seller');
      }
    }
  };

  const deleteReview = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.put(`/admin/delete-review/${orderId}`);
        fetchAllReviews();
        fetchSellersPerformance();
        alert('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  const formatPrice = (price) => {
    return `TK. ${(price || 0).toLocaleString()}`;
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating));
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
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Back to Home
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Manage your marketplace from one place</p>
      </div>

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
            <h3 style={styles.statValue}>{formatPrice(stats.totalRevenue)}</h3>
            <p style={styles.statLabel}>Total Revenue</p>
          </div>
        </div>
      </div>

      <div style={styles.tabNav}>
        <button onClick={() => setActiveTab('stats')} style={{ ...styles.tabButton, ...(activeTab === 'stats' && styles.tabButtonActive) }}>📊 Statistics</button>
        <button onClick={() => setActiveTab('sellers')} style={{ ...styles.tabButton, ...(activeTab === 'sellers' && styles.tabButtonActive) }}>
          👨‍💼 Pending Sellers
          {pendingSellers.length > 0 && <span style={styles.badge}>{pendingSellers.length}</span>}
        </button>
        <button onClick={() => setActiveTab('performance')} style={{ ...styles.tabButton, ...(activeTab === 'performance' && styles.tabButtonActive) }}>
          📈 Seller Performance
        </button>
        <button onClick={() => setActiveTab('users')} style={{ ...styles.tabButton, ...(activeTab === 'users' && styles.tabButtonActive) }}>👥 All Users</button>
        <button onClick={() => setActiveTab('reviews')} style={{ ...styles.tabButton, ...(activeTab === 'reviews' && styles.tabButtonActive) }}>
          ⭐ Reviews
          {reviews.length > 0 && <span style={styles.badge}>{reviews.length}</span>}
        </button>
      </div>

      <div style={styles.tabContent}>
        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div style={styles.statsDetails}>
            <div style={styles.detailCard}>
              <h4>Platform Overview</h4>
              <div style={styles.detailRow}><span>Active Products:</span><strong>{stats.totalProducts || 0}</strong></div>
              <div style={styles.detailRow}><span>Completed Orders:</span><strong>{stats.totalOrders || 0}</strong></div>
              <div style={styles.detailRow}><span>Pending Sellers:</span><strong>{pendingSellers.length}</strong></div>
              <div style={styles.detailRow}><span>Total Reviews:</span><strong>{reviews.length}</strong></div>
              <div style={styles.detailRow}>
                <span>Average Rating:</span>
                <strong>{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0} / 5</strong>
              </div>
              <div style={styles.detailRow}><span>Total Revenue:</span><strong style={{ color: '#d97706' }}>{formatPrice(stats.totalRevenue)}</strong></div>
            </div>
          </div>
        )}

        {/* Pending Sellers Tab */}
        {activeTab === 'sellers' && (
          <div>
            {pendingSellers.length === 0 ? (
              <div style={styles.emptyState}><span style={styles.emptyIcon}>✅</span><p>No pending seller requests</p></div>
            ) : (
              <div style={styles.sellersGrid}>
                {pendingSellers.map((seller) => (
                  <div key={seller._id} style={styles.sellerCard}>
                    <div style={styles.sellerHeader}>
                      <div style={styles.sellerAvatar}>{seller.name?.charAt(0) || 'S'}</div>
                      <div><h4 style={styles.sellerNameText}>{seller.name}</h4><p style={styles.sellerEmailText}>{seller.email}</p></div>
                    </div>
                    <div style={styles.sellerDetails}>
                      <div style={styles.detailItem}><span>🏪 Business:</span><strong>{seller.sellerDetails?.businessName}</strong></div>
                      <div style={styles.detailItem}><span>📂 Category:</span><strong>{seller.sellerDetails?.businessCategory}</strong></div>
                      <div style={styles.detailItem}><span>📞 Phone:</span><strong>{seller.sellerDetails?.phoneNumber}</strong></div>
                      <div style={styles.detailItem}><span>📝 Description:</span><p style={styles.descriptionText}>{seller.sellerDetails?.businessDescription}</p></div>
                    </div>
                    <div style={styles.sellerActions}>
                      <button onClick={() => approveSeller(seller._id, true)} style={styles.approveBtn}>✓ Approve</button>
                      <button onClick={() => approveSeller(seller._id, false)} style={styles.rejectBtn}>✗ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seller Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            {sellersPerformance.length === 0 ? (
              <div style={styles.emptyState}><span style={styles.emptyIcon}>📈</span><p>No active sellers yet</p></div>
            ) : (
              <div style={styles.performanceTable}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th>Seller</th>
                      <th>Business</th>
                      <th>Products</th>
                      <th>Orders</th>
                      <th>Completed</th>
                      <th>Revenue</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellersPerformance.map((seller) => (
                      <React.Fragment key={seller._id}>
                        <tr 
                          style={styles.tableRow} 
                          onClick={() => setSelectedSeller(selectedSeller === seller._id ? null : seller._id)}
                        >
                          <td style={styles.userCell}>
                            <div style={styles.userAvatar}>{seller.name?.charAt(0) || 'S'}</div>
                            <div>
                              <div style={styles.userName}>{seller.name}</div>
                              <div style={styles.userEmail}>{seller.email}</div>
                            </div>
                          </td>
                          <td><strong>{seller.sellerDetails?.businessName || 'N/A'}</strong></td>
                          <td>{seller.totalProducts}</td>
                          <td>{seller.totalOrders}</td>
                          <td><span style={{ color: '#10b981' }}>{seller.completedOrders}</span> / {seller.totalOrders}</td>
                          <td><strong style={{ color: '#d97706' }}>{formatPrice(seller.totalRevenue)}</strong></td>
                          <td>
                            <div style={styles.ratingCell}>
                              <span style={styles.ratingStarsSmall}>{getRatingStars(seller.avgRating)}</span>
                              <span>({seller.avgRating.toFixed(1)})</span>
                            </div>
                          </td>
                          <td>
                            <div style={styles.userActions}>
                              <button onClick={() => setSelectedSeller(selectedSeller === seller._id ? null : seller._id)} style={styles.viewBtn}>👁️ View</button>
                              {seller.email !== 'admin@campusmart.com' && (
                                <button onClick={() => setShowSuspendModal(seller)} style={styles.suspendBtn}>⚠️ Suspend</button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {selectedSeller === seller._id && (
                          <tr>
                            <td colSpan="8" style={styles.expandedRow}>
                              <div style={styles.expandedContent}>
                                <div style={styles.expandedGrid}>
                                  <div style={styles.expandedCard}>
                                    <h4>Sales Overview</h4>
                                    <div style={styles.expandedStat}><span>Total Orders:</span><strong>{seller.totalOrders}</strong></div>
                                    <div style={styles.expandedStat}><span>Completed Orders:</span><strong>{seller.completedOrders}</strong></div>
                                    <div style={styles.expandedStat}><span>Cancelled Orders:</span><strong style={{ color: '#dc2626' }}>{seller.cancelledOrders}</strong></div>
                                    <div style={styles.expandedStat}><span>Pending Orders:</span><strong style={{ color: '#f59e0b' }}>{seller.pendingOrders}</strong></div>
                                    <div style={styles.expandedStat}><span>Total Revenue:</span><strong style={{ color: '#d97706' }}>{formatPrice(seller.totalRevenue)}</strong></div>
                                  </div>
                                  <div style={styles.expandedCard}>
                                    <h4>Product & Review Stats</h4>
                                    <div style={styles.expandedStat}><span>Total Products:</span><strong>{seller.totalProducts}</strong></div>
                                    <div style={styles.expandedStat}><span>Total Reviews:</span><strong>{seller.totalReviews}</strong></div>
                                    <div style={styles.expandedStat}><span>Average Rating:</span>
                                      <div style={styles.ratingCell}>
                                        <span style={styles.ratingStarsSmall}>{getRatingStars(seller.avgRating)}</span>
                                        <strong>({seller.avgRating.toFixed(1)})</strong>
                                      </div>
                                    </div>
                                    <div style={styles.expandedStat}><span>Joined Date:</span><strong>{new Date(seller.joinedDate).toLocaleDateString()}</strong></div>
                                  </div>
                                  <div style={styles.expandedCard}>
                                    <h4>Business Information</h4>
                                    <div style={styles.expandedStat}><span>Business Name:</span><strong>{seller.sellerDetails?.businessName || 'N/A'}</strong></div>
                                    <div style={styles.expandedStat}><span>Category:</span><strong>{seller.sellerDetails?.businessCategory || 'N/A'}</strong></div>
                                    <div style={styles.expandedStat}><span>Phone:</span><strong>{seller.sellerDetails?.phoneNumber || 'N/A'}</strong></div>
                                    <div style={styles.expandedStat}><span>Status:</span>
                                      <span style={styles.approvedBadge}>Active</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div style={styles.usersTable}>
            <table style={styles.table}>
              <thead><tr style={styles.tableHeader}><th>User</th><th>Email</th><th>Role</th><th>Seller Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={styles.tableRow}>
                    <td style={styles.userCell}><div style={styles.userAvatar}>{user.name?.charAt(0) || 'U'}</div><span>{user.name}</span></td>
                    <td>{user.email}</td>
                    <td><span style={{ ...styles.roleBadge, ...(user.role === 'student' ? styles.roleStudent : user.role === 'faculty' ? styles.roleFaculty : styles.roleStaff) }}>{user.role === 'student' ? 'Student' : user.role === 'faculty' ? 'Faculty' : 'Staff'}</span></td>
                    <td>
                      {user.isSeller ? (
                        user.sellerSuspended ? (
                          <span style={styles.suspendedBadge}>⚠️ Suspended</span>
                        ) : user.sellerApproved ? (
                          <span style={styles.approvedBadge}>✓ Approved</span>
                        ) : (
                          <span style={styles.pendingBadge}>⏳ Pending</span>
                        )
                      ) : (
                        <span style={styles.notSellerBadge}>Not a Seller</span>
                      )}
                    </td>
                    <td>
                      <div style={styles.userActions}>
                        {user.isSeller && user.sellerSuspended && (
                          <button onClick={() => reinstateSeller(user._id)} style={styles.reinstateBtn}>↺ Reinstate</button>
                        )}
                        {user.isSeller && user.sellerApproved && !user.sellerSuspended && user.email !== 'admin@campusmart.com' && (
                          <button onClick={() => setShowSuspendModal(user)} style={styles.suspendBtn}>⚠️ Suspend</button>
                        )}
                        {user.email !== 'admin@campusmart.com' && (
                          <button onClick={() => deleteUser(user._id)} style={styles.deleteBtn}>🗑️ Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <div style={styles.emptyState}><span style={styles.emptyIcon}>⭐</span><p>No reviews yet</p></div>
            ) : (
              <div style={styles.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <div style={styles.reviewerInfo}>
                        <div style={styles.reviewerAvatar}>{review.buyerName.charAt(0)}</div>
                        <div><div style={styles.reviewerNameText}>{review.buyerName}</div><div style={styles.reviewerEmailText}>{review.buyerEmail}</div></div>
                      </div>
                      <div style={styles.ratingBox}><span style={styles.ratingStars}>{getRatingStars(review.rating)}</span><span style={styles.ratingValue}>{review.rating}.0</span></div>
                    </div>
                    <div style={styles.productInfo}><span style={styles.productLabel}>Product:</span><span style={styles.productNameText}>{review.productName}</span></div>
                    <div style={styles.sellerInfoBlock}><span style={styles.sellerLabel}>Seller:</span><span style={styles.sellerNameText}>{review.sellerName}</span>
                      <button onClick={() => setShowSuspendModal({ _id: review.sellerId, name: review.sellerName })} style={styles.suspendSellerBtn}>⚠️ Suspend Seller</button>
                    </div>
                    {review.comment && <div style={styles.reviewComment}><span style={styles.commentIcon}>💬</span><p>"{review.comment}"</p></div>}
                    <div style={styles.reviewFooter}><span style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
                      <button onClick={() => deleteReview(review.orderId)} style={styles.deleteReviewBtn}>Delete Review</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showSuspendModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Suspend Seller</h3>
            <p style={styles.modalSubtitle}>You are about to suspend <strong>{showSuspendModal.name}</strong></p>
            <textarea placeholder="Reason for suspension..." value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} style={styles.modalTextarea} rows="4" />
            <div style={styles.modalButtons}>
              <button onClick={() => { setShowSuspendModal(null); setSuspendReason(''); }} style={styles.modalCancelBtn}>Cancel</button>
              <button onClick={() => suspendSeller(showSuspendModal._id, suspendReason)} style={styles.modalConfirmBtn}>Suspend Seller</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', backgroundColor: '#f5f7fa', minHeight: '100vh' },
  backButton: { backgroundColor: '#ffffff', color: '#1a2c3e', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '24px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1a2c3e', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#5a6e7c' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' },
  statCard: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #eef2f6' },
  statIcon: { fontSize: '36px' },
  statContent: { flex: 1 },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1a2c3e', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#5a6e7c', margin: 0 },
  
  tabNav: { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' },
  tabButton: { padding: '10px 20px', fontSize: '14px', fontWeight: '500', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#5a6e7c', borderRadius: '8px 8px 0 0' },
  tabButtonActive: { color: '#d97706', borderBottom: '2px solid #d97706' },
  badge: { backgroundColor: '#d97706', color: '#fff', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', marginLeft: '8px' },
  
  tabContent: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' },
  statsDetails: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  detailCard: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0', fontSize: '13px' },
  
  sellersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' },
  sellerCard: { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #eef2f6' },
  sellerHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  sellerAvatar: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' },
  sellerNameText: { fontSize: '16px', fontWeight: '600', color: '#1a2c3e', marginBottom: '4px' },
  sellerEmailText: { fontSize: '12px', color: '#5a6e7c' },
  sellerDetails: { marginBottom: '16px' },
  detailItem: { marginBottom: '8px', fontSize: '13px', color: '#4a5568' },
  descriptionText: { fontSize: '12px', color: '#5a6e7c', marginTop: '4px', lineHeight: '1.5' },
  sellerActions: { display: 'flex', gap: '12px' },
  approveBtn: { flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  rejectBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  
  performanceTable: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { textAlign: 'left', padding: '12px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '12px', fontWeight: '600', color: '#4a5568' },
  tableRow: { borderBottom: '1px solid #eef2f6', cursor: 'pointer', '&:hover': { backgroundColor: '#f8fafc' } },
  userCell: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' },
  userName: { fontSize: '14px', fontWeight: '600', color: '#1a2c3e' },
  userEmail: { fontSize: '11px', color: '#5a6e7c' },
  ratingCell: { display: 'flex', alignItems: 'center', gap: '6px' },
  ratingStarsSmall: { fontSize: '11px', color: '#f59e0b', letterSpacing: '1px' },
  
  expandedRow: { backgroundColor: '#f8fafc' },
  expandedContent: { padding: '20px' },
  expandedGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  expandedCard: { backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #eef2f6' },
  expandedStat: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', borderBottom: '1px solid #eef2f6' },
  
  usersTable: { overflowX: 'auto' },
  roleBadge: { padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
  roleStudent: { backgroundColor: '#e0f2fe', color: '#0284c7' },
  roleFaculty: { backgroundColor: '#fae8ff', color: '#a21caf' },
  roleStaff: { backgroundColor: '#fef3c7', color: '#d97706' },
  approvedBadge: { color: '#10b981', fontWeight: '500', fontSize: '12px' },
  pendingBadge: { color: '#f59e0b', fontWeight: '500', fontSize: '12px' },
  suspendedBadge: { color: '#dc2626', fontWeight: '500', fontSize: '12px' },
  notSellerBadge: { color: '#94a3b8', fontWeight: '500', fontSize: '12px' },
  userActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  viewBtn: { backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' },
  suspendBtn: { backgroundColor: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' },
  reinstateBtn: { backgroundColor: '#d1fae5', color: '#059669', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' },
  
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  reviewCard: { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #eef2f6' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' },
  reviewerInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  reviewerAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1a2c3e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' },
  reviewerNameText: { fontSize: '14px', fontWeight: '600', color: '#1a2c3e' },
  reviewerEmailText: { fontSize: '11px', color: '#5a6e7c' },
  ratingBox: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef3c7', padding: '6px 12px', borderRadius: '20px' },
  ratingStars: { fontSize: '12px', color: '#f59e0b', letterSpacing: '1px' },
  ratingValue: { fontSize: '12px', fontWeight: '600', color: '#d97706' },
  productInfo: { fontSize: '13px', marginBottom: '8px' },
  productLabel: { color: '#5a6e7c', marginRight: '8px' },
  productNameText: { fontWeight: '500', color: '#1a2c3e' },
  sellerInfoBlock: { fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  sellerLabel: { color: '#5a6e7c' },
  suspendSellerBtn: { backgroundColor: '#fef3c7', color: '#d97706', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' },
  reviewComment: { display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', marginBottom: '12px' },
  commentIcon: { fontSize: '14px' },
  reviewFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reviewDate: { fontSize: '11px', color: '#94a3b8' },
  deleteReviewBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' },
  modalTitle: { fontSize: '18px', fontWeight: '600', color: '#1a2c3e', marginBottom: '8px' },
  modalSubtitle: { fontSize: '13px', color: '#5a6e7c', marginBottom: '16px' },
  modalTextarea: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', marginBottom: '20px' },
  modalButtons: { display: 'flex', gap: '12px' },
  modalCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8' },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '16px' },
  
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  loader: { border: '3px solid #e2e8f0', borderTop: '3px solid #d97706', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '16px' },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default AdminDashboard;