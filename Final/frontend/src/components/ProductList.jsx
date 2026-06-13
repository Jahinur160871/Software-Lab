import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return <p className="loading">No products found.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;