import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FilterPanel = ({ onFilterChange, onClearFilters }) => {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [discount, setDiscount] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const category = new URLSearchParams(location.search).get('category');
  const isUsedMaterials = category === 'used-materials';

  useEffect(() => {
    onFilterChange({ 
      minPrice: priceRange.min, 
      maxPrice: priceRange.max, 
      condition, 
      sortBy,
      discount
    });
  }, [priceRange, condition, sortBy, discount]);

  const handleClearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setCondition('');
    setSortBy('newest');
    setDiscount('');
    if (onClearFilters) onClearFilters();
    else onFilterChange({});
    navigate('/');
  };

  const discountOptions = [
    { value: '', label: 'All' },
    { value: '10', label: '10%+' },
    { value: '20', label: '20%+' },
    { value: '30', label: '30%+' },
    { value: '40', label: '40%+' },
    { value: '50', label: '50%+' },
    { value: '60', label: '60%+' },
    { value: '70', label: '70%+' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'discount_high', label: 'Biggest Discount' },
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (discount) count++;
    if (priceRange.min) count++;
    if (priceRange.max) count++;
    if (condition) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Filters</h3>
        {activeCount > 0 && (
          <button onClick={handleClearFilters} style={styles.clearBtn}>
            Clear all
          </button>
        )}
      </div>

      {/* Discount Filter - Horizontal chips */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Discount</h4>
        <div style={styles.discountRow}>
          {discountOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDiscount(option.value)}
              style={{
                ...styles.discountChip,
                ...(discount === option.value && styles.discountChipActive)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Price</h4>
        <div style={styles.priceRow}>
          <div style={styles.priceInputWrapper}>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              style={styles.priceInput}
              min="0"
            />
          </div>
          <span style={styles.priceSeparator}>–</span>
          <div style={styles.priceInputWrapper}>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              style={styles.priceInput}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Condition - Only for Used Materials */}
      {isUsedMaterials && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Condition</h4>
          <select 
            value={condition} 
            onChange={(e) => setCondition(e.target.value)} 
            style={styles.select}
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="like new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="needs repair">Needs Repair</option>
          </select>
        </div>
      )}

      {/* Sort By */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Sort by</h4>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          style={styles.select}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters */}
      {activeCount > 0 && (
        <div style={styles.activeSection}>
          <div style={styles.activeTags}>
            {discount && (
              <span style={styles.activeTag}>
                {discount}% off
                <button onClick={() => setDiscount('')} style={styles.removeTag}>×</button>
              </span>
            )}
            {priceRange.min && (
              <span style={styles.activeTag}>
                Min ৳{priceRange.min}
                <button onClick={() => setPriceRange({ ...priceRange, min: '' })} style={styles.removeTag}>×</button>
              </span>
            )}
            {priceRange.max && (
              <span style={styles.activeTag}>
                Max ৳{priceRange.max}
                <button onClick={() => setPriceRange({ ...priceRange, max: '' })} style={styles.removeTag}>×</button>
              </span>
            )}
            {condition && (
              <span style={styles.activeTag}>
                {condition}
                <button onClick={() => setCondition('')} style={styles.removeTag}>×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #eef2f6',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #eef2f6',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: '#1a1a2e',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#e67e22',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 8px',
  },
  
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#2c3e50',
  },
  
  // Discount chips - horizontal scroll
  discountRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  discountChip: {
    padding: '6px 14px',
    backgroundColor: '#f5f6fa',
    border: '1px solid #e2e8f0',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  discountChipActive: {
    backgroundColor: '#e67e22',
    borderColor: '#e67e22',
    color: '#fff',
  },
  
  // Price row
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#fafbfc',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#e67e22',
      backgroundColor: '#fff',
    },
  },
  priceSeparator: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  
  // Select
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '13px',
    backgroundColor: '#fafbfc',
    cursor: 'pointer',
    outline: 'none',
    color: '#334155',
  },
  
  // Active filters
  activeSection: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #eef2f6',
  },
  activeTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  activeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#f1f5f9',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    color: '#2c3e50',
  },
  removeTag: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0 2px',
    display: 'flex',
    alignItems: 'center',
  },
};

export default FilterPanel;