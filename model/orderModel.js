const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  items: [
    {
      productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      productName: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      variant: {
        type: String,
      },
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  
  // Reference to shipping address in Address model
  shippingAddressID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  
  // Reference to billing address in Address model (can be same as shipping)
  billingAddressID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },

  // Keep shipping address data for order history (immutable)
  shippingAddress: {
    phone: String,
    fullName: String,
    street: String,
    apartment: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    landmark: String,
    instructions: String
  },

  paymentMethod: {
    type: String,
    enum: ['cod', 'prepaid']
  },

  couponCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
},
  orderTotal: {
    subtotal: Number,
    discount: Number,
    total: Number
  },
  trackingUrl: {
    type: String
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
