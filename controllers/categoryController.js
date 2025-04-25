const Category = require('../models/Category');
const mongoose = require('mongoose');

// Render edit form
exports.renderEditCategoryForm = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    const parentCategories = await Category.find({
      _id: { $ne: category._id }, // exclude self
      parent_category_id: null
    });

    if (!category) {
      req.flash('error_msg', 'Category not found.');
      return res.redirect('/categories');
    }

    res.render('editCategory', {
      title: 'Edit Category',
      category,
      parentCategories,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (err) {
    console.error('Error loading edit form:', err);
    req.flash('error_msg', 'Error loading edit form.');
    res.redirect('/categories');
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon_url, parent_category_id, restricted_countries, is_active } = req.body;

    const updateData = {
      name,
      description,
      icon_url,
      parent_category_id: parent_category_id || null,
      restricted_countries: restricted_countries
        ? restricted_countries.split(',').map(c => c.trim())
        : [],
      is_active: is_active === 'on'
    };

    const updated = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) {
      req.flash('error_msg', 'Category not found.');
      return res.redirect('/categories');
    }

    req.flash('success_msg', 'Category updated successfully.');
    res.redirect('/categories');
  } catch (err) {
    console.error('Error updating category:', err);
    req.flash('error_msg', 'Failed to update category.');
    res.redirect(`/categories/edit/${req.params.id}`);
  }
};

// Add category form
exports.renderAddCategoryForm = (req, res) => {
  Category.find({ parent_category_id: null })
    .then(parentCategories => {
      res.render('addCategory', {
        title: 'Add Category',
        parentCategories
      });
    })
    .catch(err => {
      console.log(err);
      req.flash('error_msg', 'Error loading categories.');
      res.redirect('/categories');
    });
};

// Create category
exports.createCategory = (req, res) => {
  const { name, description, icon_url, parent_category_id, restricted_countries, is_active } = req.body;

  const category = new Category({
    name,
    description,
    icon_url,
    parent_category_id: parent_category_id || null,
    restricted_countries: restricted_countries ? restricted_countries.split(',').map(c => c.trim()) : [],
    is_active: is_active === 'on'
  });

  category
    .save()
    .then(() => {
      req.flash('success_msg', 'Category created successfully.');
      res.redirect('/categories');
    })
    .catch(err => {
      console.log(err);
      req.flash('error_msg', 'Failed to create category.');
      res.redirect('/categories/add');
    });
};

// Get all categories
exports.getAllCategories = (req, res) => {
  Category.find()
    .populate('parent_category_id')
    .then(categories => {
      res.render('categories', { categories });
    })
    .catch(err => {
      console.log(err);
      req.flash('error_msg', 'Failed to load categories.');
      res.redirect('/');
    });
};

// Delete category
exports.deleteCategory = (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then(() => {
      req.flash('success_msg', 'Category deleted successfully.');
      res.redirect('/categories');
    })
    .catch(err => {
      console.log(err);
      req.flash('error_msg', 'Failed to delete category.');
      res.redirect('/categories');
    });
};
