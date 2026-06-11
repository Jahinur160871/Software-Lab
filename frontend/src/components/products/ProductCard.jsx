import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { 
      alert('Please login first'); 
      return; 
    }
    if (isOutOfStock) {
      alert('Sorry, this product is out of stock!');
      return;
    }
    addToCart(product, 1);
  };

  const renderStars = () => {
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={styles.star}>
            {i < fullStars ? '★' : (i === fullStars && hasHalfStar ? '½' : '☆')}
          </span>
        ))}
      </div>
    );
  };

  const hasActiveDiscount = () => {
    if (!product.discount || product.discount <= 0) return false;
    if (product.discountEndDate && new Date(product.discountEndDate) < new Date()) return false;
    return true;
  };

  const isDiscounted = hasActiveDiscount();
  const currentPrice = product.price;
  const originalPrice = product.originalPrice || product.price;
  const discountPercent = isDiscounted && product.discountType === 'percentage' 
    ? product.discount 
    : Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  
  const businessName = product.sellerId?.sellerDetails?.businessName || 
                       product.sellerId?.name || 
                       'CampusMart';
  
  // Get review count
  const reviewCount = product.ratingCount || 0;
  const averageRating = product.rating || 0;

  return (
    <Link 
      to={`/product/${product._id}`} 
      style={styles.cardLink}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ ...styles.card, ...(isHovered && styles.cardHover) }}>
        {/* Image Section */}
        <div style={styles.imageSection}>
          <div style={styles.imageContainer}>
            {product.images?.[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.title} 
                style={{ ...styles.image, ...(isHovered && styles.imageHover) }}
              />
            ) : (
              <div style={styles.placeholderImage}>📦</div>
            )}
            
            {/* Discount Badge */}
            {isDiscounted && discountPercent > 0 && (
              <div style={styles.discountBadge}>
                -{discountPercent}%
              </div>
            )}
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div style={styles.outOfStockOverlay}>
                <span>Out of Stock</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content Section - 8cm height optimized */}
        <div style={styles.content}>
          {/* Business Name */}
          <div style={styles.businessWrapper}>
            <span style={styles.businessName}>{businessName}</span>
          </div>

          {/* Product Title */}
          <h3 style={styles.title}>{product.title}</h3>
          
          {/* Rating with Review Count */}
          <div style={styles.ratingWrapper}>
            {renderStars()}
            <span style={styles.ratingValue}>{averageRating.toFixed(1)}</span>
            <span style={styles.reviewCount}>({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>
          
          {/* Price Section */}
          <div style={styles.priceWrapper}>
            {isDiscounted ? (
              <>
                <span style={styles.currentPrice}>TK {Math.round(currentPrice).toLocaleString()}</span>
                <span style={styles.originalPrice}>TK {Math.round(originalPrice).toLocaleString()}</span>
              </>
            ) : (
              <span style={styles.currentPrice}>TK {Math.round(currentPrice).toLocaleString()}</span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart} 
            style={{
              ...styles.addToCartBtn,
              ...(isOutOfStock && styles.disabledBtn),
              ...(isHovered && !isOutOfStock && styles.addToCartBtnHover)
            }}
            disabled={isOutOfStock}
          >
            <span style={styles.btnIcon}>🛒</span>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

const styles = {
  cardLink: {
    textDecoration: 'none',
    display: 'block',
    height: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    height: '300px', // 8cm ≈ 300px
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.12)',
  },
  
  // Image Section
  imageSection: {
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: '140px',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  imageHover: {
    transform: 'scale(1.06)',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '42px',
    backgroundColor: '#f1f5f9',
  },
  
  // Badges
  discountBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '700',
    zIndex: 2,
    letterSpacing: '0.3px',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    '& span': {
      color: '#fff',
      fontSize: '12px',
      fontWeight: '600',
      padding: '5px 12px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '30px',
    },
  },
  
  // Content Section
  content: {
    padding: '12px 14px 14px 14px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: '#fff',
  },
  
  // Business Name
  businessWrapper: {
    marginBottom: '0',
  },
  businessName: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#8b5cf6',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    display: 'inline-block',
  },
  
  // Title
  title: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.4',
    margin: '0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  
  // Rating with Review Count
  ratingWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  starsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  star: {
    fontSize: '11px',
    color: '#fbbf24',
  },
  ratingValue: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewCount: {
    fontSize: '10px',
    color: '#94a3b8',
  },
  
  // Price
  priceWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '2px',
  },
  currentPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#d97706',
  },
  originalPrice: {
    fontSize: '12px',
    color: '#94a3b8',
    textDecoration: 'line-through',
  },
  
  // Add to Cart Button
  addToCartBtn: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    border: '1px solid #e2e8f0',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.25s ease',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  addToCartBtnHover: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
    color: '#fff',
  },
  btnIcon: {
    fontSize: '13px',
  },
  disabledBtn: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    borderColor: '#e2e8f0',
    cursor: 'not-allowed',
  },
};

export default ProductCard;