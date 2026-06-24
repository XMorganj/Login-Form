const express = require('express');
const multer = require('multer');
const path = require('path');
const Celebrity = require('../models/Celebrity');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/celebrities/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

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
    if (req.files?.photo) data.photo = '/uploads/celebrities/' + req.files.photo[0].filename;
    if (req.files?.coverPhoto) data.coverPhoto = '/uploads/celebrities/' + req.files.coverPhoto[0].filename;
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
    if (req.files?.photo) data.photo = '/uploads/celebrities/' + req.files.photo[0].filename;
    if (req.files?.coverPhoto) data.coverPhoto = '/uploads/celebrities/' + req.files.coverPhoto[0].filename;

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
