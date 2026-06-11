import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading products...</p>
      </div>
    );
  }
  
  if (!products || products.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🛍️</div>
        <h3 style={styles.emptyTitle}>No products found</h3>
        <p style={styles.emptyText}>Try adjusting your search or filters</p>
      </div>
    );
  }
  
  return (
    <div style={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  loader: {
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #d97706',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
  },
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProductGrid;