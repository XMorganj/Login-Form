const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  celebrity: { type: mongoose.Schema.Types.ObjectId, ref: 'Celebrity', required: true },
  category: { type: String, enum: ['merchandise', 'digital', 'experience', 'donation'], default: 'merchandise' },
  stock: { type: Number, default: 0 },
  unlimited: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
