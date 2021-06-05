const mongoose = require("mongoose");

// Connect to our database
// NOTE: This is a cloud deployed database, the username and password are both "server"
const mongoDB =
  "mongodb+srv://books:books123@cluster0.b8xmq.mongodb.net/bookexchange?retryWrites=true&w=majority";

mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log("Connected"))
  .catch((error) => {
    console.log("Error Connecting Database Server!");
  });

module.exports = { mongoose };
