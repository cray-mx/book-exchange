const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    time: {
        type: Date,
        required: true
    },
    sender: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    content: {
        type: String,
        required: true,
        minlength: 1
    }
});

const ChatSchema = new mongoose.Schema({
    user1: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    user2: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    user1Messages: [MessageSchema],
    user2Messages: [MessageSchema],
    messages: [MessageSchema]
});

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = {Chat};
