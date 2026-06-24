const express = require('express');
const Stripe = require('stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: build order from cart items
async function resolveCartItems(items) {
  const resolved = [];
  let subtotal = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId).populate('celebrity', '_id name');
    if (!product || !product.active) throw new Error(`Product ${item.productId} not available`);
    if (!product.unlimited && product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
    resolved.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      celebrity: product.celebrity._id
    });
    subtotal += product.price * item.quantity;
  }
  return { resolved, subtotal };
}

// ── Stripe card payment ───────────────────────────────────────────────────────

router.post('/stripe/create-intent', async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items, shippingAddress, guestEmail } = req.body;

    const { resolved, subtotal } = await resolveCartItems(items);
    const total = subtotal; // add tax/shipping logic here if needed

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true }
    });

    const order = await Order.create({
      user: req.user?._id,
      guestEmail,
      items: resolved,
      subtotal,
      total,
      paymentMethod: 'card',
      stripePaymentIntentId: paymentIntent.id,
      shippingAddress
    });

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/confirm/:orderId', async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    if (intent.status === 'succeeded') {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      await order.save();
      // decrement stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Bitcoin via CoinGate ──────────────────────────────────────────────────────

router.post('/bitcoin/create', async (req, res) => {
  try {
    const { items, guestEmail, shippingAddress } = req.body;
    const { resolved, subtotal } = await resolveCartItems(items);
    const total = subtotal;

    const order = await Order.create({
      user: req.user?._id,
      guestEmail,
      items: resolved,
      subtotal,
      total,
      paymentMethod: 'bitcoin',
      shippingAddress
    });

    const cgPayload = {
      order_id: order._id.toString(),
      price_amount: total,
      price_currency: 'USD',
      receive_currency: 'BTC',
      title: `Fan Gift Order #${order._id}`,
      description: `${resolved.length} item(s)`,
      callback_url: `${process.env.APP_URL}/api/payments/bitcoin/callback`,
      success_url: `${process.env.APP_URL}/order-success.html?id=${order._id}`,
      cancel_url: `${process.env.APP_URL}/checkout.html`
    };

    const cgBase = process.env.COINGATE_ENVIRONMENT === 'sandbox'
      ? 'https://api-sandbox.coingate.com/v2'
      : 'https://api.coingate.com/v2';

    const cgRes = await fetch(`${cgBase}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.COINGATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cgPayload)
    });

    if (!cgRes.ok) {
      const errText = await cgRes.text();
      throw new Error(`CoinGate error: ${errText}`);
    }

    const cgOrder = await cgRes.json();
    order.coingateOrderId = cgOrder.id.toString();
    order.bitcoinAddress = cgOrder.payment_address || '';
    await order.save();

    res.json({
      orderId: order._id,
      paymentUrl: cgOrder.payment_url,
      bitcoinAddress: cgOrder.payment_address,
      amountBtc: cgOrder.pay_amount,
      expiresAt: cgOrder.expire_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bitcoin/callback', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    if (data.status === 'paid') {
      const order = await Order.findById(data.order_id);
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Order lookup ──────────────────────────────────────────────────────────────

router.get('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
