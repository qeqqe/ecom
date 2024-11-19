const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./model/User");
const CartSchema = require("./model/CartItems");
const Items = require("./model/Items");
app.use(express.json());
const ConnectDB = require("./ConnectDB");

ConnectDB();
const SECRET_KEY = process.env.SECRET_KEY;
const verify = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(404)
        .json({ success: false, error: "token not found login again!" });
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(404)
        .json({ success: false, error: "token not found login again!" });
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = {
      username: decoded.username,
      email: decoded.email,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired brah",
      });
    }
  }
};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(403)
      .json({ success: false, error: "Enter all the credentials" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "email not found" });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "incorrect password" });
    }
    const token = jwt.sign(
      { username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    return res
      .status(200)
      .json({ success: true, message: "successfully logged in", token });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `an error occured on the server side ${err}`,
    });
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(403)
      .json({ success: false, error: "Enter all the credentials" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    return res.status(201).json({ message: "successfully created an accound" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: `new error: ${err} ` });
  }
});

app.post("/add-item", verify, async (req, res) => {
  try {
    const { itemId } = req.body;
    const username = req.user.username;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const item = await Items.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    let cart = await CartItems.findOne({ username: user._id });
    if (!cart) {
      cart = new CartItems({
        username: user._id,
        items: [],
      });
    }

    await cart.addItem(itemId);

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error adding item to cart ${error}`,
    });
  }
});

app.post("/remove-item", verify, async (req, res) => {
  try {
    const { itemId } = req.body;
    const username = req.user.username;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const item = await Items.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    let cart = await CartItems.findOne({ username: user._id });
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    await cart.removeItem(itemId);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error removing item from cart",
    });
  }
});

// Add this endpoint to create a test item
app.post("/create-item", async (req, res) => {
  try {
    const item = new Items({
      name: "Test Item",
      mrp: 100,
      discount: 10,
    });
    await item.save();
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add this endpoint to get all items
app.get("/items", async (req, res) => {
  try {
    const items = await Items.find();
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log(`server running at port 3001`);
});
