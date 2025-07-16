const dotenv = require('dotenv');
dotenv.config();

// for stripe payment gateway
const stripe = require('stripe')(process.env.STRIPE_SKRT_KET_TST);



// Handle Stripe payment route
const handleStripePayment = async (req, res) => {
  try {
    console.log('stripe');
    const { email, name, address, amount, currency, description } = req.body;
    
    // Create a customer for stripe
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      address: address,
    });

    // Create an ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' }
    );

    // Create a payment intent for Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      description: description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PBLK_KET_TST,
    });

  } catch (error) {
    console.error('Error processing Stripe payment:', error);
    return res.json({ error: true, message: error.message, data: null });
  }
};



// Handle Razorpay payment route
const handleRazorpayPayment = async (req, res) => {
  try {
    console.log('razorpay')
    const razorpayKey  = process.env.RAZORPAY_KEY_TEST
    res.json({  key: razorpayKey });
  } catch (error) {
    console.error('Error fetching Razorpay key:', error);
    res.status(500).json({ error: true, message: "can't proceed payment failed. please try again.", data: null });
  }
};


module.exports = {
    handleStripePayment,
    handleRazorpayPayment,
};