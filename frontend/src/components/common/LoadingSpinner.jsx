
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #ff6b35', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;