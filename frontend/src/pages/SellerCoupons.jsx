import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

const SellerCoupons = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', validUntil: '', usageLimit: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try { const response = await api.get('/coupons/seller-coupons'); setCoupons(response.data); } catch (error) { console.error('Error fetching coupons:', error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const formattedData = { ...formData, validUntil: new Date(formData.validUntil).toISOString(), discountValue: Number(formData.discountValue), minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0, maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null, usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null };
      await api.post('/coupons/create', formattedData);
      setMessage('Coupon created successfully!');
      setShowForm(false);
      fetchCoupons();
      setFormData({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', validUntil: '', usageLimit: '' });
    } catch (error) { setError(error.response?.data?.message || 'Failed to create coupon'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try { await api.delete(`/coupons/${id}`); fetchCoupons(); } catch (error) { console.error('Error deleting coupon:', error); }
    }
  };

  const getDiscountText = (coupon) => coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`;
  const isCouponValid = (coupon) => { const now = new Date(); return coupon.isActive && new Date(coupon.validUntil) > now; };

  if (loading) return <div><Header /><div className="loading">Loading...</div></div>;

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <div style={styles.header}><h1 style={styles.title}>💰 My Coupons</h1><button onClick={() => setShowForm(!showForm)} style={styles.createBtn}>+ Create New Coupon</button></div>
        {message && <div style={styles.successMessage}>{message}</div>}{error && <div style={styles.errorMessage}>{error}</div>}
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>Create New Coupon</h3>
            <div style={styles.formGrid}>
              <input type="text" placeholder="Coupon Code (e.g., SAVE20)" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} required style={styles.input} />
              <input type="text" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={styles.input} />
              <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} style={styles.select}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (₹)</option></select>
              <input type="number" placeholder={formData.discountType === 'percentage' ? 'Discount %' : 'Discount Amount'} value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} required style={styles.input} />
              <input type="number" placeholder="Minimum Order Amount" value={formData.minOrderAmount} onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})} style={styles.input} />
              <input type="number" placeholder="Maximum Discount (for percentage)" value={formData.maxDiscount} onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})} style={styles.input} />
              <input type="date" placeholder="Valid Until" value={formData.validUntil} onChange={(e) => setFormData({...formData, validUntil: e.target.value})} required style={styles.input} />
              <input type="number" placeholder="Usage Limit (optional)" value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} style={styles.input} />
            </div>
            <div style={styles.formButtons}><button type="submit" style={styles.submitBtn}>Create Coupon</button><button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button></div>
          </form>
        )}
        <div style={styles.couponsGrid}>
          {coupons.length === 0 ? (
            <div style={styles.emptyState}><span style={styles.emptyIcon}>🏷️</span><h3>No Coupons Created Yet</h3><p>Create your first coupon to attract more customers!</p><button onClick={() => setShowForm(true)} style={styles.emptyCreateBtn}>+ Create Coupon</button></div>
          ) : (
            coupons.map((coupon) => (
              <div key={coupon._id} style={styles.couponCard}>
                <div style={styles.couponHeader}><div style={styles.couponCode}>{coupon.code}</div><div style={isCouponValid(coupon) ? styles.validBadge : styles.expiredBadge}>{isCouponValid(coupon) ? 'Active' : 'Expired'}</div></div>
                <div style={styles.couponDetails}><p>{coupon.description || 'No description'}</p><p style={styles.discountText}>{getDiscountText(coupon)}</p>{coupon.minOrderAmount > 0 && <p>Min Order: ₹{coupon.minOrderAmount}</p>}<p>Valid until: {new Date(coupon.validUntil).toLocaleDateString()}</p>{coupon.usageLimit && <p>Used: {coupon.usedCount}/{coupon.usageLimit}</p>}</div>
                <button onClick={() => handleDelete(coupon._id)} style={styles.deleteBtn}>Delete</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', backgroundColor: '#f8f9fa' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#333' },
  createBtn: { backgroundColor: '#ff6b35', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' },
  successMessage: { backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  errorMessage: { backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  form: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
  select: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' },
  formButtons: { display: 'flex', gap: '10px' },
  submitBtn: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  cancelBtn: { backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  couponsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  couponCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eee' },
  couponHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  couponCode: { fontSize: '20px', fontWeight: 'bold', color: '#ff6b35' },
  validBadge: { backgroundColor: '#28a745', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px' },
  expiredBadge: { backgroundColor: '#dc3545', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px' },
  couponDetails: { marginBottom: '15px', fontSize: '13px', color: '#666', lineHeight: '1.6' },
  discountText: { fontSize: '16px', fontWeight: 'bold', color: '#ff6b35', marginTop: '5px' },
  deleteBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', width: '100%' },
  emptyState: { textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '16px' },
  emptyIcon: { fontSize: '64px', display: 'block', marginBottom: '16px' },
  emptyCreateBtn: { backgroundColor: '#ff6b35', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }
};

export default SellerCoupons;