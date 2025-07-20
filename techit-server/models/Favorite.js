const { Schema, model } = require("mongoose");

const favoriteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'User' 
  },
  productId: {
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'Product' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite = model("favorites", favoriteSchema);
module.exports = Favorite;