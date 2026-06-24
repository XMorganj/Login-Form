const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { makeUpload } = require('../config/cloudinary');

const router = express.Router();
const upload = makeUpload('stargifts/products');

// Public
router.get('/', async (req, res) => {
  try {
    const { celebrity, category } = req.query;
    const filter = { active: true };
    if (celebrity) filter.celebrity = celebrity;
    if (category) filter.category = category;

    const products = await Product.find(filter).populate('celebrity', 'name slug photo');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, active: true }).populate('celebrity', 'name slug photo');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin
router.post('/', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.length) data.images = req.files.map(f => f.path);
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.length) data.images = req.files.map(f => f.path);
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
