import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout', { state: { product, quantity: 1 } });
  };

  // Categories that should NOT show condition
  const hideConditionCategories = ['Food', 'Clothing', 'Stylish Products'];
  const shouldShowCondition = product && !hideConditionCategories.includes(product.category?.name);

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="loading">Product not found</div>;

  return (
    <div className="container">
      <div className="product-detail">
        {product.images && product.images[0] && (
          <img src={product.images[0]} alt={product.title} style={{ maxWidth: '100%', maxHeight: '400px' }} />
        )}
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <h3>Price: ৳{product.price}</h3>
        
        {/* Only show condition for Lab Equipment, Used Items, Electronics, Textbooks */}
        {shouldShowCondition && (
          <p><strong>Condition:</strong> {product.condition}</p>
        )}
        
        <p><strong>Category:</strong> {product.category?.name}</p>
        <p><strong>Seller:</strong> {product.sellerId?.name}</p>
        {product.negotiable && <p>✅ Price Negotiable</p>}
        <button onClick={handleBuyNow}>Buy Now</button>
      </div>
    </div>
  );
};

export default ProductDetail;