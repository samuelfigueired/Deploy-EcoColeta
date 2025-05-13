require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const jsonServerRouter = jsonServer.router('db.json');
const jsonServerMiddlewares = jsonServer.defaults();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('src'));

// JSON Server routes
app.use('/api', jsonServerMiddlewares, jsonServerRouter);

// Stripe payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save donation endpoint
app.post('/api/donations', async (req, res) => {
  try {
    const donation = {
      ...req.body,
      id: Date.now(),
      date: new Date().toISOString(),
      status: 'completed'
    };

    jsonServerRouter.db.get('donations').push(donation).write();
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 