import Order from '../models/Order.js';
import Product from '../models/Product.js';

const createOrder = async (req, res) => {
  try {
    const { products, deliveryAddress, contactNumber } = req.body;
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }
    let totalAmount = 0;
    const orderProducts = [];
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found` });
      if (product.status !== 'active') return res.status(400).json({ message: `${product.title} is not available` });
      totalAmount += product.price * item.quantity;
      orderProducts.push({ productId: item.productId, quantity: item.quantity, price: product.price, sellerId: product.sellerId });
    }
    const order = await Order.create({ buyerId: req.user._id, products: orderProducts, totalAmount, deliveryAddress, contactNumber });
    for (const item of orderProducts) {
      const product = await Product.findById(item.productId);
      product.stock -= item.quantity;
      if (product.stock === 0) product.status = 'sold';
      await product.save();
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id }).populate('products.productId', 'title images price').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'products.sellerId': req.user._id }).populate('products.productId', 'title images').populate('buyerId', 'name email').sort({ createdAt: -1 });
    const filteredOrders = orders.map(order => ({ ...order._doc, products: order.products.filter(p => p.sellerId.toString() === req.user._id.toString()) }));
    res.json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const ownsProduct = order.products.some(p => p.sellerId.toString() === req.user._id.toString());
    if (!ownsProduct && req.user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { createOrder, getMyOrders, getSellerOrders, updateOrderStatus };