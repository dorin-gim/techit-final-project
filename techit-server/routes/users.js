const express = require("express");
const Joi = require("joi");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");
const Favorite = require("../models/Favorite");
const auth = require("../middlewares/auth");
const { loginLimiter, adminLimiter } = require("../middlewares/rateLimiter");
const _ = require("lodash");
const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().required().email().min(2),
  password: Joi.string().required().min(8),
  isAdmin: Joi.boolean().required(),
});

// register
router.post("/", async (req, res) => {
  try {
    // 1. body validation
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // 2. check for existing user
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already exists");

    // 3. create user + encrypt password
    user = new User(req.body);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    // 3.5 create cart
    const cart = new Cart({ userId: user._id, products: [], active: true });
    await cart.save();

    // 4. create token
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWTKEY
    );
    res.status(201).send(token);
  } catch (error) {
    res.status(400).send(error);
  }
});

const loginSchema = Joi.object({
  email: Joi.string().required().email().min(2),
  password: Joi.string().required().min(8),
});

// login - with rate limiting
router.post("/login", loginLimiter, async (req, res) => {
  try {
    // 1. body validation
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // 2. check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email or password are incorrect");

    // 3. compare the password
    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) return res.status(400).send("Email or password are incorrect");

    // 4. create token
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWTKEY
    );
    res.status(200).send(token);
  } catch (error) {
    res.status(400).send(error);
  }
});

// profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.payload._id);
    if (!user) return res.status(404).send("No such user");
    res.status(200).send(_.pick(user, ["_id", "email", "name", "isAdmin"]));
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all users (admin only)
router.get("/all", auth, adminLimiter, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.payload.isAdmin) {
      return res.status(403).send("אין הרשאה לצפייה במשתמשים");
    }

    const users = await User.find({}, { password: 0 }).sort({ name: 1 });
    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(400).send("שגיאה בטעינת המשתמשים");
  }
});

// Update user role (admin only)
router.patch("/:userId/role", auth, adminLimiter, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.payload.isAdmin) {
      return res.status(403).send("אין הרשאה לשינוי הרשאות");
    }

    // Validate request body
    const { isAdmin } = req.body;
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).send("סוג הרשאה לא תקין");
    }

    // Don't allow changing own role
    if (req.params.userId === req.payload._id) {
      return res.status(400).send("לא ניתן לשנות את ההרשאות של עצמך");
    }

    // Update user role
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isAdmin },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("משתמש לא נמצא");
    }

    res.status(200).send("הרשאות המשתמש עודכנו בהצלחה");
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(400).send("שגיאה בעדכון הרשאות");
  }
});

// Delete user (admin only)
router.delete("/:userId", auth, adminLimiter, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.payload.isAdmin) {
      return res.status(403).send("אין הרשאה למחיקת משתמשים");
    }

    // Don't allow deleting own account
    if (req.params.userId === req.payload._id) {
      return res.status(400).send("לא ניתן למחוק את עצמך");
    }

    // Delete user
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).send("משתמש לא נמצא");
    }

    // Also delete user's cart and favorites
    await Cart.deleteMany({ userId: req.params.userId });
    await Favorite.deleteMany({ userId: req.params.userId });

    res.status(200).send("המשתמש נמחק בהצלחה");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(400).send("שגיאה במחיקת המשתמש");
  }
});

module.exports = router;