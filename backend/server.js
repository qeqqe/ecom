const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./model/User");
const CartItems = require("./model/CartItems");
const Items = require("./model/Items");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB at", MONGODB_URI))
  .catch((err) => console.error("MongoDB connection error:", err));

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ username: decoded.username });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired" });
    }
    return res.status(403).json({ success: false, error: "Invalid token" });
  }
};

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    await CartItems.create({ userId: user._id, items: [] });

    res
      .status(201)
      .json({ success: true, message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/cart/add", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = await Items.findById(itemId);

    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    if (item.stock < 1) {
      return res
        .status(400)
        .json({ success: false, error: "Item out of stock" });
    }

    let cart = await CartItems.findOne({ userId: req.user._id });
    await cart.addItem(itemId);

    res.status(200).json({ success: true, message: "Item added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/cart/remove", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    let cart = await CartItems.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    await cart.removeItem(itemId);
    res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/cart", authenticateToken, async (req, res) => {
  try {
    const cart = await CartItems.findOne({ userId: req.user._id }).populate(
      "items.itemId"
    );
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/items", authenticateToken, async (req, res) => {
  try {
    const item = await Items.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/items", async (req, res) => {
  try {
    const items = await Items.find();
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
