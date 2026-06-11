import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CategoryNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentCategory = new URLSearchParams(location.search).get('category');

  const categories = [
    { name: 'Food', slug: 'food', icon: '🍔' },
    { name: 'Clothing', slug: 'cloth-and-style', icon: '👕' },
    { name: 'Used Items', slug: 'used-materials', icon: '📦' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {categories.map((cat) => (
          <button 
            key={cat.slug} 
            onClick={() => navigate(currentCategory === cat.slug ? '/' : `/?category=${cat.slug}`)} 
            style={{
              ...styles.categoryBtn,
              ...(currentCategory === cat.slug && styles.categoryBtnActive)
            }}
          >
            <span style={styles.icon}>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { 
    backgroundColor: '#ffffff', 
    borderBottom: '1px solid #eef2f6',
  },
  wrapper: { 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '10px', 
    padding: '12px 20px', 
    maxWidth: '1400px', 
    margin: '0 auto' 
  },
  categoryBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 24px', 
    borderRadius: '40px', 
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '500',
    color: '#4a5568',
    transition: 'all 0.2s ease',
  },
  categoryBtnActive: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
    color: '#ffffff',
  },
  icon: { 
    fontSize: '16px' 
  },
};

export default CategoryNav;