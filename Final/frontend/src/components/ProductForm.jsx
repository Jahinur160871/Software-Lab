import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('new');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('other');
  const [negotiable, setNegotiable] = useState(false);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setPrice(product.price);
      setCondition(product.condition);
      setCategory(product.category?._id || product.category);
      setSubcategory(product.subcategory);
      setNegotiable(product.negotiable);
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('condition', condition);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('negotiable', negotiable);
    
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      if (product) {
        await api.put(`/products/${product._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
      <input
        type="text"
        placeholder="Product Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows="4"
        required
      />
      <input
        type="number"
        placeholder="Price (BDT)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <select value={condition} onChange={(e) => setCondition(e.target.value)}>
        <option value="new">New</option>
        <option value="like new">Like New</option>
        <option value="good">Good</option>
        <option value="fair">Fair</option>
      </select>
      <select value={category} onChange={(e) => setCategory(e.target.value)} required>
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
        ))}
      </select>
      <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
        <option value="food">Food</option>
        <option value="clothing">Clothing</option>
        <option value="electronics">Electronics</option>
        <option value="lab equipment">Lab Equipment</option>
        <option value="textbook">Textbook</option>
        <option value="other">Other</option>
      </select>
      <label>
        <input
          type="checkbox"
          checked={negotiable}
          onChange={(e) => setNegotiable(e.target.checked)}
        />
        Price Negotiable
      </label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        required={!product}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default ProductForm;