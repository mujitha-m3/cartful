const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('back');
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingItem) {
      req.flash('info_msg', 'Product is already in your wishlist');
      return res.redirect('back');
    }

    // Add to wishlist
    await Wishlist.create({
      user: req.user._id,
      product: productId
    });

    req.flash('success_msg', 'Product added to wishlist');
    res.redirect('back');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add to wishlist');
    res.redirect('back');
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId
    });
    
    req.flash('success_msg', 'Product removed from wishlist');
    res.redirect('back');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to remove from wishlist');
    res.redirect('back');
  }
};

const viewWishlist = async (req, res) => {
    try {
      const wishlistItems = await Wishlist.find({ user: req.user._id })
        .populate({
          path: 'product',
          model: 'Product'
        })
        .lean()
        .exec();
  
      res.render('wishlist', {
        title: 'My Wishlist',
        wishlist: wishlistItems,
        user: req.user // pass user data if needed
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Failed to load wishlist');
      res.redirect('/account');
    }
  };

module.exports = {
  addToWishlist,
  removeFromWishlist,
  viewWishlist
};