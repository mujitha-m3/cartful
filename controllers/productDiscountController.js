const Product = require('../models/Product');
const Category = require('../models/Category');

function calculateDiscountedPrice(price, discount) {
  if (!price || !discount.type || !discount.value) return price;

  let discounted;
  if (discount.type === 'percentage') {
    discounted = price - (price * (discount.value / 100));
  } else if (discount.type === 'flat') {
    discounted = price - discount.value;
  } else {
    discounted = price;
  }

  return discounted > 0 ? discounted.toFixed(2) : '0.00';
}

const showDiscountPage = async (req, res) => {
  try {
    console.log('showDiscountPage Called');

    const selectedCategoryId = req.query.category || '';
    const {
      discountType,
      discountValue,
      startDate,
      endDate,
      applyTo,
      selectedProducts,
      reason: commonReason
    } = req.query;

    console.log('Selected Category ID:', selectedCategoryId || 'None');
    const categories = await Category.find();
    console.log(` Categories loaded: ${categories.length}`);

    let products = [];

    if (selectedCategoryId) {
      console.log(` Searching for products in category ${selectedCategoryId}`);
      products = await Product.find({ category_id: selectedCategoryId }).lean();
      console.log(` Products found: ${products.length}`);
    } else {
      console.log(' No category selected, skipping product query');
    }

    const selectedSet = new Set(
      Array.isArray(selectedProducts)
        ? selectedProducts
        : selectedProducts
        ? [selectedProducts]
        : []
    );

    const now = new Date();
    const sixMonthsLater = new Date(now);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    products.forEach(product => {
      const expiry = product.lifecycle?.expiry_date ? new Date(product.lifecycle.expiry_date) : null;
      product.isNearingExpiry = expiry && expiry <= sixMonthsLater;

      if (discountType && discountValue && startDate && endDate) {
        let applyCondition = false;

        if (applyTo === 'all') {
          applyCondition = true;
        } else if (applyTo === 'category' && selectedCategoryId) {
          applyCondition = true;
        } else if (applyTo === 'selected' && selectedSet.has(product._id.toString())) {
          applyCondition = true;
        }

        if (applyCondition) {
          product.discount_type = discountType;
          product.discount_value = parseFloat(discountValue);
          product.discount_start = new Date(startDate);
          product.discount_end = new Date(endDate);
          product.discount_reason = commonReason || '';
        }
      }

      product.discountedPrice = calculateDiscountedPrice(product.price, {
        type: product.discount_type,
        value: product.discount_value
      });
      product.discountType = product.discount_type || '';
      product.discountValue = product.discount_value || '';
      product.discountStart = product.discount_start
        ? new Date(product.discount_start).toISOString().substring(0, 10)
        : '';
      product.discountEnd = product.discount_end
        ? new Date(product.discount_end).toISOString().substring(0, 10)
        : '';
      product.reason = product.discount_reason || '';

      console.log(` ${product.name}`);
      console.log(` Price: ${product.price}`);
      console.log(` Discounted Price: ${product.discountedPrice}`);
      console.log(` Type: ${product.discountType}`);
      console.log(` Value: ${product.discountValue}`);
      console.log(` Start: ${product.discountStart}`);
      console.log(` End: ${product.discountEnd}`);
      console.log(` Reason: ${product.reason}`);
      console.log(" Expiry dt:", product.lifecycle?.expiry_date);
    });

    console.log(' Rendering discount page');
    res.render('productDiscount', {
      categories,
      products,
      selectedCategory: selectedCategoryId,
      reason: commonReason || ''
    });

  } catch (err) {
    console.error('showDiscountPage Error:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).render('error', {
      error: {
        message: 'Failed to load discount page.',
        status: 500
      }
    });
  }
};

const applyDiscountToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, start_date, end_date, reason } = req.body;

    console.log('applyDiscountToProduct] Product ID:', id);
    console.log(`Received: type=${type}, value=${value}, start=${start_date}, end=${end_date}`);

    if (!type || !value || !start_date || !end_date) {
      console.warn('Missing required fields');
      return res.status(400).send('All discount fields are required.');
    }

    if (!['percentage', 'flat'].includes(type)) {
      console.warn(' Invalid discount type:', type);
      return res.status(400).send('Invalid discount type.');
    }

    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      console.warn('Invalid discount value:', value);
      return res.status(400).send('Invalid discount value.');
    }

    const product = await Product.findById(id);
    if (!product) {
      console.warn('Product not found:', id);
      return res.status(404).send('Product not found.');
    }

    const expiry = product.lifecycle?.expiry_date ? new Date(product.lifecycle.expiry_date) : null;
    const now = new Date();
    const sixMonthsLater = new Date(now);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    const isNearingExpiry = expiry && expiry <= sixMonthsLater;

    if (!isNearingExpiry) {
      console.warn('Discount denied: Not near expiry');
      return res.status(400).send("Discount not allowed — product is not within 6 months of expiry.");
    }

    product.discount_type = type;
    product.discount_value = parsedValue;
    product.discount_start = new Date(start_date);
    product.discount_end = new Date(end_date);
    product.discount_reason = reason || '';

    await product.save();
    console.log('Discount applied successfully');

    res.redirect('back');

  } catch (err) {
    console.error('applyDiscountToProduct Error:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).send('Server error while applying discount.');
  }
};

const showDiscountPreview = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('showDiscountPreview Previewing product:', productId);

    const product = await Product.findById(productId).lean({ virtuals: true });
    if (!product) {
      console.warn('Product not found for preview:', productId);
      return res.status(404).render('error', {
        error: {
          message: 'Product not found for preview.',
          status: 404
        }
      });
    }

    console.log(' Rendering product preview:', product.name);
    res.render('productDiscountPreview', { product });

  } catch (err) {
    console.error(' showDiscountPreview Error:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).render('error', {
      error: {
        message: 'Error generating preview.',
        status: 500
      }
    });
  }
};

const saveMultipleDiscounts = async (req, res) => {
    try {
      const selectedProductIds = req.body.selectedProducts;
      const productIds = Array.isArray(selectedProductIds) ? selectedProductIds : [selectedProductIds];
  
      if (!productIds || productIds.length === 0) {
        return res.status(400).send("No updates received.");
      }
  
      for (const id of productIds) {
        const type = req.body[`type_${id}`];
        const value = req.body[`value_${id}`];
        const start_date = req.body[`start_${id}`];
        const end_date = req.body[`end_${id}`];
        const reason = req.body[`reason_${id}`];
  
        if (!type || !value || !start_date || !end_date) continue;
  
        const product = await Product.findById(id);
        if (!product) continue;
  
        product.discount_type = type;
        product.discount_value = parseFloat(value);
        product.discount_start = new Date(start_date);
        product.discount_end = new Date(end_date);
        product.discount_reason = reason || '';
  
        await product.save();
      }
  
      res.redirect("/admin/discounts/search");
  
    } catch (err) {
      console.error("saveMultipleDiscounts Error:", {
        message: err.message,
        stack: err.stack
      });
      res.status(500).render("error", {
        error: {
          message: "Error saving multiple discounts",
          details: err.message
        }
      });
    }
  };
  
module.exports = {
  showDiscountPage,
  applyDiscountToProduct,
  showDiscountPreview,
  saveMultipleDiscounts
};
