import Coupon from '../models/Coupon.js';

const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, validUntil, usageLimit } = req.body;
    
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      validFrom: new Date(),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      sellerId: req.user._id
    });
    
    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).populate('sellerId', 'name');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    
    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon has expired or is no longer valid' });
    }
    
    const discount = coupon.calculateDiscount(orderAmount);
    if (discount === 0 && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    }
    
    res.json({ valid: true, coupon, discount, finalAmount: orderAmount - discount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSellerCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    if (coupon.sellerId.toString() !== req.user._id.toString() && req.user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await coupon.deleteOne();
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { createCoupon, getActiveCoupons, validateCoupon, getSellerCoupons, deleteCoupon };