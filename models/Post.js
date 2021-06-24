const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
  },
  seller: {
    type: String,
    required: true,
    minlength: 1,
  },
  image: [String],
  condition: {
    type: String,
    required: true,
    enum: ["New", "Like New", "Very Good", "Good", "Acceptable"],
  },
  ISBN: {
    type: String,
    required: false,
  },
  edition: {
    type: Number,
    required: false,
  },
  description: {
    type: String,
    required: false,
    minlength: 1,
  },
  price: {
    type: String,
    required: false,
    validate: {
      validator: function (price) {
        return price >= 0;
      },
      message: (price) => `${price} is not a valid price`,
    },
  },
  postingDate: {
    type: Date,
    required: true,
  },
  isSold: {
    type: Boolean,
    required: true,
  },
  byCreditCard: {
    type: Boolean,
    required: true,
  },
  buyer: {
    type: String,
    required: false,
  },
});

const Post = mongoose.model("Post", PostSchema);

module.exports = { Post, PostSchema };
