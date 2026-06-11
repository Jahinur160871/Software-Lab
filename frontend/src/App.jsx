import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateProduct from './pages/CreateProduct';
import CreateUsedItem from './pages/CreateUsedItem';
import MyProducts from './pages/MyProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import SellerOrders from './pages/SellerOrders';
import SellerCoupons from './pages/SellerCoupons';
import BecomeSeller from './pages/BecomeSeller';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/common/PrivateRoute';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/my-products" element={<PrivateRoute><MyProducts /></PrivateRoute>} />
          <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/seller-orders" element={<PrivateRoute><SellerOrders /></PrivateRoute>} />
          <Route path="/seller-coupons" element={<PrivateRoute><SellerCoupons /></PrivateRoute>} />
          <Route path="/create-product" element={<PrivateRoute><CreateProduct /></PrivateRoute>} />
          <Route path="/create-used-item" element={<PrivateRoute><CreateUsedItem /></PrivateRoute>} />
          <Route path="/become-seller" element={<PrivateRoute><BecomeSeller /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;