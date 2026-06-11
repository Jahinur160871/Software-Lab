import Message from '../models/Message.js';

const sendMessage = async (req, res) => {
  try {
    const { orderId, message, receiverId } = req.body;
    
    if (!orderId || !message || !receiverId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const messageDoc = await Message.create({
      orderId,
      senderId: req.user._id,
      receiverId,
      message
    });
    
    const populatedMessage = await Message.findById(messageDoc._id)
      .populate('senderId', 'name')
      .populate('receiverId', 'name');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const messages = await Message.find({ orderId })
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { orderId: req.params.orderId, receiverId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread message count for user
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false
    });
    
    // Also get unread count per order
    const unreadByOrder = await Message.aggregate([
      {
        $match: {
          receiverId: req.user._id,
          isRead: false
        }
      },
      {
        $group: {
          _id: '$orderId',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({ 
      totalUnread: count,
      unreadByOrder: unreadByOrder
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { sendMessage, getMessages, markAsRead, getUnreadCount };