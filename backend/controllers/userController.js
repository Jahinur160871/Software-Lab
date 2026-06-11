import User from '../models/User.js';

const becomeSeller = async (req, res) => {
  try {
    const { businessName, businessDescription, businessCategory, phoneNumber } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check if user is already suspended
    if (user.sellerSuspended) {
      return res.status(403).json({ message: 'Your account is suspended. Cannot become a seller.' });
    }
    
    user.isSeller = true;
    user.sellerApproved = false;
    user.sellerSuspended = false;
    user.sellerDetails = { businessName, businessDescription, businessCategory, phoneNumber };
    await user.save();
    res.json({ message: 'Seller request submitted. Awaiting admin approval.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSellerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('isSeller sellerApproved sellerSuspended sellerDetails suspensionReason');
    res.json({ 
      isSeller: user.isSeller, 
      sellerApproved: user.sellerApproved,
      sellerSuspended: user.sellerSuspended || false,
      suspensionReason: user.suspensionReason || '',
      sellerDetails: user.sellerDetails 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const Product = await import('../models/Product.js').then(m => m.default);
    
    // Check if seller is suspended
    const user = await User.findById(req.user._id);
    if (user.sellerSuspended) {
      return res.status(403).json({ 
        message: 'Your account has been suspended. You cannot access your products.',
        suspended: true,
        reason: user.suspensionReason
      });
    }
    
    const products = await Product.find({ sellerId: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { becomeSeller, getSellerStatus, getMyProducts };