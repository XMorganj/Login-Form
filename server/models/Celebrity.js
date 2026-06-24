const mongoose = require('mongoose');

const celebritySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: { type: String, enum: ['music', 'film', 'sports', 'tv', 'other'], default: 'other' },
  bio: { type: String, required: true },
  shortBio: { type: String, maxlength: 200 },
  photo: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  nationality: { type: String, default: '' },
  birthDate: { type: Date },
  socialLinks: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Celebrity', celebritySchema);
