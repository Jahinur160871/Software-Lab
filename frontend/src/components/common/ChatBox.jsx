import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const ChatBox = ({ orderId, sellerId, buyerId, currentUserId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Debug logging to see what props are received
  console.log('ChatBox Props:', { orderId, sellerId, buyerId, currentUserId });

  // Determine receiver ID based on who is logged in
  const getReceiverId = () => {
    // If current user is the buyer, send to seller
    if (currentUserId === buyerId) {
      return sellerId;
    }
    // If current user is the seller, send to buyer
    if (currentUserId === sellerId) {
      return buyerId;
    }
    return null;
  };

  // Get the other party's name for display
  const getOtherPartyName = () => {
    if (currentUserId === buyerId) {
      return 'Seller';
    }
    if (currentUserId === sellerId) {
      return 'Customer';
    }
    return 'User';
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchMessages();
      markAsRead();
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${orderId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await api.put(`/messages/read/${orderId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const receiverId = getReceiverId();
    console.log('Receiver ID determined:', receiverId);
    console.log('Current User ID:', currentUserId);
    console.log('Buyer ID:', buyerId);
    console.log('Seller ID:', sellerId);
    
    if (!receiverId) {
      alert('Unable to send message: Invalid recipient. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/messages/send', {
        orderId,
        message: newMessage,
        receiverId
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.chatContainer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.chatHeader}>
          <h4 style={styles.chatTitle}>💬 Chat with {getOtherPartyName()} (Order #{orderId?.slice(-8)})</h4>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        
        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.noMessages}>
              <span>💬</span>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.message,
                  ...(msg.senderId?._id === currentUserId ? styles.sent : styles.received)
                }}
              >
                <div style={styles.messageSender}>
                  {msg.senderId?._id === currentUserId ? 'You' : getOtherPartyName()}
                </div>
                <div style={styles.messageText}>{msg.message}</div>
                <div style={styles.messageTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.sendBtn}>
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatContainer: {
    width: '400px',
    height: '550px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#ff6b35',
    color: '#fff'
  },
  chatTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 5px'
  },
  messagesContainer: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#f8f9fa'
  },
  noMessages: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999'
  },
  message: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '18px',
    position: 'relative'
  },
  sent: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff6b35',
    color: '#fff',
    borderBottomRightRadius: '4px'
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    color: '#333',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  messageSender: {
    fontSize: '11px',
    fontWeight: 'bold',
    marginBottom: '4px',
    opacity: 0.8
  },
  messageText: {
    fontSize: '14px',
    wordBreak: 'break-word'
  },
  messageTime: {
    fontSize: '10px',
    marginTop: '4px',
    textAlign: 'right',
    opacity: 0.7
  },
  inputForm: {
    display: 'flex',
    padding: '16px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: '25px',
    outline: 'none',
    fontSize: '14px'
  },
  sendBtn: {
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default ChatBox;