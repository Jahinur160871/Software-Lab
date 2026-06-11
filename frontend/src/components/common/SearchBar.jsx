import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} style={styles.form}>
      <div style={styles.searchContainer}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search for products... (e.g., 'Rice' shows 'Fried Rice', 'Rice Bowl')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Search</button>
      </div>
    </form>
  );
};

const styles = {
  form: { width: '100%' },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '40px',
    padding: '6px 6px 6px 18px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
  },
  searchIcon: { 
    fontSize: '16px', 
    marginRight: '8px', 
    color: '#94a3b8' 
  },
  input: { 
    flex: 1, 
    padding: '10px 0', 
    border: 'none', 
    backgroundColor: 'transparent', 
    fontSize: '14px', 
    outline: 'none',
    '&::placeholder': {
      color: '#94a3b8',
    },
  },
  button: { 
    backgroundColor: '#1a2c3e', 
    color: 'white', 
    border: 'none', 
    padding: '8px 24px', 
    borderRadius: '40px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
};

export default SearchBar;