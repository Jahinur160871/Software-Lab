import User from '../models/User.js';
import generateToken, { setTokenCookie, clearTokenCookie } from '../utils/generateToken.js';

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, role: role || 'student' });
    if (user) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      res.status(201).json({
        _id: user._id, name: user.name, email: user.email,
        role: user.role, isSeller: user.isSeller, sellerApproved: user.sellerApproved
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      res.json({
        _id: user._id, name: user.name, email: user.email,
        role: user.role, isSeller: user.isSeller, sellerApproved: user.sellerApproved
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const logoutUser = async (req, res) => {
  try {
    clearTokenCookie(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      const token = generateToken(updatedUser._id);
      setTokenCookie(res, token);
      res.json({
        _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
        role: updatedUser.role, isSeller: updatedUser.isSeller, sellerApproved: updatedUser.sellerApproved
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile };