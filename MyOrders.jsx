import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/layout/Header';
import OrderTracker from '../components/orders/OrderTracker';
import ChatBox from '../components/common/ChatBox';
import MessageNotification from '../components/common/MessageNotification';
import { useAuth } from '../context/AuthContext';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      console.log('Orders fetched:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await api.get('/messages/unread/count');
      const unreadMap = {};
      response.data.unreadByOrder.forEach(item => {
        unreadMap[item._id] = item.count;
      });
      setUnreadMessages(unreadMap);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { label: 'Pending', color: '#d97706', bg: '#fef3c7' },
      confirmed: { label: 'Confirmed', color: '#059669', bg: '#d1fae5' },
      preparing: { label: 'Preparing', color: '#7c3aed', bg: '#ede9fe' },
      delivering: { label: 'Out for Delivery', color: '#2563eb', bg: '#dbeafe' },
      delivered: { label: 'Delivered', color: '#059669', bg: '#d1fae5' },
      cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' }
    };
    return styles[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  };

  const formatPrice = (price) => {
    return `TK. ${(price || 0).toLocaleString()}`;
  };

  const getSellerIdFromOrder = (order) => {
    if (order.products && order.products.length > 0 && order.products[0].sellerId) {
      return order.products[0].sellerId._id || order.products[0].sellerId;
    }
    return null;
  };

  const handleChatOpen = (order) => {
    setChatOrder(order);
    markOrderAsRead(order._id);
  };

  const markOrderAsRead = async (orderId) => {
    try {
      await api.put(`/messages/read/${orderId}`);
      setUnreadMessages(prev => ({ ...prev, [orderId]: 0 }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.loader}></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <MessageNotification />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>My Orders</h1>
            <p style={styles.pageSubtitle}>Track and manage all your purchases</p>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.statChip}>
              <strong>{stats.total}</strong>
              <span>Total Orders</span>
            </div>
            {stats.delivered > 0 && (
              <div style={styles.statChip}>
                <strong>{stats.delivered}</strong>
                <span>Delivered</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderTopColor: '#d97706' }}>
            <div style={styles.statNumber}>{stats.pending}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={{ ...styles.statCard, borderTopColor: '#059669' }}>
            <div style={styles.statNumber}>{stats.confirmed}</div>
            <div style={styles.statLabel}>Confirmed</div>
          </div>
          <div style={{ ...styles.statCard, borderTopColor: '#7c3aed' }}>
            <div style={styles.statNumber}>{stats.preparing}</div>
            <div style={styles.statLabel}>Preparing</div>
          </div>
          <div style={{ ...styles.statCard, borderTopColor: '#2563eb' }}>
            <div style={styles.statNumber}>{stats.delivering}</div>
            <div style={styles.statLabel}>Out for Delivery</div>
          </div>
          <div style={{ ...styles.statCard, borderTopColor: '#059669' }}>
            <div style={styles.statNumber}>{stats.delivered}</div>
            <div style={styles.statLabel}>Delivered</div>
          </div>
          <div style={{ ...styles.statCard, borderTopColor: '#dc2626' }}>
            <div style={styles.statNumber}>{stats.cancelled}</div>
            <div style={styles.statLabel}>Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <div style={styles.filterTabs}>
            {['all', 'pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === status ? styles.filterBtnActive : {})
                }}
              >
                {status === 'all' ? 'All Orders' : getStatusStyle(status).label}
                {status !== 'all' && stats[status] > 0 && (
                  <span style={styles.filterCount}>{stats[status]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3>No Orders Found</h3>
            <p>You haven't placed any orders yet</p>
            <button onClick={() => window.location.href = '/'} style={styles.shopBtn}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {filteredOrders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const sellerId = getSellerIdFromOrder(order);
              const unreadCount = unreadMessages[order._id] || 0;
              const isExpanded = expandedOrder === order._id;
              const firstProduct = order.products[0];
              const productCount = order.products.length;
              const moreItems = productCount - 1;
              
              // Get size for first product (if exists)
              const firstProductSize = firstProduct?.size && firstProduct.size !== 'null' ? firstProduct.size : null;
              
              return (
                <div key={order._id} style={styles.orderCard}>
                  {/* Order Header */}
                  <div style={styles.orderHeader}>
                    <div style={styles.orderInfo}>
                      <span style={styles.orderId}>#{order._id.slice(-8)}</span>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div style={styles.orderMeta}>
                      <span style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => toggleExpand(order._id)}
                        style={styles.expandBtn}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    </div>
                  </div>

                  {/* Order Items Preview with Size */}
                  <div style={styles.itemsPreview}>
                    {firstProduct?.productId?.images?.[0] ? (
                      <img 
                        src={firstProduct.productId.images[0]} 
                        alt="" 
                        style={styles.itemThumb}
                      />
                    ) : (
                      <div style={styles.itemThumbPlaceholder}>📦</div>
                    )}
                    <div style={styles.itemDetails}>
                      <div style={styles.itemTitle}>
                        {firstProduct?.productId?.title || 'Product'}
                        {moreItems > 0 && (
                          <span style={styles.moreItems}> +{moreItems} more</span>
                        )}
                      </div>
                      <div style={styles.itemMeta}>
                        {firstProductSize && (
                          <span style={styles.sizeBadge}>Size: {firstProductSize}</span>
                        )}
                        <span>Qty: {firstProduct?.quantity || 0}</span>
                        <span style={styles.itemPrice}>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.actionButtons}>
                    <button 
                      onClick={() => handleChatOpen(order)}
                      style={styles.chatBtn}
                      disabled={!sellerId}
                    >
                      💬 Message Seller
                      {unreadCount > 0 && <span style={styles.unreadDot}></span>}
                    </button>
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button 
                        onClick={() => toggleExpand(order._id)}
                        style={styles.detailsBtn}
                      >
                        View Details
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={styles.expandedContent}>
                      {/* All Products with Sizes */}
                      <div style={styles.expandedSection}>
                        <h4 style={styles.sectionTitle}>Order Items</h4>
                        <div style={styles.productsList}>
                          {order.products.map((item, idx) => {
                            const itemSize = item.size && item.size !== 'null' ? item.size : null;
                            return (
                              <div key={idx} style={styles.productItem}>
                                <div style={styles.productImageWrapper}>
                                  {item.productId?.images?.[0] ? (
                                    <img src={item.productId.images[0]} alt="" style={styles.productThumb} />
                                  ) : (
                                    <div style={styles.productThumbPlaceholder}>📦</div>
                                  )}
                                </div>
                                <div style={styles.productInfo}>
                                  <div style={styles.productName}>{item.productId?.title || 'Product'}</div>
                                  <div style={styles.productMeta}>
                                    {itemSize && (
                                      <span style={styles.productSizeBadge}>📏 Size: {itemSize}</span>
                                    )}
                                    <span>🔢 Qty: {item.quantity}</span>
                                    <span>💰 {formatPrice(item.price)} each</span>
                                  </div>
                                </div>
                                <div style={styles.productTotal}>
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div style={styles.expandedSection}>
                        <h4 style={styles.sectionTitle}>Delivery Information</h4>
                        <div style={styles.deliveryGrid}>
                          <div><strong>📍 Address:</strong> {order.deliveryAddress}</div>
                          <div><strong>📞 Contact:</strong> {order.contactNumber}</div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div style={styles.summaryBox}>
                        <div style={styles.summaryRow}>
                          <span>Subtotal</span>
                          <span>{formatPrice(order.originalAmount || order.totalAmount)}</span>
                        </div>
                        {order.couponDiscount > 0 && (
                          <div style={styles.summaryRow}>
                            <span>Coupon Discount</span>
                            <span style={{ color: '#059669' }}>-{formatPrice(order.couponDiscount)}</span>
                          </div>
                        )}
                        <div style={styles.summaryRow}>
                          <span>Delivery Fee</span>
                          <span style={{ color: '#059669' }}>Free</span>
                        </div>
                        <div style={styles.summaryDivider}></div>
                        <div style={styles.summaryTotal}>
                          <span>Total Paid</span>
                          <strong style={styles.totalAmountLarge}>{formatPrice(order.totalAmount)}</strong>
                        </div>
                      </div>

                      {/* Order Tracker */}
                      <OrderTracker 
                        order={order} 
                        onStatusUpdate={fetchOrders}
                        userRole="buyer"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Chat Box */}
      {chatOrder && (
        <ChatBox
          orderId={chatOrder._id}
          sellerId={getSellerIdFromOrder(chatOrder)}
          buyerId={user?._id}
          currentUserId={user?._id}
          isOpen={!!chatOrder}
          onClose={() => {
            setChatOrder(null);
            fetchUnreadCounts();
          }}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 20px',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  loader: {
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #d97706',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  headerStats: {
    display: 'flex',
    gap: '12px',
  },
  statChip: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#fff',
    borderRadius: '40px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    fontSize: '13px',
    color: '#6b7280',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '10px',
    marginBottom: '28px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '14px 8px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    borderTop: '3px solid',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '4px',
  },
  
  filterBar: {
    marginBottom: '24px',
  },
  filterTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '40px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
    color: '#fff',
  },
  filterCount: {
    marginLeft: '6px',
    padding: '0px 6px',
    borderRadius: '20px',
    fontSize: '11px',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#fafbfc',
    borderBottom: '1px solid #f0f0f0',
  },
  orderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  orderId: {
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: '600',
    color: '#d97706',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '500',
  },
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  orderDate: {
    fontSize: '12px',
    color: '#6b7280',
  },
  expandBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s',
  },
  
  itemsPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    borderBottom: '1px solid #f5f5f5',
  },
  itemThumb: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    objectFit: 'cover',
    backgroundColor: '#f9fafb',
  },
  itemThumbPlaceholder: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '4px',
  },
  moreItems: {
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#6b7280',
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: '#6b7280',
  },
  sizeBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
  },
  itemPrice: {
    fontWeight: '600',
    color: '#d97706',
  },
  
  actionButtons: {
    display: 'flex',
    gap: '12px',
    padding: '12px 20px 16px 20px',
  },
  chatBtn: {
    position: 'relative',
    padding: '8px 18px',
    borderRadius: '40px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s',
  },
  unreadDot: {
    position: 'absolute',
    top: '4px',
    right: '8px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
  },
  detailsBtn: {
    padding: '8px 18px',
    borderRadius: '40px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s',
  },
  
  expandedContent: {
    padding: '20px 24px',
    backgroundColor: '#fafbfc',
    borderTop: '1px solid #f0f0f0',
  },
  expandedSection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '14px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e7eb',
  },
  
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  productItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #f0f0f0',
  },
  productImageWrapper: {
    width: '52px',
    height: '52px',
    flexShrink: 0,
  },
  productThumb: {
    width: '100%',
    height: '100%',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  productThumbPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '10px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '6px',
  },
  productMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: '#6b7280',
  },
  productSizeBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: '2px 8px',
    borderRadius: '16px',
    fontSize: '11px',
    fontWeight: '500',
  },
  productTotal: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#d97706',
  },
  
  deliveryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
    fontSize: '13px',
    color: '#4b5563',
    padding: '4px 0',
  },
  
  summaryBox: {
    marginTop: '20px',
    padding: '16px 20px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    maxWidth: '300px',
    marginLeft: 'auto',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '13px',
    color: '#6b7280',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '10px 0',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '6px',
    fontSize: '15px',
    fontWeight: '600',
  },
  totalAmountLarge: {
    fontSize: '18px',
    color: '#d97706',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#fff',
    borderRadius: '20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  shopBtn: {
    marginTop: '20px',
    padding: '10px 28px',
    backgroundColor: '#111827',
    color: '#fff',
    border: 'none',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;
document.head.appendChild(styleSheet);

export default MyOrders;