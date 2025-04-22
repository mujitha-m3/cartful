const Category = require('./models/Category'); // Ensure this path is correct

app.get('/add-product', async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }).sort({ name: 1 });
    res.render('addProduct', {
      title: 'Add a New Product',
      categories: categories.map(c => c.toJSON()) // Pass to Handlebars
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: 'Error loading categories' });
  }
});
