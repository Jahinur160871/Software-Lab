import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const getPendingSellers = async (req, res) => {
  try {
    const pendingSellers = await User.find({ isSeller: true, sellerApproved: false, sellerSuspended: false }).select('-password');
    res.json(pendingSellers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const approveSeller = async (req, res) => {
  try {
    const { approved } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.sellerApproved = approved;
    user.sellerSuspended = false;
    await user.save();
    res.json({ message: approved ? 'Seller approved successfully' : 'Seller request rejected', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Product.deleteMany({ sellerId: user._id });
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingSellers = await User.countDocuments({ isSeller: true, sellerApproved: false, sellerSuspended: false });
    const totalRevenue = await Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    res.json({ totalUsers, totalProducts, totalOrders, pendingSellers, totalRevenue: totalRevenue[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('buyerId', 'name email').populate('products.productId', 'title').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// New: Suspend a seller
const suspendSeller = async (req, res) => {
  try {
    const { suspended, reason } = req.body;
    const user = await User.findById(req.params.sellerId);
    
    if (!user) return res.status(404).json({ message: 'Seller not found' });
    
    if (!user.isSeller) {
      return res.status(400).json({ message: 'User is not a seller' });
    }
    
    user.sellerApproved = !suspended;
    user.sellerSuspended = suspended;
    user.suspensionReason = reason || 'No reason provided';
    user.suspensionDate = suspended ? new Date() : null;
    
    await user.save();
    
    res.json({ 
      message: suspended ? 'Seller suspended successfully' : 'Seller reinstated successfully',
      user 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New: Get suspended sellers
const getSuspendedSellers = async (req, res) => {
  try {
    const suspendedSellers = await User.find({ 
      isSeller: true, 
      sellerSuspended: true 
    }).select('-password');
    res.json(suspendedSellers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// New: Reinstate a seller
const reinstateSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.sellerId);
    if (!user) return res.status(404).json({ message: 'Seller not found' });
    
    user.sellerApproved = true;
    user.sellerSuspended = false;
    user.suspensionReason = '';
    user.suspensionDate = null;
    
    await user.save();
    
    res.json({ message: 'Seller reinstated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { 
  getPendingSellers, 
  approveSeller, 
  getAllUsers, 
  deleteUser, 
  getStats, 
  getAllOrders,
  suspendSeller,
  getSuspendedSellers,
  reinstateSeller
};