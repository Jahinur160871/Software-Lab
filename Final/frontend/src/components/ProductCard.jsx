import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Categories that should NOT show condition
  const hideConditionCategories = ['Food', 'Clothing', 'Stylish Products'];
  const shouldShowCondition = !hideConditionCategories.includes(product.category?.name);

  return (
    <div className="product-card">
      {product.images && product.images[0] && (
        <img src={product.images[0]} alt={product.title} />
      )}
      <h3>{product.title}</h3>
      <p>Price: ৳{product.price}</p>
      
      {/* Only show condition for Lab Equipment, Used Items, Electronics, Textbooks */}
      {shouldShowCondition && (
        <p>Condition: {product.condition}</p>
      )}
      
      <Link to={`/product/${product._id}`}>
        <button>View Details</button>
      </Link>
    </div>
  );
};

export default ProductCard;