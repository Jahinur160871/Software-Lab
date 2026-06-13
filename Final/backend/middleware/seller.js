const isApprovedSeller = (req, res, next) => {
  if (req.user && req.user.isSeller && req.user.sellerApproved) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as approved seller' });
  }
};

export { isApprovedSeller };