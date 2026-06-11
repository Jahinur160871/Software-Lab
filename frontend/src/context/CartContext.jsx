import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalCount);
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const itemKey = `${product._id}-${product.selectedSize || 'nosize'}`;
      const existingItem = prevItems.find(item => item.uniqueId === itemKey);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.uniqueId === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, {
        productId: product._id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.images?.[0],
        quantity: quantity,
        sellerId: product.sellerId?._id,
        sellerName: product.sellerId?.name || 'Unknown Seller',
        selectedSize: product.selectedSize || null,
        hasSizes: product.hasSizes || false,
        uniqueId: itemKey
      }];
    });
  };

  const removeFromCart = (uniqueId) => {
    setCartItems(prevItems => prevItems.filter(item => item.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId, quantity) => {
    if (quantity < 1) {
      removeFromCart(uniqueId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getOriginalTotal = () => {
    return cartItems.reduce((total, item) => total + ((item.originalPrice || item.price) * item.quantity), 0);
  };

  const getTotalSavings = () => {
    return cartItems.reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0);
  };

  const getCartBySeller = () => {
    const grouped = {};
    cartItems.forEach(item => {
      if (!grouped[item.sellerId]) {
        grouped[item.sellerId] = {
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          items: [],
          subtotal: 0
        };
      }
      grouped[item.sellerId].items.push(item);
      grouped[item.sellerId].subtotal += item.price * item.quantity;
    });
    return Object.values(grouped);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getOriginalTotal,
    getTotalSavings,
    getCartBySeller,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};