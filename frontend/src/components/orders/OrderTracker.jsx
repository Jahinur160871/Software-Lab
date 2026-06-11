import React, { useState } from 'react';
import api from '../../services/api';

const OrderTracker = ({ order, onStatusUpdate, userRole }) => {
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝', color: '#ff9800', description: 'Your order has been placed successfully' },
    { key: 'confirmed', label: 'Order Confirmed', icon: '✅', color: '#2196f3', description: 'Seller has confirmed your order' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: '#9c27b0', description: 'Seller is preparing your order' },
    { key: 'delivering', label: 'On the Way', icon: '🚚', color: '#4caf50', description: 'Your order is out for delivery' },
    { key: 'delivered', label: 'Delivered', icon: '🏠', color: '#4caf50', description: 'Order has been delivered' }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
  const canUpdate = userRole === 'seller' && order.status !== 'delivered' && order.status !== 'cancelled';
  const canCancel = (userRole === 'buyer' || userRole === 'seller') && 
                    order.status !== 'delivered' && 
                    order.status !== 'cancelled';
  
  const getNextStatus = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < statusSteps.length) {
      return statusSteps[nextIndex].key;
    }
    return null;
  };

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return;
    
    try {
      await api.put(`/orders/${order._id}/status`, { 
        status: nextStatus, 
        note: statusNote 
      });
      onStatusUpdate();
      setStatusNote('');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    setCancelling(true);
    try {
      await api.put(`/orders/${order._id}/cancel`, { 
        reason: cancelReason 
      });
      onStatusUpdate();
      setShowCancelModal(false);
      setCancelReason('');
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitRating = async () => {
    try {
      await api.post(`/orders/${order._id}/rating`, { 
        rating, 
        comment: ratingComment 
      });
      onStatusUpdate();
      setShowRating(false);
      alert('Thank you for your rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    }
  };

  // If order is cancelled, show cancellation info
  if (order.status === 'cancelled') {
    return (
      <div style={styles.cancelledContainer}>
        <div style={styles.cancelledHeader}>
          <span style={styles.cancelledIcon}>❌</span>
          <h3 style={styles.cancelledTitle}>Order Cancelled</h3>
        </div>
        <div style={styles.cancelledInfo}>
          <p><strong>Cancelled by:</strong> {order.cancelledBy?.name || (order.cancelledBy === order.buyerId?._id ? 'Customer' : 'Seller')}</p>
          <p><strong>Reason:</strong> {order.cancellationReason || 'No reason provided'}</p>
          {order.statusHistory?.find(h => h.status === 'cancelled') && (
            <p><strong>Cancelled on:</strong> {new Date(order.statusHistory.find(h => h.status === 'cancelled').updatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Order Tracking</h3>
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Cancel Order</h3>
            <p style={styles.modalSubtitle}>Please provide a reason for cancellation</p>
            <textarea
              placeholder="Why do you want to cancel this order?"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={styles.modalTextarea}
              rows="4"
            />
            <div style={styles.modalButtons}>
              <button 
                onClick={() => setShowCancelModal(false)} 
                style={styles.modalCancelBtn}
              >
                No, Keep Order
              </button>
              <button 
                onClick={handleCancelOrder} 
                style={styles.modalConfirmBtn}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Steps */}
      <div style={styles.stepsContainer}>
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = step.key === order.status;
          
          return (
            <div key={step.key} style={styles.stepWrapper}>
              <div style={styles.stepConnector}>
                {index > 0 && (
                  <div style={{
                    ...styles.connectorLine,
                    backgroundColor: isCompleted ? step.color : '#e0e0e0'
                  }} />
                )}
              </div>
              <div style={styles.stepContent}>
                <div style={{
                  ...styles.stepIcon,
                  backgroundColor: isCompleted ? step.color : '#e0e0e0',
                  border: isCurrent ? `3px solid ${step.color}` : 'none'
                }}>
                  <span>{step.icon}</span>
                </div>
                <div style={styles.stepLabel}>
                  <span style={{ 
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    color: isCompleted ? step.color : '#999'
                  }}>
                    {step.label}
                  </span>
                  <span style={styles.stepDesc}>{step.description}</span>
                  {order.statusHistory?.find(h => h.status === step.key) && (
                    <span style={styles.stepTime}>
                      {new Date(order.statusHistory.find(h => h.status === step.key).updatedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Button */}
      {canCancel && (
        <div style={styles.cancelSection}>
          <button 
            onClick={() => setShowCancelModal(true)} 
            style={styles.cancelBtn}
          >
            ❌ Cancel Order
          </button>
          <p style={styles.cancelNote}>Orders can only be cancelled before delivery</p>
        </div>
      )}

      {order.estimatedDeliveryTime && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div style={styles.estimatedTime}>
          <span>⏰</span>
          <div>
            <strong>Estimated Delivery:</strong>
            <p>{new Date(order.estimatedDeliveryTime).toLocaleString()}</p>
          </div>
        </div>
      )}

      {canUpdate && (
        <div style={styles.updateSection}>
          <textarea
            placeholder="Add a note for the customer (optional)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            style={styles.noteInput}
            rows="2"
          />
          <button onClick={handleStatusUpdate} style={styles.updateBtn}>
            Mark as {getNextStatus()?.replace(/_/g, ' ').toUpperCase()}
          </button>
        </div>
      )}

      {order.status === 'delivered' && !order.rating && userRole === 'buyer' && (
        <div style={styles.ratingSection}>
          <h4>Rate this order</h4>
          <p>How was your experience?</p>
          <div style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  fontSize: '40px',
                  cursor: 'pointer',
                  color: star <= rating ? '#ff9800' : '#e0e0e0',
                  marginRight: '8px'
                }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            placeholder="Share your experience with this order (optional)..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            style={styles.ratingInput}
            rows="3"
          />
          <button onClick={handleSubmitRating} style={styles.submitRatingBtn}>
            Submit Rating
          </button>
        </div>
      )}

      {order.rating && (
        <div style={styles.ratingDisplay}>
          <div style={styles.starsDisplay}>
            {'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}
          </div>
          <div style={styles.ratingValue}>{order.rating} out of 5 stars</div>
          {order.ratingComment && <p style={styles.ratingComment}>"{order.ratingComment}"</p>}
        </div>
      )}

      {order.statusHistory && order.statusHistory.length > 0 && (
        <div style={styles.historySection}>
          <h4>Order Timeline</h4>
          {order.statusHistory.map((history, idx) => (
            <div key={idx} style={styles.historyItem}>
              <div style={styles.historyHeader}>
                <span style={styles.historyStatus}>
                  {statusSteps.find(s => s.key === history.status)?.label || history.status}
                </span>
                <span style={styles.historyTime}>
                  {new Date(history.updatedAt).toLocaleString()}
                </span>
              </div>
              {history.note && <p style={styles.historyNote}>{history.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#333'
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  stepWrapper: {
    flex: 1,
    minWidth: '120px',
    position: 'relative'
  },
  stepConnector: {
    position: 'absolute',
    top: '20px',
    left: '-50%',
    width: '100%',
    zIndex: 0
  },
  connectorLine: {
    height: '2px',
    width: '100%'
  },
  stepContent: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  },
  stepIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px',
    backgroundColor: '#e0e0e0'
  },
  stepLabel: {
    fontSize: '12px',
    textAlign: 'center'
  },
  stepDesc: {
    fontSize: '10px',
    color: '#999',
    display: 'block',
    marginTop: '4px'
  },
  stepTime: {
    fontSize: '10px',
    color: '#999',
    display: 'block',
    marginTop: '2px'
  },
  estimatedTime: {
    backgroundColor: '#fff3e0',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  cancelSection: {
    marginTop: '20px',
    marginBottom: '15px',
    padding: '15px',
    backgroundColor: '#fff3e0',
    borderRadius: '12px',
    textAlign: 'center'
  },
  cancelBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  cancelNote: {
    fontSize: '11px',
    color: '#999',
    margin: 0
  },
  updateSection: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px'
  },
  noteInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  updateBtn: {
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  },
  ratingSection: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    textAlign: 'center'
  },
  starsContainer: {
    marginBottom: '15px'
  },
  ratingInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  submitRatingBtn: {
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  },
  ratingDisplay: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#e8f5e9',
    borderRadius: '12px',
    textAlign: 'center'
  },
  starsDisplay: {
    fontSize: '24px',
    color: '#ff9800',
    marginBottom: '8px'
  },
  ratingValue: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px'
  },
  ratingComment: {
    color: '#555',
    fontStyle: 'italic',
    marginTop: '8px'
  },
  historySection: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  historyItem: {
    marginBottom: '12px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px'
  },
  historyStatus: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#ff6b35'
  },
  historyTime: {
    fontSize: '11px',
    color: '#999'
  },
  historyNote: {
    fontSize: '12px',
    color: '#666',
    marginTop: '6px'
  },
  // Cancelled order styles
  cancelledContainer: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #ffebee'
  },
  cancelledHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px'
  },
  cancelledIcon: {
    fontSize: '24px'
  },
  cancelledTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#dc3545',
    margin: 0
  },
  cancelledInfo: {
    backgroundColor: '#ffebee',
    padding: '15px',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#555'
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333'
  },
  modalSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px'
  },
  modalTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '20px'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px'
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #ddd',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

export default OrderTracker;