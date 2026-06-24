const express = require('express');
const Celebrity = require('../models/Celebrity');
const { protect, adminOnly } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');

const router = express.Router();
const upload = makeUpload('stargifts/celebrities');

// Public
router.get('/', async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    const filter = { active: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const celebrities = await Celebrity.find(filter).sort({ featured: -1, name: 1 });
    res.json(celebrities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const celebrity = await Celebrity.findOne({ slug: req.params.slug, active: true });
    if (!celebrity) return res.status(404).json({ error: 'Celebrity not found' });
    res.json(celebrity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin
router.post('/', protect, adminOnly, upload.fields([{ name: 'photo' }, { name: 'coverPhoto' }]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.photo) data.photo = req.files.photo[0].path;
    if (req.files?.coverPhoto) data.coverPhoto = req.files.coverPhoto[0].path;
    if (!data.slug) data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const celebrity = await Celebrity.create(data);
    res.status(201).json(celebrity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', protect, adminOnly, upload.fields([{ name: 'photo' }, { name: 'coverPhoto' }]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.photo) data.photo = req.files.photo[0].path;
    if (req.files?.coverPhoto) data.coverPhoto = req.files.coverPhoto[0].path;

    const celebrity = await Celebrity.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!celebrity) return res.status(404).json({ error: 'Celebrity not found' });
    res.json(celebrity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Celebrity.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Celebrity removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
