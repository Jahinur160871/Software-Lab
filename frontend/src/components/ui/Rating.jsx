import React from 'react';

const Rating = ({ value, text, color = '#ff9800', size = '14px' }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        style={{
          color: i <= value ? color : '#e4e5e9',
          fontSize: size,
          marginRight: '2px',
          cursor: 'pointer'
        }}
      >
        ★
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <div>{stars}</div>
      {text && <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>{text}</span>}
    </div>
  );
};

export default Rating;