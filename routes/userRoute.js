const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const userController = require('../controllers/userController');

// POST: Customer Registration


router.post('/api/', userController.registerNewUser);


router.get('/api/customerRegister/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({
        msg: 'User not found'
      });
    }

  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update Cusomer or user Record
router.patch('/api/customerRegister/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Update failed' });
  }
});

// Delete

router.delete('/api/customerRegister/:id', async (req, res) => 
  {
  try {
    const result = await User.deleteUserById(req.params.id);
    if (result) 
      {
      res.status(200).json({ msg: 'User deleted successfully' });
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Delete failed' });
  }
});

module.exports = router;
