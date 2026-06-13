import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateProduct = () => {
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

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

  // Get selected category name from ID
  const getSelectedCategoryName = () => {
    const selected = categories.find(cat => cat._id === category);
    return selected ? selected.name : '';
  };

  // Categories that are always new
  const alwaysNewCategories = ['Food', 'Clothing', 'Stylish Products'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    
    // Force condition to 'new' for Food, Clothing, Stylish Products
    const selectedCategoryName = getSelectedCategoryName();
    const finalCondition = alwaysNewCategories.includes(selectedCategoryName) ? 'new' : condition;
    formData.append('condition', finalCondition);
    
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('negotiable', negotiable);
    
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/my-products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryName = getSelectedCategoryName();
  // Hide condition dropdown for always-new categories
  const showCondition = !alwaysNewCategories.includes(selectedCategoryName);

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Add New Product</h2>
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
        
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
          ))}
        </select>

        {/* Condition dropdown - only shown for Lab Equipment, Used Items, Electronics, Textbooks */}
        {showCondition && (
          <>
            <label>Condition:</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="new">New</option>
              <option value="like new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs repair">Needs Repair</option>
            </select>
          </>
        )}

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
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;