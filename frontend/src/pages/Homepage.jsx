import React, { useState, useEffect } from 'react';
import ProductList from '../components/ProductList';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    try {
      let url = '/products?';
      if (category) url += `category=${category}&`;
      if (search) url += `search=${search}&`;
      const response = await api.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container">
      <h1>Campus Marketplace</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Clothing">Clothing</option>
          <option value="Stylish Products">Stylish Products</option>
          <option value="Lab Equipment">Lab Equipment</option>
          <option value="Used Items">Used Items</option>
          <option value="Electronics">Electronics</option>
          <option value="Textbooks">Textbooks</option>
        </select>
      </div>
      <ProductList products={products} />
    </div>
  );
};

export default Homepage;