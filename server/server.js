require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const app = express();

connectDB().then(() => autoSeed());

async function autoSeed() {
  try {
    const User = require('./models/User');
    const Celebrity = require('./models/Celebrity');
    const Product = require('./models/Product');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return;

    await User.create({ name: 'Admin', email: 'admin@stargifts.com', password: 'admin123', role: 'admin' });
    console.log('Admin account created — admin@stargifts.com / admin123');

    const celeb = await Celebrity.create({
      name: 'Sample Star', slug: 'sample-star', category: 'music',
      bio: 'Sample celebrity — replace via the Admin panel.',
      shortBio: 'Demo celebrity.', nationality: 'International', featured: true,
      socialLinks: { instagram: '', twitter: '' }
    });

    await Product.create({
      name: 'Signed Poster', description: 'A high-quality signed poster for fans and collectors.',
      price: 29.99, celebrity: celeb._id, category: 'merchandise', stock: 50
    });

    console.log('Sample celebrity and product created.');
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
}

// Ensure upload dirs exist
['uploads/celebrities', 'uploads/products'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Expose safe public config to frontend
app.get('/api/config', (req, res) => {
  res.json({ stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/celebrities', require('./routes/celebrities'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/orders', require('./routes/orders'));

// Admin panel
app.use('/admin', express.static(path.join(__dirname, '..', 'public', 'admin')));

// Catch-all: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
