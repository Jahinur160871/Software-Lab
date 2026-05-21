import Product from '../models/Product.js';
import imagekit from '../config/imagekit.js';

const getProducts = async (req, res) => {
  try {
    const { category, subcategory, condition, minPrice, maxPrice, search, negotiable } = req.query;
    let query = { status: 'active' };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (condition) query.condition = condition;
    if (negotiable === 'true') query.negotiable = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };
    const products = await Product.find(query).populate('category', 'name').populate('sellerId', 'name email').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name').populate('sellerId', 'name email sellerDetails');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, description, price, originalPrice, condition, usedDuration, reasonForSelling, courseName, category, subcategory, negotiable } = req.body;
    const imageUrls = [];
    const imageFileIds = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedImage = await imagekit.upload({
          file: file.buffer.toString('base64'),
          fileName: `${Date.now()}-${file.originalname}`,
          folder: '/campusmart-products'
        });
        imageUrls.push(uploadedImage.url);
        imageFileIds.push(uploadedImage.fileId);
      }
    }
    const product = await Product.create({
      title, description, price, originalPrice, condition, usedDuration, reasonForSelling, courseName,
      category, subcategory, negotiable: negotiable === 'true', images: imageUrls, imageFileIds,
      sellerId: req.user._id, stock: 1
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description, price, originalPrice, condition, usedDuration, reasonForSelling, courseName, category, subcategory, negotiable, status } = req.body;
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.originalPrice = originalPrice || product.originalPrice;
    product.condition = condition || product.condition;
    product.usedDuration = usedDuration || product.usedDuration;
    product.reasonForSelling = reasonForSelling || product.reasonForSelling;
    product.courseName = courseName || product.courseName;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.negotiable = negotiable === 'true';
    product.status = status || product.status;
    if (req.files && req.files.length > 0) {
      for (const fileId of product.imageFileIds) {
        try { await imagekit.deleteFile(fileId); } catch (err) { console.error(err); }
      }
      const imageUrls = [], imageFileIds = [];
      for (const file of req.files) {
        const uploadedImage = await imagekit.upload({
          file: file.buffer.toString('base64'),
          fileName: `${Date.now()}-${file.originalname}`,
          folder: '/campusmart-products'
        });
        imageUrls.push(uploadedImage.url);
        imageFileIds.push(uploadedImage.fileId);
      }
      product.images = imageUrls;
      product.imageFileIds = imageFileIds;
    }
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    for (const fileId of product.imageFileIds) {
      try { await imagekit.deleteFile(fileId); } catch (err) { console.error(err); }
    }
    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId, status: 'active' }).populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getLabEquipment = async (req, res) => {
  try {
    const products = await Product.find({ subcategory: 'lab equipment', status: 'active' }).populate('category', 'name').populate('sellerId', 'name email');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsBySeller, getLabEquipment };