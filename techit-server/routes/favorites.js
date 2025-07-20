const express = require("express");
const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");
const Product = require("../models/Product");
const auth = require("../middlewares/auth");
const { adminLimiter } = require("../middlewares/rateLimiter");
const Joi = require("joi");
const router = express.Router();

// Validation schema
const favoriteSchema = Joi.object({
  productId: Joi.string().required()
});

// Get all user favorites with product details
router.get("/", auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ 
      userId: new mongoose.Types.ObjectId(req.payload._id) 
    });
    
    // Get product details for each favorite
    const productPromises = favorites.map(fav => 
      Product.findById(fav.productId)
    );
    
    const products = await Promise.all(productPromises);
    
    // Filter out null products (in case product was deleted)
    const validProducts = products
      .filter(product => product !== null)
      .map(product => product.toObject());
    
    res.status(200).send(validProducts);
  } catch (error) {
    res.status(400).send("שגיאה בטעינת המועדפים");
  }
});

// Add product to favorites
router.post("/", auth, async (req, res) => {
  try {
    // Validate request body
    const { error } = favoriteSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if product exists and is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.body.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }

    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).send("המוצר לא נמצא");

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      userId: new mongoose.Types.ObjectId(req.payload._id),
      productId: new mongoose.Types.ObjectId(req.body.productId)
    });
    
    if (existingFavorite) {
      return res.status(400).send("המוצר כבר במועדפים");
    }

    // Add to favorites
    const favorite = new Favorite({
      userId: new mongoose.Types.ObjectId(req.payload._id),
      productId: new mongoose.Types.ObjectId(req.body.productId)
    });
    
    await favorite.save();
    res.status(201).send("המוצר נוסף למועדפים בהצלחה");
  } catch (error) {
    res.status(400).send("שגיאה בהוספה למועדפים");
  }
});

// Remove product from favorites
router.delete("/:productId", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }

    const favorite = await Favorite.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(req.payload._id),
      productId: new mongoose.Types.ObjectId(req.params.productId)
    });

    if (!favorite) {
      return res.status(404).send("המוצר לא נמצא במועדפים");
    }

    res.status(200).send("המוצר הוסר מהמועדפים בהצלחה");
  } catch (error) {
    res.status(400).send("שגיאה בהסרה מהמועדפים");
  }
});

// Check if product is in user's favorites
router.get("/check/:productId", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).send("מזהה מוצר לא תקין");
    }

    const favorite = await Favorite.findOne({
      userId: new mongoose.Types.ObjectId(req.payload._id),
      productId: new mongoose.Types.ObjectId(req.params.productId)
    });

    res.status(200).send({ isFavorite: !!favorite });
  } catch (error) {
    res.status(400).send("שגיאה בבדיקת מועדפים");
  }
});

// Get favorites statistics for admin
router.get("/stats", auth, adminLimiter, async (req, res) => {
  try {
    if (!req.payload.isAdmin) {
      return res.status(403).send("אין הרשאה לצפייה בנתונים");
    }

    // Check if there are any favorites
    const favoritesCount = await Favorite.countDocuments();
    
    if (favoritesCount === 0) {
      return res.status(200).send([]);
    }

    // Aggregation pipeline for favorites statistics
    const pipeline = [
      {
        $group: {
          _id: "$productId",
          favoriteCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products", // MongoDB collection name
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: false // Filter out deleted products
        }
      },
      {
        $project: {
          _id: 1,
          productName: "$product.name",
          productCategory: "$product.category",
          favoriteCount: 1
        }
      },
      {
        $sort: { favoriteCount: -1 }
      }
    ];

    const stats = await Favorite.aggregate(pipeline);
    res.status(200).send(stats);
  } catch (error) {
    res.status(400).send("שגיאה בטעינת סטטיסטיקות: " + error.message);
  }
});

module.exports = router;