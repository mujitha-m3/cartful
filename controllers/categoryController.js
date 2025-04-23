const Category = require('../models/Category');

exports.renderAddCategoryForm = async (req, res) => {
  try {
    const parentCategories = await Category.find({ is_active: true });
    res.render('addCategory', {
      title: 'Add New Category',
      parentCategories
    });
  } catch (error) {
    res.render('addCategory', {
      title: 'Add New Category',
      error: 'Failed to load parent categories'
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon_url, parent_category_id, restricted_countries, localized_names } = req.body;
    
    const category = new Category({
      name,
      description,
      parent_category_id: parent_category_id || null,
      restricted_countries: restricted_countries || [],
      localized_names: localized_names || {}
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category name must be unique' });
    }
    res.status(400).json({ error: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const { include_inactive } = req.query;
    const filter = {};
    
    if (include_inactive !== 'true') {
      filter.is_active = true;
    }
    
    const categories = await Category.find(filter).populate('parent_category_id', 'name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent_category_id', 'name');
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'icon_url', 'parent_category_id', 'restricted_countries', 'localized_names', 'is_active'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    updates.forEach(update => category[update] = req.body[update]);
    await category.save();
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category name must be unique' });
    }
    res.status(400).json({ error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get categories hierarchy
exports.getCategoryHierarchy = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true });
    
    const buildHierarchy = (parentId = null) => {
      return categories
        .filter(category => 
          (category.parent_category_id && category.parent_category_id.toString() === parentId) || 
          (!category.parent_category_id && !parentId)
        )
        .map(category => ({
          ...category.toObject(),
          children: buildHierarchy(category._id.toString())
        }));
    };
    
    const hierarchy = buildHierarchy();
    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
