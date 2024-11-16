const mongoose = require("mongoose");

const CartSchema = mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Items",
    },
  ],
});

CartSchema.methods.addItem = function (itemId) {
  const itemIndex = this.items.findIndex((item) => item.equals(itemId));
  if (itemIndex === -1) {
    this.items.push({ item: itemId, quantity: 1 });
  } else {
    this.items[itemIndex].quantity += 1;
  }
  return this.save();
};

CartSchema.methods.removeItem = function (itemId) {
  const itemIndex = this.items.findIndex((item) => item.equals(itemId));
  if (itemIndex !== -1) {
    if (this.items[itemIndex].quantity > 1) {
      this.items[itemIndex].quantity -= 1;
    } else {
      this.items.splice(itemIndex, 1);
    }
  }
  return this.save();
};

const CartItems = mongoose.model("CartItems", CartSchema);

module.exports = CartItems;
