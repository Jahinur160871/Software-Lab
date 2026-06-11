import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'staff'], default: 'student' },
  phone: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  profileImageFileId: { type: String, default: '' },
  isSeller: { type: Boolean, default: false },
  sellerApproved: { type: Boolean, default: false },
  sellerSuspended: { type: Boolean, default: false },
  suspensionReason: { type: String, default: '' },
  suspensionDate: { type: Date, default: null },
  sellerDetails: {
    businessName: String,
    businessDescription: String,
    businessCategory: String,
    phoneNumber: String
  },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);