import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MessageNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByOrder, setUnreadByOrder] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    fetchUnreadCount();
    // Poll every 10 seconds for new messages
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/messages/unread/count');
      setUnreadCount(response.data.totalUnread);
      setUnreadByOrder(response.data.unreadByOrder);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleClick = () => {
    // Navigate to the most recent order with unread messages
    if (unreadByOrder.length > 0) {
      const orderId = unreadByOrder[0]._id;
      navigate(`/my-orders`);
    } else {
      navigate('/my-orders');
    }
  };

  if (!user || unreadCount === 0) return null;

  return (
    <div style={styles.notificationBadge} onClick={handleClick}>
      <span style={styles.badgeNumber}>{unreadCount}</span>
      <span style={styles.badgeText}>
        new message{unreadCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
};

const styles = {
  notificationBadge: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    zIndex: 1000,
    cursor: 'pointer',
    animation: 'pulse 1s ease-in-out infinite',
    transition: 'transform 0.3s ease'
  },
  badgeNumber: {
    backgroundColor: '#fff',
    color: '#ff6b35',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  badgeText: {
    fontSize: '14px',
    fontWeight: '500'
  }
};

// Add animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .notification-badge:hover {
    transform: scale(1.05);
  }
`;
document.head.appendChild(styleSheet);

export default MessageNotification;