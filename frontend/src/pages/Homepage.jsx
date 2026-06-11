import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import FilterPanel from '../components/filters/FilterPanel';
import ProductGrid from '../components/products/ProductGrid';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Homepage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'food', name: 'Food' },
    { id: 'cloth-and-style', name: 'Clothing' },
    { id: 'used-materials', name: 'Used Items' }
  ];

  // Rotating messages
  const rotatingMessages = [
    { text: 'Start Your Business', icon: '🚀', link: '/become-seller' },
    { text: 'Sell Your Used Products', icon: '🔄', link: '/create-used-item' },
    { text: 'Grow Your Business', icon: '📈', link: '/seller-orders' },
    { text: 'admin@campusmart.com', icon: '✉️', link: 'mailto:admin@campusmart.com' },
  ];

  // Auto-rotate messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % rotatingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get search term from URL on page load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [location.search]);

  // Fetch products when category or filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, filters]);

  // Filter products by search term - PARTIAL MATCH (includes word)
  useEffect(() => {
    if (allProducts.length > 0) {
      let filtered = [...allProducts];
      
      // Apply search filter - show products where title INCLUDES the search term (not just starts with)
      if (searchTerm.trim()) {
        const searchLower = searchTerm.trim().toLowerCase();
        filtered = filtered.filter(product => 
          product.title.toLowerCase().includes(searchLower)
        );
      }
      
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, allProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products?';
      if (selectedCategory !== 'all') {
        url += `category=${selectedCategory}&`;
      }
      if (filters.minPrice) url += `minPrice=${filters.minPrice}&`;
      if (filters.maxPrice) url += `maxPrice=${filters.maxPrice}&`;
      if (filters.condition) url += `condition=${filters.condition}&`;
      if (filters.discount && filters.discount !== '') {
        url += `minDiscount=${filters.discount}&`;
      }
      if (filters.sortBy === 'price_low') url += `sort=price_asc&`;
      if (filters.sortBy === 'price_high') url += `sort=price_desc&`;
      if (filters.sortBy === 'discount_high') url += `sort=discount_desc&`;
      
      const response = await api.get(url);
      let availableProducts = response.data.filter(product => 
        product.status === 'active' && product.stock > 0
      );
      
      if (filters.discount && filters.discount !== '') {
        const minDiscount = parseInt(filters.discount);
        availableProducts = availableProducts.filter(product => {
          const discountPercent = product.discountType === 'percentage' 
            ? product.discount 
            : Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          return discountPercent >= minDiscount;
        });
      }
      
      if (filters.sortBy === 'discount_high') {
        availableProducts.sort((a, b) => {
          const discountA = a.discountType === 'percentage' 
            ? a.discount 
            : Math.round(((a.originalPrice - a.price) / a.originalPrice) * 100);
          const discountB = b.discountType === 'percentage' 
            ? b.discount 
            : Math.round(((b.originalPrice - b.price) / b.originalPrice) * 100);
          return discountB - discountA;
        });
      }
      
      setAllProducts(availableProducts);
      setFilteredProducts(availableProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?category=${selectedCategory}&search=${encodeURIComponent(searchTerm)}`);
    } else if (selectedCategory !== 'all') {
      navigate(`/?category=${selectedCategory}`);
    } else {
      navigate('/');
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
    if (categoryId === 'all') {
      navigate('/');
    } else {
      navigate(`/?category=${categoryId}`);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    navigate('/');
  };

  const handleMessageClick = (link) => {
    if (link.startsWith('mailto:')) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  const showEmptyState = !loading && filteredProducts.length === 0;
  const currentMessage = rotatingMessages[currentMessageIndex];
  const isUsedItemsSelected = selectedCategory === 'used-materials';

  return (
    <div style={styles.appContainer}>
      <Header />
      
      {/* Rotating Message Banner - Clean Professional */}
      <div 
        style={styles.messageBanner}
        onClick={() => handleMessageClick(currentMessage.link)}
      >
        <div style={styles.messageContent}>
          <span style={styles.messageIcon}>{currentMessage.icon}</span>
          <span style={styles.messageText}>{currentMessage.text}</span>
          <div style={styles.messageDots}>
            {rotatingMessages.map((_, index) => (
              <span
                key={index}
                style={{
                  ...styles.messageDot,
                  ...(currentMessageIndex === index && styles.messageDotActive)
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Categories and Search Row - Directly below banner */}
      <div style={styles.topBar}>
        <div style={styles.categoriesWrapper}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat.id && styles.categoryBtnActive)
              }}
            >
              <span style={styles.categoryName}>{cat.name}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={styles.searchContainer}>
            <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search products... (e.g., 'Rice' shows 'Fried Rice')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>Search</button>
          </div>
        </form>
      </div>

      {/* Search Results Info */}
      {searchTerm && !loading && filteredProducts.length > 0 && (
        <div style={styles.searchResultsInfo}>
          <span>
            Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} for "{searchTerm}"
          </span>
        </div>
      )}

      {/* Floating Add Button for Used Items - Only shows when Used Items category is selected */}
      {isUsedItemsSelected && (
        <div style={styles.floatingAddContainer}>
          {user ? (
            <button 
              onClick={() => navigate('/create-used-item')}
              style={styles.floatingAddBtn}
            >
              <span style={styles.floatingAddIcon}>+</span>
              <span>Sell Used Item</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              style={styles.floatingAddBtn}
            >
              <span style={styles.floatingAddIcon}>+</span>
              <span>Login to Sell</span>
            </button>
          )}
        </div>
      )}

      {/* Main Layout */}
      <div style={styles.mainLayout}>
        <aside style={styles.sidebar}>
          <FilterPanel onFilterChange={setFilters} onClearFilters={handleClearFilters} />
        </aside>
        <main style={styles.mainContent}>
          {(filters.minPrice || filters.maxPrice || filters.condition || filters.discount || filters.sortBy !== 'newest') && (
            <div style={styles.clearFiltersWrapper}>
              <button onClick={handleClearFilters} style={styles.clearFiltersBtn}>
                Clear all filters
              </button>
            </div>
          )}
          
          {showEmptyState ? (
            <div style={styles.emptyState}>
              <svg style={styles.emptyIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h3 style={styles.emptyTitle}>
                {searchTerm ? `No products found for "${searchTerm}"` : 'No products found'}
              </h3>
              <p style={styles.emptyText}>
                {searchTerm ? 'Try searching with different keywords' : 'Try adjusting your search or filters'}
              </p>
              {(filters.minPrice || filters.maxPrice || filters.condition || filters.discount) && (
                <button onClick={handleClearFilters} style={styles.resetBtn}>Reset all filters</button>
              )}
            </div>
          ) : (
            <ProductGrid products={filteredProducts} loading={loading} />
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  appContainer: {
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
  },
  
  // Rotating Message Banner - Professional
  messageBanner: {
    backgroundColor: '#1a2c3e',
    padding: '10px 24px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  messageContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  messageIcon: {
    fontSize: '16px',
  },
  messageText: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: '0.3px',
  },
  messageDots: {
    display: 'flex',
    gap: '6px',
    marginLeft: '12px',
  },
  messageDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transition: 'all 0.3s ease',
  },
  messageDotActive: {
    width: '20px',
    borderRadius: '3px',
    backgroundColor: '#ffffff',
  },
  
  // Top Bar - Clean and Professional
  topBar: {
    maxWidth: '1400px',
    margin: '20px auto 0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  categoriesWrapper: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  categoryBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4a5b6e',
    transition: 'all 0.2s ease',
  },
  categoryBtnActive: {
    backgroundColor: '#1a2c3e',
    borderColor: '#1a2c3e',
    color: '#ffffff',
  },
  categoryName: {
    fontSize: '13px',
    fontWeight: '500',
  },
  
  // Search Form
  searchForm: {
    flexShrink: 0,
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '40px',
    padding: '4px 4px 4px 16px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  searchIcon: {
    width: '16px',
    height: '16px',
    color: '#94a3b8',
  },
  searchInput: {
    flex: 1,
    padding: '9px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    outline: 'none',
    width: '280px',
  },
  searchButton: {
    backgroundColor: '#1a2c3e',
    color: '#ffffff',
    border: 'none',
    padding: '7px 20px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  
  // Search Results Info
  searchResultsInfo: {
    maxWidth: '1400px',
    margin: '16px auto 0 auto',
    padding: '0 24px',
    fontSize: '13px',
    color: '#5a6e7c',
  },
  
  // Floating Add Button for Used Items
  floatingAddContainer: {
    maxWidth: '1400px',
    margin: '16px auto 0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  floatingAddBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#d97706',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  floatingAddIcon: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  
  // Main Layout
  mainLayout: { 
    display: 'flex', 
    maxWidth: '1400px', 
    margin: '24px auto', 
    padding: '0 24px 48px 24px', 
    gap: '32px' 
  },
  sidebar: { 
    width: '280px', 
    flexShrink: 0 
  },
  mainContent: { 
    flex: 1 
  },
  
  // Clear Filters Wrapper
  clearFiltersWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
  clearFiltersBtn: {
    padding: '5px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '30px',
    fontSize: '11px',
    color: '#5a6e7c',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  resetBtn: {
    marginTop: '20px',
    padding: '10px 28px',
    backgroundColor: '#1a2c3e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '40px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  
  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    border: '1px solid #eef2f6',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    color: '#cbd5e1',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a2c3e',
    marginBottom: '10px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#5a6e7c',
  },
};

export default Homepage;