import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import User from './models/User.js';
import Category from './models/Category.js';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CampusMart API is running with Cookie Authentication' });
});

const seedInitialData = async () => {
  try {
    const categories = [
      { name: 'Food', slug: 'food', icon: '🍔' },
      { name: 'Clothing', slug: 'clothing', icon: '👕' },
      { name: 'Stylish Products', slug: 'stylish-products', icon: '💎' },
      { name: 'Lab Equipment', slug: 'lab-equipment', icon: '🔬' },
      { name: 'Used Items', slug: 'used-items', icon: '📚' },
      { name: 'Electronics', slug: 'electronics', icon: '💻' },
      { name: 'Textbooks', slug: 'textbooks', icon: '📖' }
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`Category created: ${cat.name}`);
      }
    }

    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'staff',
        isSeller: true,
        sellerApproved: true,
        emailVerified: true
      });
      console.log('Admin user created');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedInitialData();
});