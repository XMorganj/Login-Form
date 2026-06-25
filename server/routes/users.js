const express = require('express');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const re = escRe(search);
      filter.$or = [
        { name: { $regex: re, $options: 'i' } },
        { email: { $regex: re, $options: 'i' } }
      ];
    }
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.put('/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['fan', 'admin'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: 'Cannot change your own role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.put('/:id/active', protect, adminOnly, async (req, res) => {
  try {
    const { active } = req.body;
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    const user = await User.findByIdAndUpdate(req.params.id, { active }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
