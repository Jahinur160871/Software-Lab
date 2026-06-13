import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  condition: { type: String, enum: ['new', 'like new', 'good', 'fair', 'needs repair'], default: 'new' },
  usedDuration: String,
  reasonForSelling: String,
  courseName: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String, enum: ['lab equipment', 'textbook', 'electronics', 'stationery', 'food', 'clothing', 'accessories', 'other'], default: 'other' },
  images: [{ type: String, required: true }],
  imageFileIds: [{ type: String }],
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, default: 1, min: 0 },
  negotiable: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'sold', 'reserved'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);