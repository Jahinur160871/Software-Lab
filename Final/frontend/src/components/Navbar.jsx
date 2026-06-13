import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h2>
        <Link to="/">CampusMart</Link>
      </h2>
      <div>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/my-products">My Products</Link>
            <Link to="/my-orders">My Orders</Link>
            {user.isSeller && user.sellerApproved && (
              <Link to="/create-product">Add Product</Link>
            )}
            {!user.isSeller && (
              <Link to="/become-seller">Become Seller</Link>
            )}
            {user.email === 'admin@campusmart.com' && (
              <Link to="/admin">Admin</Link>
            )}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;