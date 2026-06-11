import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null },
  validFrom: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

couponSchema.methods.isValid = function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.validFrom) return false;
  if (now > this.validUntil) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderAmount) return 0;
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = orderAmount * this.discountValue / 100;
    if (this.maxDiscount && discount > this.maxDiscount) discount = this.maxDiscount;
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, orderAmount);
};

export default mongoose.model('Coupon', couponSchema);