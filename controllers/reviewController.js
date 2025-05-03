const Review = require('../models/Review');
const Product = require('../models/Product');

const submitReview = async (req, res) => {
    try {
      const { rating, comment } = req.body;
      const productId = req.params.productId;
      
      if (!req.user) {
        req.flash('error_msg', 'You must be logged in to submit a review');
        return res.redirect(`/products/view/${productId}`);
      }
  
      const review = new Review({
        user_id: req.user._id,
        product_id: productId,
        rating,
        comment
      });
  
      const savedReview = await review.save();
      
      // Populate user data for the response
      const populatedReview = await Review.findById(savedReview._id)
        .populate('user_id', 'fullName profileImage')
        .exec();
  
      // Emit the new review to all connected clients
      req.app.locals.io.emit('new-review', {
        productId,
        review: {
          ...populatedReview.toObject(),
          user_id: {
            fullName: populatedReview.user_id.fullName,
            profileImage: populatedReview.user_id.profileImage,
            _id: populatedReview.user_id._id
          }
        }
      });
  
      req.flash('success_msg', 'Thank you for your review!');
      res.redirect(`/products/view/${productId}`);
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Failed to submit review');
      res.redirect(`/products/view/${req.params.productId}`);
    }
  };

module.exports = {
  submitReview
};