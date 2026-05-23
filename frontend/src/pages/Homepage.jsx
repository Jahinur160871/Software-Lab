import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import CategoryNav from '../components/layout/CategoryNav';
import FilterPanel from '../components/filters/FilterPanel';
import ProductGrid from '../components/products/ProductGrid';
import api from '../services/api';

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, [location.search, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const category = params.get('category');
      const search = params.get('search');
      
      let url = '/products?';
      if (category) url += `category=${category}&`;
      if (search) url += `search=${search}&`;
      if (filters.minPrice) url += `minPrice=${filters.minPrice}&`;
      if (filters.maxPrice) url += `maxPrice=${filters.maxPrice}&`;
      if (filters.condition) url += `condition=${filters.condition}&`;
      if (filters.sortBy === 'price_low') url += `sort=price_asc&`;
      if (filters.sortBy === 'price_high') url += `sort=price_desc&`;
      
      const response = await api.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <CategoryNav />
      <div style={styles.mainLayout}>
        <aside style={styles.sidebar}>
          <FilterPanel onFilterChange={setFilters} />
        </aside>
        <main style={styles.mainContent}>
          <div style={styles.resultsHeader}><h2>{products.length} Items Found</h2></div>
          <ProductGrid products={products} loading={loading} />
        </main>
      </div>
    </div>
  );
};

const styles = {
  mainLayout: { display: 'flex', maxWidth: '1400px', margin: '30px auto', padding: '0 20px', gap: '30px' },
  sidebar: { width: '280px', flexShrink: 0 },
  mainContent: { flex: 1 },
  resultsHeader: { marginBottom: '20px' }
};

export default Homepage;