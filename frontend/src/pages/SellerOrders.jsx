import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/layout/Header';
import OrderTracker from '../components/orders/OrderTracker';
import ChatBox from '../components/common/ChatBox';
import MessageNotification from '../components/common/MessageNotification';
import { useAuth } from '../context/AuthContext';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [chatOrder, setChatOrder] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/seller-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching seller orders:', error);
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

  const getBuyerIdFromOrder = (order) => {
    if (order.buyerId && order.buyerId._id) return order.buyerId._id;
    return order.buyerId;
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
    if (filter !== 'all' && order.status !== filter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const orderIdMatch = order._id.toLowerCase().includes(searchLower);
      const customerMatch = order.buyerId?.name?.toLowerCase().includes(searchLower);
      const productMatch = order.products.some(p => 
        p.productId?.title?.toLowerCase().includes(searchLower)
      );
      if (!orderIdMatch && !customerMatch && !productMatch) return false;
    }
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
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
            <h1 style={styles.pageTitle}>Order Management</h1>
            <p style={styles.pageSubtitle}>Manage and track all your customer orders</p>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.statChip}>
              <strong>{formatPrice(stats.revenue)}</strong>
              <span>Total Revenue</span>
            </div>
            <div style={styles.statChip}>
              <strong>{stats.total}</strong>
              <span>Total Orders</span>
            </div>
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

        {/* Filters and Search */}
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
          
          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search by order ID, customer, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3>No Orders Found</h3>
            <p>{searchTerm ? `No orders matching "${searchTerm}"` : 'When customers order your products, they\'ll appear here'}</p>
          </div>
        ) : (
          <div style={styles.ordersTable}>
            {/* Table Header */}
            <div style={styles.tableHeader}>
              <div style={styles.headerOrder}>Order ID</div>
              <div style={styles.headerCustomer}>Customer</div>
              <div style={styles.headerItems}>Items</div>
              <div style={styles.headerTotal}>Amount</div>
              <div style={styles.headerStatus}>Status</div>
              <div style={styles.headerDate}>Date</div>
              <div style={styles.headerActions}></div>
            </div>

            {/* Table Rows */}
            {filteredOrders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const buyerId = getBuyerIdFromOrder(order);
              const unreadCount = unreadMessages[order._id] || 0;
              const isExpanded = expandedOrder === order._id;
              
              const firstProduct = order.products[0];
              const productCount = order.products.length;
              const moreItems = productCount - 1;
              
              return (
                <React.Fragment key={order._id}>
                  <div 
                    style={styles.tableRow}
                    onClick={() => toggleExpand(order._id)}
                  >
                    <div style={styles.rowOrder}>
                      <span style={styles.orderId}>#{order._id.slice(-8)}</span>
                    </div>
                    
                    <div style={styles.rowCustomer}>
                      <div style={styles.customerAvatar}>
                        {order.buyerId?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div style={styles.customerInfo}>
                        <div style={styles.customerName}>{order.buyerId?.name || 'Unknown'}</div>
                        <div style={styles.customerContact}>{order.contactNumber}</div>
                      </div>
                    </div>
                    
                    <div style={styles.rowItems}>
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
                        <div style={styles.itemInfo}>
                          <div style={styles.itemTitle}>
                            {firstProduct?.productId?.title?.slice(0, 35)}
                            {firstProduct?.productId?.title?.length > 35 && '...'}
                          </div>
                          {moreItems > 0 && (
                            <div style={styles.moreItems}>+{moreItems} more</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.rowTotal}>
                      <span style={styles.totalAmount}>{formatPrice(order.totalAmount)}</span>
                    </div>
                    
                    <div style={styles.rowStatus}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    
                    <div style={styles.rowDate}>
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div style={styles.timeText}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    
                    <div style={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleChatOpen(order)}
                        style={styles.chatBtn}
                      >
                        💬
                        {unreadCount > 0 && <span style={styles.unreadDot}></span>}
                      </button>
                      <button 
                        onClick={() => toggleExpand(order._id)}
                        style={styles.expandBtn}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={styles.expandedRow}>
                      {/* Delivery Info */}
                      <div style={styles.expandedSection}>
                        <h4 style={styles.sectionTitle}>Delivery Information</h4>
                        <div style={styles.deliveryGrid}>
                          <div><strong>Address:</strong> {order.deliveryAddress}</div>
                          <div><strong>Phone:</strong> {order.contactNumber}</div>
                          <div><strong>Customer:</strong> {order.buyerId?.name}</div>
                          <div><strong>Email:</strong> {order.buyerId?.email || 'N/A'}</div>
                        </div>
                      </div>
                      
                      {/* Products List */}
                      <div style={styles.expandedSection}>
                        <h4 style={styles.sectionTitle}>Order Items</h4>
                        <div style={styles.productsTable}>
                          <div style={styles.productsHeader}>
                            <div style={{ flex: 2 }}>Product</div>
                            <div style={{ flex: 0.5, textAlign: 'center' }}>Size</div>
                            <div style={{ flex: 0.5, textAlign: 'center' }}>Qty</div>
                            <div style={{ flex: 0.8, textAlign: 'center' }}>Price</div>
                            <div style={{ flex: 0.8, textAlign: 'right' }}>Total</div>
                          </div>
                          {order.products.map((item, idx) => {
                            const selectedSize = item.size;
                            const hasSize = selectedSize && selectedSize !== 'null' && selectedSize !== '';
                            return (
                              <div key={idx} style={styles.productsRow}>
                                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {item.productId?.images?.[0] ? (
                                    <img src={item.productId.images[0]} alt="" style={styles.productThumb} />
                                  ) : (
                                    <div style={styles.productThumbPlaceholder}>📦</div>
                                  )}
                                  <span>{item.productId?.title || 'Product'}</span>
                                </div>
                                <div style={{ flex: 0.5, textAlign: 'center' }}>
                                  {hasSize ? selectedSize : '—'}
                                </div>
                                <div style={{ flex: 0.5, textAlign: 'center' }}>{item.quantity}</div>
                                <div style={{ flex: 0.8, textAlign: 'center' }}>{formatPrice(item.price)}</div>
                                <div style={{ flex: 0.8, textAlign: 'right', fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Order Summary */}
                      <div style={styles.summaryBox}>
                        <div style={styles.summaryRow}>
                          <span>Subtotal</span>
                          <span>{formatPrice(order.originalAmount || order.totalAmount || 0)}</span>
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
                          <span>Total</span>
                          <strong style={styles.totalAmountLarge}>{formatPrice(order.totalAmount)}</strong>
                        </div>
                      </div>
                      
                      {/* Order Tracker */}
                      <OrderTracker 
                        order={order} 
                        onStatusUpdate={fetchOrders}
                        userRole="seller"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
      
      {chatOrder && (
        <ChatBox
          orderId={chatOrder._id}
          sellerId={user?._id}
          buyerId={getBuyerIdFromOrder(chatOrder)}
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
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 24px',
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
    gap: '12px',
    marginBottom: '28px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 12px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    borderTop: '3px solid',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
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
  searchWrapper: {
    position: 'relative',
    minWidth: '280px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px 10px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '40px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#fff',
    transition: 'all 0.2s',
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#9ca3af',
  },
  
  ordersTable: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
  },
  tableHeader: {
    display: 'flex',
    padding: '16px 20px',
    backgroundColor: '#fafbfc',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  tableRow: {
    display: 'flex',
    padding: '16px 20px',
    borderBottom: '1px solid #f5f5f5',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  
  headerOrder: { width: '100px', flexShrink: 0 },
  headerCustomer: { width: '200px', flexShrink: 0 },
  headerItems: { flex: 1, minWidth: '200px' },
  headerTotal: { width: '110px', flexShrink: 0, textAlign: 'right' },
  headerStatus: { width: '130px', flexShrink: 0 },
  headerDate: { width: '120px', flexShrink: 0 },
  headerActions: { width: '70px', flexShrink: 0, textAlign: 'right' },
  
  rowOrder: { width: '100px', flexShrink: 0 },
  rowCustomer: { width: '200px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' },
  rowItems: { flex: 1, minWidth: '200px' },
  rowTotal: { width: '110px', flexShrink: 0, textAlign: 'right' },
  rowStatus: { width: '130px', flexShrink: 0 },
  rowDate: { width: '120px', flexShrink: 0, fontSize: '12px', color: '#6b7280' },
  rowActions: { width: '70px', flexShrink: 0, textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  
  orderId: {
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: '500',
    color: '#d97706',
  },
  
  customerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4b5563',
    fontWeight: '500',
    fontSize: '14px',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  customerContact: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  
  itemsPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  itemThumb: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    objectFit: 'cover',
    backgroundColor: '#f9fafb',
  },
  itemThumbPlaceholder: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '2px',
  },
  moreItems: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  
  totalAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  
  statusBadge: {
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '500',
  },
  
  timeText: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '2px',
  },
  
  chatBtn: {
    position: 'relative',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  unreadDot: {
    position: 'absolute',
    top: '2px',
    right: '4px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
  },
  expandBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s',
  },
  
  expandedRow: {
    padding: '24px 28px',
    backgroundColor: '#fafbfc',
    borderBottom: '1px solid #f0f0f0',
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
  deliveryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
    fontSize: '13px',
    color: '#4b5563',
  },
  
  productsTable: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  productsHeader: {
    display: 'flex',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    borderBottom: '1px solid #e5e7eb',
  },
  productsRow: {
    display: 'flex',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '13px',
    alignItems: 'center',
  },
  productThumb: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  productThumbPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  
  summaryBox: {
    marginTop: '20px',
    padding: '16px 20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    maxWidth: '300px',
    marginLeft: 'auto',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
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
    paddingTop: '8px',
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
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default SellerOrders;