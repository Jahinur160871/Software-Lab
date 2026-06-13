import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'delivered', 'cancelled'], default: 'pending' },
  deliveryAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);