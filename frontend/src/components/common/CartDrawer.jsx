import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div 
        style={{
          ...styles.overlay,
          pointerEvents: isOpen ? 'auto' : 'none',
          opacity: isOpen ? 1 : 0
        }}
        onClick={onClose}
      />
      
      <div style={{
        ...styles.drawer,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
      }}>
        <div style={styles.drawerHeader}>
          <h3 style={styles.drawerTitle}>Your Cart</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        
        <div style={styles.drawerContent}>
          {cartItems.length === 0 ? (
            <div style={styles.emptyCart}>
              <span style={styles.emptyIcon}>🛒</span>
              <p>Your cart is empty</p>
              <button onClick={onClose} style={styles.continueBtn}>Continue Shopping</button>
            </div>
          ) : (
            <>
              <div style={styles.cartItemsList}>
                {cartItems.map((item) => (
                  <div key={item.uniqueId} style={styles.cartItem}>
                    <div style={styles.itemImage}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} style={styles.image} />
                      ) : (
                        <div style={styles.imagePlaceholder}>📦</div>
                      )}
                    </div>
                    <div style={styles.itemDetails}>
                      <h4 style={styles.itemTitle}>{item.title}</h4>
                      {item.selectedSize && (
                        <p style={styles.itemSize}>Size: {item.selectedSize}</p>
                      )}
                      <p style={styles.itemPrice}>TK. {item.price} × {item.quantity}</p>
                    </div>
                    <div style={styles.itemActions}>
                      <div style={styles.quantityControls}>
                        <button 
                          onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                          style={styles.qtyBtn}
                        >
                          −
                        </button>
                        <span style={styles.qtyValue}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                          style={styles.qtyBtn}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.uniqueId)}
                        style={styles.removeBtn}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={styles.drawerFooter}>
                <div style={styles.totalRow}>
                  <span>Subtotal</span>
                  <span style={styles.totalAmount}>TK. {getCartTotal()}</span>
                </div>
                <div style={styles.totalRow}>
                  <span>Delivery Fee</span>
                  <span style={{ color: '#28a745' }}>FREE</span>
                </div>
                <div style={styles.divider}></div>
                <div style={styles.totalRow}>
                  <strong>Total</strong>
                  <strong style={styles.totalAmount}>TK. {getCartTotal()}</strong>
                </div>
                <button onClick={handleCheckout} style={styles.checkoutBtn}>
                  Checkout →
                </button>
                <button onClick={clearCart} style={styles.clearCartBtn}>
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    transition: 'opacity 0.3s ease'
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '380px',
    height: '100vh',
    backgroundColor: '#fff',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column'
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff'
  },
  drawerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#999',
    padding: '5px'
  },
  drawerContent: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  emptyCart: {
    textAlign: 'center',
    padding: '60px 20px',
    flex: 1
  },
  emptyIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '16px'
  },
  continueBtn: {
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '25px',
    cursor: 'pointer',
    marginTop: '20px'
  },
  cartItemsList: {
    flex: 1,
    padding: '16px'
  },
  cartItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  itemImage: {
    width: '60px',
    height: '60px',
    flexShrink: 0
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px'
  },
  itemDetails: {
    flex: 1
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#333'
  },
  itemSize: {
    fontSize: '12px',
    color: '#ff6b35',
    marginBottom: '4px'
  },
  itemPrice: {
    fontSize: '13px',
    color: '#666'
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer'
  },
  qtyValue: {
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '24px',
    textAlign: 'center'
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#dc3545'
  },
  drawerFooter: {
    padding: '16px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fff'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px'
  },
  totalAmount: {
    color: '#ff6b35',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '8px 0'
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '12px'
  },
  clearCartBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#dc3545',
    border: '1px solid #dc3545',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: '8px'
  }
};

export default CartDrawer;