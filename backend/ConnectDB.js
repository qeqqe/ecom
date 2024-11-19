const mongoose = require("mongoose");

const URI = "mongodb://localhost:27017/ecom";

const ConnectDB = async () => {
  await mongoose.connect(URI).then(() => {
    console.log(`Connnected to the db`);
  });
};

module.exports = ConnectDB;
