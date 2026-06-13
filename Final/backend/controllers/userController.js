import User from '../models/User.js';

const becomeSeller = async (req, res) => {
  try {
    const { businessName, businessDescription, businessCategory, phoneNumber } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isSeller = true;
    user.sellerApproved = false;
    user.sellerDetails = { businessName, businessDescription, businessCategory, phoneNumber };
    await user.save();
    res.json({ message: 'Seller request submitted. Awaiting admin approval.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSellerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('isSeller sellerApproved sellerDetails');
    res.json({ isSeller: user.isSeller, sellerApproved: user.sellerApproved, sellerDetails: user.sellerDetails });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const Product = await import('../models/Product.js').then(m => m.default);
    const products = await Product.find({ sellerId: req.user._id }).populate('category', 'name').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { becomeSeller, getSellerStatus, getMyProducts };