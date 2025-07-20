const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middlewares/auth");
const router = express.Router();

// Add product to cart - PATCH request
router.patch("/", auth, async (req, res) => {
  try {
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(req.body.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }

    let product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).send("No such product");
    if (!product.available) return res.status(400).send("Product not available");
    
    let cart = await Cart.findOne({ 
      userId: new mongoose.Types.ObjectId(req.payload._id), 
      active: true 
    });
    
    if (!cart) {
      // Create new cart if doesn't exist
      cart = new Cart({ 
        userId: new mongoose.Types.ObjectId(req.payload._id), 
        products: [{ 
          productId: new mongoose.Types.ObjectId(req.body.productId), 
          quantity: 1 
        }], 
        active: true 
      });
    } else {
      let indexToAdd = cart.products.findIndex(
        (p) => p.productId.toString() === req.body.productId
      );
      
      if (indexToAdd !== -1) {
        cart.products[indexToAdd].quantity++;
        cart.markModified("products");
      } else {
        cart.products.push({ 
          productId: new mongoose.Types.ObjectId(req.body.productId), 
          quantity: 1 
        });
      }
    }
    
    await cart.save();
    
    // Update product quantity if needed
    if (product.quantity > 0) {
      product.quantity--;
      if (product.quantity === 0) product.available = false;
      await product.save();
    }
    
    res.status(200).send("Product has been added to cart");
  } catch (error) {
    res.status(400).send("Error adding product to cart");
  }
});

// Get cart items with product details - GET request
router.get("/", auth, async (req, res) => {
  try {
    // Get user cart
    const cart = await Cart.findOne({ 
      userId: new mongoose.Types.ObjectId(req.payload._id), 
      active: true 
    });
    
    if (!cart || !cart.products.length) {
      return res.status(200).send([]);
    }
    
    // Create array of promises to get product details
    let promises = cart.products.map((p) => Product.findById(p.productId));
    
    // Get all product details
    let products = await Promise.all(promises);
    
    if (!products) return res.status(400).send("Error in products");
    
    // Combine cart info with product details
    let cartItems = [];
    for (let i = 0; i < products.length; i++) {
      if (products[i]) {
        cartItems.push({
          ...products[i].toObject(),
          quantity: cart.products[i].quantity,
          productId: cart.products[i].productId.toString(),
        });
      }
    }
    
    res.status(200).send(cartItems);
  } catch (error) {
    res.status(400).send("Error fetching cart");
  }
});

// Remove specific product from cart - DELETE /:productId
router.delete("/:productId", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }

    const cart = await Cart.findOne({ 
      userId: new mongoose.Types.ObjectId(req.payload._id), 
      active: true 
    });
    if (!cart) return res.status(404).send("No cart found");
    
    // Remove product from cart
    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== req.params.productId
    );
    
    cart.markModified("products");
    await cart.save();
    
    res.status(200).send("Product removed from cart successfully");
  } catch (error) {
    res.status(400).send("Error removing product from cart");
  }
});

// Clear entire cart - DELETE request
router.delete("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ 
      userId: new mongoose.Types.ObjectId(req.payload._id), 
      active: true 
    });
    if (!cart) return res.status(404).send("No cart found");
    
    // Clear all products from cart
    cart.products = [];
    cart.markModified("products");
    await cart.save();
    
    res.status(200).send("Cart cleared successfully");
  } catch (error) {
    res.status(400).send("Error clearing cart");
  }
});

// Update product quantity in cart - PUT /:productId
router.put("/:productId", auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity < 0) {
      return res.status(400).send("Invalid quantity");
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }
    
    const cart = await Cart.findOne({ 
      userId: new mongoose.Types.ObjectId(req.payload._id), 
      active: true 
    });
    if (!cart) return res.status(404).send("No cart found");
    
    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === req.params.productId
    );
    
    if (productIndex === -1) {
      return res.status(404).send("Product not found in cart");
    }
    
    if (quantity === 0) {
      // Remove product if quantity is 0
      cart.products.splice(productIndex, 1);
    } else {
      // Update quantity
      cart.products[productIndex].quantity = quantity;
    }
    
    cart.markModified("products");
    await cart.save();
    
    res.status(200).send("Cart updated successfully");
  } catch (error) {
    res.status(400).send("Error updating cart");
  }
});

// Get cart summary (total items and price) - GET /summary
router.get("/summary", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ 
      userId: new mongoose.Types.ObjectId(req.payload._id), 
      active: true 
    });
    
    if (!cart || !cart.products.length) {
      return res.status(200).send({ totalItems: 0, totalPrice: 0 });
    }
    
    // Get product details and calculate totals
    let totalItems = 0;
    let totalPrice = 0;
    
    for (let cartProduct of cart.products) {
      const product = await Product.findById(cartProduct.productId);
      if (product && product.available) {
        totalItems += cartProduct.quantity;
        totalPrice += product.price * cartProduct.quantity;
      }
    }
    
    res.status(200).send({ totalItems, totalPrice });
  } catch (error) {
    res.status(400).send("Error getting cart summary");
  }
});

module.exports = router;