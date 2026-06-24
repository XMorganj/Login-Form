/**
 * Seed script — creates a default admin user and sample data.
 * Run once: node server/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Celebrity = require('./models/Celebrity');
const Product = require('./models/Product');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Admin user
  const existing = await User.findOne({ email: 'admin@stargifts.com' });
  if (!existing) {
    await User.create({ name: 'Admin', email: 'admin@stargifts.com', password: 'admin123', role: 'admin' });
    console.log('Admin created — email: admin@stargifts.com  password: admin123');
  } else {
    console.log('Admin already exists');
  }

  // Sample celebrity
  let celeb = await Celebrity.findOne({ slug: 'sample-star' });
  if (!celeb) {
    celeb = await Celebrity.create({
      name: 'Sample Star',
      slug: 'sample-star',
      category: 'music',
      bio: 'Sample Star is a fictional artist used for demo purposes. Replace this with real celebrity data via the Admin panel.',
      shortBio: 'Demo celebrity — edit via Admin panel.',
      nationality: 'International',
      featured: true,
      socialLinks: { instagram: 'https://instagram.com', twitter: 'https://twitter.com' }
    });
    console.log('Sample celebrity created');
  }

  // Sample product
  const prodExists = await Product.findOne({ celebrity: celeb._id });
  if (!prodExists) {
    await Product.create({
      name: 'Signed Poster',
      description: 'A high-quality signed poster. Great for fans and collectors.',
      price: 29.99,
      celebrity: celeb._id,
      category: 'merchandise',
      stock: 50
    });
    console.log('Sample product created');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
