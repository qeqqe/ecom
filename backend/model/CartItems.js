const mongoose = require("mongoose");

const CartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Items",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CartSchema.methods.addItem = async function (itemId) {
  const itemIndex = this.items.findIndex((item) => item.itemId.equals(itemId));
  if (itemIndex > -1) {
    this.items[itemIndex].quantity += 1;
  } else {
    this.items.push({ itemId, quantity: 1 });
  }
  await this.updateTotalAmount();
  return this.save();
};

CartSchema.methods.removeItem = async function (itemId) {
  const itemIndex = this.items.findIndex((item) => item.itemId.equals(itemId));
  if (itemIndex > -1) {
    if (this.items[itemIndex].quantity > 1) {
      this.items[itemIndex].quantity -= 1;
    } else {
      this.items.splice(itemIndex, 1);
    }
    await this.updateTotalAmount();
    return this.save();
  }
  return this;
};

CartSchema.methods.updateTotalAmount = async function () {
  const Items = mongoose.model("Items");
  let total = 0;

  for (let item of this.items) {
    const itemData = await Items.findById(item.itemId);
    if (itemData) {
      total += itemData.price * item.quantity;
    }
  }

  this.totalAmount = total;
};

const CartItems = mongoose.model("CartItems", CartSchema);
module.exports = CartItems;
