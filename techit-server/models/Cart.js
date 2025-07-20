const { Schema, model } = require("mongoose");

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  products: [{ 
    productId: {
      type: Schema.Types.ObjectId, 
      ref: 'Product'
    }, 
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Cart = model("carts", cartSchema);
module.exports = Cart;