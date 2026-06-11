import { setServers } from "node:dns/promises";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import User from "./models/User.js";
import Category from "./models/Category.js";
import bcrypt from "bcryptjs";

setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.json({ message: "CampusMart API is running with Cookie Authentication" });
});

// Seed initial data - Only categories and admin (no sample products)
const seedInitialData = async () => {
  try {
    // Categories
    const categories = [
      { name: 'Food', slug: 'food', icon: '🍔', parentCategory: null, subcategories: ['Restaurant', 'Fast Food', 'Bakery', 'Cafe'] },
      { name: 'Cloth and Style', slug: 'cloth-and-style', icon: '👕', parentCategory: null, subcategories: ['Men', 'Women', 'Kids', 'Accessories'] },
      { name: 'Used Materials', slug: 'used-materials', icon: '📦', parentCategory: null, subcategories: ['Lab Equipment', 'Textbook', 'Electronics', 'Furniture'] },
      { name: 'Lab Equipment', slug: 'lab-equipment', icon: '🔬', parentCategory: 'Used Materials', subcategories: ['Physics', 'Chemistry', 'Biology', 'Engineering'] },
      { name: 'Textbook', slug: 'textbook', icon: '📖', parentCategory: 'Used Materials', subcategories: ['Computer Science', 'Engineering', 'Business', 'Science'] }
      { name: "Food", slug: "food", icon: "🍔" },
      { name: "Clothing", slug: "clothing", icon: "👕" },
      { name: "Stylish Products", slug: "stylish-products", icon: "💎" },
      { name: "Lab Equipment", slug: "lab-equipment", icon: "🔬" },
      { name: "Used Items", slug: "used-items", icon: "📚" },
      { name: "Electronics", slug: "electronics", icon: "💻" },
      { name: "Textbooks", slug: "textbooks", icon: "📖" },
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      }
    }
    console.log('✅ Categories seeding completed');

    // Create admin only (no test seller, no sample products)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@campusmart.com';
    const adminPlainPassword = 'admin123';
    
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPlainPassword, salt);
      
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: "staff",
        isSeller: true,
        sellerApproved: true,
        emailVerified: true,
      });
      
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPlainPassword}`);
    } else {
      console.log('✅ Admin user already exists');
    }
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedInitialData();
});
