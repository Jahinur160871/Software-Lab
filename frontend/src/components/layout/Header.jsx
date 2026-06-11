import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../common/CartDrawer';
import MessageNotification from '../common/MessageNotification';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getInitials = () => {
    return user?.name?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>🛒</span>
            <span style={styles.logoText}>
              <span style={styles.campusText}>Campus</span>
              <span style={styles.martText}>Mart</span>
            </span>
          </Link>

          <div style={styles.navButtons}>
            <Link 
              to="/" 
              style={{
                ...styles.navLink,
                ...(isActive('/') && styles.activeLink)
              }}
            >
              Home
            </Link>
            
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  style={{
                    ...styles.navLink,
                    ...(isActive('/login') && styles.activeLink)
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  style={{
                    ...styles.navLink,
                    ...(isActive('/register') && styles.activeLink)
                  }}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/profile" 
                  style={{
                    ...styles.profileLink,
                    ...(isActive('/profile') && styles.activeProfileLink)
                  }}
                >
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      style={styles.profileImage}
                    />
                  ) : (
                    <div style={styles.profilePlaceholder}>
                      {getInitials()}
                    </div>
                  )}
                  <span style={styles.profileName}>{user.name?.split(' ')[0]}</span>
                </Link>
                
                <Link 
                  to="/my-products" 
                  style={{
                    ...styles.navLink,
                    ...(isActive('/my-products') && styles.activeLink)
                  }}
                >
                  My Products
                </Link>
                
                <Link 
                  to="/my-orders" 
                  style={{
                    ...styles.navLink,
                    ...(isActive('/my-orders') && styles.activeLink)
                  }}
                >
                  My Orders
                </Link>
                
                {user.isSeller && user.sellerApproved && (
                  <Link 
                    to="/seller-orders" 
                    style={{
                      ...styles.sellerNavLink,
                      ...(isActive('/seller-orders') && styles.activeSellerNavLink)
                    }}
                  >
                    Manage Orders
                  </Link>
                )}
                
                <button 
                  onClick={() => setIsCartOpen(true)} 
                  style={styles.cartButton}
                >
                  Cart
                  {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
                </button>
                
                {!user.isSeller && (
                  <Link 
                    to="/become-seller" 
                    style={styles.sellerBtn}
                  >
                    Become Seller
                  </Link>
                )}
                
                {user.email === 'admin@campusmart.com' && (
                  <Link 
                    to="/admin" 
                    style={styles.adminBtn}
                  >
                    Admin
                  </Link>
                )}
                
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <MessageNotification />
    </>
  );
};

const styles = {
  header: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
    position: 'sticky',
    top: 0,
    zIndex: 999,
    padding: '12px 0',
    borderBottom: '1px solid #eef2f6',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  logoIcon: { 
    fontSize: '26px',
  },
  logoText: { 
    fontSize: '20px', 
    fontWeight: 'bold',
  },
  campusText: {
    color: '#1a2c3e',
  },
  martText: {
    color: '#d97706',
  },
  navButtons: { 
    display: 'flex', 
    gap: '20px', 
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '500',
    padding: '4px 8px',
    borderRadius: '30px',
    transition: 'all 0.2s ease',
  },
  activeProfileLink: {
    color: '#d97706',
    backgroundColor: '#fef3c7',
  },
  profileImage: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #d97706',
  },
  profilePlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#d97706',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: { 
    fontSize: '14px', 
    fontWeight: '500',
    color: '#4a5568',
  },
  
  navLink: { 
    textDecoration: 'none', 
    color: '#4a5568', 
    fontSize: '14px', 
    fontWeight: '500',
    padding: '8px 0',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    color: '#d97706',
    borderBottom: '2px solid #d97706',
  },
  
  sellerNavLink: {
    textDecoration: 'none',
    color: '#d97706',
    fontSize: '14px',
    fontWeight: '500',
    padding: '6px 14px',
    backgroundColor: '#fef3c7',
    borderRadius: '24px',
    transition: 'all 0.2s ease',
  },
  activeSellerNavLink: {
    color: '#ffffff',
    backgroundColor: '#d97706',
  },
  
  cartButton: {
    background: 'none',
    border: 'none',
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    position: 'relative',
    padding: '8px 0',
    transition: 'color 0.2s ease',
  },
  cartBadge: { 
    position: 'absolute', 
    top: '-8px', 
    right: '-15px', 
    backgroundColor: '#d97706', 
    color: 'white', 
    borderRadius: '50%', 
    padding: '2px 6px', 
    fontSize: '10px',
    fontWeight: '600',
  },
  sellerBtn: { 
    backgroundColor: '#d97706', 
    color: '#fff', 
    padding: '6px 16px', 
    borderRadius: '24px', 
    textDecoration: 'none', 
    fontSize: '13px', 
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  adminBtn: { 
    backgroundColor: '#6b21a5', 
    color: '#fff', 
    padding: '6px 16px', 
    borderRadius: '24px', 
    textDecoration: 'none', 
    fontSize: '13px', 
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  logoutBtn: { 
    background: 'none', 
    border: 'none', 
    color: '#dc2626', 
    fontSize: '14px', 
    fontWeight: '500', 
    cursor: 'pointer',
    padding: '8px 0',
    transition: 'color 0.2s ease',
  },
};

export default Header;