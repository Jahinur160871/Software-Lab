import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], default: null },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    discountApplied: { type: Number, default: 0 },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  originalAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  cancellationReason: { type: String, default: '' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  rating: { type: Number, min: 1, max: 5 },
  ratingComment: { type: String },
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
    note: String
  }],
  createdAt: { type: Date, default: Date.now }
});

orderSchema.methods.updateStatus = async function(newStatus, userId, note = '') {
  this.status = newStatus;
  this.statusHistory.push({ status: newStatus, updatedBy: userId, note: note });
  if (newStatus === 'delivered') this.actualDeliveryTime = new Date();
  await this.save();
  return this;
};

orderSchema.methods.cancelOrder = async function(userId, reason, userRole) {
  if (this.status === 'delivered') throw new Error('Cannot cancel delivered order');
  if (this.status === 'cancelled') throw new Error('Order already cancelled');
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = userId;
  this.statusHistory.push({ status: 'cancelled', updatedBy: userId, note: `Cancelled by ${userRole}. Reason: ${reason}` });
  await this.save();
  return this;
};

orderSchema.virtual('savings').get(function() {
  return (this.originalAmount || 0) - (this.totalAmount || 0);
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export default mongoose.model('Order', orderSchema);