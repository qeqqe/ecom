const mongoose = require("mongoose");

const ItemsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mrp: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: function () {
      return this.mrp - this.mrp * (this.discount / 100);
    },
  },
});

const Items = mongoose.model("Items", ItemsSchema);

module.exports = Items;
